// :copyright: Copyright (c) 2016 ftrack

import { compose } from 'redux';
import { applyMiddleware } from 'redux-subspace';
import createSagaMiddleware from 'redux-subspace-saga';
import rootReducer from 'reducer/root';

import { createStore } from 'redux-dynamic-reducer';
import { session } from '../ftrack_api';

export default function configureStore(
    initialState = {},
    sagas = []
) {
    var session_proxy = new Proxy(
        {}, // This value is irrelevant, it just has to be valid.
        {
            deleteProperty: function (_, property) {
                delete (session[property]);
                // Return True to indicate that the delete was successful.
                return (true);
            },
            get: function (_, property, receiver) {
                return (session[property]);
            },
            has: function (_, property) {
                return (property in session);
            },
            set: function (_, property, value, receiver) {
                session[property] = value;
                // Return True to indicate that the set was successful.
                return (true);
            }
        }
    );

    const sagaMiddleware = createSagaMiddleware({
        context: {
            // only initial context values are propagated to redux subspaces
            // provide dynamic proxy instead so it sill be available after
            // configuration
            ftrackSession: session_proxy,
        },
    });

    // Compose redux middleware
    const middleware = [sagaMiddleware];

    const composeEnhancers =
        window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
    const store = createStore(
        rootReducer,
        initialState,
        composeEnhancers(applyMiddleware(...middleware))
    );

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
    store.runSaga = sagaMiddleware.run;

    return store;
}
