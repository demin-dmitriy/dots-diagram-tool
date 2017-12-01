const History = (function(){
    
    "use strict";


    class History
    {
        constructor(theme, visualizer)
        {
            this._states = [];
            this._theme = theme;
            this._visualizer = visualizer;
        }

        historyCheckpoint()
        {
            const state = this._visualizer.save();
            this._states.push(state);

            const name = String(this._states.length);
            const cssClass = this._chooseCssClass(this._states.length);
            const onclick = () => this._visualizer.load(state);

            this._theme.appendNode(name, cssClass, onclick);
        }

        _chooseCssClass(n)
        {
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
