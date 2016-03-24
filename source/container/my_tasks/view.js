// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import style from './style';

import InfiniteScroll from 'component/infinite_scroll';
import { Card, CardActions, CardTitle, CardMedia, CardText } from 'react-toolbox/lib/card';
import Button from 'react-toolbox/lib/button';
import Reveal from 'component/reveal';

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

    /** Navigate to the task. */
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

    _getLink(link) {
        const path = [];

        for (let index = 0; index < link.length; index++) {
            path.push(link[index].name);
        }

        return path.join(' / ');
    }

    /** Render item. */
    _renderItem(item) {
        const showDetails = this._showDetails.bind(this, item);

        return (
            <Card
                key={ item.id }
            >
                <div className={style.cardRow}>
                    <CardTitle>
                        <p>{ item.__entity_type__ }</p>
                        <p>{ item.name }</p>
                        <p>{ this._getLink(item.link.slice(-2, -1)) }</p>
                        <p>{ this._getLink(item.link.slice(0, -2)) }</p>
                    </CardTitle>
                    <CardMedia
                        className={ style.media }
                        image={ session.thumbnail(item.thumbnail_id, 300) }
                    />
                </div>


                <CardActions>
                    <Button
                        label="Details"
                        flat
                        onClick={ showDetails }
                        type="button"
                    />
                </CardActions>
                <CardText>
                    <Reveal label="description">
                        { item.description }
                    </Reveal>
                </CardText>
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
