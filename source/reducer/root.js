// :copyright: Copyright (c) 2016 ftrack

import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as formReducer } from 'redux-form';

import userReducer from './user';
import quickReviewReducer from './quick_review';

export default combineReducers({
    routing: routerReducer,
    form: formReducer,
    user: userReducer,
    quickReview: quickReviewReducer,
});
