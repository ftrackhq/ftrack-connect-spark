// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import ReactDOM from 'react-dom';
import { hashHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import loglevel from 'loglevel';
const logger = loglevel.getLogger('application');


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

    // Configure logging
    loglevel.setLevel('debug');
    logger.debug('Creating application');

    // Create redux store and sync with react-router-redux.
    const store = configureStore(initialState, sagas);
    const history = syncHistoryWithStore(hashHistory, store);

    // Create our routes. We provide the store to the route definitions
    // so that routes have access to it for hooks such as `onEnter`.
    const routes = makeRoutes(store);

    // Render the React application to the DOM
    function renderApplication() {
        ReactDOM.render(
            <RootContainer history={history} routes={routes} store={store} />,
            document.getElementById('app')
        );
    }

    // Execute renderApplication once DOM is ready.
    const loadedStates = ['complete', 'loaded', 'interactive'];
    if (loadedStates.includes(document.readyState) && document.body) {
        renderApplication();
    } else {
        window.addEventListener('DOMContentLoaded', renderApplication, false);
    }
}
