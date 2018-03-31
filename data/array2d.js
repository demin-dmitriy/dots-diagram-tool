import { assert } from '/utils/assert.js';


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
