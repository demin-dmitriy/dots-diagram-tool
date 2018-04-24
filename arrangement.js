import { assertArgs } from '/utils/assert_args.js';
import { BoardModel } from '/model/board_model.js';
import { BoardView } from '/view/board_view.js';
import { Grid } from '/grid.js';
import { GameModel } from '/model/game_model.js';
import { Canvas } from '/canvas.js';


// TODO: probably reorganize/rename properties
export const DEFAULT_STYLE = Object.freeze({
    grid: Object.freeze({
        lineColor: 'rgb(225, 230, 235)',
        lineWidth: 0
    }),
    blueColor: 'rgb(35, 88, 237)',
    redColor: 'rgb(211, 32, 32)',
    blueCaptureColor: 'rgba(35, 88, 237, 0.3)',
    redCaptureColor: 'rgba(211, 32, 32, 0.3)',
    dimColor: 'rgba(0, 0, 0, 0.15)',
    dotRadius: 5,
    gridStep: 19,
    paddingLeft: 20.5,
    paddingTop: 20.5,
    paddingRight: 20.5,
    paddingBottom: 20.5
});


// TODO: not sure that this is a good abstraction
export class Arrangement
{
    constructor(rootNode, boardModel, style=DEFAULT_STYLE)
    {
        assertArgs(arguments, {
            rootNode: HTMLElement,
            boardModel: BoardModel,
            style: Object // TODO: specify fields
        })

        this._rootNode = rootNode;
        this._boardModel = boardModel;
        this._style = style;

        const grid = new Grid({
            paddingX: style.paddingLeft,
            paddingY: style.paddingTop,
            cellSize: style.gridStep,
            boardModel: boardModel
        });

        const gameModel = new GameModel(boardModel);

        const canvas = new Canvas(rootNode, {
            layerIds: [
                "boardGrid"
            ],
            size: {
                width: grid.right + style.paddingRight,
                height: grid.bottom + style.paddingBottom
            }
        });

        const boardView = new BoardView(grid, canvas.layer("boardGrid"), style.grid);
    }
}
