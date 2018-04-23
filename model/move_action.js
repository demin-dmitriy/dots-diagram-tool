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

    get color()
    {
        return this._color;
    }

    get x()
    {
        return this._position.x;
    }

    get y()
    {
        return this._position.y;
    }

    position()
    {
        return this._position.clone();
    }
}


class SurroundAction
{
    constructor(color, border, holes)
    {
        assertArgs(arguments, {
            color: Color,
            border: Loop,
            holes: Array /* of Loop */
        });

        this._color = color;
        this._border = border;
        this._holes = holes;
    }

    get color()
    {
        return this._color;
    }

    get border()
    {
        return this._border;
    }

    get holes()
    {
        return this._holes;
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
