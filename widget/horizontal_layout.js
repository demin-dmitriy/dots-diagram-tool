import { updateAttrs } from '/utils/update_attrs.js';
import { Widget } from "./widget";


export class HorizontalLayout extends Widget
{
    constructor(subwidgets, attrs = {})
    {
        // TODO: Not really a horizontal layout currently, but oh well.
        // TODO: assertArgs here and in other widgets
        const divElement = document.createElement("input");

        for (const subwidget of subwidgets)
        {
            divElement.appendChild(subwidget.element);
        }

        updateAttrs(divElement, attrs);
        super(divElement);
    }
}
