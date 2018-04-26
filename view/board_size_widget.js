import { assertArgs } from '/utils/assert_args.js';
import { isNatural } from '/utils/is_natural.js';
import { Publisher } from '/publisher.js';
import { BoardModel } from '/viewmodel/boardModel.js';
import { TextField } from '/widget/text_field.js';
import { Button } from '/widget/button.js';
import { HorizontalLayout } from '/widget/horizontal_layout.js';
import { Label } from '/widget/label.js';
import { Panel } from '/view/panel.js';


export class BoardSizeWidget extends Publisher
{
    constructor(panel, boardModel)
    {
        assertArgs(arguments, {
            panel: Panel,
            boardModel: BoardModel
        })
        super({
            resizeBoard: {
                boardModel: BoardModel
            }
        });

        this._widthField = new TextField(boardModel.width);
        this._heightField = new TextField(boardModel.height);

        const button = new Button("Изменить");

        button.on("click", () => { this._resizeBoard(); });

        // TODO: text that depends on language should be a parameter
        panel.addWidget(new HorizontalLayout([
            new Label("Размер поля"),
            this._widthField,
            this._heightField,
            button    
        ]));
    }

    _resizeBoard()
    {
        const width = Number(this._widthField.text);
        const height = Number(this._heightField.text);

        // TODO: assert is incorrect way of handling user input errors
        // TODO: The best way is to show some red tooltip but that's not easy to implement
        assert(isNatural(width), "Board width must be a natural number");
        assert(isNatural(height), "Board height must be a natural number");

        const newBoardModel = new BoardModel({
            sizeX: width,
            sizeY: height
        });

        this.notify("resizeBoard", [newBoardModel]);
    }
}
