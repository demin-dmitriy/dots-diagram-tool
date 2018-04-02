import { assert } from '/utils/assert.js';


function updateAttrs(target, attrs)
{
    for (const attrKey in attrs)
    {
        assert(attrKey in target);
    }

    Object.assign(target, attrs);
}