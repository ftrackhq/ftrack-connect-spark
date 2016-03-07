// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { Route, Redirect, IndexRoute } from 'react-router';

import RootLayout from 'layout/root';
import NotFoundView from 'view/not_found';
import HomeView from 'view/home';
import ExampleView from 'view/example';
import QuickReviewView from 'view/quick_review';

export default () => (
    <Route path="/" component={RootLayout}>
        <IndexRoute component={HomeView} />
        <Route path="/example" component={ExampleView} />
        <Route path="/quick-review" component={QuickReviewView} />

        <Redirect from="*.html" to="/" />
        <Route path="/404" component={NotFoundView} />
        <Redirect from="*" to="/404" />
    </Route>
);
