// :copyright: Copyright (c) 2016 ftrack

import React from 'react';

import InfiniteScroll from 'component/infinite_scroll';
import Button from 'react-toolbox/lib/button';
import ContextCard from 'component/context_card';

import style from './style';
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
        this._onBackClick = this._onBackClick.bind(this);

        this._history = [this.state.parentId];
        this._resetQuery('projects');
    }

    /** Reset the query. */
    _resetQuery(parentId) {
        const lastItem = this._history[this._history.length - 1];
        if (parentId !== lastItem) {
            this._history.push(parentId);
        }

        this._offset = 0;

        if (parentId !== 'projects') {
            this._baseQuery = (
                'select id, name, thumbnail_id, link, object_type.name from TypedContext where ' +
                `parent_id is ${parentId} order by name, id`
            );
        } else {
            this._baseQuery = (
                'select id, name, thumbnail_id, link from Project where ' +
                'status is active order by full_name, id'
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

    _onBackClick() {
        const history = this._history;
        if (history.length > 1) {
            history.pop();
            const parentId = history.pop();
            this.setState({ parentId });
            this._resetQuery(parentId);
        }
    }

    /* handle click. */
    _onContextCardClick(item, event) {
        event.stopPropagation();
        if (item.__entity_type__ === 'Task') {
            this.props.onSelectContext(item.id);
        } else {
            this.setState({ parentId: item.id });
            this._resetQuery(item.id);
        }
    }

    _onSelectContextClick(item, event) {
        event.stopPropagation();
        this.props.onSelectContext(item.id);
    }

    /** Render item. */
    _renderItem(item) {
        const onClick = this._onContextCardClick.bind(this, item);
        const onSelectClick = this._onSelectContextClick.bind(this, item);
        const actions = [
            <Button
                label="Select"
                onClick={onSelectClick}
                type="button"
            />,
        ];

        return (
            <ContextCard
                key={item.id}
                entity={item}
                className={style.item}
                onClick={onClick}
                actions={actions}
            />
        );
    }

    /** Render. */
    render() {
        return (
            <div>
                <Button
                    label="Back"
                    icon="chevron_left"
                    disabled={this._history.length <= 1}
                    onClick={this._onBackClick}
                    type="button"
                />
                <InfiniteScroll
                    key={this.state.parentId}
                    className={style['context-list']}
                    loadItems={ this._loadItems }
                    renderItem={ this._renderItem }
                />
            </div>
        );
    }
}

ContextBrowser.propTypes = {
    onSelectContext: React.PropTypes.func,
};

export default ContextBrowser;