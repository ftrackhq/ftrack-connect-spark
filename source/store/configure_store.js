// :copyright: Copyright (c) 2016 ftrack

import { applyMiddleware, createStore, compose } from 'redux';
import createLogger from 'redux-logger';
import createSagaMiddleware from 'redux-saga';
import rootReducer from 'reducer/root';

export default function configureStore(
    initialState = {},
    sagas = []
) {
    // Compose redux middleware
    const middleware = [];
    if (sagas && sagas.length) {
        middleware.push(createSagaMiddleware(...sagas));
    }
    middleware.push(createLogger());
    const createStoreWithMiddleware = compose(
        applyMiddleware(...middleware),
        window.devToolsExtension ? window.devToolsExtension() : f => f
    );

    const store = createStoreWithMiddleware(
        createStore
    )(rootReducer, initialState);

    if (module.hot) {
        // Enable Webpack hot module replacement for reducers
        module.hot.accept('../reducer/root', () => {
            const nextRootReducer = require('../reducer/root').default;

            store.replaceReducer(nextRootReducer);
        });
    }

    return store;
}
