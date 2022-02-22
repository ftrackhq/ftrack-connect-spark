// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { Tab, Tabs } from 'react-toolbox';
import { hashHistory } from 'react-router';
import PropTypes from 'prop-types';

import style from './style.scss';


/**
 * Route tabs
 *
 * Display a set of tabs as {route: 'route', label: 'label'}
 *
 */
class RouteTabs extends React.Component {
    constructor() {
        super();
        this.state = { index: 0 };
        this._handleTabChange = this._handleTabChange.bind(this);
    }

    componentWillMount() {
        this.setState({ index: this._getActiveIndexFromRoute() });
    }

    componentWillReceiveProps() {
        this.setState({ index: this._getActiveIndexFromRoute() });
    }

    /** Return active index based on current route. */
    _getActiveIndexFromRoute() {
        const index = this.props.items.findIndex(
            (tab) => this.context.router.isActive(`${this.props.baseRoute}${tab.route}`)
        );
        return (index !== -1) ? index : 0;
    }

    /** Handle tab change. */
    _handleTabChange(index) {
        this.setState({ index });
        hashHistory.replace(`${this.props.baseRoute}${this.props.items[index].route}`);
    }


    /** Render component. */
    render() {
        return (
            <Tabs index={this.state.index} onChange={this._handleTabChange} className={style.tabs} >
                {this.props.items.map(
                    (tab) => <Tab key={tab.route} label={tab.label}><div /></Tab>
                )}
            </Tabs>
        );
    }
}

RouteTabs.contextTypes = {
    router: PropTypes.object.isRequired,
};

RouteTabs.propTypes = {
    items: PropTypes.arrayOf(
        PropTypes.shape({
            route: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
        })
    ),
    baseRoute: PropTypes.string,
};

RouteTabs.defaultProps = {
    baseRoute: '/',
};

export default RouteTabs;
