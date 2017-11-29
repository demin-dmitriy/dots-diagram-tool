const Main = (function() {

    "use strict";

    function createCanvas(node, name)
    {
        const canvas = document.createElement("canvas");
        canvas.setAttribute("id", name);
        node.appendChild(canvas);
        return canvas;
    }

    class App extends Lib.Subscribable
    {
        constructor(workspace, initWidth, initHeight)
        {
            super();

            const boardCanvas = createCanvas(workspace, "board");
            const overlayCanvas = createCanvas(workspace, "overlay");

            this._boardCtx = boardCanvas.getContext("2d");
            this._overlayCtx = overlayCanvas.getContext("2d");

            this.resetField(initWidth, initHeight)

            // TODO: not a good design
            overlayCanvas.addEventListener("click", (event) =>
            {
                this._visualizer.onMouseClick(new Lib.Point(event.offsetX, event.offsetY));
            });
        }

        resetField(width, height)
        {
            this._engine = new Game.Engine(width, height);
            const theme = PLAYDOTS_THEME(this._boardCtx, this._overlayCtx);
            this._visualizer = new Visualizer.Visualizer(theme, this._engine);
            this._selector = new Selector.Model(width, height);
            this._selectorVis = new Selector.Visualizer(theme, this._selector);

            const canvas = this._boardCtx.canvas;
            this._notify("resize", [ canvas.width, canvas.height ]);
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

    function element(id)
    {
        return document.getElementById(id);
    }

    function main()
    {
        const workspace = element("workspace");
        workspace.style.height = "630px";

        const app = new App(workspace, 39, 32);
        document.app = app;

        const resizeButton = element("resize");
        const widthField = element("width");
        const heightField = element("height");
        widthField.value = app.engine.boardWidth;
        heightField.value = app.engine.boardHeight;

        resizeButton.addEventListener("click", function(event)
        {
            const width = Number(widthField.value);
            const height = Number(heightField.value);

            if (Number.isInteger(width) && Number.isInteger(height))
            {
                app.resetField(width, height);
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

        app.subscribe({
            resize: function(width, height)
            {
                workspace.style.height = height + "px";
            }
        })
    }

    return {
        App: App,
        main: main
    };

}());
