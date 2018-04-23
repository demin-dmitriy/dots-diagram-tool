import { Vector } from '/data/vector.js';
import { assertArgs } from '/utils/assert_args.js';
import { Loop } from '/model/loop.js';
import { Color } from '/model/color.js';


class PlaceDotAction
{
    constructor(color, position)
    {
        assertArgs(arguments, {
            color: Color,
            position: Vector 
        });

        this._color = color;
        this._position = position;
    }

    on({ placeDot, surround })
    {
        return placeDot(this._color, this._position);
    }
}


class SurroundAction
{
    constructor(color, border, holes)
    {
        assertArgs(arguments, {
            color: Color,
            border: Loop,
            holes: Array /* of Loops */
        });

        this._color = color;
        this._border = border;
        this._holes = holes;
    }

    on({ placeDot, surround })
    {
        return surround(this._color, this._border, this._holes);
    }
}


export class MoveAction
{
    static placeDot(color, position)
    {
        return new PlaceDotAction(...arguments);
    }

    static surround(color, border, holes)
    {
        return new SurroundAction(...arguments);
    }
}
