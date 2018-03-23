import * as Lib from '/Lib.js';


// TODO: это лучше реализовать если сделать класс обёртку.

/*
 * Combinators
 */

export function withStyles(ctx, styles, continuation)
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
export function combine(...shapes)
{
    return (ctx) =>
    {
        Lib.apply(shapes, ctx);
    };
}


/*
 * Shapes
 */

export function line(p1, p2, ...styles)
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

export function circle(p, r, ...styles)
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

export function rectangle(p1, p2, ...styles)
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

export const LineCapEnum = {
    BUTT: "butt",
    ROUND: "round",
    SQUARE: "square"
};

export function lineCap(capType)
{
    return (ctx) =>
    {
        ctx.lineCap = capType;
    };
}

export const LineJoinEnum = {
    BEVEL: "bevel",
    ROUND: "round",
    MITER: "miter"
};

export function lineJoin(joinType)
{
    return (ctx) =>
    {
        ctx.lineJoin = joinType;
    };
}

export function lineWidth(width)
{
    return (ctx) =>
    {
        ctx.lineWidth = width;
    };
}

export function fillStyle(value)
{
    return (ctx) =>
    {
        ctx.fillStyle = value;
    };
}

export function strokeStyle(value)
{
    return (ctx) =>
    {
        ctx.strokeStyle = value;
    };
}

export const ColorEnum = {
    BLUE: 'blue',
    RED: 'red',
};
