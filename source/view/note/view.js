
import React from 'react';
import { connect } from 'react-redux';
import { Avatar, Button } from 'react-toolbox';
import loglevel from 'loglevel';
import TimeAgo from 'react-timeago';

import { session } from '../../ftrack_api';

import style from './style.scss';

const logger = loglevel.getLogger('view:note');

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

function ReviewSessionInvitee({ data }) {
    return <span>{data.name}</span>;
}

ReviewSessionInvitee.propTypes = {
    data: React.PropTypes.object.isRequired,
};

function Author({ data }) {
    if (data.__entity_type__ === 'User') {
        return <User data={data} />;
    } else if (data.__entity_type__ === 'ReviewSessionInvitee') {
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

function ParentNote({ data }) {
    const replies = (data.replies || []).map(
        (reply) => <Note data={reply} key={reply.id} />
    );
    return (
        <div className={style['parent-note-item']}>
            <Note data={data} replies={replies} reply category />
        </div>
    );
}

ParentNote.propTypes = {
    data: React.PropTypes.object.isRequired,
};

const SUPPORTED_IMG_FILE_TYPES = [
    'png', 'gif', 'jpeg', 'jpg', 'bmp',
];

function AttachmentArea({ components }) {
    const images = [];
    const other = [];

    components.forEach(
        component => {
            if (
                SUPPORTED_IMG_FILE_TYPES.includes(
                    component.file_type.slice(1)
                )
            ) {
                images.push(<img key={component.id} src={session.thumbnail(component.id, 100)} />);
            } else {
                other.push(
                    <p key={component.id}>{`${component.name}${component.file_type}`}</p>
                );
            }
        }
    );

    return (
        <div className={style['attachments-area']}>
            <div className={style.images}>
                {images}
            </div>
            <div className={style.other}>
                {other}
            </div>
        </div>
    );
}

AttachmentArea.propTypes = {
    components: React.PropTypes.array.isRequired,
};

function Note({ data, replies, reply, category }) {
    const replyButton = (
        (reply !== true) ?
        '' :
        <Button primary mini className={style['reply-button']} label="Reply" />
    );
    const categoryItem = (category !== true) ? '' : (
        <span className={style.category}>
            {data.category && data.category.name}
        </span>
    );

    const displayAvatar = data.author && data.author.__entity_type__ === 'user';

    return (
        <div className={style['note-item']}>
            <div className={style['avatar-column']}>
                {
                    displayAvatar ? (
                        <Avatar>
                            <img src={session.thumbnail(data.author.thumbnail_id, 100)} />
                        </Avatar>
                    ) : ''
                }
            </div>
            <div className={style['body-column']}>
                <span className={style.top}>
                    <Author data={data.author} />
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
                <div className={style.replies}>
                    {replies || []}
                </div>
                {replyButton}
            </div>
        </div>
    );
}

Note.propTypes = {
    data: React.PropTypes.object.isRequired,
    replies: React.PropTypes.array,
    reply: React.PropTypes.bool,
    category: React.PropTypes.bool,
};

function NotesList({ items }) {
    logger.debug('Rendering notes', items);
    return (
        <div className={style['note-list']}>
            {
                items.map((item) => <ParentNote data={item} key={item.id} />)
            }
        </div>
    );
}

NotesList.propTypes = {
    items: React.PropTypes.array.isRequired,
};


const mapStateToProps = (state) => {
    const items = state.screen.notes && state.screen.notes.items || [];
    return {
        items,
    };
};

const NotesListView = connect(
    mapStateToProps,
    null
)(NotesList);

export default NotesListView;
