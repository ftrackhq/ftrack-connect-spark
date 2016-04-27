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

    const sagaMiddleware = createSagaMiddleware();
    middleware.push(sagaMiddleware);

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
            // eslint-disable-next-line global-require
            const nextRootReducer = require('../reducer/root').default;

            store.replaceReducer(nextRootReducer);
        });
    }

    // Run sagas
    sagas.map(saga => sagaMiddleware.run(saga));

    return store;
}
