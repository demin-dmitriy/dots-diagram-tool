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
        for (let i = 0; i < signals.length; i++)
        {
            assert(
                signals[i] in this._signalToSubscribers,
                "Invalid signal " + signals[i]
            );
        }

        for (let i = 0; i < signals.length; i++)
        {
            this._signalToSubscribers[signals[i]].add(listener);
        }
    }

    notify(signal, args)
    {
        assert(signal in this._signalToSubscribers, "Invalid signal " + signal);

        const subscribers = this._signalToSubscribers[signal];
        const handlerName = this._signalToHandlerName[signal];

        for (let i = 0; i < subscribers.length; i++)
        {
            const subscriber = this._subscribers[i];
            assert(
                handlerName in subscriber,
                "Subscriber doesn't have handler " + handlerName
            );
            subscriber[handlerName](...args);
        }
    }
}
