import { assert } from '/utils/assert.js';


class Nothing
{
    hasValue()
    {
        return false;
    }

    get value()
    {
        assert(false, "can't get a value from Nothing");
    }

    valueOrDefault(defaultValue)
    {
        return defaultValue;
    }

    on({ nothing, just })
    {
        return nothing();
    }
}


const NOTHING_SINGLETON = new Nothing();


class Just
{
    constructor(value)
    {
        this._value = value;
    }

    hasValue()
    {
        return true;
    }

    get value()
    {
        return this._value;
    }

    valueOrDefault(defaultValue)
    {
        return this._value;
    }

    on({ nothing, just })
    {
        return just(this._value);
    }
}


export class Maybe
{
    static just(value)
    {
        return new Just(value);
    }

    static nothing()
    {
        return NOTHING_SINGLETON;
    }
}
