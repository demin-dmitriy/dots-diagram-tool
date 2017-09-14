var PLAYDOTS_THEME = (function() {

    "use strict";

    var D = Drawing;

    var blueColor = '#2358ED';
    var redColor = '#D32020';

    // TODO: rework this
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

        capturePolygon: function(player, points)
        {
            console.log("drawing polygon", player, points);
            assert(points.length > 0);
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (var i = 1; i < points.length; i++)
            {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.closePath();
            ctx.stroke();
        },

        // setScore
    });

    return theme;
}());
