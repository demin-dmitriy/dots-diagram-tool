import { Subscribable, assert } from '/Lib.js';
import * as Lib from '/Lib.js';
import * as D from '/Drawing.js';


const blueColor = '#2358ED';
const redColor = '#D32020';
const redColor2 = 'hsl(224, 100%, 96%)';
const dimColor = 'rgba(0, 0, 0, 0.15)'

const dotStyles =
{
    0: [D.fillStyle(blueColor), D.strokeStyle(blueColor)],
    1: [D.fillStyle(redColor), D.strokeStyle(redColor)]
};

const captureStyles =
{
    0: [D.fillStyle('rgba(35, 88, 237, 0.3)'), D.strokeStyle(blueColor)],
    1: [D.fillStyle('rgba(211, 32, 32, 0.3)'), D.strokeStyle(redColor)]
};

function createCanvas(node, name)
{
    const canvas = document.createElement("canvas");
    canvas.setAttribute("id", name);
    node.appendChild(canvas);
    return canvas;
}

const boardParameters = {
    gridStep: 19,
    paddingLeft: 20.5,
    paddingTop: 20.5,
    paddingRight: 20.5,
    paddingBottom: 20.5
};

class BoardComponent extends Subscribable
{
    constructor(canvas)
    {
        super();

        this._canvas = canvas;
        this._context = canvas.getContext('2d');

        for (const parameter in boardParameters)
        {
            this[parameter] = boardParameters[parameter];
        }

        canvas.addEventListener("click", (event) =>
        {
            const point = new Lib.Point(event.offsetX, event.offsetY);
            this._notify("onMouseClick", [point]);
        });
    }

    resetCanvas(width, height)
    {
        // TODO: maybe need to fill the canvas
        this._canvas.width = width;
        this._canvas.height = height;
    }

    gridLine(p1, p2)
    {
        const ctx = this._context;
        D.line(p1, p2, D.lineWidth(0), D.strokeStyle('#E1E6EB'))(ctx);
    }

    dot(player, p)
    {
        const ctx = this._context;
        D.circle(p, 5, ...dotStyles[player.id])(ctx)
    }

    capturePolygon(player, points)
    {
        assert(points.length > 0);

        const ctx = this._context;

        D.withStyles(ctx, captureStyles[player.id], () =>
        {
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++)
            {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.closePath();
            ctx.stroke();
            ctx.fill();
        });
    }
}

class SelectorComponent extends Subscribable
{
    constructor(canvas)
    {
        super();

        this._canvas = canvas;
        this._context = canvas.getContext('2d');

        for (const parameter in boardParameters)
        {
            this[parameter] = boardParameters[parameter];
        }

        canvas.addEventListener("click", (event) =>
        {
            const point = new Lib.Point(event.offsetX, event.offsetY);
            this._notify("onMouseClick", [point]);
        });
    }

    resetCanvas(width, height)
    {
        this._canvas.width = width;
        this._canvas.height = height;
    }

    selectRect(rect)
    {
        const ctx = this._context;
        const canvas = this._canvas;

        ctx.fillStyle = dimColor;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.clearRect(rect.left, rect.top, rect.right - rect.left, rect.bottom - rect.top);
    }
}

const cssClassSelected = 'selected';

class HistoryComponent
{
    constructor(domContainer)
    {
        this._domContatiner = domContainer;
        this._addedNodes = [];
        this._selectedNode = null;
    }

    cleanup()
    {
        this._domContatiner.innerHTML = '';
    }

    select(index)
    {
        assert(0 <= index && index < this._addedNodes.length, "Index out of range");

        if (this._selectedNode !== null)
        {
            this._addedNodes[this._selectedNode].classList.remove(cssClassSelected);
        }
        this._selectedNode = index;
        this._addedNodes[index].classList.add(cssClassSelected);
    }

    appendNode(name, cssClass, onclick)
    {
        const button = document.createElement("a");
        button.innerHTML = name;
        button.setAttribute("href", "#");

        button.setAttribute("class", cssClass);
        button.onclick = () => {
            onclick();
            return false;
        };
        this._domContatiner.appendChild(button);
        this._addedNodes.push(button);
    }
}

class FileLoaderComponent extends Subscribable
{
    constructor(dropZone)
    {
        super();

        this._dropZone = dropZone;
        this._cancelEvent = (event) =>
        {
            event.preventDefault();
            return false;
        };

        this._dropEvent = (event) =>
        {
            event.preventDefault();

            const files = event.dataTransfer.files;

            for (let i = 0; i != files.length; ++i)
            {
                this._notify("loadFile", [files[i]]);
            }

            return false;
        }

        dropZone.addEventListener("dragover", this._cancelEvent);
        dropZone.addEventListener("dragenter", this._cancelEvent);
        dropZone.addEventListener("drop", this._dropEvent);
    }

    cleanup()
    {
        const dropZone = this._dropZone;

        dropZone.removeEventListener("dragover", this._cancelEvent);
        dropZone.removeEventListener("dragenter", this._cancelEvent);
        dropZone.removeEventListener("drop", this._dropEvent);
    }
}

export class PlaydotsTheme
{
    constructor(elements)
    {
        const workspace = elements.workspace;
        const history = elements.history;
        const dropZone = elements.dropZone;

        this._workspaceElement = workspace;
        this._historyElement = history;

        const boardCanvas = createCanvas(workspace, "board");
        const selectorCanvas = createCanvas(workspace, "overlay");

        this._boardComponent = new BoardComponent(boardCanvas);
        this._selectorComponent = new SelectorComponent(selectorCanvas);
        this._historyComponent = new HistoryComponent(history);
        this._fileLoaderComponent = new FileLoaderComponent(dropZone);
    }

    cleanup()
    {
        this._historyComponent.cleanup();
        this._workspaceElement.innerHTML = '';
        this._fileLoaderComponent.cleanup();
    }

    resizeBoardCanvas(canvasWidth, canvasHeight)
    {
        this._workspaceElement.style.height = canvasHeight + "px";
    }

    resetCanvas(width, height)
    {
        this._boardComponent.resetCanvas(width, height);
        this._selectorComponent.resetCanvas(width, height);
    }

    get board()
    {
        return this._boardComponent;
    }

    get selector()
    {
        return this._selectorComponent;
    }

    get history()
    {
        return this._historyComponent;
    }

    get fileLoader()
    {
        return this._fileLoaderComponent;
    }
}
