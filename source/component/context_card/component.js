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

    render() {
        const _classNames = classNames(
            style.root, {
                [style.clickable]: !!this.props.onClick,
            }, this.props.className
        );
        const entity = this.props.entity;
        const expandIcon = this.state.expanded ? 'expand_less' : 'expand_more';
        const isExpandable = !!entity.description;
        const statusColor = entity.status && entity.status.color;
        const actions = [...this.props.actions];
        if (isExpandable) {
            actions.push(
                <Button
                    icon={expandIcon}
                    className={style['expand-button']}
                    onClick={this._onToggleExpand}
                />
            );
        }

        const contents = [
            <div className={style.contents}>
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
                        size="large"
                        className={style['entity-link']}
                    />
                    <CardActions>
                        {actions}
                    </CardActions>
                </div>
            </div>,
            <Reveal active={this.state.expanded}>
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
    entity: React.PropTypes.object.isRequired,
    flat: React.PropTypes.bool,
    onClick: React.PropTypes.func,
    actions: React.PropTypes.node,
};

ContextCard.defaultProps = {
    className: '',
    flat: false,
    actions: [],
};

export default ContextCard;
