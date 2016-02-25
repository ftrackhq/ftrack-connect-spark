import React from 'react';
import { Route, Redirect } from 'react-router';

import RootLayout from 'layouts/RootLayout';
import NotFoundView from 'views/NotFoundView';

export default (store) => (
    <Route path="/" component={RootLayout}>

        <Route path='/404' component={NotFoundView} />
        <Redirect from='*' to='/404' />
    </Route>
);
