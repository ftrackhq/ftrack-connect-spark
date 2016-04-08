import React from 'react';
import classNames from 'classnames';
import Avatar from 'react-toolbox/lib/avatar';

import style from './style.scss';

import { session } from '../../ftrack_api';

/**
 * EntityAvatar component - displays *entity* (user, invitee, context) as an Avatar.
 */
function EntityAvatar({ entity, className }) {
    const _classNames = classNames(
        style['entity-avatar'], className
    );

    let image = false;
    if (entity.thumbnail_id) {
        const url = session.thumbnail(entity.thumbnail_id, 100);
        image = (
            <div
                className={style.image}
                style={{ backgroundImage: `url('${url}')` }}
            />
        );
    }

    let title = null;
    if (entity.full_name) {
        title = entity.full_name;
    } else if (entity.name) {
        title = entity.name;
    } else if (entity.first_name && entity.last_name) {
        title = `${entity.first_name} ${entity.last_name}`;
    }

    return (
        <Avatar title={title} className={_classNames}>
            {image}
        </Avatar>
    );
}

EntityAvatar.propTypes = {
    className: React.PropTypes.string,
    entity: React.PropTypes.object,
};

EntityAvatar.defaultProps = {
    className: '',
    entity: {},
};

export default EntityAvatar;
