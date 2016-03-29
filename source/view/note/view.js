
import React from 'react';
import { connect } from 'react-redux';
import { Avatar, Button } from 'react-toolbox';
import loglevel from 'loglevel';

import { session } from '../../ftrack_api';

import style from './style.scss';

const logger = loglevel.getLogger('view:note');

function ParentNote({ data }) {
    const replies = (data.replies || []).map(
        (reply) => <Note data={reply} />
    );
    return (
        <Note data={data} replies={replies} reply category />
    );
}

ParentNote.propTypes = {
    data: React.PropTypes.object.isRequired,
};


function Note({ data, replies, reply, category }) {
    logger.debug('Note item to render: ', data);
    const replyButton = (reply !== true) ? '' : <Button label="Reply" />;
    const categoryItem = (category !== true) ? '' : (
        <div className={style.category}>
            {data.category && data.category.name}
        </div>
    );

    return (
        <div className={style['note-item']}>
            <div className={style['avatar-column']}>
                <Avatar>
                    <img src={session.thumbnail(data.author.thumbnail_id, 100)} />
                </Avatar>
            </div>
            <div className={style['body-column']}>
                <div className={style.top}>
                    <div className={style.user}>
                        {`${data.author.first_name} ${data.author.last_name}`}
                    </div>
                    <div>{data.date.value}</div>
                </div>
                {categoryItem}
                <div>{data.content}</div>
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
    replies: React.PropTypes.object.isRequired,
    reply: React.PropTypes.bool.isRequired,
    category: React.PropTypes.bool.isRequired,
};

function NotesList({ items }) {
    return (
        <div className={style['note-list']}>
            <div>Notes:</div>
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
