// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import HomeHeader from 'container/home_header';
import { Tab, Tabs } from 'react-toolbox';
import { browserHistory } from 'react-router';

import style from './style.scss';


/** Home view */
class HomeView extends React.Component {
    /** Instantiate home view. */
    constructor() {
        super();
        this._tabs = [
            { route: 'my-tasks', label: 'My tasks' },
            { route: 'browse-all', label: 'Browse all' },
        ];
        this.state = { index: 0 };
        this._handleTabChange = this._handleTabChange.bind(this);
    }

    componentWillMount() {
        this.setState({ index: this._getActiveIndexFromRoute() });
    }

    componentWillReceiveProps() {
        this.setState({ index: this._getActiveIndexFromRoute() });
    }

    _getActiveIndexFromRoute() {
        const index = this._tabs.findIndex(
            (tab) => this.context.router.isActive(`/home/${tab.route}`)
        ) || 0;
        return index;
    }

    /** Handle tab change. */
    _handleTabChange(index) {
        this.setState({ index });
        browserHistory.replace(`/home/${this._tabs[index].route}`);
    }

    /** Handle selecting a context. */
    _onSelectContext(id) {
        browserHistory.push(`/context/${id}`);
    }

    /** Render component. */
    render() {
        return (
            <div className={style.root}>
                <HomeHeader />
                <Tabs index={this.state.index} onChange={this._handleTabChange}>
                    <Tab label="My tasks" onClick={this._onMyTasksClicked} />
                    <Tab label="Browse all" onClick={this._onBrowseAllClicked} />
                </Tabs>
                {this.props.children}
            </div>
        );
    }
}

HomeView.contextTypes = {
    router: React.PropTypes.object.isRequired,
};

HomeView.propTypes = {
    children: React.PropTypes.element.isRequired,
};

export default HomeView;
