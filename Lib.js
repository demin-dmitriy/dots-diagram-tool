export function assert(condition, message = "Assertion error")
{
    if (!condition)
    {
        throw message;
    }
}

export function apply(fs, arg)
{
    if (fs == undefined)
    {
        return;
    }

    for (let i = 0; i < fs.length; i++)
    {
        fs[i](arg);
    }
}

export class Array2D
{
    constructor(size1, size2, valueFunction)
    {
        const array = new Array(size1 * size2);

        this._size1 = size1;
        this._size2 = size2;

        for (let i = 0; i < size1; i++)
        {
            for (let j = 0; j < size2; j++)
            {
                array[this._index(i, j)] = valueFunction(i, j);
            }
        }

        this._data = array;
    }

    _index(i, j)
    {
        return i * this._size2 + j;
    }

    assertInBounds(i, j)
    {
        assert(Number.isInteger(i) && Number.isInteger(j), "Index must be ineger");
        assert(0 <= i && i < this._size1 && 0 <= j && j < this._size2, "Invalid index");
    }

    get size1()
    {
        return this._size1;
    }

    get size2()
    {
        return this._size2;
    }

    // TODO: accept Point as argument

    at(i, j)
    {
        this.assertInBounds(i, j);
        return this._data[this._index(i, j)];
    }

    set(i, j, v)
    {
        this.assertInBounds(i, j);
        this._data[this._index(i, j)] = v;
    }
}


export class Point
{
    constructor(x, y)
    {
        this.x = x;
        this.y = y;
    }

    rotateClockwise()
    {
        const x = this.y;
        const y = -this.x;
        this.x = x;
        this.y = y;
    }

    rotateCounterClockwise()
    {
        const x = -this.y;
        const y = this.x;
        this.x = x;
        this.y = y;
    }

    squareLength()
    {
        return this.x * this.x + this.y * this.y;
    }

    clone()
    {
        return new this.constructor(this.x, this.y);
    }

    equals(other)
    {
        return this.x === other.x && this.y === other.y;
    }

    plus(other)
    {
        return new this.constructor(this.x + other.x, this.y + other.y);
    }

    negative()
    {
        return new this.constructor(-this.x, -this.y);
    }
}


export class Subscribable
{
    constructor()
    {
        this._subscribers = [];
    }

    // TODO: specify explicitly signal names to subscribe
    subscribe(listener)
    {
        this._subscribers.push(listener);
    }

    _notify(name, args)
    {
        for (let i = 0; i < this._subscribers.length; i++)
        {
            const subscriber = this._subscribers[i];
            if (name in subscriber)
            {
                subscriber[name](...args);
            }
        }
    }
}
