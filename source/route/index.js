// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { Route, Redirect, IndexRoute } from 'react-router';

import RootLayout from 'layout/root';
import NotFoundView from 'view/not_found';
import HomeView from 'view/home';
import ExampleView from 'view/example';
import QuickReviewView from 'view/quick_review';
import CreateProjectView from 'view/create_project';
import ContextBrowser from 'view/context_browser';
import PublishView from 'view/publish';
import ContextView from 'view/context';
import { publishLoad } from 'action/publish';


function dispatchOnEnter(dispatch, actionCreator) {
    return () => { dispatch(actionCreator()); };
}


export default (store) => (
    <Route path="/" component={RootLayout}>
        <Route path="/home" component={HomeView} />
        <Route path="/context-view/:context" component={ContextView} />
        <Route path="/example" component={ExampleView} />
        <Route path="/context/:parentId/:callback" component={ContextBrowser} />
        <Route
            path="/quick-review"
            component={QuickReviewView}
        />
        <Route
            path="/create-project"
            component={CreateProjectView}
        />
        <Route
            path="/publish"
            component={PublishView}
            onEnter={dispatchOnEnter(store.dispatch, publishLoad)}
        />
        <Route
            path="/publish/:contextId"
            component={PublishView}
            onEnter={dispatchOnEnter(store.dispatch, publishLoad)}
        />
        <Redirect from="*.html" to="/" />
        <Route path="/404" component={NotFoundView} />
        <Redirect from="*" to="/404" />
    </Route>
);
