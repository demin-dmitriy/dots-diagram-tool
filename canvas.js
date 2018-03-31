import { assert } from '/utils/assert.js';
import { updateAttrs } from '/utils/update_attrs.js';
import { Vector } from '/data/vector.js';
import { Publisher } from '/utils/publisher.js';


export class Canvas
{
    constructor(parameters)
    {
        this._layerNames = layerNames; // TODO: probably will be unused

    }

    resize(size)
    {

    }

    layer(i) // TODO: how to reference layer and how to order them?
    {

    }

    addEventListener(...args)
    {

    }

    removeEventListener(...args)
    {

    }
}


function withStyle(drawingContext, style, continuation)
{
    drawingContext.save();
    updateAttrs(drawingContext, style);
    continuation();
    drawingContext.restore();
}


class Layer
{
    constructor(drawingContext)
    {
        this._ctx = drawingContext;
    }

    drawCircle(point, radius, style)
    {
        withStyle(this._ctx, style, () =>
        {
            this._ctx.beginPath();
            const startAngle = 0;
            const endAngle = 2 * Math.PI;
            this._ctx.arc(point.x, point.y, radius, startAngle, endAngle);
            this._ctx.fill(); // TODO: should there be a version that doesn't do this?
            this._ctx.stroke();
        });
    }

    drawLine(pointFrom, pointTo, style)
    {
        withStyle(this._ctx, style, () =>
        {
            this._ctx.beginPath();
            this._ctx.moveTo(pointFrom.x, pointFrom.y);
            this._ctx.lineTo(pointTo.x, pointTo.y);
            this._ctx.stroke();
        });
    }
}
