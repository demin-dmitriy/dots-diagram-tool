import { assertArgs } from '/utils/assert_args.js';
import { Publisher } from '/publisher.js';
import { BoardModel } from '/viewmodel/board_model.js';
import { MoveAction } from '/viewmodel/move_action.js';
import { hasType } from '/utils/has_type.js'


const UPDATE_SIGNAL = 'updateGameModel';


export class GameModel extends Publisher
{
    static _assertValidConstructorArgs(boardModel, actions)
    {
        assertArgs(arguments, {
            boardModel: BoardModel,
            actions: Array /* of MoveAction */
        });

        actions.forEach(action => assert(hasType(action, MoveAction)));
    }

    constructor(boardModel, actions = [])
    {
        GameModel._assertValidConstructorArgs(boardModel, actions);

        super({
            [UPDATE_SIGNAL]: { }
        });
        this._boardModel = boardModel;
        this._actions = actions;
    }

    get boardModel()
    {
        return this._boardModel;
    }

    get actions()
    {
        // TODO: is it good to provide direct access like this? (it is not)

        return this._actions;
    }

    // TODO: implement as a setter?
    setActions(actions)
    {
        // TODO: validate actions

        assertArgs(arguments, { actions: Array });
        actions.forEach(action => assert(hasType(action, MoveAction)));

        this._actions = actions;

        this.notify(UPDATE_SIGNAL, []);
    }

    addAction(action)
    {
        // TODO: separate signal for adding just a move?
        assertArgs(arguments, { action: MoveAction });
        this._actions.push(action);

        this.notify(UPDATE_SIGNAL, []);
    }
}
