import {combineReducers} from 'redux';

import ActionTypes from './action_types';

function menu(state = [], action) {
    switch (action.type) {
    case ActionTypes.RECEIVED_POST_ACTIONS_MENU:
        return action.data;
    default:
        return state;
    }
}

function ask(state = {}, action) {
    switch (action.type) {
    case ActionTypes.ACTION_ASK_QUESTIONS:
        return action.data;
    default:
        return state;
    }
}

export default combineReducers({
    menu,
    ask,
});
