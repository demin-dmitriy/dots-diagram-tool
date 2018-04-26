import { TYPE_FUNC } from '/utils/has_type.js';


export const Color = Object.freeze({
    BLUE: Symbol("Blue"),
    RED: Symbol("Red"),
    [TYPE_FUNC]: isColor
});


function isColor(value)
{
    return value === Color.BLUE || value === Color.RED;
}
