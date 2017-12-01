const History = (function(){
    
    "use strict";


    class History
    {
        constructor(theme, visualizer)
        {
            this._states = [];
            this._theme = theme;
            this._visualizer = visualizer;
            this._selectedIndex = -1;
        }

        init()
        {
            this.historyCheckpoint();
        }

        selectState(index)
        {
            this._selectedIndex = index;
            this._selectState();
        }

        _selectState()
        {
            const index = this._selectedIndex;
            assert(0 <= index && index < this._states.length,
                   "Index out of range");

            this._visualizer.load(this._states[index]);
        }

        _addState(state)
        {
            assert(this._selectedIndex == this._states.length - 1,
                   "History branching is not supported");

            this._states.push(state);
            this._selectedIndex += 1;
            return this._selectedIndex;
        }

        historyCheckpoint()
        {
            const addedIndex = this._addState(this._visualizer.save());

            const name = String(addedIndex);
            const cssClass = this._chooseCssClass(addedIndex);
            const onclick = () => this.selectState(addedIndex);

            this._theme.appendNode(name, cssClass, onclick);
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
