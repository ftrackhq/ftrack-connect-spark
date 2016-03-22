// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { Tab, Tabs } from 'react-toolbox';

import ContextBrowser from 'view/context_browser';
import MyTasks from 'container/my_tasks';


/** Home view */
class HomeView extends React.Component {

    constructor() {
        super();
        this.state = { index: 0 };
        this._handleTabChange = this._handleTabChange.bind(this);
    }

    _handleTabChange(index) {
        this.setState({ index });
    }

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
                            inline={ 1 }
                        />
                    </div>
                </Tab>
            </Tabs>
        );
    }
}

export default HomeView;
