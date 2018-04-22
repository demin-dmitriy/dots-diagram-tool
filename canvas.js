import { assert } from '/utils/assert.js';
import { assertArgs } from '/utils/assertArgs';
import { updateAttrs } from '/utils/update_attrs.js';
import { Vector } from '/data/vector.js';
import * as array_utils from '/utils/array.js';


export class Canvas
{
    constructor(rootNode, parameters)
    {
        assertArgs(arguments, {
            rootNode: HTMLElement,
            parameters: {
                layerIds: Array,
                size: {
                    width: Number,
                    height: Number,
                }
            }
        });

        this._rootNode = rootNode;
        this._layerNames = parameters.layerNames;
        this._size = parameters.size;
        this._layers = { };
        this._canvasElements = [ ];

        for (let i = 0; i < this._layerNames.length; ++i)
        {
            const layerName = this._layerNames[i];
            const canvasElement = document.createElement('canvas');
            rootNode.appendChild(canvasElement);
            this._canvasElements.push(canvasElement);
            const context = canvasElement.getContext('2d');
            this._layers[layerName] = new Layer(context);
        }

        this._updateStyle();
        this.resize(this._size);
    }

    resize(size)
    {
        this._size = size;

        for (let i = 0; i < this._canvasElements.length; ++i)
        {
            const canvasElement = this._canvasElements[i];
            canvasElement.width = size.width;
            canvasElement.height = size.height;
        }

        this._updateStyle();
    }

    get size()
    {
        return this._size;
    }

    layer(id)
    {
        assert(id in this._layers, "invalid layer id");
        return this._layers[id];
    }

    addEventListener(...args)
    {
        return this._lastCanvas().addEventListener(...args);
    }

    removeEventListener(...args)
    {
        return this._lastCanvas().removeEventListener(...args);
    }

    _lastCanvas()
    {
        return array_utils.last(this._canvasElements);
    }

    _updateStyle()
    {
        this._rootNode.style.height = this._size.height;
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
        assertArgs(arguments, {
            point: Vector,
            radius: Number,
            style: Object
        });

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
        assertArgs(arguments, {
            pointFrom: Vector,
            pointTo: Vector,
            style: Object
        });

        withStyle(this._ctx, style, () =>
        {
            this._ctx.beginPath();
            this._ctx.moveTo(pointFrom.x, pointFrom.y);
            this._ctx.lineTo(pointTo.x, pointTo.y);
            this._ctx.stroke();
        });
    }
}
