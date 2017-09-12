var Lib = (function() {

    "use strict";

    function assert(condition, message = "Assertion error")
    {
        if (!condition)
        {
            throw message;
        }
    }

    function apply(fs, arg)
    {
        if (fs == undefined)
        {
            return;
        }

        for (var i = 0; i < fs.length; i++)
        {
            fs[i](arg);
        }
    }

    function Array2D(size1, size2, valueFunction)
    {
        var array = new Array(size1 * size2);

        this._size1 = size1;
        this._size2 = size2;

        for (var i = 0; i < size1; i++)
        {
            for (var j = 0; j < size2; j++)
            {
                array[this._index(i, j)] = valueFunction(i, j);
            }
        }

        this._data = array;
    }

    Array2D.prototype._index = function(i, j)
    {
        return i * this._size2 + j;
    };

    Array2D.prototype.assertInBounds = function(i, j)
    {
        assert(Number.isInteger(i) && Number.isInteger(j), "Index must be ineger");
        assert(0 <= i && i < this._size1 && 0 <= j && j < this._size2, "Invalid index");
    };

    Array2D.prototype.size1 = function()
    {
        return this._size1;
    };

    Array2D.prototype.size2 = function()
    {
        return this._size2;
    };

    Array2D.prototype.at = function(i, j)
    {
        this.assertInBounds(i, j);
        return this._data[this._index(i, j)];
    };

    Array2D.prototype.set = function(i, j, v)
    {
        this.assertInBounds(i, j);
        this._data[this._index(i, j)] = v;
    };

    function Point(x, y)
    {
        this.x = x;
        this.y = y;
    }

    Point.prototype.rotateClockwise = function()
    {
        var x = this.y;
        var y = -this.x;
        this.x = x;
        this.y = y;
    };

    Point.prototype.rotateCounterClockwise = function()
    {
        var x = -this.y;
        var y = this.x;
        this.x = x;
        this.y = y;
    };

    Point.prototype.squareLength = function()
    {
        return this.x * this.x + this.y * this.y;
    };

    Point.prototype.clone = function()
    {
        return new this.constructor(this.x, this.y);
    };

    Point.prototype.equals = function(other)
    {
        return this.x === other.x && this.y === other.y;
    };

    Point.prototype.plus = function(other)
    {
        return new this.constructor(this.x + other.x, this.y + other.y);
    };

    Point.prototype.negative = function()
    {
        return new this.constructor(-this.x, -this.y);
    };

    return {
        assert: assert,
        apply: apply,
        Array2D: Array2D,
        Point: Point,
    };

}());


var assert = Lib.assert;


var Drawing = (function() {

    "use strict";


    /*
     * Combinators
     */

    function withStyles(ctx, styles, continuation)
    {
        if (0 != styles.length)
        {
            ctx.save();
            Lib.apply(styles, ctx);
            continuation();
            ctx.restore();
        }
        else
        {
            continuation();
        }
    }

    // TODO: Probably not needed
    function combine(...shapes)
    {
        return (ctx) =>
        {
            Lib.apply(shapes, ctx);
        };
    }


    /*
     * Shapes
     */

    function line(p1, p2, ...styles)
    {
        return (ctx) =>
        {
            withStyles(ctx, styles, () =>
            {
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            });
        };
    }

    function circle(p, r, ...styles)
    {
        return (ctx) =>
        {
            withStyles(ctx, styles, () =>
            {
                ctx.beginPath();
                var startAngle = 0;
                var endAngle = 2 * Math.PI;
                ctx.arc(p.x, p.y, r, startAngle, endAngle, false);
                ctx.fill();
                ctx.stroke();
            });
        };
    }

    function rectangle(p1, p2, ...styles)
    {
        return (ctx) =>
        {
            withStyles(ctx, styles, () =>
            {
                ctx.beginPath();
                ctx.rect(p1.x, p1.y, p2.x, p2.y);
                ctx.stroke();
            });
        };
    }


    /*
     * Styles
     */

    var LineCapEnum = {
        BUTT: "butt",
        ROUND: "round",
        SQUARE: "square"
    };

    function lineCap(capType)
    {
        return (ctx) =>
        {
            ctx.lineCap = capType;
        };
    }

    var LineJoinEnum = {
        BEVEL: "bevel",
        ROUND: "round",
        MITER: "miter"
    };

    function lineJoin(joinType)
    {
        return (ctx) =>
        {
            ctx.lineJoin = joinType;
        };
    }

    function lineWidth(width)
    {
        return (ctx) =>
        {
            ctx.lineWidth = width;
        };
    }

    function fillStyle(value)
    {
        return (ctx) =>
        {
            ctx.fillStyle = value;
        };
    }

    function strokeStyle(value)
    {
        return (ctx) =>
        {
            ctx.strokeStyle = value;
        };
    }

    var ColorEnum = {
        BLUE: 'blue',
        RED: 'red',
    };

    return {
        withStyles: withStyles,
        combine: combine,
        line: line,
        circle: circle,
        rectangle: rectangle,
        LineCapEnum: LineCapEnum,
        lineCap: lineCap,
        LineJoinEnum: LineJoinEnum,
        lineJoin: lineJoin,
        lineWidth: lineWidth,
        fillStyle: fillStyle,
        strokeStyle: strokeStyle,
        ColorEnum: ColorEnum,
    };

}());


