import { assertArgs } from '/utils/assert_args.js';
import { Layer } from '/view/canvas.js';


export class BackgroundView
{
    constructor(layer, style)
    {
        assertArgs(arguments, {
            layer: Layer,
            style: {
                color: String
            }
        })

        const rectangle = {
            left: 0,
            top: 0,
            right: layer.width,
            bottom: layer.height
        };

        layer.drawRectangle(rectangle, {
            fillStyle: style.color
        });
    }
}
