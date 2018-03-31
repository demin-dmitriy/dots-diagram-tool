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
    return hasPrimitiveType(value, type) || value instanceof type;
}
