// :copyright: Copyright (c) 2016 ftrack

import React from 'react';

import InfiniteScroll from 'component/infinite_scroll';
import { List } from 'react-toolbox';
import { Card, CardActions, CardTitle, CardMedia, CardText } from 'react-toolbox/lib/card';
import Button from 'react-toolbox/lib/button';
import Reveal from 'component/reveal';

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

        this._resetQuery('projects');
    }

    /** Reset the query. */
    _resetQuery(parentId) {
        this._offset = 0;

        if (parentId !== 'projects') {
            this._baseQuery = (
                'select id, name, thumbnail_id, link from TypedContext where ' +
                `parent_id is ${parentId} order by name, id`
            );
        } else {
            this._baseQuery = (
                'select id, name, thumbnail_id, link from Project order by name, id'
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

    _getLink(link) {
        const path = [];

        for (let index = 0; index < link.length; index++) {
            path.push(link[index].name);
        }

        return path.join(' / ');
    }

    /** Render item. */
    _renderItem(item) {
        const onClick = this._onClick.bind(this, item);

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
                        onClick={ onClick }
                        type="button"
                    />
                </CardActions>
            </Card>
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
