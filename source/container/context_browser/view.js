// :copyright: Copyright (c) 2016 ftrack

import React from 'react';

import InfiniteScroll from 'component/infinite_scroll';
import { ListItem, List } from 'react-toolbox';

import { session } from '../../ftrack_api';


/** Context browser. */
/* eslint-disable react/prefer-stateless-function */
class ContextBrowser extends React.Component {

    /** Constructor. */
    constructor() {
        super();

        this.state = { parentId: 'projects' };
        this._limit = 25;
        this._offset = 0;
        this._loadItems = this._loadItems.bind(this);
        this._renderItem = this._renderItem.bind(this);

        this._resetQuery('projects');
    }

    /** Reset the query. */
    _resetQuery(parentId) {
        this._offset = 0;

        if (parentId !== 'projects') {
            this._baseQuery = (
                'select id, name, thumbnail_id from TypedContext where ' +
                `parent_id is ${parentId} order by name, id`
            );
        } else {
            this._baseQuery = (
                'select id, name, thumbnail_id from Project order by name, id'
            );
        }
    }

    /** Load more items. */
    _loadItems() {
        let query = session._query(
            `${this._baseQuery} offset ${this._offset} limit ${this._limit}`
        );

        // Calculate new offset.
        query = query.then((result) => {
            if (
                result.metadata &&
                result.metadata.next &&
                result.metadata.next.offset
            ) {
                this._offset = result.metadata.next.offset;
            } else {
                this._offset += this._limit;
            }

            return result.data;
        });

        return query;
    }

    /* handle click. */
    _onClick(item) {
        if (item.__entity_type__ === 'Task') {
            this.props.onSelectContext(item.id);
        } else {
            this.setState({ parentId: item.id });
            this._resetQuery(item.id);
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
                legend={ item.__entity_type__ }
                rightIcon="star"
                onClick={ onClick }
                selectable={ 1 }
            />
        );
    }

    /** Render. */
    render() {
        return (
            <List
                key={ this.state.parentId }
            >
                <InfiniteScroll
                    loadItems={ this._loadItems }
                    renderItem={ this._renderItem }
                />
            </List>
        );
    }
}

ContextBrowser.propTypes = {
    onSelectContext: React.PropTypes.func,
};

export default ContextBrowser;