var PLAYDOTS_THEME = (function() {

    "use strict";

    var D = Drawing;

    var blueColor = '#2358ED';
    var redColor = '#D32020';

    var styles =
    {
        0: [D.fillStyle(blueColor), D.strokeStyle(blueColor)],
        1: [D.fillStyle(redColor), D.strokeStyle(redColor)]
    };

    var theme = (ctx) =>
    ({
        gridLine: (p1, p2) => D.line(p1, p2, D.lineWidth(0), D.strokeStyle('#E1E6EB'))(ctx),
        gridStep: 19,
        paddingLeft: 20.5,
        paddingTop: 20.5,
        paddingRight: 20.5,
        paddingBottom: 20.5,

        dot: (player, p) => D.circle(p, 5, ...styles[player.id])(ctx),

        setupCanvas: function(width, height)
        {
            // TODO: we maybe need to fill canvas
            ctx.canvas.width = width;
            ctx.canvas.height = height;
        },

        // capturePolygon: (player, points)

        // setScore
    });

    return theme;
}());


var Visualizer = (function() {

    "use strict";    


    var Point = Lib.Point;


    /* local */
    function State(actions=[], count=0)
    {
        this._actions = actions;
        this._actionCount = count;
    };

    State.prototype.clone = function()
    {
        return new State(this._actions, this._actionCount);
    };

    State.prototype.replay = function(self)
    {
        for (var i = 0; i < this._actionCount; i++)
        {
            this._actions[i](self);
        }
    };

    State.prototype.act = function(action, self)
    {
        assert(this._actions.length == this._actionCount, "Only linear histories are allowed");
        this._actions.push(action);
        this._actionCount += 1;
        action(self);
    };


    function Visualizer(theme, engine)
    {
        this._state = new State();
        this._engine = engine;
        this._theme = theme;
        
        this._fieldLeft = this._boardXCordToCanvasXCord(0);
        this._fieldTop = this._boardYCordToCanvasYCord(0);
        this._fieldRight = this._boardXCordToCanvasXCord(engine.boardWidth() - 1);
        this._fieldBottom = this._boardYCordToCanvasYCord(engine.boardHeight() - 1);

        engine.subscribe(this);
        this.resetAndShowGrid();
    }

    Visualizer.prototype._boardXCordToCanvasXCord = function(x)
    {
        return this._theme.paddingLeft + x * this._theme.gridStep;
    };

    Visualizer.prototype._boardYCordToCanvasYCord = function(y)
    {
        return this._theme.paddingTop + y * this._theme.gridStep;
    };

    Visualizer.prototype._boardPointToCanvasPoint = function(boardPoint)
    {
        return new Point
        (
            this._boardXCordToCanvasXCord(boardPoint.x),
            this._boardYCordToCanvasYCord(boardPoint.y)
        );
    };
        
    Visualizer.prototype.resetAndShowGrid = function()
    {
        this._state.act((self) => self._resetAndShowGrid(), this);
    };

    Visualizer.prototype._resetAndShowGrid = function()
    {
        var theme = this._theme;

        theme.setupCanvas(this._fieldRight + theme.paddingRight, this._fieldBottom + theme.paddingBottom);
        for (var boardX = 0; boardX < this._engine.boardWidth(); boardX++)
        {
            var x = this._boardXCordToCanvasXCord(boardX); 
            theme.gridLine(new Point(x, this._fieldTop), new Point(x, this._fieldBottom));
        }

        for (var boardY = 0; boardY < this._engine.boardHeight(); boardY++)
        {
            var y = this._boardYCordToCanvasYCord(boardY);
            theme.gridLine(new Point(this._fieldLeft, y), new Point(this._fieldRight, y));
        }
    };

    Visualizer.prototype.playAt = function(player, x, y)
    {
        this._state.act((self) => self._playAt(player, x, y), this);
    };

    Visualizer.prototype._playAt = function(player, x, y)
    {
        var engine = this._engine;
        var theme = this._theme;

        assert(0 <= x && x < engine.boardWidth());
        assert(0 <= y && y < engine.boardHeight());

        theme.dot(player, this._boardPointToCanvasPoint(new Point(x, y)));
    };

    Visualizer.prototype.capture = function(...args)
    {
        console.log("Visualizer: capture!", args);
        // TODO: отрисовка захвата
        // Какие аргументы должны быть? Внешняя цепочка, и список дырок?
    };

    Visualizer.prototype.updateScore = function(...args)
    {
        console.log("Visualizer: score:", args);
    };

    Visualizer.prototype.onMouseClick = function(canvasPoint)
    {
        var theme = this._theme;
        var engine = this._engine;
        var gridStep = theme.gridStep

        var boardX = Math.floor((canvasPoint.x - this._fieldLeft + gridStep / 2) / gridStep);
        var boardY = Math.floor((canvasPoint.y - this._fieldTop + gridStep / 2) / gridStep);
        if (0 <= boardX && boardX < engine.boardWidth() && 0 <= boardY && boardY < engine.boardHeight())
        {
            if (engine.at(boardX, boardY).isUnoccupied())
            {
                engine.playAt(boardX, boardY);
            }
        }
    };

    Visualizer.prototype.onMouseMove = function(x, y)
    {

    };

    Visualizer.prototype.save = function()
    {
        return this._state.clone();
    };

    Visualizer.prototype.load = function(state)
    {
        this._state = state.clone();
        this._state.replay(this);            
    };

    return {
        Visualizer: Visualizer
    };

}());


