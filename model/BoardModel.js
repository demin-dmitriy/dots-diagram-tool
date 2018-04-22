import { assert } from '/utils/assert.js';
import { assertNamedArgs } from '/utils/assert_args.js';
import { Publisher } from '/utils/'


export class Board extends Publisher
{
    constructor(parameters)
    {
        assertNamedArgs(parameters, {
            width: Number,
            height: Number
        });

        assert(parameters.width > 0);
        assert(Number.isInteger(parameters.width));
        assert(parameters.height > 0);
        assert(Number.isInteger(parameters.height));

        this._width = width;
        this._height = height;
    }

    get width()
    {
        return this._width;
    }

    get height()
    {
        return this._height;
    }
}
