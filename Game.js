const Game = (function() {
    
    "use strict";

    const wall = 1;
    const space = 1;

    class Player
    {
        constructor(id)
        {
            this._id = id;
            this._next = null; // set by PlayerEnum
        }

        get id()
        {
            return this._id;
        }

        next()
        {
            return this._next;
        }
    }

    const PlayerEnum = {
        NOBODY: new Player(null),
        BLUE: new Player(0),
        RED: new Player(1),
    };

    PlayerEnum.BLUE._next = PlayerEnum.RED;
    PlayerEnum.RED._next = PlayerEnum.BLUE;

    class Coordinate extends Lib.Point
    {
        constructor(x, y)
        {
            assert(Number.isInteger(x) && Number.isInteger(y), "Coordinates must be integer");
            assert(x >= 0 && y >= 0);
            super(x, y);
        }
    }

    /* local */
    class InternalCoord extends Lib.Point
    {
        constructor(x, y)
        {
            assert(Number.isInteger(x) && Number.isInteger(y), "Coordinates must be integer");
            super(x, y);
        }

        static fromCoordinate(coordinate)
        {
            assert(coordinate instanceof Coordinate);
            return new InternalCoord(wall + space + coordinate.x, wall + space + coordinate.y);
        }

        toCoordinate()
        {
            return new Coordinate(this.x - (wall + space), this.y - (wall + space));
        }
    }

    class Point
    {
        constructor()
        {
            this._stone = PlayerEnum.NOBODY;
            this._owner = PlayerEnum.NOBODY;
        }

        get stone()
        {
            return this._stone;
        }

        get owner()
        {
            return this._owner;
        }

        set owner(player)
        {
            assert(player instanceof Player);
            this._owner = player;
        }

        isUnoccupied()
        {
            return this._owner === PlayerEnum.NOBODY;
        }

        putStone(player)
        {
            assert(this._owner === PlayerEnum.NOBODY, "Point is already occupied");
            assert(this._stone === PlayerEnum.NOBODY, "1) Invalid state; 2) Point is already occupied");
            assert(player instanceof Player);

            this._owner = player;
            this._stone = player;
        }
    }

    class BoardSize
    {
        constructor(width, height)
        {
            assert(Number.isInteger(width) && Number.isInteger(height));
            this._width = width;
            this._height = height;
        }

        get width()
        {
            return this._width;
        }

        get height()
        {
            return this._height;
        }
    }

    class Board extends Lib.Array2D
    {
        constructor(size)
        {
            assert(size instanceof BoardSize);
            super
            (
                wall + space + size.width + space + wall,
                wall + space + size.height + space + wall,
                (i, j) => new Point()
            );
            this._size = size;
        }

        _convertCoordinate(anyCoordinate)
        {
            if (anyCoordinate instanceof Coordinate)
            {
                assert(0 <= anyCoordinate.x && anyCoordinate.x < this._size.width);
                assert(0 <= anyCoordinate.y && anyCoordinate.y < this._size.height);
                return InternalCoord.fromCoordinate(anyCoordinate);
            }
            assert(anyCoordinate instanceof InternalCoord,
                   "Invalid argument type: Must be a Coordinate or InternalCoord");
            return anyCoordinate;
        }

        at(anyCoordinate)
        {
            const internalCoord = this._convertCoordinate(anyCoordinate);
            return super.at(internalCoord.x, internalCoord.y);
        }

        set(anyCoordinate, value)
        {
            const internalCoord = this._convertCoordinate(anyCoordinate);
            return super.set(this, internalCoord.x, internalCoord.y, value);
        }

        get width()
        {
            return this._size.width;
        }

        get height()
        {
            return this._size.height;
        }
    }

    class Engine extends Lib.Subscribable
    {
        constructor(boardSize)
        {
            super();
            this._board = new Board(boardSize);
            this._nextPlayer = PlayerEnum.BLUE;

            this._playerIdToScore = {};
            let p = PlayerEnum.BLUE;
            do
            {
                this._playerIdToScore[p.id] = 0;
                p = p.next();
            } while (p !== PlayerEnum.BLUE);
        }

        get boardWidth()
        {
            return this._board.width;
        }

        get boardHeight()
        {
            return this._board.height;
        }

        score(player)
        {
            assert(player instanceof Player);
            return this._playerIdToScore[player.id];
        }

        at(coordinate)
        {
            return this._board.at(coordinate);
        }

        playIfLegalAt(coordinate)
        {
            if (this.at(coordinate).isUnoccupied(coordinate))
            {
                this.playAt(coordinate);
            }
        }

        playAt(coordinate)
        {
            this.placeDotAt(coordinate, this._nextPlayer);
            this._notify("historyCheckpoint", []);
            this._nextPlayer = this._nextPlayer.next();
        }

        placeDotAt(coordinate, player)
        {
            assert(coordinate instanceof Coordinate);
            assert(this.at(coordinate).isUnoccupied(), "Point is already occupied");
            this.at(coordinate).putStone(player);
            this._notify("playAt", [player, coordinate]);

            const offset = new InternalCoord(1, 0);
            let captured = false;
            // TODO: Bad name. clashes with coordinate
            const coord = InternalCoord.fromCoordinate(coordinate);

            for (let i = 0; i != 4; i++)
            {
                captured |= this._handleCaptureAt(coord.plus(offset), player);
                offset.rotateClockwise();
            }
            if (captured)
            {
                this._recalculateScore();
            }
            else
            {
                // Check for suicide move
                for (let opponent = player.next(); opponent !== player; opponent = opponent.next())
                {
                    if (this._handleCaptureAt(coord, opponent))
                    {
                        this._recalculateScore();
                        break;
                    }
                }
            }
        }

        currentPlayer()
        {
            return this._currentPlayer;
        }

        setCurrentPlayer(player)
        {
            assert(player instanceof Player);
            this._currentPlayer = player;
        }

        _handleCaptureAt(point, player)
        {
            assert(point instanceof InternalCoord);

            // 1. Check if a `point` is surrounded by `player` and classify all points as BOUNDARY/INTERIOR/EXTERIOR
            const mask = new Mask(this._board.size1, this._board.size2);

            const ownColorPredicate = (p) => this._board.at(p).owner === player; 

            if (ownColorPredicate(point))
            {
                return false;
            }

            flood(point, mask, ownColorPredicate);

            if (!this._doMaskCaptures(mask, player))
            {
                return false;
            }

            // 2. Run bug to find capturing contour
            const bugStartPoint = leftTopMaskBoundary(mask);
            bugStartPoint.x += 1;

            // Must be true, because we chose left-most, top-most boundary point
            assert(mask.at(bugStartPoint.x, bugStartPoint.y) === TopologicalKind.INTERIOR);
            const startDirection = new InternalCoord(-1, 0); // Face bug towards the boundary point
            const boundaryPredicate = (p) => mask.at(p.x, p.y) === TopologicalKind.BOUNDARY;
            const contour = normalizeContour(runBug(bugStartPoint, startDirection, boundaryPredicate));

            // 3. Find all interior points of capture
            const territoryMask = new Mask(mask.size1, mask.size2);
            for (let i = 0; i < contour.length; i++)
            {
                const contourPoint = contour[i];
                territoryMask.set(contourPoint.x, contourPoint.y, TopologicalKind.BOUNDARY);
            }
            flood(point, territoryMask, (p) => false); // Walls are already encoded in territoryMask

            // 4. Actually perform capture: update board and notify anyone who wants to draw
            this._captureByMask(territoryMask, player);
            this._notify("capture", [player, fromInternalCoordArray(contour)]);

            return true;
        }

        _doMaskCaptures(mask, player)
        {
            if (mask.at(wall, wall) === TopologicalKind.INTERIOR)
            {
                return false;
            }

            // There is a closed contour, but we need to check, if it captured any dots.

            let capturedAnyEnemyDots = false;

            // TODO: redo loop bounds
            for (let x = wall + space; x < mask.size1; x++)
            {
                for (let y = wall + space; y < mask.size2; y++)
                {
                    const coordinate = new InternalCoord(x, y);
                    const point = this._board.at(coordinate);
                    if (mask.at(x, y) === TopologicalKind.INTERIOR
                        && point.owner !== PlayerEnum.NOBODY
                        && point.owner !== player)
                    {
                        return true;
                    }
                }
            }
            return false;
        }

        _captureByMask(mask, player)
        {
            const xMin = wall + space;
            const xMax = mask.size1 - (wall + space);
            const yMin = wall + space;
            const yMax = mask.size2 - (wall + space);

            for (let x = xMin; x < xMax; x++)
            {
                for (let y = yMin; y < yMax; y++)
                {
                    if (mask.at(x, y) === TopologicalKind.INTERIOR)
                    {
                        this._board.at(new InternalCoord(x, y)).owner = player;
                    }
                }
            }
        }

        _recalculateScore()
        {
            for (let id in this._playerIdToScore)
            {
                this._playerIdToScore[id] = 0;
            }

            for (let x = 0; x < this._board.width; x++)
            {
                for (let y = 0; y < this._board.height; y++)
                {
                    const point = this._board.at(new Coordinate(x, y));
                    const owner = point.owner;
                    const stone = point.stone;

                    if (owner !== PlayerEnum.NOBODY && stone !== PlayerEnum.NOBODY && owner !== stone)
                    {
                        this._playerIdToScore[owner.id] += 1;
                    }
                }
            }
            this._notify("updateScore", [this._playerIdToScore]);
        }
    }

    // ... Move up?
    const TopologicalKind = {
        EXTERIOR: 1,
        BOUNDARY: 2,
        INTERIOR: 3
    };

    function fromInternalCoordArray(arrayInternalCoord)
    {
        assert(arrayInternalCoord instanceof Array);
        const coordinateArray = Array(arrayInternalCoord.length);
        for (let i = 0; i < coordinateArray.length; i++)
        {
            coordinateArray[i] = arrayInternalCoord[i].toCoordinate();
        }
        return coordinateArray;
    }

    function leftTopMaskBoundary(mask)
    {
        for (let x = 0; x < mask.size1; x++)
        {
            for (let y = 0; y < mask.size2; y++)
            {
                if (mask.at(x, y) === TopologicalKind.BOUNDARY)
                {
                    return new InternalCoord(x, y);
                }
            }
        }
        assert(false, "No boundary points in mask");
    }

    class Mask extends Lib.Array2D
    {
        constructor(size1, size2)
        {
            assert(Number.isInteger(size1) && Number.isInteger(size2));

            super(size1, size2, (i, j) => TopologicalKind.EXTERIOR);

            for (let x = 0; x < size1; x++)
            {
                this.set(x, 0, TopologicalKind.INTERIOR);
                this.set(x, size2 - 1, TopologicalKind.INTERIOR);
            }

            for (let y = 0; y < size2; y++)
            {
                this.set(0, y, TopologicalKind.INTERIOR);
                this.set(size1 - 1, y, TopologicalKind.INTERIOR);
            }
        }
    }

    function flood(startPoint, mask, wallFunction)
    {
        assert(startPoint instanceof InternalCoord);
        assert(mask instanceof Mask);
        assert(wallFunction instanceof Function);
        assert(0 < startPoint.x && startPoint.x < mask.size1 - 1);
        assert(0 < startPoint.y && startPoint.y < mask.size2 - 1);
        mask.set(startPoint.x, startPoint.y, TopologicalKind.INTERIOR);
 
        const toProcess = [ startPoint ];

        while (toProcess.length > 0)
        {
            const point = toProcess.pop();
            const offset = new InternalCoord(1, 0);

            for (let i = 0; i < 4; i++)
            {
                const neighbour = point.plus(offset);
                if (mask.at(neighbour.x, neighbour.y) === TopologicalKind.EXTERIOR)
                {
                    if (wallFunction(neighbour))
                    {
                        mask.set(neighbour.x, neighbour.y, TopologicalKind.BOUNDARY);
                    }
                    else
                    {
                        mask.set(neighbour.x, neighbour.y, TopologicalKind.INTERIOR);
                        toProcess.push(neighbour);
                    }
                }

                offset.rotateClockwise();
            }
        }
    }

    function runBug(startPoint, startDirection, wallFunction)
    {
        assert(startPoint instanceof InternalCoord);
        assert(startDirection instanceof InternalCoord);
        assert(startDirection.squareLength() === 1);

        let point = startPoint.clone();
        let direction = startDirection.clone();

        const contour = [];

        do
        {
            const pointInFront = point.plus(direction);
            if (wallFunction(pointInFront))
            {
                contour.push(pointInFront);
                direction.rotateClockwise();
            }
            else
            {
                point = pointInFront;
                direction.rotateCounterClockwise();
            }
        } while (!point.equals(startPoint) || !direction.equals(startDirection));

        return contour;
    }

    function normalizeContour(contour)
    {
        // I don't remember now, but it's probably important that first point in contour will remain after normalization
        const normalizedContour = [];
        const contourPoints = new Set();

        const key = (point) => point.x + ";" + point.y;

        for (let i = 0; i < contour.length; i++)
        {
            const point = contour[i];
            const pointKey = key(point);

            while (contourPoints.has(pointKey))
            {
                const redundantPoint = normalizedContour.pop();
                assert(contourPoints.has(key(redundantPoint)));
                contourPoints.delete(key(redundantPoint));
            }
            normalizedContour.push(point);
            contourPoints.add(pointKey);
        }

        return normalizedContour;
    }

    return {
        PlayerEnum: PlayerEnum,
        Coordinate: Coordinate,
        Point: Point,
        BoardSize: BoardSize,
        Board: Board,
        Engine: Engine,
    };

}());
