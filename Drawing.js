const Drawing = (function() {

    "use strict";


    /*
     * Combinators
     */

    function withStyles(ctx, styles, continuation)
    {
        if (0 != styles.length)
        {
            ctx.save();
            Lib.apply(styles, ctx);
            continuation();
            ctx.restore();
        }
        else
        {
            continuation();
        }
    }

    // TODO: Probably not needed
    function combine(...shapes)
    {
        return (ctx) =>
        {
            Lib.apply(shapes, ctx);
        };
    }


    /*
     * Shapes
     */

    function line(p1, p2, ...styles)
    {
        return (ctx) =>
        {
            withStyles(ctx, styles, () =>
            {
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            });
        };
    }

    function circle(p, r, ...styles)
    {
        return (ctx) =>
        {
            withStyles(ctx, styles, () =>
            {
                ctx.beginPath();
                const startAngle = 0;
                const endAngle = 2 * Math.PI;
                ctx.arc(p.x, p.y, r, startAngle, endAngle, false);
                ctx.fill();
                ctx.stroke();
            });
        };
    }

    function rectangle(p1, p2, ...styles)
    {
        return (ctx) =>
        {
            withStyles(ctx, styles, () =>
            {
                ctx.beginPath();
                ctx.rect(p1.x, p1.y, p2.x, p2.y);
                ctx.stroke();
            });
        };
    }


    /*
     * Styles
     */

    const LineCapEnum = {
        BUTT: "butt",
        ROUND: "round",
        SQUARE: "square"
    };

    function lineCap(capType)
    {
        return (ctx) =>
        {
            ctx.lineCap = capType;
        };
    }

    const LineJoinEnum = {
        BEVEL: "bevel",
        ROUND: "round",
        MITER: "miter"
    };

    function lineJoin(joinType)
    {
        return (ctx) =>
        {
            ctx.lineJoin = joinType;
        };
    }

    function lineWidth(width)
    {
        return (ctx) =>
        {
            ctx.lineWidth = width;
        };
    }

    function fillStyle(value)
    {
        return (ctx) =>
        {
            ctx.fillStyle = value;
        };
    }

    function strokeStyle(value)
    {
        return (ctx) =>
        {
            ctx.strokeStyle = value;
        };
    }

    const ColorEnum = {
        BLUE: 'blue',
        RED: 'red',
    };

    return {
        withStyles: withStyles,
        combine: combine,
        line: line,
        circle: circle,
        rectangle: rectangle,
        LineCapEnum: LineCapEnum,
        lineCap: lineCap,
        LineJoinEnum: LineJoinEnum,
        lineJoin: lineJoin,
        lineWidth: lineWidth,
        fillStyle: fillStyle,
        strokeStyle: strokeStyle,
        ColorEnum: ColorEnum,
    };

}());
