import { Subscribable, assert, Point } from '/Lib.js';
import * as Game from '/Game.js';


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
        assert(this._actions.length == this._actionCount, "Branching history is not supported");
        this._actions.push(action);
        this._actionCount += 1;
        action(self);
    }
}

export class Visualizer extends Subscribable
{
    constructor(theme, boardSize)
    {
        assert(boardSize instanceof Game.BoardSize);

        super();

        this._state = new State();
        this._boardSize = boardSize;
        this._theme = theme;

        this._fieldLeft = this._boardXCordToCanvasXCord(0);
        this._fieldTop = this._boardYCordToCanvasYCord(0);
        this._fieldRight = this._boardXCordToCanvasXCord(boardSize.width - 1);
        this._fieldBottom = this._boardYCordToCanvasYCord(boardSize.height - 1);
    }

    _doAction(action)
    {
        this._state.act(action, this);
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

    init()
    {
        this._doAction(self => self._init());
    }

    _init()
    {
        const theme = this._theme;

        const canvasWidth = this._fieldRight + theme.paddingRight;
        const canvasHeight = this._fieldBottom + theme.paddingBottom;
        theme.resetCanvas(canvasWidth, canvasHeight);

        this._notify("resizeBoardCanvas", [canvasWidth, canvasHeight]);

        for (let boardX = 0; boardX < this._boardSize.width; boardX++)
        {
            const x = this._boardXCordToCanvasXCord(boardX);
            theme.gridLine(new Point(x, this._fieldTop), new Point(x, this._fieldBottom));
        }

        for (let boardY = 0; boardY < this._boardSize.height; boardY++)
        {
            const y = this._boardYCordToCanvasYCord(boardY);
            theme.gridLine(new Point(this._fieldLeft, y), new Point(this._fieldRight, y));
        }
    }

    playAt(player, coordinate)
    {
        this._doAction(self => self._playAt(player, coordinate));
    }

    _playAt(player, coordinate)
    {
        const size = this._boardSize;
        const theme = this._theme;
        const x = coordinate.x;
        const y = coordinate.y;
        assert(0 <= x && x < size.width);
        assert(0 <= y && y < size.height);

        theme.dot(player, this._boardPointToCanvasPoint(new Point(x, y)));
    }

    capture(player, pointChain)
    {
        this._doAction(self => self._capture(player, pointChain));
    }

    _capture(player, pointChain)
    {
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
        assert(canvasPoint instanceof Point);
        const theme = this._theme;
        const size = this._boardSize;
        const gridStep = theme.gridStep

        const boardX = Math.floor((canvasPoint.x - this._fieldLeft + gridStep / 2) / gridStep);
        const boardY = Math.floor((canvasPoint.y - this._fieldTop + gridStep / 2) / gridStep);
        if (0 <= boardX && boardX < size.width && 0 <= boardY && boardY < size.height)
        {
            const coordinate = new Game.Coordinate(boardX, boardY);
            this._notify("playIfLegalAt", [coordinate]);
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
