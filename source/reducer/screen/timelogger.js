// :copyright: Copyright (c) 2016 ftrack

import actions from 'action/timelogger';

/**
 * Reduce state for timelogger
 */
export default function timeloggerReducer(state = { items: [] }, action) {
    let nextState = state;
    if (action.type === actions.TIMELOGS_LOADED) {
        const items = [...state.items, ...action.payload.items];

        console.info('timeloggerReducer', action.type);
        nextState = Object.assign(
            {},
            state,
            {
                items,
                nextOffset: action.payload.nextOffset,
                loading: false,
            }
        );
    }

    return nextState;
}
