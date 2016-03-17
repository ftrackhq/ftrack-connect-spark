// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { Route, Redirect, IndexRoute } from 'react-router';

import RootLayout from 'layout/root';
import NotFoundView from 'view/not_found';
import HomeView from 'view/home';
import ExampleView from 'view/example';
import QuickReviewView from 'view/quick_review';
import CreateProjectView from 'view/create_project';
import PublishView from 'view/publish';


export default () => (
    <Route path="/" component={RootLayout}>
        <IndexRoute component={HomeView} />
        <Route path="/example" component={ExampleView} />
        <Route
            path="/quick-review"
            component={QuickReviewView}
        />
        <Route
            path="/create-project"
            component={CreateProjectView}
        />
        <Route path="/publish" component={PublishView} />
        <Redirect from="*.html" to="/" />
        <Route path="/404" component={NotFoundView} />
        <Redirect from="*" to="/404" />
    </Route>
);
