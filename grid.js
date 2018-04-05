import { assertArgs, assertNamedArgs } from '/utils/assert_args.js';
import { assert } from '/utils/assert.js';
import { Vector } from '/data/vector.js';
import { Maybe } from '/data/maybe.js';


/*
 *  Coordinates are calculated from top left corner. Top-left point has board
 *  coordinate (0, 0), and canvas coordinate (paddingX, paddingY).
 */
export class Grid
{
    constructor(parameters)
    {
        assertNamedArgs(parameters, {
            paddingX : Number,
            paddingY : Number,
            cellSize : Number,
            nx : Number,
            ny : Number
        });

        assert(parameters.nx > 0);
        assert(Number.isInteger(parameters.nx));
        assert(parameters.ny > 0);
        assert(Number.isInteger(parameters.ny));

        assert(parameters.cellSize > 0);

        this._paddingX = parameters.paddingX;
        this._paddingY = parameters.paddingY;
        this._cellSize = parameters.cellSize;
        this._nx = parameters.nx;
        this._ny = parameters.ny;
    }

    get sizeX()
    {
        return this._nx;
    }

    get sizeY()
    {
        return this._ny;
    }

    get left()
    {
        return this.verticalLine(0);
    }

    get right()
    {
        return this.verticalLine(this._nx - 1);
    }

    get top()
    {
        return this.horizontalLine(0);
    }

    get bottom()
    {
        return this.horizontalLine(this._ny - 1);
    }

    horizontalLine(j)
    {
        assertArgs(arguments, { j : Number });

        return this._paddingY + this._cellSize * j;
    }

    verticalLine(i)
    {
        assertArgs(arguments, { i : Number});

        return this._paddingX + this._cellSize * i;
    }

    at(gridPoint)
    {
        assertArgs(arguments, { gridPoint : Vector });

        return new Vector(
            verticalLine(gridPoint.x),
            horizontalLine(gridPoint.y)
        );
    }

    snapToGrid(canvasPoint)
    {
        assertArgs(arguments, { point : Vector });

        const cellSize = this._cellSize;
        const realtiveX = canvasPoint.x - this._paddingX;
        const relativeY = canvasPoint.y - this._paddingY;

        const i = Math.floor((realtiveX + cellSize / 2) / cellSize);
        const j = Math.floor((relativeY + cellSize / 2) / cellSize);

        if (0 <= i && i < this._nx && 0 <= j && j < this._ny)
        {
            return Maybe.just(new Vector(i, j));
        }
        else
        {
            return Maybe.nothing();
        }
    }
}
