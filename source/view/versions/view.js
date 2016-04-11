// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { connect } from 'react-redux';
import Button from 'react-toolbox/lib/button';
import { Menu, MenuItem } from 'react-toolbox/lib/menu';

import { importGetComponents, importComponent } from 'action/import';
import InfiniteScroll from 'component/infinite_scroll';
import ContextCard from 'component/context_card';

import { session } from '../../ftrack_api';

import style from './style';

/** Versions. */
class VersionsView extends React.Component {

    /** Constructor. */
    constructor() {
        super();

        this._limit = 25;
        this._offset = 0;
        this._loadItems = this._loadItems.bind(this);
        this._renderItem = this._renderItem.bind(this);
        this._renderImportMenu = this._renderImportMenu.bind(this);
        this.state = { components: [] };
    }

    /** Load more items. */
    _loadItems() {
        const contextId = this.props.params.id;
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
            `${queryString} order by date desc` +
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

    /** Render import menu */
    _renderImportMenu(components = []) {
        return (
            <Menu
                ref={(ref) => { if (ref) { ref.show(); } }}
                className={style.menu}
                menuRipple
                position="auto"
            >
                {components.map((component) => {
                    const onItemClick = this.props.onImportComponent.bind(
                        null, component.data
                    );

                    return (
                        <MenuItem
                            key={component.data.id}
                            caption={component.caption}
                            disabled={component.disabled}
                            icon={component.icon}
                            onClick={onItemClick}
                        />
                    );
                })}
            </Menu>
        );
    }

    /** Render item. */
    _renderItem(item) {
        const activeVersion = this.props.components;
        const isItemActiveVersion = (activeVersion.versionId === item.id);

        let menu = null;
        if (isItemActiveVersion && !activeVersion.loading) {
            menu = this._renderImportMenu(activeVersion.components);
        }

        let button = null;
        if (isItemActiveVersion && activeVersion.loading) {
            button = <Button label="Loading..." disabled />;
        } else {
            const onImportClick = this.props.onGetImportComponents.bind(null, item.id);
            button = (
                <Button
                    label="Import"
                    onClick={onImportClick}
                />
            );
        }

        const actions = [
            <div className={style.import} key="action-import">
                {button}
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

VersionsView.propTypes = {
    params: React.PropTypes.object.isRequired,
    onImportComponent: React.PropTypes.func.isRequired,
    onGetImportComponents: React.PropTypes.func.isRequired,
    components: React.PropTypes.object,
};

/** Map version state to components */
function mapStateToProps(state) {
    return { components: state.screen.version };
}

/** Map import actions to props */
function mapDispatchToProps(dispatch) {
    return {
        onGetImportComponents(versionId) {
            dispatch(importGetComponents(versionId));
        },
        onImportComponent(component) {
            dispatch(importComponent(component));
        },
    };
}

VersionsView = connect(
    mapStateToProps,
    mapDispatchToProps
)(VersionsView);

export default VersionsView;
