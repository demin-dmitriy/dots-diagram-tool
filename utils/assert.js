class AssertionError extends Error { }


export function assert(condition, message = 'assertion failed', ...params)
{
    if (!condition)
    {
        if (params.length > 0)
        {
            console.error(...params);
        }

        throw new AssertionError(message);
    }
}


export function assertEq(expected, have, message)
{
    if (expected !== have)
    {
        throw new AssertionError(`${message} (${expected} !== ${have})`);
    }
}
