// :copyright: Copyright (c) 2016 ftrack

import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as formReducer } from 'redux-form';

import userReducer from './user';
import quickReviewReducer from './quick_review';
import applicationOverlayReducer from './screen/application_overlay';

export default combineReducers({
    routing: routerReducer,
    form: formReducer,
    user: userReducer,
    quickReview: quickReviewReducer,
    screen: combineReducers({
        overlay: applicationOverlayReducer,
    }),
});
