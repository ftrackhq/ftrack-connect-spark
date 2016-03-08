import types from 'action/quick_review';

export default function quickReviewReducer(state = null, action) {
    let nextState = state;
    if (action.type === types.QUICK_REVIEW_PROJECTS_LOADED) {
        nextState = Object.assign(
            {}, {
                projects: action.payload,
            }
        );
    }
    return nextState;
}

