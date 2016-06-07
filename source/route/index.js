// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { Route, Redirect, IndexRedirect } from 'react-router';

import { session } from '../ftrack_api';
import { applicationAuthenticate } from 'action/application';

import RootLayout from 'layout/root';
import NotFoundView from 'view/not_found';
import HomeView from 'view/home';
import ExampleView from 'view/example';
import QuickReviewView from 'view/quick_review';
import CreateProjectView from 'view/create_project';
import PublishContextBrowser from 'container/publish_context_browser';
import PublishView from 'view/publish';
import ContextView from 'view/context';
import { importReset } from 'action/import';
import { publishLoad } from 'action/publish';
import { notesLoad } from 'action/note';
import BrowseAllView from 'view/browse_all';
import MyTasksView from 'view/my_tasks';
import VersionsView from 'view/versions';
import NotesListView from 'view/note';
import ConnectMissingView from 'view/connect_missing';


function dispatchOnEnter(dispatch, actionCreator) {
    return () => { dispatch(actionCreator()); };
}

function dispatchRequiresAuth(dispatch) {
    return (nextState, replace) => {
        if (!session || !session.initialized) {
            const nextPathName = nextState.location.pathname;
            replace({ pathname: '/login' });
            dispatch(applicationAuthenticate(nextPathName));
        }
    };
}

export default (store) => (
    <Route path="/" component={RootLayout}>
        <Route path="/login" />
        <Route onEnter={dispatchRequiresAuth(store.dispatch)}>
            <IndexRedirect to="/home/my-tasks" />

            <Route path="/home" component={HomeView}>
                <IndexRedirect to="my-tasks" />
                <Route path="my-tasks" component={MyTasksView} />
                <Route path="browse-all" component={BrowseAllView} />
            </Route>

            <Route path="/context/:type/:id" component={ContextView}>
                <IndexRedirect to="notes" />
                <Route
                    path="notes"
                    component={NotesListView}
                    onEnter={
                        // eslint-disable-next-line react/prop-types
                        ({ params }) => store.dispatch(notesLoad(params.id, params.type))
                    }
                />
                <Route
                    path="versions"
                    component={VersionsView}
                    onEnter={dispatchOnEnter(store.dispatch, importReset)}
                />
            </Route>

            <Route path="/example" component={ExampleView} />
            <Route path="/publish-context" component={PublishContextBrowser} />
            <Route
                path="/quick-review(/:projectId)"
                component={QuickReviewView}
            />
            <Route
                path="/create-project"
                component={CreateProjectView}
            />
            <Route
                path="/publish/:context"
                component={PublishView}
                onEnter={
                    (nextState, replace, callback) => store.dispatch(
                        publishLoad(callback)
                    )
                }
            />
        </Route>

        <Route path="/connect-missing" component={ConnectMissingView} />
        <Redirect from="*.html" to="/home/my-tasks" />
        <Route path="/404" component={NotFoundView} />
        <Redirect from="*" to="/404" />
    </Route>
);
