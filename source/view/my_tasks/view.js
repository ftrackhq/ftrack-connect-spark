// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { connect } from 'react-redux';
import { hashHistory } from 'react-router';
import { Link } from 'react-router';

import InfiniteScroll from 'component/infinite_scroll';
import ContextCard from 'component/context_card';
import EmptyState from 'component/empty_state';

import { session } from '../../ftrack_api';

import style from './style';

/** My Tasks. */
/* eslint-disable react/prefer-stateless-function */
class MyTasks extends React.Component {

    /** Constructor. */
    constructor() {
        super();

        this._limit = 25;
        this._offset = 0;
        this._hideDoneTasks = true;
        this._loadItems = this._loadItems.bind(this);
        this._renderItem = this._renderItem.bind(this);

        this.state = { empty: true, loading: true };
    }

    /** Navigate to the task. */
    _selectContext(item) {
        hashHistory.push(`/context/${item.__entity_type__}/${item.id}`);
    }

    /** Load more items. */
    _loadItems() {
        const select = [
            'thumbnail_id', 'type.color', 'type.is_billable', 'type.name',
            'type.sort', 'priority.sort', 'end_date', 'name', 'status',
            'type.name', 'assignments', 'assignments.resource_id', 'project',
            'description', 'priority.name', '_link', 'object_type_id',
            'status.sort', 'status.name', 'status.color',
        ];
        let queryString = (
            `select ${select.join(', ')} from Task where ` +
            `assignments.resource_id=${this.props.user.id} ` +
            'and project.status is active'
        );

        if (this._hideDoneTasks) {
            queryString += ' and status.state.short != DONE';
        }

        let query = session._query(
            `${queryString} order by name, id offset ${this._offset} limit ${this._limit}`,
            true
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


    /** Render item. */
    _renderItem(item) {
        const selectContext = this._selectContext.bind(this, item);
        return (
            <ContextCard
                key={item.id}
                entity={item}
                className={style.item}
                onClick={selectContext}
            />
        );
    }

    /** Render empty state */
    _renderEmptyState() {
        const message = (
            <span>
                You don't have any tasks assigned to you. <br />
                Try <Link to="/home/browse-all">browsing</Link> all projects and tasks.
            </span>
        );
        return (<EmptyState className={style.empty} icon="assignment" message={message} />);
    }

    /** Render. */
    render() {
        if (!this.state.loading && this.state.empty) {
            return this._renderEmptyState();
        }

        return (
            <InfiniteScroll
                className={style['task-list']}
                loadItems={ this._loadItems }
                renderItem={ this._renderItem }
            />
        );
    }
}


MyTasks.propTypes = {
    user: React.PropTypes.object,
};


function mapStateToProps(state) {
    return {
        user: state.user,
    };
}

MyTasks = connect(
    mapStateToProps
)(MyTasks);

export default MyTasks;
