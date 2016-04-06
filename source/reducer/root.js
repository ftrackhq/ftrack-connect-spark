// :copyright: Copyright (c) 2016 ftrack

import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as formReducer } from 'redux-form';

import userReducer from './user';
import applicationOverlayReducer from './screen/application_overlay';
import notificationReducer from './screen/notification';
import publishReducer from './screen/publish';
import versionReducer from './screen/version';

export default combineReducers({
    routing: routerReducer,
    form: formReducer,
    user: userReducer,
    screen: combineReducers({
        notification: notificationReducer,
        overlay: applicationOverlayReducer,
        publish: publishReducer,
        version: versionReducer,
    }),
});
