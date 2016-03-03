// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { Route, Redirect, IndexRoute } from 'react-router';

import RootLayout from 'layout/root';
import NotFoundView from 'view/not_found';
import ExampleView from 'view/example';

export default () => (
    <Route path="/" component={RootLayout}>
        <IndexRoute component={ExampleView} />

        <Route path="/404" component={NotFoundView} />
        <Redirect from="*" to="/404" />
    </Route>
);
