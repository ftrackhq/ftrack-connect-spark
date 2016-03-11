// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import ReactDOM from 'react-dom';
import { browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';

import configureStore from '../store/configure_store';
import makeRoutes from '../route';
import RootContainer from 'container/root';

export let mediator = null;

export default function createApplication({
    initialState = {},
    sagas = [],
    applicationMediator = null,
}) {
    mediator = applicationMediator;

    // Create redux store and sync with react-router-redux.
    const store = configureStore(initialState, sagas);
    const history = syncHistoryWithStore(browserHistory, store);

    // Create our routes. We provide the store to the route definitions
    // so that routes have access to it for hooks such as `onEnter`.
    const routes = makeRoutes(store);

    // Render the React application to the DOM
    ReactDOM.render(
        <RootContainer history={history} routes={routes} store={store} />,
        document.getElementById('app')
    );
}
