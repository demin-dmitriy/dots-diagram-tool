import { assert } from '/utils/assert.js';
import { assertArgs } from '/utils/assert_args.js';


export class Publisher
{
    constructor(signalSpecs)
    {
        this._signalToCallbacks = {};
        this._signalToSpecs = {};

        for (const [signal, spec] of Object.entries(signalSpecs))
        {
            this._signalToCallbacks[signal] = new Set();
            this._signalToSpecs[signal] = spec;
        }
    }

    on(signal, callback)
    {
        assert(signal in this._signalToCallbacks, "Invalid signal " + signal);

        this._signalToCallbacks[signal].add(callback);
    }

    notify(signal, args)
    {
        assert(signal in this._signalToCallbacks, "Invalid signal " + signal);

        const spec = this._signalToSpecs[signal];

        assertArgs(args, spec);

        const callbacks = this._signalToCallbacks[signal];

        for (const callback of callbacks)
        {
            callback(...args);
        }
    }
}
