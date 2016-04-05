// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { Route, Redirect, IndexRedirect } from 'react-router';

import RootLayout from 'layout/root';
import NotFoundView from 'view/not_found';
import HomeView from 'view/home';
import ExampleView from 'view/example';
import QuickReviewView from 'view/quick_review';
import CreateProjectView from 'view/create_project';
import PublishContextBrowser from 'container/publish_context_browser';
import PublishView from 'view/publish';
import ContextView from 'view/context';
import { publishLoad } from 'action/publish';
import { notesLoad } from 'action/note';
import BrowseAllView from 'view/browse_all';
import MyTasksView from 'view/my_tasks';
import VersionsView from 'view/versions';
import NotesListView from 'view/note';

function dispatchOnEnter(dispatch, actionCreator, args) {
    return () => { dispatch(actionCreator(...args)); };
}


export default (store) => (
    <Route path="/" component={RootLayout}>
        <Route path="/home" component={HomeView}>
            <IndexRedirect to="my-tasks" />
            <Route path="my-tasks" component={MyTasksView} />
            <Route path="browse-all" component={BrowseAllView} />
        </Route>

        <Route path="/context/:context" component={ContextView}>
            <IndexRedirect to="notes" />
            <Route path="notes" component={NotesListView}
                onEnter={
                    ({ params }) => store.dispatch(notesLoad(params.context))
                }
            />
            <Route path="versions" component={VersionsView} />
        </Route>

        <Route path="/example" component={ExampleView} />
        <Route path="/publish-context" component={PublishContextBrowser} />
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
        <Redirect from="*.html" to="/" />
        <Route path="/404" component={NotFoundView} />
        <Redirect from="*" to="/404" />
    </Route>
);
