import { assertArgs, assertNamedArgs } from '/utils/assert_args.js';
import { Vector } from '/data/vector.js';
import { GameModel } from '/viewmodel/game_model.js';
import { Color } from '/viewmodel/color.js';
import { Loop } from '/viewmodel/loop.js';
import { Layer } from '/view/canvas.js';
import { Grid } from '/view/grid.js';


export class GameView
{
    constructor(parameters)
    {
        assertNamedArgs(parameters, {
            layer: Layer,
            grid: Grid,
            gameModel: GameModel,
            style: {
                blueColor: String,
                redColor: String,
                blueCaptureColor: String,
                redCaptureColor: String,
                dotRadius: Number
            }
        });


        this._layer = parameters.layer;
        this._grid = parameters.grid;
        this._gameModel = parameters.gameModel;
        this._style = parameters.style;

        this._gameModel.on("updateGameModel", () => this.updateGameModelHandler());

        this.updateGameModelHandler();
    }

    updateGameModelHandler()
    {
        this._layer.clear();
        const actions = this._gameModel.actions;

        for (const action of actions)
        {
            action.on({
                placeDot: this._drawDot.bind(this),
                surround: this._drawSurround.bind(this)
            })
        }
    }

    _dotStyle(color)
    {
        const style = this._style;

        if (color === Color.BLUE)
        {
            return { 
                fillStyle: style.blueColor,
                strokeStyle: style.blueColor
            };
        }
        else if (color === Color.RED)
        {
            return {
                fillStyle: style.redColor,
                strokeStyle: style.redColor
            };
        }

        assert(false);
    }

    _surroundStyle(color)
    {
        const style = this._style;

        if (color === Color.BLUE)
        {
            return { 
                fillStyle: style.blueCaptureColor,
                strokeStyle: style.blueColor
            };
        }
        else if (color === Color.RED)
        {
            return {
                fillStyle: style.redCaptureColor,
                strokeStyle: style.redColor
            };
        }

        assert(false);
    }

    _drawDot(color, position)
    {
        assertArgs(arguments, {
            color: Color,
            position: Vector
        })

        this._layer.drawCircle(
            this._grid.at(position),
            this._style.dotRadius,
            this._dotStyle(color)
        );
    }

    _drawSurround(color, border, holes)
    {
        assertArgs(arguments, {
            color: Color,
            border: Loop,
            holes: Array /* of Loop */
        });

        assert(holes.length === 0, "surrounds with holes aren't supported yet");

        this._layer.drawPolygon(border.map(this._grid.at), this._surroundStyle);
    }
}
