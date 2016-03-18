// :copyright: Copyright (c) 2016 ftrack
import React from 'react';
import Waypoint from 'react-waypoint';

import style from './style.scss';

/**
 * InfiniteScroll
 *
 * Component with infinite scrolling.
 */
class InfiniteScroll extends React.Component {

    constructor() {
        super();
        this.state = { items: [], offset: 0, finished: false };
        this._renderItems = this._renderItems.bind(this);
        this._loadMoreItems = this._loadMoreItems.bind(this);
        this._renderWaypoint = this._renderWaypoint.bind(this);
    }

    _loadMoreItems() {
        this.setState({ loading: true });

        const result = this.props.loadItems(
            this.state.offset, this.props.limit
        );

        result.then((data) => {
            if (!data.length) {
                this.setState({ finished: true });
                return;
            }

            this.setState({
                items: this.state.items.concat(data),
                offset: this.state.offset + this.props.limit,
                loading: false,
            });
        });
    }

    _renderItems() {
        return this.state.items.map(this.props.renderItem);
    }

    _renderLoadingMessage() {
        if (this.state.loading && !this.state.finished) {
            return (
                <p className={style.loading}>
                    Loading...
                </p>
            );
        }

        return null;
    }

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
        return (
            <div className={style.parent}>
                {this._renderItems()}
                {this._renderWaypoint()}
                {this._renderLoadingMessage()}
            </div>
        );
    }
}

InfiniteScroll.propTypes = {
    renderItem: React.PropTypes.func,
    loadItems: React.PropTypes.func,
    limit: React.PropTypes.number,
};

InfiniteScroll.defaultProps = {
    limit: 25,
};

export default InfiniteScroll;
