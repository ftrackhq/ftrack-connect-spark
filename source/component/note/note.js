// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import TimeAgo from 'react-timeago';

import style from './style.scss';
import AttachmentArea from './attachment_area.js';
import EntityAvatar from 'component/entity_avatar';


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
    data: React.PropTypes.object,
};

/** Note component to display note data. */
function Note({ data, category, onAttachmentClick }) {
    const categoryItem = (category !== true) ? '' : (
        <span className={style.category}>
            {data.category && data.category.name}
        </span>
    );

    return (
        <div className={style['note-item']}>
            <div className={style['avatar-column']}>
                {data.author ? <EntityAvatar entity={data.author} /> : null}
            </div>
            <div className={style['body-column']}>
                <span className={style.top}>
                    <Author data={data.author} />
                    <TimeAgo className={style.datetime} date={data.date.toDate()} />
                </span>
                {categoryItem}
                <span>{data.content}</span>
                <AttachmentArea onAttachmentClick={onAttachmentClick} components={
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
    onAttachmentClick: React.PropTypes.func,
};


export default Note;
