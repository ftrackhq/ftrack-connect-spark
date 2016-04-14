// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import classNames from 'classnames';
import { Card, CardActions } from 'react-toolbox/lib/card';
import { Button } from 'react-toolbox/lib/button';

import EntityType from 'component/entity_type';
import EntityThumbnail from 'component/entity_thumbnail';
import EntityLink from 'component/entity_link';
import StatusBar from 'component/status_bar';
import Reveal from 'component/reveal';

import style from './style';

/** Context Card */
class ContextCard extends React.Component {
    constructor() {
        super();
        this.state = { expanded: false };
        this._onToggleExpand = this._onToggleExpand.bind(this);
    }

    /** Toggle card expanded mode. */
    _onToggleExpand(event) {
        event.stopPropagation();
        this.setState({ expanded: !this.state.expanded });
    }

    /** Return empty state */
    renderEmptyState() {
        const _classNames = classNames(style['empty-state'], this.props.className);
        return (
            <div className={_classNames}>
                <div className={style.contents}>
                    <div className={style.side}>
                        <div className={style.placeholder} />
                    </div>
                    <div className={style.main}>
                        <ul className={style.placeholderList}>
                            <li className={style.placeholder} />
                            <li className={style.placeholder} />
                            <li className={style.placeholder} />
                            <li className={style.placeholder} />
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        const entity = this.props.entity;
        if (!entity) {
            return this.renderEmptyState();
        }

        const _classNames = classNames(
            style.root, {
                [style.clickable]: !!this.props.onClick,
                [style.large]: !this.props.small,
                [style.small]: !!this.props.small,
            }, this.props.className
        );
        const expandIcon = this.state.expanded ? 'expand_less' : 'expand_more';
        const isExpandable = !!entity.description;
        const statusColor = entity.status && entity.status.color;
        const actions = [...this.props.actions];
        if (isExpandable) {
            actions.push(
                <Button
                    key="context-action-expand-button"
                    icon={expandIcon}
                    className={style['expand-button']}
                    onClick={this._onToggleExpand}
                />
            );
        }
        let cardActions = null;
        if (actions.length) {
            cardActions = (
                <CardActions className={style['card-actions']}>
                    {actions}
                </CardActions>
            );
        }

        const isSmall = !!this.props.small;
        const linkProps = {
            size: (isSmall) ? 'medium' : 'large',
            parent: !isSmall,
            ancestors: !isSmall,
        };

        const contents = [
            <div key="context-contents" className={style.contents}>
                <div className={style.side}>
                    <EntityThumbnail thumbnailId={entity.thumbnail_id} />
                    <StatusBar color={statusColor} />
                </div>
                <div
                    className={style.main}
                    onClick={this.props.onClick}
                >
                    <EntityType entity={entity} className={style['entity-type']} />
                    <EntityLink
                        link={entity.link}
                        className={style['entity-link']}
                        {...linkProps}
                    />
                    {cardActions}
                </div>
            </div>,
            <Reveal key="context-reveal" active={this.state.expanded}>
                <p className={style.description}>{entity.description}</p>
            </Reveal>,
        ];

        return React.createElement(this.props.flat ? 'div' : Card, {
            className: _classNames,
            raised: !this.props.flat,
        }, contents);
    }
}


ContextCard.propTypes = {
    className: React.PropTypes.string,
    entity: React.PropTypes.object,
    flat: React.PropTypes.bool,
    small: React.PropTypes.bool,
    onClick: React.PropTypes.func,
    actions: React.PropTypes.node,
};

ContextCard.defaultProps = {
    className: '',
    flat: false,
    small: false,
    actions: [],
};

export default ContextCard;
