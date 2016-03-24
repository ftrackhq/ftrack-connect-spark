// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { Tab, Tabs } from 'react-toolbox';
import { browserHistory } from 'react-router';

import ContextBrowser from 'container/context_browser';
import MyTasks from 'container/my_tasks';


/** Home view */
class HomeView extends React.Component {

    /** Instantiate home view. */
    constructor() {
        super();
        this.state = { index: 0 };
        this._handleTabChange = this._handleTabChange.bind(this);
    }

    /** Handle tab change. */
    _handleTabChange(index) {
        this.setState({ index });
    }

    /** Handle selecting a context. */
    _onSelectContext(id) {
        browserHistory.push(`/context/${id}`);
    }

    /** Render component. */
    render() {
        return (
            <Tabs index={this.state.index} onChange={this._handleTabChange}>
                <Tab label="My tasks">
                    <div>
                        <MyTasks />
                    </div>
                </Tab>
                <Tab label="Browse all">
                    <div>
                        <ContextBrowser
                            onSelectContext={ this._onSelectContext }
                        />
                    </div>
                </Tab>
            </Tabs>
        );
    }
}

export default HomeView;
