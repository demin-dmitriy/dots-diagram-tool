const History = (function(){
    
    "use strict";


    class History
    {
        constructor(theme, visualizer)
        {
            this._states = [];
            this._theme = theme;
            this._visualizer = visualizer;
            this._timepoint = -1;
        }

        init()
        {
            this.historyCheckpoint();
        }

        get lastTimepoint()
        {
            return this._states.length - 1;
        }

        get timepoint()
        {
            return this._timepoint;
        }

        set timepoint(value)
        {
            if (0 <= value && value < this._states.length)
            {
                this.selectState(value);
            }
        }

        selectState(timepoint)
        {
            this._timepoint = timepoint;
            this._selectState();
        }

        _selectState()
        {
            const timepoint = this._timepoint;
            assert(0 <= timepoint && timepoint < this._states.length,
                   "Index out of range");

            this._visualizer.load(this._states[timepoint]);
            this._theme.select(timepoint);
        }

        _addState(state)
        {
            assert(this._timepoint == this._states.length - 1,
                   "History branching is not supported");

            this._states.push(state);
            this._timepoint += 1;
            return this._timepoint;
        }

        historyCheckpoint()
        {
            const addedIndex = this._addState(this._visualizer.save());

            const name = String(addedIndex);
            const cssClass = this._chooseCssClass(addedIndex);
            const onclick = () => this.selectState(addedIndex);

            this._theme.appendNode(name, cssClass, onclick);
            this._theme.select(this._timepoint);
        }

        _chooseCssClass(n)
        {
            if (n == 0)
            {
                return "root";
            }
            if (n % 2 == 0)
            {
                return "red";
            }
            return "blue";
        }
    }

    return {
        History
    };
}());
