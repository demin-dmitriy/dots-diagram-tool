import { assertNamedArgs, assertArgs } from '/utils/assert_args.js';
import { Publisher } from '/utils/publisher.js';


const UPDATE_SIGNAL = 'updateCropModel';


export class CropModel extends Publisher
{
    constructor(parameters)
    {
        assertNamedArgs(parameters, {
            left: Number,
            right: Number,
            top: Number,
            bottom: Number
        });

        super([ UPDATE_SIGNAL ]);

        this._left = parameters.left;
        this._right = parameters.right;
        this._top = parameters.top;
        this._bottom = parameters.bottom;
    }

    get left()
    {
        return this._left;
    }

    set left(value)
    {
        this._left = value;
        this.notify(UPDATE_SIGNAL, []);
    }

    get right()
    {
        return this._right;
    }

    set right(value)
    {
        this._right = value;
        this.notify(UPDATE_SIGNAL, []);
    }

    get top()
    {
        return this._top;
    }

    set top(value)
    {
        this._top = value;
        this.notify(UPDATE_SIGNAL, []);
    }

    get bottom()
    {
        return this._bottom;
    }

    set bottom(value)
    {
        this._bottom = value;
        this.notify(UPDATE_SIGNAL, []);
    }
}
