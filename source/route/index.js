// :copyright: Copyright (c) 2016 ftrack
import React from 'react';
import { Route, Redirect, IndexRoute } from 'react-router';

import RootLayout from 'layout/root_layout';
import NotFoundView from 'view/not_found_view';
import ExampleView from 'view/example_view';

export default () => (
    <Route path="/" component={RootLayout}>
        <IndexRoute component={ExampleView} />

        <Route path="/404" component={NotFoundView} />
        <Redirect from="*" to="/404" />
    </Route>
);
