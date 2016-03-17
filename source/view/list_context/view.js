// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { browserHistory } from 'react-router';

import InfiniteScroll from 'component/infinite_scroll';
import { ListItem, List } from 'react-toolbox';

import { session } from '../../ftrack_api';


/** Quick review view */
/* eslint-disable react/prefer-stateless-function */
class ListContext extends React.Component {
    constructor() {
        super();

        this._loadItems = this._loadItems.bind(this);
        this._renderItem = this._renderItem.bind(this);

        this._setQuery(this.props);
    }

    componentWillReceiveProps(newProps) {
        this._setQuery(newProps);
    }

    _setQuery(props) {
        if (props && props.params.parentId) {
            this._baseQuery = (
                'select id, name, thumbnail_id from TypedContext where ' +
                `parent_id is ${props.params.parentId} order by name, id`
            );
        } else {
            this._baseQuery = (
                'select id, name, thumbnail_id from Project order by name, id'
            );
        }
    }

    /** Load more items. */
    _loadItems(offset, limit) {
        const query = session._query(
            `${this._baseQuery} offset ${offset} limit ${limit}`
        );

        return query;
    }

    _onClick(item) {
        if (item.__entity_type__ === 'Task') {
            // Do nothing.
        } else {
            const path = `/context/${item.id}`;
            browserHistory.push(path);
        }
    }

    /** Render item. */
    _renderItem(item) {
        const onClick = this._onClick.bind(this, item);

        return (
            <ListItem
                key={ item.id }
                avatar={ session.thumbnail(item.thumbnail_id, 100) }
                caption={ item.name }
                legend={ item.thumbnail_id }
                rightIcon="star"
                onClick={ onClick }
                selectable={ 1 }
            />
        );
    }

    render() {
        return (
            <List
                key={ this.props.params.parentId }
            >
                <InfiniteScroll
                    loadItems={ this._loadItems }
                    renderItem={ this._renderItem }
                />
            </List>
        );
    }
}

ListContext.propTypes = {
    params: React.PropTypes.object,
};

ListContext.defaultProps = {
    params: {},
};

export default ListContext;
