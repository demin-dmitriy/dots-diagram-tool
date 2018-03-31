export class Vector
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
        return new Point(this.x, this.y);
    }

    equals(other)
    {
        return this.x === other.x && this.y === other.y;
    }

    plus(other)
    {
        return new Point(this.x + other.x, this.y + other.y);
    }

    minus(other)
    {
        return new Point(this.x - other.x, this.y - other.y);
    }

    negative()
    {
        return new this.constructor(-this.x, -this.y);
    }
}
