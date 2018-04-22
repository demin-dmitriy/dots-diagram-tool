import { assert } from '/utils/assert.js';
import { assertNamedArgs } from '/utils/assert_args.js';
import { Publisher } from '/utils/'
import { isNatural } from '/utils/is_natural';


export class BoardModel extends Publisher
{
    constructor(parameters)
    {
        assertNamedArgs(parameters, {
            sizeX: Number,
            sizeY: Number
        });

        assert(isNatural(sizeX));
        assert(isNatural(sizeY));

        this._sizeX = sizeX;
        this._sizeY = sizeY;
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
