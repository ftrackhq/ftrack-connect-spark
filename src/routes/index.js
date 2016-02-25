import React from 'react';
import { Route, Redirect, IndexRoute } from 'react-router';

import RootLayout from 'layouts/RootLayout';
import NotFoundView from 'views/NotFoundView';
import Main from 'components/Main';

export default () => (
  <Route path="/" component={RootLayout}>
    <IndexRoute component={Main} />

    <Route path="/404" component={NotFoundView} />
    <Redirect from="*" to="/404" />
  </Route>
);
