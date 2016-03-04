// :copyright: Copyright (c) 2016 ftrack

import { applyMiddleware, createStore } from 'redux';

import rootReducer from '../reducer/root.js';

export default function configureStore(initialState = {}) {
    // Compose redux middleware
    const middleware = applyMiddleware();

    const store = middleware(createStore)(rootReducer, initialState);

    if (module.hot) {
        // Enable Webpack hot module replacement for reducers
        module.hot.accept('../reducer/root', () => {
            const nextRootReducer = require('../reducer/root').default;

            store.replaceReducer(nextRootReducer);
        });
    }

    return store;
}
