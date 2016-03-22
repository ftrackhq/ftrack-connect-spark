// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';

import InfiniteScroll from 'component/infinite_scroll';
import { Card, CardMedia, CardTitle, CardText, CardActions } from 'react-toolbox/lib/card';
import Button from 'react-toolbox/lib/button';

import { session } from '../../ftrack_api';

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
    }

    _showDetails(item) {
        browserHistory.push(`/context-view/${item.id}`);
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
            `assignments.resource_id=${this.props.user.id}`
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
        const showDetails = this._showDetails.bind(this, item);

        return (
            <Card
                key={ item.id }
            >
                <CardTitle
                    title={ item.name }
                    subtitle={ item.__entity_type__ }
                />
                <CardText>{ item.description }</CardText>
                <CardActions>
                    <Button
                        label="Details"
                        flat
                        onClick={ showDetails }
                        type="button"
                    />
                </CardActions>
            </Card>
        );
    }

    /** Render. */
    render() {
        return (
            <InfiniteScroll
                loadItems={ this._loadItems }
                renderItem={ this._renderItem }
            />
        );
    }
}


function mapStateToProps(state) {
    return {
        user: state.user,
    };
}

MyTasks = connect(
    mapStateToProps
)(MyTasks);

export default MyTasks;
