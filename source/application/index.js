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
export let store = null;


// Patch `history` and `sessionStorage` to avoid issues in IE11 served via file://
// which occurs in Cinema 4D / Windows 2012 server.
//
// * #126 (https://github.com/ReactJSTraining/history/issues/126)
// * #295 (https://github.com/ReactJSTraining/history/issues/295)
//
// TODO: Remove the following block once
// the `history` library has been upgraded to `3.0.0` or later.
//
if (!window.sessionStorage) {
    window.sessionStorage = {
        setItem() {},
        getItem() {},
        removeItem() {},
    };

    hashHistory.replaceHashPath = (path) => {
        const i = window.location.href.indexOf('#');
        const baseUrl = window.location.href.slice(0, i >= 0 ? i : 0);
        window.location.replace(`${baseUrl}#${path}`);
    };
}


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
    store = configureStore(initialState, sagas);
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
