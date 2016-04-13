// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import FontIcon from 'react-toolbox/lib/font_icon';
import { Avatar } from 'react-toolbox';

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
            <span className={style.name}>
            {name}
            </span>
        </div>
    );
}

User.propTypes = {
    data: React.PropTypes.object.isRequired,
    thumbnail: React.PropTypes.bool,
};

/** Display user information. */
export function PlaceholderUser({ title }) {
    return (
        <div className={style.user}>
            <Avatar title={name} className={style.avatar} icon="person" />
            <span className={style['unassigned-name']}>
            {title}
            </span>
        </div>
    );
}

PlaceholderUser.propTypes = {
    title: React.PropTypes.string.isRequired,
};
