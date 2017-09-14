var Lib = (function() {

    "use strict";

    function assert(condition, message = "Assertion error")
    {
        if (!condition)
        {
            throw message;
        }
    }

    function apply(fs, arg)
    {
        if (fs == undefined)
        {
            return;
        }

        for (var i = 0; i < fs.length; i++)
        {
            fs[i](arg);
        }
    }

    function Array2D(size1, size2, valueFunction)
    {
        var array = new Array(size1 * size2);

        this._size1 = size1;
        this._size2 = size2;

        for (var i = 0; i < size1; i++)
        {
            for (var j = 0; j < size2; j++)
            {
                array[this._index(i, j)] = valueFunction(i, j);
            }
        }

        this._data = array;
    }

    Array2D.prototype._index = function(i, j)
    {
        return i * this._size2 + j;
    };

    Array2D.prototype.assertInBounds = function(i, j)
    {
        assert(Number.isInteger(i) && Number.isInteger(j), "Index must be ineger");
        assert(0 <= i && i < this._size1 && 0 <= j && j < this._size2, "Invalid index");
    };

    Array2D.prototype.size1 = function()
    {
        return this._size1;
    };

    Array2D.prototype.size2 = function()
    {
        return this._size2;
    };

    Array2D.prototype.at = function(i, j)
    {
        this.assertInBounds(i, j);
        return this._data[this._index(i, j)];
    };

    Array2D.prototype.set = function(i, j, v)
    {
        this.assertInBounds(i, j);
        this._data[this._index(i, j)] = v;
    };

    function Point(x, y)
    {
        this.x = x;
        this.y = y;
    }

    Point.prototype.rotateClockwise = function()
    {
        var x = this.y;
        var y = -this.x;
        this.x = x;
        this.y = y;
    };

    Point.prototype.rotateCounterClockwise = function()
    {
        var x = -this.y;
        var y = this.x;
        this.x = x;
        this.y = y;
    };

    Point.prototype.squareLength = function()
    {
        return this.x * this.x + this.y * this.y;
    };

    Point.prototype.clone = function()
    {
        return new this.constructor(this.x, this.y);
    };

    Point.prototype.equals = function(other)
    {
        return this.x === other.x && this.y === other.y;
    };

    Point.prototype.plus = function(other)
    {
        return new this.constructor(this.x + other.x, this.y + other.y);
    };

    Point.prototype.negative = function()
    {
        return new this.constructor(-this.x, -this.y);
    };

    return {
        assert: assert,
        apply: apply,
        Array2D: Array2D,
        Point: Point,
    };

}());

var assert = Lib.assert;
