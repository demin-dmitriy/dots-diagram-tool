import { assert } from '/utils/assert.js';
import { assertArgs } from '/utils/assert_args.js';
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
        this._layerIds = parameters.layerIds;
        this._size = parameters.size;
        this._layers = { };
        this._canvasElements = [ ];

        rootNode.style.height = this._size.height + 'px';

        for (let i = 0; i < this._layerIds.length; ++i)
        {
            const layerId = this._layerIds[i];
            const canvasElement = document.createElement('canvas');
            // TODO: this probably should be in css classs
            canvasElement.style.position = 'absolute';
            canvasElement.style.left = '0px';
            canvasElement.style.right = '0px';
            canvasElement.style.margin = '0 auto';
            rootNode.appendChild(canvasElement);
            this._canvasElements.push(canvasElement);
            const context = canvasElement.getContext('2d');
            this._layers[layerId] = new Layer(context);
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


export class Layer
{
    constructor(drawingContext)
    {
        this._ctx = drawingContext;
    }

    get width()
    {
        return this._ctx.canvas.width;
    }

    get height()
    {
        return this._ctx.canvas.height;
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

    drawRectangle(rectangle, style)
    {
        assertArgs(arguments, {
            rectangle: {
                left: Number,
                right: Number,
                top: Number,
                bottom: Number
            },
            style: Object
        });

        withStyle(this._ctx, style, () =>
        {
            this._ctx.fillRect(
                rectangle.left,
                rectangle.top,
                rectangle.right - rectangle.left,
                rectangle.bottom - rectangle.top
            );
        });
    }


}
