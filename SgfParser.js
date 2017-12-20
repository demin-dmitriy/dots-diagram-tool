const SgfParser = (function(){

    "use strict";

    const
    {
        createLanguage,
        regexp,
        seqMap,
        string,
    } = Parsimmon.Parsimmon;

    // AST
    class Property
    {
        constructor(name, value)
        {
            this._name = name;
            this._value = value;
        }

        get name()
        {
            return this._name;
        }

        get value()
        {
            return this._value;
        }
    }

    class Tree
    {
        constructor(properties, children)
        {
            assert(properties instanceof Array);
            assert(children instanceof Array);

            this._properties = properties;
            this._children = children

            const propertiesDict = {};

            for (let i = 0; i < properties.length; ++i)
            {
                const property = properties[i];

                if (!(property.name in propertiesDict))
                {
                    propertiesDict[property.name] = [];
                }

                propertiesDict[property.name].push(property.value);
            }

            this._propertiesDict = propertiesDict;
        }

        get propertyList()
        {
            return this._properties;
        }

        getPropertyValues(name)
        {
            if (name in this._propertiesDict)
            {
                return this._propertiesDict[name]
            }
            return [];
        }

        getPropertyValue(name, defaultValue)
        {
            if (defaultValue === undefined)
            {
                defaultValue = null;
            }

            if (name in this._propertiesDict)
            {
                const values = this._propertiesDict[name];
                assert(values.length == 1);
                return values[0];
            }

            return defaultValue;
        }

        get children()
        {
            return this._children;
        }
    }

    function interpretEscapes(str)
    {
        return str.replace(/\\(.)/, (_, char) => char);
    }

    const coordinateMap = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

    function parseCoordinate(str)
    {
        return new Game.Coordinate(
            coordinateMap.indexOf(str[0]),
            coordinateMap.indexOf(str[1])
        );
    }

    const whitespace = regexp(/\s*/m);

    function token(parser)
    {
        return parser.skip(whitespace);
    }

    function word(str)
    {
        return string(str).thru(token);
    }


    function propertyValue(parser)
    {
         return parser.wrap(word('['), word(']'))
    }

    function listOf(parser)
    {
        return propertyValue(parser).atLeast(1);
    }

    function elistOf(parser)
    {
        const empty = word('[').then(word(']')).result(null);
        return listOf(parser).or(empty);
    }

    function compose(leftParser, rightParser)
    {
        return propertyValue(seqMap(
            leftParser, word(':'), rightParser,
                (left, _, right) => [ left, right ]
        ));
    }

    const propertyIdToTypeMap = {
        B: r => propertyValue(r.Move),          // Black (blue) move
        W: r => propertyValue(r.Move),          // White (red) move
        MN: r => propertyValue(r.Number),       // Move number
        AB: r => listOf(r.Stone),               // Add black stones
        AW: r => listOf(r.Stone),               // Add white stones
        C: r => propertyValue(r.Text),          // Comment
        FF: r => propertyValue(r.Number),       // SGF version
        CA: r => propertyValue(r.Text),         // Charset
        GM: r => propertyValue(r.Number),       // Game type
        SZ: r => compose(r.Number, r.Number),   // Field size
        RU: r => propertyValue(r.Text),         // Ruleset
        PB: r => propertyValue(r.Text),         // Black player name
        PW: r => propertyValue(r.Text),         // White player name
        BR: r => propertyValue(r.Text),         // Black player rating
        WR: r => propertyValue(r.Text),         // White player rating
        DT: r => propertyValue(r.Text),         // Date
        TM: r => propertyValue(r.Real),         // Time limit in seconds
        RE: r => propertyValue(r.Text),         // Result
        EV: r => propertyValue(r.Text),         // Name of event
        SO: r => propertyValue(r.Text),         // Source
        AP: r => propertyValue(r.Text),         // Application (used incorrectly in playdots)
        OT: r => propertyValue(r.Text),         // Overtime
        RO: r => propertyValue(r.Text),         // Round number
    };

    function propertyIdToType(r, id)
    {
        if (id in propertyIdToTypeMap)
        {
            return propertyIdToTypeMap[id](r).map(value =>
                new Property(id, value));
        }

        console.log("Info: unknown property '" + id + "'");
        return r.Text.map(value => new Property(id, value));
    }

    // Grammar translated from EBNF on http://www.red-bean.com/sgf/sgf4.html
    const Lang = createLanguage
    ({
        PropertyIdentifier: () =>
            token(regexp(/[A-Z]+/))
            .desc("property identifier"),

        Number: () =>
            token(regexp(/[+-]?[0-9]+/))
            .map(Number)
            .desc("number"),

        Real: () =>
            token(regexp(/[+-]?[0-9]+(\.[0-9]+)?/))
            .map(Number)
            .desc("real"),

        None: () => null, // (currently unused)

        Color: () =>
            token(regexp(/[BW]/))
            .desc("color"),

        Text: () =>
            regexp(/(?:\\.|[^\]])*/)
            .map(interpretEscapes)
            .desc("text"),

        Move: () =>
            token(regexp(/[a-zA-Z][a-zA-Z]/))
            .map(parseCoordinate)
            .desc("move"),

        Stone: () =>
            token(regexp(/[a-zA-Z][a-zA-Z]/))
            .map(parseCoordinate)
            .desc("stone"),

        Point: () =>
            token(regexp(/[a-zA-Z][a-zA-Z]/))
            .map(parseCoordinate)
            .desc("point"),

        // Grammar

        Collection: r => r.GameTree.atLeast(1),

        GameTree: r =>
            seqMap(r.Sequence, r.GameTree.many(),
                (sequence, subtrees) =>
                {
                    let result = subtrees;

                    assert(sequence.length >= 1);

                    for (let i = sequence.length - 1; i >= 0; --i)
                    {
                        result = [new Tree(sequence[i], result)];
                    }

                    return result[0];
                }
            )
            .wrap(word('('), word(')')),

        Sequence: r => r.Node.atLeast(1),

        Node: r => word(';').then(r.Property.many()),

        Property: r =>
            r.PropertyIdentifier.chain(identifier =>
                propertyIdToType(r, identifier)),
    });

    function parse(data)
    {
        return Lang.Collection.tryParse(data);
    }

    return { parse };

}());
