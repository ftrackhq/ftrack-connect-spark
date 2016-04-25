// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import Avatar from 'react-toolbox/lib/avatar';
import classNames from 'classnames';

import style from './style.scss';
import { session } from '../../ftrack_api';

/** Display user information. */
export function User({ data, thumbnail }) {
    const name = `${data.first_name} ${data.last_name}`;
    const url = session.thumbnail(data.thumbnail_id, 100);
    const image = (
        <div
            className={style.image}
            style={{ backgroundImage: `url('${url}')` }}
        />
    );

    let avatar = '';
    if (thumbnail) {
        avatar = (
            <Avatar title={name} className={style.avatar}>
                {image}
            </Avatar>
        );
    }
    return (
        <div className={style.user}>
            {avatar}
            <div className={style.name}>
                <span>{name}</span>
            </div>
        </div>
    );
}

User.propTypes = {
    data: React.PropTypes.object.isRequired,
    thumbnail: React.PropTypes.bool,
};

/** Display user placeholder. */
export function PlaceholderUser({ title }) {
    const _classNames = classNames(style.name, style['unassigned-name']);
    return (
        <div className={style.user}>
            <Avatar title={title} className={style.avatar} icon="person" />
            <div className={_classNames}>
                <span>{title}</span>
            </div>
        </div>
    );
}

PlaceholderUser.propTypes = {
    title: React.PropTypes.string.isRequired,
};
