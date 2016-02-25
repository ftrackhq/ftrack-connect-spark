import React from 'react';
import { Route, Redirect, IndexRoute } from 'react-router';

import RootLayout from 'layout/RootLayout';
import NotFoundView from 'view/NotFoundView';
import Main from 'component/Main';

export default () => (
  <Route path="/" component={RootLayout}>
    <IndexRoute component={Main} />

    <Route path="/404" component={NotFoundView} />
    <Redirect from="*" to="/404" />
  </Route>
);
