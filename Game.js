var Game = (function() {
    
    "use strict";


    var wall = 1;
    var space = 1;


    function Nobody() { }                 /* local */
    function Player(id) { this.id = id; } /* local */

    var PlayerEnum = {
        NOBODY: new Nobody(),
        BLUE: new Player(0),
        RED: new Player(1)
    };

    Player.prototype.next = function()
    {
        if (this === PlayerEnum.BLUE)
            return PlayerEnum.RED;
        if (this === PlayerEnum.RED)
            return PlayerEnum.BLUE;
        assert(false);
    };


    function Coordinate(x, y)
    {
        assert(Number.isInteger(x) && Number.isInteger(y), "Coordinates must be integer");
        assert(x >= 0 && y >= 0);
        Lib.Point.call(this, x, y);
    }

    Coordinate.prototype = Object.create(Lib.Point.prototype);
    Coordinate.prototype.constructor = Coordinate;


    /* local */
    function InternalCoord(x, y)
    {
        assert(Number.isInteger(x) && Number.isInteger(y), "Coordinates must be integer");
        Lib.Point.call(this, x, y);
    }

    InternalCoord.prototype = Object.create(Lib.Point.prototype);
    InternalCoord.prototype.constructor = InternalCoord;

    InternalCoord.fromCoordinate = function(coordinate)
    {
        assert(coordinate instanceof Coordinate);
        return new InternalCoord(wall + space + coordinate.x, wall + space + coordinate.y);
    };

    InternalCoord.prototype.toCoordinate = function()
    {
        return new Coordinate(this.x - (wall + space), this.y - (wall + space));
    };


    function Point()
    {
        this._stone = PlayerEnum.NOBODY;
        this._owner = PlayerEnum.NOBODY;
    }

    Point.prototype.stone = function()
    {
        return this._stone;
    };

    Point.prototype.owner = function()
    {
        return this._owner;
    };

    Point.prototype.isUnoccupied = function()
    {
        return this._owner === PlayerEnum.NOBODY;
    };

    Point.prototype.putStone = function(player)
    {
        assert(this._owner === PlayerEnum.NOBODY, "Point is already occupied");
        assert(this._stone === PlayerEnum.NOBODY, "1) Invalid state; 2) Point is already occupied");
        assert(player instanceof Player);

        this._owner = player;
        this._stone = player;
    };

    Point.prototype.setOwner = function(player)
    {
        assert(player instanceof Player);
        this._owner = player;
    };


    function Board(width, height)
    {
        assert(Number.isInteger(width) && Number.isInteger(height));
        Lib.Array2D.call
        (
            this,
            wall + space + width + space + wall,
            wall + space + height + space + wall,
            (i, j) => new Point()
        );
        this._width = width;
        this._height = height;
    }

    Board.prototype = Object.create(Lib.Array2D.prototype);
    Board.prototype.constructor = Board;    

    Board.prototype._convertCoordinate = function(anyCoordinate)
    {
        if (anyCoordinate instanceof Coordinate)
        {
            assert(0 <= anyCoordinate.x && anyCoordinate.x < this._width);
            assert(0 <= anyCoordinate.y && anyCoordinate.y < this._height);
            return InternalCoord.fromCoordinate(anyCoordinate);
        }
        assert(anyCoordinate instanceof InternalCoord,
               "Invalid argument type: Must be a Coordinate or InternalCoord");
        return anyCoordinate;
    };

    Board.prototype.at = function(anyCoordinate)
    {
        var internalCoord = this._convertCoordinate(anyCoordinate);
        return Lib.Array2D.prototype.at.call(this, internalCoord.x, internalCoord.y);
    };

    Board.prototype.set = function(anyCoordinate, value)
    {
        var internalCoord = this._convertCoordinate(anyCoordinate);
        return Lib.Array2D.prototype.set.call(this, internalCoord.x, internalCoord.y, value);
    };

    Board.prototype.width = function()
    {
        return this._width;
    };

    Board.prototype.height = function()
    {
        return this._height;
    };


    function Engine(width, height)
    {
        this._board = new Board(width, height);
        this._nextPlayer = PlayerEnum.BLUE;
        this._subscribers = [];

        this._playerIdToScore = {};
        var p = PlayerEnum.BLUE;
        do
        {
            this._playerIdToScore[p.id] = 0;
            p = p.next();
        } while (p !== PlayerEnum.BLUE);
    }

    Engine.prototype.boardWidth = function()
    {
        return this._board.width();
    };

    Engine.prototype.boardHeight = function()
    {
        return this._board.height();
    };

    Engine.prototype.score = function(player)
    {
        assert(player instanceof Player);
        return this._playerIdToScore[player.id];
    };

    Engine.prototype.at = function(coordinate)
    {
        return this._board.at(coordinate);
    };

    Engine.prototype.subscribe = function(listener)
    {
        this._subscribers.push(listener);
    };

    Engine.prototype.playAt = function(coordinate)
    {
        this.playerPlaysAt(coordinate, this._nextPlayer);
        this._nextPlayer = this._nextPlayer.next();
    };

    Engine.prototype.playerPlaysAt = function(coordinate, player)
    {
        assert(coordinate instanceof Coordinate);
        assert(this.at(coordinate).isUnoccupied(), "Point is already occupied");
        this.at(coordinate).putStone(player);
        this._notify("playAt", [player, coordinate]);

        var offset = new InternalCoord(1, 0);
        var captured = false;
        // TODO: Bad name. clashes with coordinate
        var coord = InternalCoord.fromCoordinate(coordinate);

        for (var i = 0; i != 4; i++)
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
            for (var opponent = player.next(); opponent !== player; opponent = opponent.next())
            {
                if (this._handleCaptureAt(coord, opponent))
                {
                    this._recalculateScore();
                    break;
                }
            }
        }

    };

    Engine.prototype.currentPlayer = function()
    {
        return this._currentPlayer;
    };

    Engine.prototype.setCurrentPlayer = function(player)
    {
        assert(player instanceof Player);
        this._currentPlayer = player;
    };

    Engine.prototype._notify = function(name, args)
    {
        for (var i = 0; i < this._subscribers.length; i++)
        {
            this._subscribers[i][name](...args);
        }
    };

    Engine.prototype._handleCaptureAt = function(point, player)
    {
        assert(point instanceof InternalCoord);
        var mask = newMask(this._board.size1(), this._board.size2());
        var wallFunction = (p) => this._board.at(p).owner() === player; 
        flood(point, mask, wallFunction);

        if (!this._doMaskCaptures(mask, player))
        {
            return false;
        }

        var bugStartPoint = leftTopMaskBoundary(mask);
        bugStartPoint.x += 1;

        // Must be true, because we chose left-most, top-most boundary point
        assert(mask.at(bugStartPoint.x, bugStartPoint.y) === TopologicalKind.INTERIOR);
        var startDirection = new InternalCoord(-1, 0); // Face bug towards the boundary point
        var wallFunction = (p) => mask.at(p.x, p.y) === TopologicalKind.BOUNDARY;
        var contour = normalizeContour(runBug(bugStartPoint, startDirection, wallFunction));

        var territoryMask = newMask(mask.size1(), mask.size2());
        for (var i = 0; i < contour.length; i++)
        {
            var contourPoint = contour[i];
            territoryMask.set(contourPoint.x, contourPoint.y, TopologicalKind.BOUNDARY);
        }
        flood(point, territoryMask, (p) => false); // Walls are already encoded in territoryMask
        this._captureByMask(territoryMask, player);
        this._notify("capture", [player, fromInternalCoordArray(contour)]);

        return true;
    };

    Engine.prototype._doMaskCaptures = function(mask, player)
    {
        if (mask.at(wall, wall) === TopologicalKind.INTERIOR)
        {
            return false;
        }

        // There is a closed contour, but we need to check, if it captured any dots.

        var capturedAnyEnemyDots = false;

        // TODO: redo loop bounds
        for (var x = wall + space; x < mask.size1(); x++)
        {
            for (var y = wall + space; y < mask.size2(); y++)
            {
                var coordinate = new InternalCoord(x, y);
                var point = this._board.at(coordinate);
                if (mask.at(x, y) === TopologicalKind.INTERIOR
                    && point.owner() !== PlayerEnum.NOBODY
                    && point.owner() !== player)
                {
                    return true;
                }
            }
        }
        return false;
    };

    Engine.prototype._captureByMask = function(mask, player)
    {
        var xMin = wall + space;
        var xMax = mask.size1() - (wall + space);
        var yMin = wall + space;
        var yMax = mask.size2() - (wall + space);

        for (var x = xMin; x < xMax; x++)
        {
            for (var y = yMin; y < yMax; y++)
            {
                if (mask.at(x, y) === TopologicalKind.INTERIOR)
                {
                    this._board.at(new InternalCoord(x, y)).setOwner(player);
                }
            }
        }  
    }

    Engine.prototype._recalculateScore = function()
    {
        for (var id in this._playerIdToScore)
        {
            this._playerIdToScore[id] = 0;
        }

        for (var x = 0; x < this._board.width(); x++)
        {
            for (var y = 0; y < this._board.height(); y++)
            {
                var point = this._board.at(new Coordinate(x, y));
                var owner = point.owner();
                var stone = point.stone();

                if (owner !== PlayerEnum.NOBODY && stone !== PlayerEnum.NOBODY && owner !== stone)
                {
                    this._playerIdToScore[owner.id] += 1;
                }
            }
        }
        this._notify("updateScore", [this._playerIdToScore]);
    };


    // ... Move up?
    var TopologicalKind = {
        EXTERIOR: 1,
        BOUNDARY: 2,
        INTERIOR: 3
    };

    function fromInternalCoordArray(arrayInternalCoord)
    {
        assert(arrayInternalCoord instanceof Array);
        var coordinateArray = Array(arrayInternalCoord.length);
        for (var i = 0; i < coordinateArray.length; i++)
        {
            coordinateArray[i] = arrayInternalCoord[i].toCoordinate();
        }
        return coordinateArray;
    }

    function leftTopMaskBoundary(mask)
    {
        for (var x = 0; x < mask.size1(); x++)
        {
            for (var y = 0; y < mask.size2(); y++)
            {
                if (mask.at(x, y) === TopologicalKind.BOUNDARY)
                {
                    return new InternalCoord(x, y);
                }
            }
        }
        assert(false, "No boundary points in mask");
    }

    function newMask(size1, size2)
    {
        assert(Number.isInteger(size1) && Number.isInteger(size2));
        
        var mask = new Lib.Array2D(size1, size2, (i, j) => TopologicalKind.EXTERIOR);

        for (var x = 0; x < size1; x++)
        {
            mask.set(x, 0, TopologicalKind.INTERIOR);
            mask.set(x, size2 - 1, TopologicalKind.INTERIOR);
        }

        for (var y = 0; y < size2; y++)
        {
            mask.set(0, y, TopologicalKind.INTERIOR);
            mask.set(size1 - 1, y, TopologicalKind.INTERIOR);
        }

        return mask;
    }

    function flood(startPoint, mask, wallFunction)
    {
        assert(startPoint instanceof InternalCoord);
        assert(mask instanceof Lib.Array2D);
        assert(wallFunction instanceof Function);
        assert(0 < startPoint.x && startPoint.x < mask.size1() - 1);
        assert(0 < startPoint.y && startPoint.y < mask.size2() - 1);
        mask.set(startPoint.x, startPoint.y, TopologicalKind.INTERIOR);
 
        var toProcess = [ startPoint ];

        while (toProcess.length > 0)
        {
            var point = toProcess.pop();
            var offset = new InternalCoord(1, 0);

            for (var i = 0; i < 4; i++)
            {
                var neighbour = point.plus(offset);
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

        var point = startPoint.clone();
        var direction = startDirection.clone();

        var contour = [];

        do
        {
            var pointInFront = point.plus(direction);
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
        var normalizedContour = [];
        var contourPoints = new Set();

        var key = (point) => point.x + ";" + point.y;

        for (var i = 0; i < contour.length; i++)
        {
            var point = contour[i];
            var pointKey = key(point);

            while (contourPoints.has(pointKey))
            {
                var redundantPoint = normalizedContour.pop();
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
        Engine: Engine,
    };

}());
