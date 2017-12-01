const Sgf = (function(){

    "use strict";

    function parse(data)
    {

    }

    function intToChar(value)
    {
        var table = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        return table.charAt(value);
    }

    function prop(name, value)
    {
        return name + "[" + value + "]";
    }

    function move(color, x, y)
    {
        assert(color == "B" || color == "W");
        return prop(color, intToChar(x) + intToChar(y));
    }

    function playerToColor(player)
    {
        return "BW".at(player.id);
    }

    function node(props)
    {
        return ";" + props;
    }

    function tree(nodes)
    {
        return "(" + nodes + ")";
    }

    function unparse(boardSize, dots)
    {
        assert(boardSize instanceof Game.BoardSize);

        const width = boardSize.width;
        const height = boardSize.height;

        const game =
            [ prop('GM', '40')                 // Dots game
            , prop('FF', '4')                  // SGF version
            , prop('CA', 'UTF-8')              // Encoding
            , prop('SZ', width + ':' + height) // Field size
            , prop('RU', 'russian')            // Russian ruleset
            , prop('PB', 'Первый игрок')
            , prop('PW', 'Второй игрок')
            ].join('');

        const moves = dots.map(d =>
            move(playerToColor(d.player), d.x, d.y)
        );

        const nodes = [game].concat(moves);

        return tree(nodes.map(node).join(""));
    }

    return {
        parse: parse,
        unparse: unparse
    };
}());
