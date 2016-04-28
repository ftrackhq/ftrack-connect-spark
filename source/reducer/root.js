// :copyright: Copyright (c) 2016 ftrack

import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as formReducer } from 'redux-form';

import userReducer from './user';
import applicationReducer from './application';
import applicationOverlayReducer from './screen/application_overlay';
import notificationReducer from './screen/notification';
import publishReducer from './screen/publish';
import previewMediaReducer from './screen/preview_media';
import notesReducer from './screen/note';
import versionReducer from './screen/version';

export default combineReducers({
    routing: routerReducer,
    form: formReducer,
    user: userReducer,
    application: applicationReducer,
    screen: combineReducers({
        notification: notificationReducer,
        overlay: applicationOverlayReducer,
        publish: publishReducer,
        preview_media: previewMediaReducer,
        notes: notesReducer,
        version: versionReducer,
    }),
});
