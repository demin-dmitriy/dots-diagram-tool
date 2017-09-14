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

    Visualizer.prototype.playAt = function(player, coordinate)
    {
        this._state.act((self) => self._playAt(player, coordinate), this);
    };

    Visualizer.prototype._playAt = function(player, coordinate)
    {
        var engine = this._engine;
        var theme = this._theme;
        var x = coordinate.x;
        var y = coordinate.y;
        assert(0 <= x && x < engine.boardWidth());
        assert(0 <= y && y < engine.boardHeight());

        theme.dot(player, this._boardPointToCanvasPoint(new Point(x, y)));
    };

    Visualizer.prototype.capture = function(player, pointChain)
    {
        console.log("Visualizer: capture!", player, pointChain);

        var canvasPointChain = new Array(pointChain.length);
        for (var i = 0; i < canvasPointChain.length; i++)
        {
            canvasPointChain[i] = this._boardPointToCanvasPoint(pointChain[i]);
        }

        this._theme.capturePolygon(player, canvasPointChain);
        // TODO: отрисовка захвата
        // Какие аргументы должны быть? Внешняя цепочка, и список дырок?
    };

    Visualizer.prototype.updateScore = function(...args)
    {
        console.log("Visualizer: score:", args);
    };

    Visualizer.prototype.onMouseClick = function(canvasPoint)
    {
        assert(canvasPoint instanceof Lib.Point);
        var theme = this._theme;
        var engine = this._engine;
        var gridStep = theme.gridStep

        var boardX = Math.floor((canvasPoint.x - this._fieldLeft + gridStep / 2) / gridStep);
        var boardY = Math.floor((canvasPoint.y - this._fieldTop + gridStep / 2) / gridStep);
        if (0 <= boardX && boardX < engine.boardWidth() && 0 <= boardY && boardY < engine.boardHeight())
        {
            var coordinate = new Game.Coordinate(boardX, boardY);
            if (engine.at(coordinate).isUnoccupied())
            {
                engine.playAt(coordinate);
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
