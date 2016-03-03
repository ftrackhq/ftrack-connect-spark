// :copyright: Copyright (c) 2016 ftrack

import { applyMiddleware, createStore } from 'redux';

import rootReducer from '../reducer/root_reducer.js';

export default function configureStore(initialState = {}) {
  // Compose redux middleware
    const middleware = applyMiddleware();

    const store = middleware(createStore)(rootReducer, initialState);

    if (module.hot) {
    // Enable Webpack hot module replacement for reducers
        module.hot.accept('../reducer/root_reducer', () => {
            const nextRootReducer = require('../reducer/root_reducer').default;

            store.replaceReducer(nextRootReducer);
        });
    }

    return store;
}
