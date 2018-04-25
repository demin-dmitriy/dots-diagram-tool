import { assertArgs } from '/utils/assert_args.js';
import { BoardModel } from '/model/board_model.js';
import { BoardView } from '/view/board_view.js';
import { Grid } from '/grid.js';
import { GameModel } from '/model/game_model.js';
import { GameView } from '/view/game_view.js';
import { Canvas } from '/canvas.js';
import { BackgroundView } from '/view/background_view.js';


export const DEFAULT_STYLE = Object.freeze({
    board: Object.freeze({
        lineColor: 'rgb(225, 230, 235)',
        lineWidth: 0
    }),

    background: Object.freeze({
        color: 'white'
    }),

    game: Object.freeze({
        blueColor: 'rgb(35, 88, 237)',
        redColor: 'rgb(211, 32, 32)',
        blueCaptureColor: 'rgba(35, 88, 237, 0.3)',
        redCaptureColor: 'rgba(211, 32, 32, 0.3)',
        dotRadius: 5
    }),

    selection: Object.freeze({
        shadowColor: 'rgba(0, 0, 0, 0.15)',
    }),

    grid: Object.freeze({
        gridStep: 19,
        paddingLeft: 20.5,
        paddingTop: 20.5,
        paddingRight: 20.5,
        paddingBottom: 20.5
    })
});


// TODO: not sure that this is a good abstraction
export class Arrangement
{
    static _assertValidConstructorArgs(rootNode, boardModel, style)
    {
        assertArgs(arguments, {
            rootNode: HTMLElement,
            boardModel: BoardModel,
            style: {
                background: Object,
                board: Object,
                game: Object,
                selection: Object,
                grid: Object
            } // TODO: specify other fields
        });
    }

    constructor(rootNode, boardModel, style=DEFAULT_STYLE)
    {
        Arrangement._assertValidConstructorArgs(rootNode, boardModel, style);

        this._boardModel = boardModel;
        this._style = style;
        this._canvas = new Canvas(rootNode, {
            layerIds: [
                "background",
                "board-grid",
                "game"
            ],
            size: { width: 0, height: 0 }
        });

        this._update();
    }

    updateBoardModel(boardModel)
    {
        this._boardModel = boardModel;
        this._update();
    }

    _update()
    {
        const canvas = this._canvas;
        const style = this._style;
        const boardModel = this._boardModel;
       
        const grid = new Grid({
            paddingX: style.grid.paddingLeft,
            paddingY: style.grid.paddingTop,
            cellSize: style.grid.gridStep,
            boardModel: boardModel
        });

        canvas.resize({
            width: grid.right + style.grid.paddingRight,
            height: grid.bottom + style.grid.paddingBottom
        });
        
        const gameModel = new GameModel(boardModel);        

        const background = new BackgroundView(canvas.layer("background"), style.background);
        const boardView = new BoardView(grid, canvas.layer("board-grid"), style.board);
        const gameView = new GameView({
            layer: canvas.layer('game'),
            grid: grid,
            gameModel: gameModel,
            style: style.game
        });
    }
}
