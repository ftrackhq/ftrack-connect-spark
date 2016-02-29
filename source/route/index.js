import React from 'react';
import { Route, Redirect, IndexRoute } from 'react-router';

import RootLayout from 'layout/RootLayout';
import NotFoundView from 'view/NotFoundView';
import ExampleView from 'view/ExampleView';

export default () => (
  <Route path="/" component={RootLayout}>
    <IndexRoute component={ExampleView} />

    <Route path="/404" component={NotFoundView} />
    <Redirect from="*" to="/404" />
  </Route>
);