var Game = (function() {
    
    "use strict";


    var Array2D = Lib.Array2D;

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
        Lib.Point.call(this, x, y);
    }

    Coordinate.prototype = Object.create(Lib.Point.prototype);
    Coordinate.prototype.constructor = Coordinate;


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


    function Engine(width, height)
    {
        // Add fantom points to facilitate traversal algorithms
        var wall = 1;
        var space = 1;

        this._board = new Array2D
        (
            wall + space + width + space + wall,
            wall + space + height + space + wall,
            (i, j) => new Point()
        );
        this._nextPlayer = PlayerEnum.BLUE;
        this._subscribers = [];
        this._xPadding = wall + space;
        this._yPadding = wall + space;
        this._realBoardWidth = width;
        this._realBoardHeight = height;

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
        return this._realBoardWidth;
    };

    Engine.prototype.boardHeight = function()
    {
        return this._realBoardHeight;
    };

    Engine.prototype.score = function(player)
    {
        assert(player instanceof Player);
        return this._playerIdToScore[player.id];
    };

    Engine.prototype.at = function(x, y)
    {
        assert(0 <= x && x < this.boardWidth());
        assert(0 <= y && y < this.boardHeight());
        return this._board.at(x + this._xPadding, y + this._yPadding);
    };

    Engine.prototype.subscribe = function(listener)
    {
        this._subscribers.push(listener);
    };

    Engine.prototype.playAt = function(x, y)
    {
        this.playerPlaysAt(x, y, this._nextPlayer);
        this._nextPlayer = this._nextPlayer.next();
    };

    Engine.prototype.playerPlaysAt = function(x, y, player)
    {
        assert(this.at(x, y).isUnoccupied(), "Point is already occupied");
        this.at(x, y).putStone(player);
        this._notify("playAt", [player, x, y]);

        var offset = new Coordinate(1, 0);
        var captured = false;

        // TODO: Needs refactoring
        var point = new Coordinate(x + this._xPadding, y + this._yPadding);

        for (var i = 0; i != 4; i++)
        {
            captured |= this._handleCaptureAt(point.plus(offset), player);
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
                if (this._handleCaptureAt(point, opponent))
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
        var mask = newMask(this._board.size1(), this._board.size2());
        var wallFunction = (p) => this._board.at(p.x, p.y).owner() === player; 
        flood(point, mask, wallFunction);

        if (!this._doMaskCaptures(mask, player))
        {
            return false;
        }

        var bugStartPoint = leftTopMaskBoundary(mask);
        bugStartPoint.x += 1;

        // Must be true, because we chose left-most, top-most boundary point
        assert(mask.at(bugStartPoint.x, bugStartPoint.y) === TopologicalKind.INTERIOR);
        var startDirection = new Coordinate(-1, 0); // Face bug towards the boundary point
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
        this._notify("capture", [player, contour]); // TODO: coordinates should fixed here

        return true;
    };

    Engine.prototype._doMaskCaptures = function(mask, player)
    {
        var wall = 1;
        var space = 1;

        if (mask.at(wall, wall) === TopologicalKind.INTERIOR)
        {
            return false;
        }

        // There is a closed contour, but we need to check, if it captured any dots.

        var capturedAnyEnemyDots = false;

        for (var x = wall + space; x < mask.size1(); x++)
        {
            for (var y = wall + space; y < mask.size2(); y++)
            {
                var point = this._board.at(x, y);
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
        var wall = 1;
        var space = 1;
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
                    this._board.at(x, y).setOwner(player);
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

        for (var x = 0; x < this._board.size1(); x++)
        {
            for (var y = 0; y < this._board.size2(); y++)
            {
                var point = this._board.at(x, y);
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

    function leftTopMaskBoundary(mask)
    {
        for (var x = 0; x < mask.size1(); x++)
        {
            for (var y = 0; y < mask.size2(); y++)
            {
                if (mask.at(x, y) === TopologicalKind.BOUNDARY)
                {
                    return new Coordinate(x, y);
                }
            }
        }
        assert(false, "No boundary points in mask");
    }

    function newMask(size1, size2)
    {
        assert(Number.isInteger(size1) && Number.isInteger(size2));
        
        var mask = new Array2D(size1, size2, (i, j) => TopologicalKind.EXTERIOR);

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
        assert(startPoint instanceof Coordinate);
        assert(mask instanceof Array2D);
        assert(wallFunction instanceof Function);
        assert(0 < startPoint.x && startPoint.x < mask.size1() - 1);
        assert(0 < startPoint.y && startPoint.y < mask.size2() - 1);
        mask.set(startPoint.x, startPoint.y, TopologicalKind.INTERIOR);
 
        var toProcess = [ startPoint ];

        while (toProcess.length > 0)
        {
            var point = toProcess.pop();
            var offset = new Coordinate(1, 0);

            for (var i = 0; i < 4; i++)
            {
                var neighbour = new Coordinate(point.x + offset.x, point.y + offset.y);
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
        assert(startPoint instanceof Coordinate);
        assert(startDirection instanceof Coordinate);
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

var Main = (function() {

    "use strict";

    function main()
    {
        var canvas = document.getElementById("board");
        var ctx = canvas.getContext("2d");

        var engine = new Game.Engine(39, 32);
        var visualizer = new Visualizer.Visualizer(PLAYDOTS_THEME(ctx), engine);

        var k = 0;
        canvas.addEventListener("click", function(event)
        {
            visualizer.onMouseClick(new Lib.Point(event.offsetX, event.offsetY));
        });

        // canvas.addEventListener("mousemove", function(event)
        // {
        //     visualizer.onMouseMove(event.offsetX, event.offsetY);
        // });
    }

    return {
        main: main
    };

}());

Main.main()
