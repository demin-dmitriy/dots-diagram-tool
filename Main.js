let Main = (function() {

    "use strict";

    class App extends Lib.Subscribable
    {
        constructor(boardCanvas, overlayCanvas, initWidth, initHeight)
        {
            super();

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
            let theme = PLAYDOTS_THEME(this._boardCtx, this._overlayCtx);
            this._visualizer = new Visualizer.Visualizer(theme, this._engine);
            this._selector = new Selector.Model(width, height);
            this._selectorVis = new Selector.Visualizer(theme, this._selector);

            let canvas = this._boardCtx.canvas;
            this._notify("resize", [ canvas.width, canvas.height ]);
        }

        engine()
        {
            return this._engine;
        }

        visualizer()
        {
            return this._visualizer;
        }

        selector()
        {
            return this._selector;
        }

        randomRun(count)
        {
            for (let i = 0; i < count; ++i)
            {
                let c = null;

                while (true)
                {
                    let x = Math.floor(Math.random() * this._engine.boardWidth);
                    let y = Math.floor(Math.random() * this._engine.boardHeight)
                    c = new Game.Coordinate(x, y);
                    if (this._engine.at(c).isUnoccupied())
                    {
                        break;
                    }
                }

                this._engine.playAt(new Game.Coordinate(x, y));
            }
        }
    }

    function element(id)
    {
        return document.getElementById(id);
    }

    function main()
    {
        let boardCanvas = element("board");
        let overlayCanvas = element("overlay");
        let ctx2 = overlayCanvas.getContext('2d');
        let workspace = element("workspace");
        workspace.style.height = "630px";

        let app = new App(boardCanvas, overlayCanvas, 39, 32);
        document.app = app;

        let resizeButton = element("resize");
        let widthField = element("width");
        let heightField = element("height");
        widthField.value = app.engine().boardWidth;
        heightField.value = app.engine().boardHeight;

        resizeButton.addEventListener("click", function(event)
        {
            let width = Number(widthField.value);
            let height = Number(heightField.value);

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
            app.selector().left -= 1;
        });
        element("left+").addEventListener("click", function(event)
        {
            app.selector().left += 1;
        });
        element("right-").addEventListener("click", function(event)
        {
            app.selector().right -= 1;
        });
        element("right+").addEventListener("click", function(event)
        {
            app.selector().right += 1;
        });
        element("top-").addEventListener("click", function(event)
        {
            app.selector().top -= 1;
        });
        element("top+").addEventListener("click", function(event)
        {
            app.selector().top += 1;
        });
        element("bottom-").addEventListener("click", function(event)
        {
            app.selector().bottom -= 1;
        });
        element("bottom+").addEventListener("click", function(event)
        {
            app.selector().bottom += 1;
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
