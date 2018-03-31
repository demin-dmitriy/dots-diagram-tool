import { assert, assertEq } from '/utils/assert.js';
import { hasType } from '/utils/has_type.js';


function assertSatisfySpec(name, value, argSpec)
{
    if (typeof argSpec === 'object')
    {
        assertNamedArgs(value, argSpec);
    }
    else
    {
        
    }
}


export function assertNamedArgs(args, spec)
{
    for (let argName in spec)
    {
        assert(argName in args, `argument "${argName}" is missing`);
        assertSatisfySpec(argName, args[argName], spec[argName]);
    }

    // Optional arguments aren't allowed for now
    for (let argName in args)
    {
        assert(argName in spec, `superfluous argument "${argName}"`);
    }
}


export function assertArgs(args, spec)
{
    assertEq(
        args.length,
        Object.keys(spec).length,
        'invalid number of arguments'
    );

    let i = 0;

    for (let argName in spec)
    {
        assertSatisfySpec(argName, args[i], spec[argName]);
        i += 1;
    }
}
