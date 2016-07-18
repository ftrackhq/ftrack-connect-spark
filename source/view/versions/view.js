// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { connect } from 'react-redux';
import Button from 'react-toolbox/lib/button';
import { Menu, MenuItem } from 'react-toolbox/lib/menu';
import { hashHistory } from 'react-router';

import { importGetComponents, importComponent } from 'action/import';
import InfiniteScroll from 'component/infinite_scroll';
import ContextCard from 'component/context_card';
import EmptyState from 'component/empty_state';

import { session } from '../../ftrack_api';

import style from './style';

/** Versions. */
class _VersionsView extends React.Component {

    /** Constructor. */
    constructor() {
        super();

        this._limit = 25;
        this._offset = 0;
        this._loadItems = this._loadItems.bind(this);
        this._renderItem = this._renderItem.bind(this);
        this._renderImportMenu = this._renderImportMenu.bind(this);
        this._onPublishClicked = this._onPublishClicked.bind(this);
        this.state = { empty: true, loading: true, components: [] };
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

        let query = session.query(
            `${queryString} order by date desc` +
            `offset ${this._offset} limit ${this._limit}`
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

    _getCardActions(item) {
        if (!this.props.enableImport) {
            return null;
        }

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

        return [
            <div className={style.import} key="action-import">
                {button}
                {menu}
            </div>,
        ];
    }

    /** Render item. */
    _renderItem(item) {
        return (
            <ContextCard
                key={item.id}
                entity={item}
                className={style.item}
                actions={this._getCardActions(item)}
            />
        );
    }

    /** Navigate to publish view on publish clicked. */
    _onPublishClicked() {
        const contextId = this.props.params.id;
        hashHistory.replace(`/publish/${contextId}`);
    }

    /** Render empty state */
    _renderEmptyState() {
        return (
            <EmptyState
                className={style.empty}
                icon="layers"
                message="There are no versions published yet."
            >
                <Button
                    label="Publish a new version"
                    onClick={this._onPublishClicked}
                    type="button"
                    primary
                    raised
                />
            </EmptyState>
        );
    }


    /** Render. */
    render() {
        if (!this.state.loading && this.state.empty) {
            return this._renderEmptyState();
        }

        return (
            <InfiniteScroll
                className={style['task-list']}
                loadItems={this._loadItems}
                renderItem={this._renderItem}
            />
        );
    }
}

_VersionsView.propTypes = {
    params: React.PropTypes.object.isRequired,
    onImportComponent: React.PropTypes.func.isRequired,
    onGetImportComponents: React.PropTypes.func.isRequired,
    components: React.PropTypes.object,
    enableImport: React.PropTypes.bool,
};

/** Map version state to components */
function mapStateToProps(state) {
    return {
        components: state.screen.version,
        enableImport: state.application.config.isImportFileSupported,
    };
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

const VersionsView = connect(
    mapStateToProps,
    mapDispatchToProps
)(_VersionsView);

export default VersionsView;
