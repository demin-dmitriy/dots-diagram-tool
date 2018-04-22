export function isNatural(number)
{
    return Number.isInteger(number) && Number.isFinite(number) && number > 0;
}
