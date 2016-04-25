// :copyright: Copyright (c) 2016 ftrack
import React from 'react';
import Waypoint from 'react-waypoint';
import classNames from 'classnames';

import ProgressBar from 'react-toolbox/lib/progress_bar';

import style from './style.scss';

/**
 * InfiniteScroll
 *
 * Component with infinite scrolling.
 */
class InfiniteScroll extends React.Component {

    /** Initiate component. */
    constructor() {
        super();
        this.state = { items: [], finished: false };
        this._renderItems = this._renderItems.bind(this);
        this._loadMoreItems = this._loadMoreItems.bind(this);
        this._renderWaypoint = this._renderWaypoint.bind(this);
    }

    /** Load more items into the component. */
    _loadMoreItems() {
        this.setState({ loading: true });

        const result = this.props.loadItems();

        result.then((data) => {
            if (!data.length) {
                this.setState({ finished: true });
                return;
            }

            this.setState({
                items: this.state.items.concat(data),
                loading: false,
            });
        });
    }

    /** Render the items using custom renderer. */
    _renderItems() {
        return this.state.items.map(this.props.renderItem);
    }

    /** Render a loading indicator. */
    _renderLoadingMessage() {
        if (this.state.loading && !this.state.finished) {
            return (
                <ProgressBar
                    type="circular"
                    mode="indeterminate"
                    className={ style.loading }
                />
            );
        }

        return null;
    }

    /** Render the waypoint. */
    _renderWaypoint() {
        if (!this.state.loading) {
            return (
                <Waypoint
                    onEnter={this._loadMoreItems}
                    threshold={0}
                />
            );
        }

        return null;
    }

    render() {
        const _classNames = classNames(
            style.parent, this.props.className
        );
        return (
            <div className={_classNames}>
                {this._renderItems()}
                {this._renderWaypoint()}
                {this._renderLoadingMessage()}
            </div>
        );
    }
}

InfiniteScroll.propTypes = {
    className: React.PropTypes.string,
    renderItem: React.PropTypes.func.isRequired,
    loadItems: React.PropTypes.func.isRequired,
};

InfiniteScroll.defaultProps = {
    className: '',
};


export default InfiniteScroll;
