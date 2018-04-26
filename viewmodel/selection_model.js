import { assert } from '/utils/assert.js';
import { assertNamedArgs, assertArgs } from '/utils/assert_args.js';
import { Publisher } from '/publisher.js';
import { BoardModel } from '/viewmodel/board_model.js';


const UPDATE_SIGNAL = 'updateSelectionModel';


function assertIsIntegerPlusHalf(value)
{
    assert(Number.isInteger(value + 0.5));
}


export class SelectionModel extends Publisher
{
    // TODO: maybe use BoardModel as a parameter and init lowX,highX,lowY,highY by default
    constructor(boardModel)
    {
        assertNamedArgs(arguments, {
            boardModel: BoardModel
        });

        super([ UPDATE_SIGNAL ]);

        this._minXBound = -0.5;
        this._maxXBound = boardModel.sizeX - 0.5;
        this._minYBound = -0.5;
        this._maxYBound = boardModel.sizeY - 0.5;

        this._lowX = this._minXBound;
        this._highX = this._maxXBound;
        this._lowY = this._minYBound;
        this._highY = this._maxYBound;
    }

    get lowX()
    {
        return this._lowX;
    }

    set lowX(value)
    {
        assertIsIntegerPlusHalf(value);

        if (this._minXBound <= value && value < this._highX)
        {
            this._lowX = value;
            this.notify(UPDATE_SIGNAL, []);
        }
    }

    get highX()
    {
        return this._highX;
    }

    set highX(value)
    {
        assertIsIntegerPlusHalf(value);

        if (this._lowX < value && value <= this._maxXBound)
        {
            this._highX = value;
            this.notify(UPDATE_SIGNAL, []);
        }
    }

    get lowY()
    {
        return this._lowY;
    }

    set lowY(value)
    {
        assertIsIntegerPlusHalf(value);

        if (this._minYBound <= value && value < this._highY)
        {
            this._lowY = value;
            this.notify(UPDATE_SIGNAL, []);
        }
    }

    get highY()
    {
        return this._highY;
    }

    set highY(value)
    {
        assertIsIntegerPlusHalf(value);

        if (this._lowY < value && value <= this._maxYBound)
        {
            this._highY = value;
            this.notify(UPDATE_SIGNAL, []);
        }
    }
}
