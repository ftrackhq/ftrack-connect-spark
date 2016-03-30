
import React from 'react';
import { connect } from 'react-redux';
import { Avatar, Button } from 'react-toolbox';
import loglevel from 'loglevel';
import TimeAgo from 'react-timeago';

import { session } from '../../ftrack_api';

import style from './style.scss';

const logger = loglevel.getLogger('view:note');

function ParentNote({ data }) {
    const replies = (data.replies || []).map(
        (reply) => <Note data={reply} />
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


function Note({ data, replies, reply, category }) {
    logger.debug('Note item to render: ', data);
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

    return (
        <div className={style['note-item']}>
            <div className={style['avatar-column']}>
                <Avatar>
                    <img src={session.thumbnail(data.author.thumbnail_id, 100)} />
                </Avatar>
            </div>
            <div className={style['body-column']}>
                <span className={style.top}>
                    <span className={style.user}>
                        {`${data.author.first_name} ${data.author.last_name}`}
                    </span>
                    <TimeAgo className={style.datetime} date={data.date.toDate()} />
                </span>
                {categoryItem}
                <span>{data.content}</span>
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
    replies: React.PropTypes.array.isRequired,
    reply: React.PropTypes.bool.isRequired,
    category: React.PropTypes.bool.isRequired,
};

function NotesList({ items }) {
    return (
        <div className={style['note-list']}>
            {
                items.map((item) => <ParentNote data={item} />)
            }
        </div>
    );
}

NotesList.propTypes = {
    items: React.PropTypes.object.isRequired,
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
