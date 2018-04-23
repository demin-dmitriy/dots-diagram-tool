export const TYPE_FUNC = Symbol("Type Func");


function hasPrimitiveType(value, type)
{
    if (type === String)
    {
        return typeof value === 'string';
    }
    if (type === Number)
    {
        return typeof value === 'number';
    }
    if (type === Boolean)
    {
        return typeof value === 'boolean';
    }
    if (type === Symbol)
    {
        return typeof value === 'symbol';
    }
    return false;
}


export function hasType(value, type)
{
    if (TYPE_FUNC in type)
    {
        return type[TYPE_FUNC](value);
    }
    return hasPrimitiveType(value, type) || value instanceof type;
}
