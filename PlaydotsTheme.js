let PLAYDOTS_THEME = (function() {

    "use strict";

    let D = Drawing;

    let blueColor = '#2358ED';
    let redColor = '#D32020';
    let dimColor = 'rgba(0, 0, 0, 0.15)'

    // TODO: rework this
    let dotStyles =
    {
        0: [D.fillStyle(blueColor), D.strokeStyle(blueColor)],
        1: [D.fillStyle(redColor), D.strokeStyle(redColor)]
    };

    let captureStyles =
    {
        0: [D.fillStyle('rgba(35, 88, 237, 0.3)'), D.strokeStyle(blueColor)],
        1: [D.fillStyle('rgba(211, 32, 32, 0.3)'), D.strokeStyle(redColor)]
    };

    let theme = (boardCtx, selectorCtx) =>
    ({
        gridLine: (p1, p2) => D.line(p1, p2, D.lineWidth(0), D.strokeStyle('#E1E6EB'))(boardCtx),
        gridStep: 19,
        paddingLeft: 20.5,
        paddingTop: 20.5,
        paddingRight: 20.5,
        paddingBottom: 20.5,

        dot: (player, p) => D.circle(p, 5, ...dotStyles[player.id])(boardCtx),

        setupCanvas: (width, height) =>
        {
            // TODO: we maybe need to fill canvas
            boardCtx.canvas.width = width;
            boardCtx.canvas.height = height;
            selectorCtx.canvas.width = width;
            selectorCtx.canvas.height = height;
        },

        capturePolygon: (player, points) =>
        {
            assert(points.length > 0);
            D.withStyles(boardCtx, captureStyles[player.id], () =>
            {
                boardCtx.beginPath();
                boardCtx.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < points.length; i++)
                {
                    boardCtx.lineTo(points[i].x, points[i].y);
                }
                boardCtx.closePath();
                boardCtx.stroke();
                boardCtx.fill();
            });
        },

        selectRect: (rect) =>
        {
            selectorCtx.fillStyle = dimColor;
            selectorCtx.clearRect(0, 0, selectorCtx.canvas.width, selectorCtx.canvas.height);
            selectorCtx.fillRect(0, 0, selectorCtx.canvas.width, selectorCtx.canvas.height);
            selectorCtx.clearRect(rect.left, rect.top, rect.right - rect.left, rect.bottom - rect.top);
        }

        // setScore
    });

    return theme;
}());
