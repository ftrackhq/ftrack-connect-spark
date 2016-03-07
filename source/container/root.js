// :copyright: Copyright (c) 2016 ftrack

import React, { PropTypes } from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';


/** A root container. */
function RootContainer({ store, history, routes }) {
    return (
        <Provider store={store}>
            <Router history={history}>
                {routes}
            </Router>
        </Provider>
    );
}

RootContainer.propTypes = {
    history: PropTypes.object.isRequired,
    routes: PropTypes.element.isRequired,
    store: PropTypes.object.isRequired,
};

export default RootContainer;
