var Main = (function() {

    "use strict";

    function App(canvas, initWidth, initHeight)
    {
        this._ctx = canvas.getContext("2d");
        this.resetField(initWidth, initHeight)

        canvas.addEventListener("click", (event) =>
        {
            this._visualizer.onMouseClick(new Lib.Point(event.offsetX, event.offsetY));
        });
    }

    App.prototype.resetField = function(width, height)
    {
        this._engine = new Game.Engine(width, height);
        this._visualizer = new Visualizer.Visualizer(PLAYDOTS_THEME(this._ctx), this._engine);
    };

    App.prototype.engine = function()
    {
        return this._engine;
    };

    App.prototype.visualizer = function()
    {
        return this._visualizer;
    };

    function element(id)
    {
        return document.getElementById(id);
    }

    function main()
    {

        var canvas = element("board");
        var app = new App(canvas, 39, 32);

        var resizeButton = element("resize");
        var widthField = element("width");
        var heightField = element("height");
        widthField.value = app.engine().boardWidth();
        heightField.value = app.engine().boardHeight();

        resizeButton.addEventListener("click", function(event)
        {
            var width = Number(widthField.value);
            var height = Number(heightField.value);

            if (Number.isInteger(width) && Number.isInteger(height))
            {
                app.resetField(width, height);
            }
            else
            {
                console.log("Input error: Board dimensions must be integer");
            }
        });
    }

    return {
        App: App,
        main: main
    };

}());
