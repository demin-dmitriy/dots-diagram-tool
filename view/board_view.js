import { Grid } from '/grid.js';
import { Layer } from '/canvas.js';
import { assertArgs } from '/utils/assert_args.js';
import { Vector } from '/data/vector.js';


export class BoardView
{
    constructor(grid, layer, style)
    {
        assertArgs(arguments, {
            grid: Grid,
            layer: Layer,
            style: {
                lineColor: String,
                lineWidth: Number
            }
        });

        this._drawGrid(grid, layer, {
            lineWidth: style.lineWidth,
            strokeStyle: style.lineColor
        });
    }

    _drawGrid(grid, layer, style)
    {
        const left = grid.left;
        const right = grid.right;
        const top = grid.top;
        const bottom = grid.bottom;

        for (let i = 0; i < grid.sizeX; ++i)
        {
            const x = grid.verticalLine(i);
            layer.drawLine(new Vector(x, top), new Vector(x, bottom), style);
        }

        for (let j = 0; j < grid.sizeY; ++j)
        {
            const y = grid.horizontalLine(j);
            layer.drawLine(new Vector(left, y), new Vector(right, y), style);
        }
    }
}
