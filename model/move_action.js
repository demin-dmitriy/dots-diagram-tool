import { Vector } from '/data/vector.js';
import { assertArgs } from '/utils/assert_args.js';
import { Loop } from '/model/loop.js';


class PlaceDotAction
{
    constructor(position)
    {
        assertArgs(arguments, {
            position: Vector 
        });

        this._position = position;
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
    constructor(border, holes)
    {
        assertArgs(arguments, {
            border: Loop,
            holes: Array /* of Loop */
        });

        this._border = border;
        this._holes = holes;
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
    static placeDot(position)
    {
        return new PlaceDotAction(...arguments);
    }

    static surround()
    {
        return new SurroundAction(...arguments);
    }
}
