import { assert } from '/utils/assert.js';
import { hasType } from '/utils/has_type.js';
import { Vector } from '/data/vector.js';


function assertIsCoordinate(arg)
{
    assert(hasType(arg, Vector));
    assert(arg.isInteger);
}


function areAdjacent(p1, p2)
{
    const dist = p1.minus(p2).squareLength();
    return 0 < dist && dist <= 2;
}


export class Loop extends Array
{
    constructor(...args)
    {
        assert(args.length > 0);
        args.forEach(assertIsCoordinate);

        let previousPoint = args[0];

        for (let i = 1; i < args.length; ++i)
        {
            const nextPoint = args[i];
            assert(areAdjacent(previousPoint, nextPoint));
            previousPoint = nextPoint;
        }

        if (args.length >= 2)
        {
            assert(areAdjacent(args[args.length - 1], args[0]));
        }

        super(...args);
    }
}
