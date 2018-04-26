import { updateAttrs } from '/utils/update_attrs.js';
import { Widget } from './widget.js';


export class Label extends Widget
{
    constructor(text, attrs = {})
    {
        const spanElement = document.createElement('span');
        spanElement.textContent = text;
        updateAttrs(spanElement, attrs);
        super(spanElement);
    }
}
