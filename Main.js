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
