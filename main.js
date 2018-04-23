import { Subscribable, assert } from '/Lib.js';
import * as Game from '/Game.js';
import * as Selector from '/Selector.js';
import * as History from '/History.js';
import * as SgfParser from '/SgfParser.js';
import * as Themes from '/Themes.js';
import * as Visualizer from '/Visualizer.js';


function element(id)
{
    return document.getElementById(id);
}


export class App extends Subscribable
{
    constructor(theme, initSize)
    {
        assert(initSize instanceof Game.BoardSize);
        super();
        this.resetField(initSize);
    }

    resetField(size)
    {
        const elements = {
            workspace: element("workspace"),
            history: element("history"),
            dropZone: document
        };

        if (this._theme !== undefined)
        {
            this._theme.cleanup();
        }

        this._engine = new Game.Engine(size);
        this._selector = new Selector.Model(size);

        const theme = new Themes.Playdots(elements);
        this._theme = theme;

        this._visualizer = new Visualizer.Visualizer(theme.board, size);
        this._selectorVis = new Selector.Visualizer(theme.selector, this._selector);
        this._history = new History.History(theme.history, this._visualizer);

        this._visualizer.subscribe(theme);
        this._visualizer.subscribe(this._selectorVis);
        this._visualizer.subscribe(this._engine);
        this._engine.subscribe(this._visualizer);
        this._engine.subscribe(this._history);
        this._theme.selector.subscribe(this._visualizer);

        this._theme.fileLoader.subscribe(this);

        this._visualizer.init();
        this._history.init();
    }

    get theme()
    {
        return this._theme;
    }

    get engine()
    {
        return this._engine;
    }

    get visualizer()
    {
        return this._visualizer;
    }

    get selector()
    {
        return this._selector;
    }

    get history()
    {
        return this._history;
    }

    loadFile(file)
    {
        const fileReader = new FileReader();
        fileReader.readAsText(file);
        fileReader.onload = (event) =>
        {
            const result = SgfParser.parse(event.target.result);
            if (result.length != 1)
            {
                console.log("Warning: sgf file should contain exactly one game");
            }
            if (result.length >= 1)
            {
                this.loadGame(result[0]);
            }
        }
    }

    loadGame(game)
    {
        assert(game.getPropertyValue("FF") == 4);
        assert(game.getPropertyValue("GM") == 40);

        const size = game.getPropertyValue("SZ");
        this.resetField(new Game.BoardSize(size[0], size[1]));

        const placeDots = (arrayOrCoordinate, color) =>
        {
            if (arrayOrCoordinate instanceof Array)
            {
                const array = arrayOrCoordinate;
                for (let i = 0; i < array.length; i++)
                {
                    this.engine.placeDotAt(array[i], color);
                }
            }
            else if (arrayOrCoordinate instanceof Game.Coordinate)
            {
                const coordinate = arrayOrCoordinate;
                this.engine.placeDotAt(coordinate, color);
            }
            else
            {
                assert(arrayOrCoordinate === null);
            }
        }

        let currentNode = game;

        while (true)
        {
            const addBlue = currentNode.getPropertyValue("AB", []);
            const addRed = currentNode.getPropertyValue("AW", []);
            const playBlue = currentNode.getPropertyValue("B");
            const playRed = currentNode.getPropertyValue("W");

            placeDots(addBlue, Game.PlayerEnum.BLUE);
            placeDots(addRed, Game.PlayerEnum.RED);
            placeDots(playBlue, Game.PlayerEnum.BLUE);
            placeDots(playRed, Game.PlayerEnum.RED);

            this.history.historyCheckpoint();
            if (currentNode.children.length >= 1)
            {
                currentNode = currentNode.children[0];
            }
            else
            {
                break;
            }
        }
    }

    randomRun(count)
    {
        const ATTEMPT_LIMIT = 10000;
        outter_loop:
        for (let i = 0; i < count; ++i)
        {
            let c = null;

            for (let attempNumber = 0; attempNumber < ATTEMPT_LIMIT; ++attempNumber)
            {
                const x = Math.floor(Math.random() * this._engine.boardWidth);
                const y = Math.floor(Math.random() * this._engine.boardHeight)
                c = new Game.Coordinate(x, y);
                if (this._engine.at(c).isUnoccupied())
                {
                    this._engine.playAt(new Game.Coordinate(x, y));
                    continue outter_loop;
                }
            }
            console.log
            (
                "Can't find free spot after " + ATTEMPT_LIMIT + " attempts. Only " + i + " dots were placed"
            );
            break;
        }
    }
}

export function main()
{
    const workspace = element("workspace");

    const app = new App(workspace, new Game.BoardSize(39, 32));
    document.app = app;

    // TODO: всё что ниже должно быть в theme?
    const resizeButton = element("resize");
    const widthField = element("width");
    const heightField = element("height");

    widthField.value = app.engine.boardWidth;
    heightField.value = app.engine.boardHeight;

    document.onkeydown = function(event)
    {
        // event = event || window.event;

        const left = 37;
        const up = 38;
        const right = 39;
        const down = 40;

        if (event.keyCode == left)
        {
            app.history.timepoint -= 1;
        }
        else if (event.keyCode == right)
        {
            app.history.timepoint += 1;
        }
        else if (event.keyCode == down)
        {
            app.history.timepoint = app.history.lastTimepoint;
        }
        else if (event.keyCode == up)
        {
            app.history.timepoint = 0;
        }
    };

    // TODO: is it good place for event listeners?
    resizeButton.addEventListener("click", function(event)
    {
        const width = Number(widthField.value);
        const height = Number(heightField.value);

        if (Number.isInteger(width) && Number.isInteger(height))
        {
            app.resetField(new Game.BoardSize(width, height));
        }
        else
        {
            console.log("Input error: Board dimensions must be integer");
        }
    });

    element("left-").addEventListener("click", function(event)
    {
        app.selector.left -= 1;
    });
    element("left+").addEventListener("click", function(event)
    {
        app.selector.left += 1;
    });
    element("right-").addEventListener("click", function(event)
    {
        app.selector.right -= 1;
    });
    element("right+").addEventListener("click", function(event)
    {
        app.selector.right += 1;
    });
    element("top-").addEventListener("click", function(event)
    {
        app.selector.top -= 1;
    });
    element("top+").addEventListener("click", function(event)
    {
        app.selector.top += 1;
    });
    element("bottom-").addEventListener("click", function(event)
    {
        app.selector.bottom -= 1;
    });
    element("bottom+").addEventListener("click", function(event)
    {
        app.selector.bottom += 1;
    });
}
