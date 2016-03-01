// :copyright: Copyright (c) 2016 ftrack
import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

export default combineReducers({
  routing: routerReducer,
});
