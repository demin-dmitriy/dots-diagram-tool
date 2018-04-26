import { updateAttrs } from '/utils/update_attrs.js';
import { Widget } from "./widget";


export class TextField extends Widget
{
    constructor(text, attrs = {})
    {
        const inputElement = document.createElement("input");
        inputElement.type = "text";
        inputElement.value = text;
        updateAttrs(inputElement, attrs);
        this._inputElement = inputElement;
        super(inputElement);
    }

    get text()
    {
        return this._inputElement.value;
    }
}
