// :copyright: Copyright (c) 2016 ftrack

import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as formReducer } from 'redux-form';

import userReducer from './user';
import applicationOverlayReducer from './screen/application_overlay';
import publishReducer from './screen/publish';

export default combineReducers({
    routing: routerReducer,
    form: formReducer,
    user: userReducer,
    screen: combineReducers({
        overlay: applicationOverlayReducer,
        publish: publishReducer,
    }),
});
