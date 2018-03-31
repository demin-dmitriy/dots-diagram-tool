import { assert } from '/utils/assert.js';


function signalNameToHandlerName(signal)
{
    return signal + "Handler";
}


export class PublisherI
{
    constructor(signals)
    {
        this._signalToSubscribers = {};
        this._signalToHandlerName = {};

        for (let i = 0; i < signals.length; i++)
        {
            this._signalToSubscribers[signal[i]] = new Set();
            this._signalToHandlerName[signal[i]]
                    = signalNameToHandlerName(signal[i]);
        }
    }

    subscribe(listener, signals)
    {
        for (let i = 0; i < signals.length; i++)
        {
            assert(
                signal[i] in this._signalToSubscribers,
                "Invalid signal " + signal[i]
            );
        }

        for (let i = 0; i < signals.length; i++)
        {
            this._signalToSubscribers[signal[i]].add(listener);
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
