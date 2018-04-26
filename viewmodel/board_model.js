import { assert } from '/utils/assert.js';
import { assertNamedArgs } from '/utils/assert_args.js';
import { isNatural } from '/utils/is_natural.js';


export class BoardModel
{
    constructor(parameters)
    {
        assertNamedArgs(parameters, {
            sizeX: Number,
            sizeY: Number
        });

        assert(isNatural(parameters.sizeX));
        assert(isNatural(parameters.sizeY));

        this._sizeX = parameters.sizeX;
        this._sizeY = parameters.sizeY;
    }

    get sizeX()
    {
        return this._sizeX;
    }

    get sizeY()
    {
        return this._sizeY;
    }
}
