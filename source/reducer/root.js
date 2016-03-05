// :copyright: Copyright (c) 2016 ftrack
/*eslint-disable */

import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import userReducer from './user';


export default combineReducers({
    routing: routerReducer,
    user: userReducer,
});
