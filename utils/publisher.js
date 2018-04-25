import { assert } from '/utils/assert.js';


function signalNameToHandlerName(signal)
{
    return signal + "Handler";
}


export class Publisher
{
    constructor(signals)
    {
        this._signalToSubscribers = {};
        this._signalToHandlerName = {};

        for (let i = 0; i < signals.length; i++)
        {
            this._signalToSubscribers[signals[i]] = new Set();
            this._signalToHandlerName[signals[i]]
                    = signalNameToHandlerName(signals[i]);
        }
    }

    subscribe(listener, signals)
    {
        for (const signal of signals)
        {
            assert(signal in this._signalToSubscribers, "Invalid signal " + signal);
        }

        for (const signal of signals)
        {
            this._signalToSubscribers[signal].add(listener);
        }
    }

    notify(signal, args)
    {
        assert(signal in this._signalToSubscribers, "Invalid signal " + signal);

        const subscribers = this._signalToSubscribers[signal];
        const handlerName = this._signalToHandlerName[signal];

        for (const subscriber of subscribers)
        {
            assert(
                handlerName in subscriber,
                "Subscriber doesn't have handler " + handlerName
            );
            subscriber[handlerName](...args);
        }
    }
}
