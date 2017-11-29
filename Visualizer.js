const Visualizer = (function() {

    "use strict";    


    const Point = Lib.Point;


    /* local */
    class State
    {
        constructor(actions=[], count=0)
        {
            this._actions = actions;
            this._actionCount = count;
        }

        clone()
        {
            return new State(this._actions, this._actionCount);
        }

        replay(self)
        {
            for (let i = 0; i < this._actionCount; i++)
            {
                this._actions[i](self);
            }
        }

        act(action, self)
        {
            assert(this._actions.length == this._actionCount, "Only linear histories are allowed");
            this._actions.push(action);
            this._actionCount += 1;
            action(self);
        }
    }


    // TODO: хороший ли интерфейс?
    class Visualizer
    {
        constructor(theme, engine)
        {
            this._state = new State();
            this._engine = engine;
            this._theme = theme;

            this._fieldLeft = this._boardXCordToCanvasXCord(0);
            this._fieldTop = this._boardYCordToCanvasYCord(0);
            this._fieldRight = this._boardXCordToCanvasXCord(engine.boardWidth - 1);
            this._fieldBottom = this._boardYCordToCanvasYCord(engine.boardHeight - 1);

            engine.subscribe(this);
            this.resetAndShowGrid();
        }

        _boardXCordToCanvasXCord(x)
        {
            return this._theme.paddingLeft + x * this._theme.gridStep;
        }

        _boardYCordToCanvasYCord(y)
        {
            return this._theme.paddingTop + y * this._theme.gridStep;
        }

        _boardPointToCanvasPoint(boardPoint)
        {
            return new Point
            (
                this._boardXCordToCanvasXCord(boardPoint.x),
                this._boardYCordToCanvasYCord(boardPoint.y)
            );
        }

        resetAndShowGrid()
        {
            this._state.act((self) => self._resetAndShowGrid(), this);
        }

        _resetAndShowGrid()
        {
            const theme = this._theme;

            theme.setupCanvas(this._fieldRight + theme.paddingRight, this._fieldBottom + theme.paddingBottom);
            for (let boardX = 0; boardX < this._engine.boardWidth; boardX++)
            {
                const x = this._boardXCordToCanvasXCord(boardX);
                theme.gridLine(new Point(x, this._fieldTop), new Point(x, this._fieldBottom));
            }

            for (let boardY = 0; boardY < this._engine.boardHeight; boardY++)
            {
                const y = this._boardYCordToCanvasYCord(boardY);
                theme.gridLine(new Point(this._fieldLeft, y), new Point(this._fieldRight, y));
            }
        }

        playAt(player, coordinate)
        {
            this._state.act((self) => self._playAt(player, coordinate), this);
        }

        _playAt(player, coordinate)
        {
            const engine = this._engine;
            const theme = this._theme;
            const x = coordinate.x;
            const y = coordinate.y;
            assert(0 <= x && x < engine.boardWidth);
            assert(0 <= y && y < engine.boardHeight);

            theme.dot(player, this._boardPointToCanvasPoint(new Point(x, y)));
        }

        capture(player, pointChain)
        {
            console.log("Visualizer: capture!", player, pointChain);

            const canvasPointChain = new Array(pointChain.length);
            for (let i = 0; i < canvasPointChain.length; i++)
            {
                canvasPointChain[i] = this._boardPointToCanvasPoint(pointChain[i]);
            }

            this._theme.capturePolygon(player, canvasPointChain);
            // TODO: отрисовка захвата
            // Какие аргументы должны быть? Внешняя цепочка, и список дырок?
        }

        updateScore(...args)
        {
            console.log("Visualizer: score:", args);
        }

        onMouseClick(canvasPoint)
        {
            assert(canvasPoint instanceof Lib.Point);
            const theme = this._theme;
            const engine = this._engine;
            const gridStep = theme.gridStep

            const boardX = Math.floor((canvasPoint.x - this._fieldLeft + gridStep / 2) / gridStep);
            const boardY = Math.floor((canvasPoint.y - this._fieldTop + gridStep / 2) / gridStep);
            if (0 <= boardX && boardX < engine.boardWidth && 0 <= boardY && boardY < engine.boardHeight)
            {
                const coordinate = new Game.Coordinate(boardX, boardY);
                if (engine.at(coordinate).isUnoccupied())
                {
                    engine.playAt(coordinate);
                }
            }
        }

        onMouseMove(x, y)
        {

        }

        save()
        {
            return this._state.clone();
        }

        load(state)
        {
            this._state = state.clone();
            this._state.replay(this);
        }
    }

    return {
        Visualizer: Visualizer
    };

}());
