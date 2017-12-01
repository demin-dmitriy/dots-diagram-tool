const Selector = (function(){

    "use strict";

    class Model extends Lib.Subscribable
    {
        constructor(size)
        {
            assert(size instanceof Game.BoardSize);

            super();

            this._leftBound = -0.5;
            this._rightBound = size.width - 0.5;
            this._topBound = -0.5;
            this._bottomBound = size.height - 0.5;

            this._left = this._leftBound;
            this._right = this._rightBound;
            this._top = this._topBound;
            this._bottom = this._bottomBound;
        }

        get left()
        {
            return this._left;
        }

        set left(value)
        {
            if (this._leftBound <= value && value < this._right)
            {
                this._left = value;
                this._notify("updateSelectionRect", []);
            }
        }

        get right()
        {
            return this._right;
        }

        set right(value)
        {
            if (this._left < value && value <= this._rightBound)
            {
                this._right = value;
                this._notify("updateSelectionRect", []);
            }
        }

        get top()
        {
            return this._top;
        }

        set top(value)
        {
            if (this._topBound <= value && value < this._bottom)
            {
                this._top = value;
                this._notify("updateSelectionRect", []);
            }
        }

        get bottom()
        {
            return this._bottom;
        }

        set bottom(value)
        {
            if (this._top < value && value <= this._bottomBound)
            {
                this._bottom = value;
                this._notify("updateSelectionRect", []);
            }
        }
    }

    // TODO: better name?
    class Visualizer
    {    
        constructor(theme, model)
        {
            this._theme = theme;
            this._model = model;

            model.subscribe(this);

            this.updateSelectionRect();
        }

        resizeBoardCanvas(canvasWidth, canvasHeight)
        {
            this._theme.resetCanvas(canvasWidth, canvasHeight);
            this.updateSelectionRect();
        }

        updateSelectionRect()
        {
            const theme = this._theme;
            const m = this._model;

            // TODO: refactor
            this._theme.selectRect({
                left: theme.paddingLeft + m.left * theme.gridStep,
                right: theme.paddingLeft + m.right * theme.gridStep,
                top: theme.paddingTop + m.top * theme.gridStep,
                bottom: theme.paddingTop + m.bottom * theme.gridStep
            });
        }
    }

    return {
        Model: Model,
        Visualizer: Visualizer
    };

}());
