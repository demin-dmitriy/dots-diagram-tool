import { Publisher } from '/utils/publisher.js';
import { assertArgs } from '/utils/assert_args.js';
import { BoardModel } from '/model/board_model.js';
import { MoveAction } from '/model/move_action.js';
import { hasType } from '/utils/has_type.js'


export class GameModel extends Publisher
{
    constructor(boardModel, actions = [])
    {
        assertArgs(arguments, {
            boardModel: BoardModel,
            actions: Array /* of MoveAction */
        });

        actions.forEach(action => assert(hasType(action, MoveAction)));

        super([  ]);
        this._boardModel = boardModel;
        this._actions 
    }

    get boardModel()
    {
        return this._boardModel;
    }

    get actions()
    {
        return this._actions;
    }

    addAction(action)
    {
        assertArgs(arguments, { action: MoveAction });
        this._actions.push(action);
    }
}
