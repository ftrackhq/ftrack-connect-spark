

import React from 'react';
import { Tab, Tabs } from 'react-toolbox';
import { browserHistory } from 'react-router';


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
        browserHistory.replace(`${this.props.baseRoute}${this.props.items[index].route}`);
    }


    /** Render component. */
    render() {
        return (
            <Tabs index={this.state.index} onChange={this._handleTabChange}>
                {this.props.items.map(
                    (tab) => <Tab label={tab.label} />
                )}
            </Tabs>
        );
    }
}

RouteTabs.contextTypes = {
    router: React.PropTypes.object.isRequired,
};

RouteTabs.propTypes = {
    items: React.PropTypes.arrayOf(
        React.PropTypes.shape({
            route: React.PropTypes.string.isRequired,
            label: React.PropTypes.string.isRequired,
        })
    ),
    baseRoute: React.PropTypes.string,
};

RouteTabs.defaultProps = {
    baseRoute: '/',
};

export default RouteTabs;

