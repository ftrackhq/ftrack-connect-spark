// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { Avatar } from 'react-toolbox';
import TimeAgo from 'react-timeago';

import { session } from '../../ftrack_api';
import style from './style.scss';
import AttachmentArea from './attachment_area.js';

/** Display user information. */
function User({ data }) {
    return (
        <span className={style.user}>
            {`${data.first_name} ${data.last_name}`}
        </span>
    );
}

User.propTypes = {
    data: React.PropTypes.object.isRequired,
};

/** Display review session invitee information. */
function ReviewSessionInvitee({ data }) {
    return <span>{data.name}</span>;
}

ReviewSessionInvitee.propTypes = {
    data: React.PropTypes.object.isRequired,
};

/** Display author information. */
function Author({ data }) {
    if (data && data.__entity_type__ === 'User') {
        return <User data={data} />;
    } else if (data && data.__entity_type__ === 'ReviewSessionInvitee') {
        return <ReviewSessionInvitee data={data} />;
    }

    const title = (
        'This note is posted by an unknown user. Most likely this is a user ' +
        'or invitee that has been removed from ftrack.'
    );

    return <span title={title}>Unknown</span>;
}

Author.propTypes = {
    data: React.PropTypes.object.isRequired,
};

/** Note component to display note data. */
function Note({ data, category }) {
    const categoryItem = (category !== true) ? '' : (
        <span className={style.category}>
            {data.category && data.category.name}
        </span>
    );

    const author = data.author;
    let avatar = false;
    if (author) {
        let img = false;
        if (author.thumbnail_id) {
            img = <img src={session.thumbnail(author.thumbnail_id, 100)} />;
        }

        const title = author.name || `${author.first_name} ${author.last_name}`;
        avatar = (
            <Avatar title={title} className={style.avatar}>
                {img}
            </Avatar>
        );
    }

    return (
        <div className={style['note-item']}>
            <div className={style['avatar-column']}>
                {avatar}
            </div>
            <div className={style['body-column']}>
                <span className={style.top}>
                    <Author data={author} />
                    <TimeAgo className={style.datetime} date={data.date.toDate()} />
                </span>
                {categoryItem}
                <span>{data.content}</span>
                <AttachmentArea components={
                        data.note_components.map(
                            noteComponent => noteComponent.component
                        )
                    }
                />
            </div>
        </div>
    );
}


Note.propTypes = {
    data: React.PropTypes.object.isRequired,
    category: React.PropTypes.bool,
};


export default Note;
