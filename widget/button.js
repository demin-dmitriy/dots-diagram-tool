import { updateAttrs } from '/utils/update_attrs.js';
import { Widget } from "./widget";


export class Button extends Widget
{
    constructor(text, attrs = {})
    {
        const buttonElement = document.createElement("button");
        buttonElement.textContent = text;
        updateAttrs(buttonElement, attrs);
        this._buttonElement = buttonElement;
        super(buttonElement);
    }

    on(eventName, callback)
    {
        this._buttonElement.addEventListener(eventName, callback);
    }
}
