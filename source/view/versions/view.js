// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import style from './style';

import InfiniteScroll from 'component/infinite_scroll';
import ContextCard from 'component/context_card';
import Button from 'react-toolbox/lib/button';
import { Menu, MenuItem } from 'react-toolbox';

import { session } from '../../ftrack_api';

/** Versions. */

/* eslint-disable react/prefer-stateless-function */
class VersionsView extends React.Component {

    /** Constructor. */
    constructor() {
        super();

        this._limit = 25;
        this._offset = 0;
        this._loadItems = this._loadItems.bind(this);
        this._renderItem = this._renderItem.bind(this);
        this.state = { activeMenu: null };
    }

    /** Load more items. */
    _loadItems() {
        const contextId = this.props.params.context;
        const select = [
            'thumbnail_id', 'version', 'link',
            'asset.type.id', 'asset.type.name',
            'status.sort', 'status.name', 'status.color',
        ];
        const queryString = (
            `select ${select.join(', ')} from AssetVersion where ` +
            `asset.context_id is ${contextId} or task_id is ${contextId}`
        );

        let query = session._query(
            `${queryString} order by asset_id, version, id ` +
            `offset ${this._offset} limit ${this._limit}`
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


    _onImportClicked(item, event) {
        event.stopPropagation();
        this.setState({ activeMenu: item.id });
    }

    /** Render item. */
    _renderItem(item) {
        const menu = (
            <Menu
                className={style.menu}
                position="auto"
                menuRipple
                active={this.state.activeMenu === item.id}
            >
                <MenuItem
                    caption="Loading..."
                    disabled
                />
            </Menu>
        );
        const onImportClick = this._onImportClicked.bind(this, item);
        const actions = [
            <div className={style.share}>
                <Button label="Import" onClick={onImportClick} />
                {menu}
            </div>,
        ];

        return (
            <ContextCard
                key={item.id}
                entity={item}
                className={style.item}
                actions={actions}
            />
        );
    }

    /** Render. */
    render() {
        return (
            <InfiniteScroll
                className={style['task-list']}
                loadItems={ this._loadItems }
                renderItem={ this._renderItem }
            />
        );
    }
}

VersionsView.contextTypes = {};

VersionsView.propTypes = {
    params: React.PropTypes.object.isRequired,
};

export default VersionsView;
