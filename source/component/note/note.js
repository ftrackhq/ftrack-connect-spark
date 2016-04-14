// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { Avatar } from 'react-toolbox';
import TimeAgo from 'react-timeago';

import { session } from '../../ftrack_api';
import style from './style.scss';
import AttachmentArea from './attachment_area.js';

import ContextCard from 'component/context_card';
import Markdown from 'component/markdown';
import { User } from 'component/user';


const REVIEW_SESSION_NOTE_CATEGORY = '42983ba0-53b0-11e4-916c-0800200c9a66';


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
    const tags = [];

    if (category && data.category) {
        if (data.category.id === REVIEW_SESSION_NOTE_CATEGORY) {
            tags.push(
                <span key={data.category.id} className={style['review-session-category']}>
                    {data.category.name}
                </span>
            );
        } else {
            tags.push(data.category.name);
        }
    }

    if (data.frame) {
        if (tags.length > 0) {
            tags.push(', ');
        }
        tags.push(`Frame ${data.frame}`);
    }

    let card = false;

    if (data.extraInformation) {
        card = (<ContextCard
            className={style['context-card']}
            entity={data.extraInformation}
            small
            flat
        />);
    }

    // TODO: Break out as a separate component.
    const author = data.author;
    let avatar = false;
    if (author) {
        let image = false;
        if (author.thumbnail_id) {
            const url = session.thumbnail(author.thumbnail_id, 100);
            image = (
                <div
                    className={style.image}
                    style={{ backgroundImage: `url('${url}')` }}
                />
            );
        }

        const title = author.name || `${author.first_name} ${author.last_name}`;
        avatar = (
            <Avatar title={title} className={style.avatar}>
                {image}
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
                    <div className={style.author}>
                        <Author data={author} />
                    </div>
                    <TimeAgo className={style.datetime} date={data.date.toDate()} />
                </span>
                <div className={style.tags}>
                    {tags}
                </div>
                {card}
                <Markdown source={data.content} />
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
