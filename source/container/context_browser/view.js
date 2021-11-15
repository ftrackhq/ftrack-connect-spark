// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import PropTypes from 'prop-types';

import InfiniteScroll from 'component/infinite_scroll';
import Button from 'react-toolbox/lib/button';
import ContextCard from 'component/context_card';
import EmptyState from 'component/empty_state';

import style from './style';
import { session } from '../../ftrack_api';


/** Context browser. */
/* eslint-disable react/prefer-stateless-function */
class ContextBrowser extends React.Component {

    /** Constructor. */
    constructor() {
        super();

        this.state = { parentId: 'projects', empty: true, loading: true };
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
        let query = session.query(
            `${this._baseQuery} offset ${this._offset} limit ${this._limit}`
        );

        // Calculate new offset.
        query = query.then((result) => {
            if (this.state.loading) {
                const isEmpty = !(result && result.data && result.data.length);
                this.setState({ loading: false, empty: isEmpty });
            }

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
            this.setState({ parentId, empty: true, loading: true });
            this._resetQuery(parentId);
        }
    }

    /* handle click. */
    _onContextCardClick(item, event) {
        event.stopPropagation();
        if (item.__entity_type__ === 'Task') {
            this.props.onSelectContext(item.id);
        } else {
            this.setState({ parentId: item.id, empty: true, loading: true });
            this._resetQuery(item.id);
        }
    }

    _onSelectContextClick(item, event) {
        event.stopPropagation();
        this.props.onSelectContext(item.id, item.__entity_type__);
    }

    /** Render item. */
    _renderItem(item) {
        const onClick = this._onContextCardClick.bind(this, item);
        const onSelectClick = this._onSelectContextClick.bind(this, item);
        const actions = [
            <Button
                key="context-browser-action-select"
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

    /** Render empty state */
    _renderEmptyState() {
        const message = (
            <span>
                There are no tasks or objects here. <br />
                Try navigating somewhere else.
            </span>
        );
        return (
            <EmptyState
                className={style.empty}
                icon="error_outline"
                message={message}
            >
                <Button
                    label="Go back"
                    disabled={this._history.length <= 1}
                    onClick={this._onBackClick}
                    type="button"
                    primary
                    raised
                />
            </EmptyState>
        );
    }

    /** Render. */
    render() {
        const isRoot = this._history.length <= 1;
        const isBackDisabled = this.props.disableRootBack && isRoot;
        let onBackClick = this._onBackClick;
        if (isRoot && !this.props.disableRootBack) {
            onBackClick = this.props.onRootBack;
        }

        return (
            <div className={style.view}>
                <div className={style.navigation}>
                    <Button
                        label="Back"
                        icon="chevron_left"
                        disabled={isBackDisabled}
                        onClick={onBackClick}
                        type="button"
                    />
                </div>
                {
                    (!this.state.loading && this.state.empty)
                    ? this._renderEmptyState()
                    : (
                        <InfiniteScroll
                            key={this.state.parentId}
                            className={style['context-list']}
                            loadItems={this._loadItems}
                            renderItem={this._renderItem}
                        />
                    )
                }
            </div>
        );
    }
}

ContextBrowser.propTypes = {
    onSelectContext: PropTypes.func,
    disableRootBack: PropTypes.bool,
    onRootBack: PropTypes.func,
};

ContextBrowser.defaultProps = {
    disableRootBack: true,
};

export default ContextBrowser;
