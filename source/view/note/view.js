
import React from 'react';
import { connect } from 'react-redux';
import { Avatar, Button, Input, ProgressBar, IconMenu, MenuItem } from 'react-toolbox';
import loglevel from 'loglevel';
import TimeAgo from 'react-timeago';
import clickOutSide from 'react-click-outside';

import { session } from '../../ftrack_api';
import { startNoteReply, hideNoteReply, submitNoteForm } from 'action/note';

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

function Note({ data, category, children }) {
    const categoryItem = (category !== true) ? '' : (
        <span className={style.category}>
            {data.category && data.category.name}
        </span>
    );

    const displayAvatar = data.author && data.author.__entity_type__ === 'User';

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
                {children}
            </div>
        </div>
    );
}


Note.propTypes = {
    data: React.PropTypes.object.isRequired,
    category: React.PropTypes.bool,
    children: React.PropTypes.array,
};


class _NoteForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            expanded: false,
            content: props.defaultContent,
        };
    }

    getContent() {
        return this.state.content;
    }

    handleClickOutside() {
        if (this.props.onClickOutside) {
            this.props.onClickOutside(this);
        }
    }

    render() {
        const content = this.state.content || undefined;
        const state = this.props.state;
        const expanded = this.state.expanded;

        return (
            <div className={style['note-form']}>
                <Input
                    value={content} ref="content" label="Write a comment..."
                    disabled={state === 'pending'}
                    name="content"
                    onChange={
                        (value) => this.setState({content: value})
                    }
                    onFocus={
                        () => this.setState({ expanded: true })
                    }
                />
                {
                    expanded ?
                    <div className={style.toolbar}>
                        {
                            state === 'pending' ?
                            <div className={style.progressbar}>
                                <ProgressBar type="circular" mode="indeterminate" />
                            </div> :
                            <Button onClick={
                                    () => this.props.onSubmit(this)
                                } label="Comment"
                            />
                        }
                    </div> : []
                }
            </div>
        );
    }
}

_NoteForm.propTypes = {
    content: React.PropTypes.string,
    onClickOutside: React.PropTypes.func,
    onSubmit: React.PropTypes.func,
    state: React.PropTypes.string,
};

const NoteForm = clickOutSide(_NoteForm);

function NotesList({
    items, onNoteFormOpen, onNoteFormHide, onNoteFormSubmit,
    entity, activeNoteReplies = {}, user = {},
}) {
    logger.debug('Rendering notes', items);
    const notes = [];

    items.forEach(
        note => {
            const replies = (note.replies || []).map(
                reply => <Note data={reply} />
            );
            const onClick = () => onNoteFormOpen(note.id, note.parent_id, note.parent_type);
            const onSubmit = (noteForm) => {
                onNoteFormSubmit(
                    note.id, note.parent_id, note.parent_type,
                    user.id, noteForm.getContent()
                );
            };
            const onNoteFormClickOutside = (noteForm) => {
                const content = noteForm.getContent();
                onNoteFormHide(note.id, content);
            };

            const activeNoteReply = activeNoteReplies[note.id];

            notes.push(
                <div className={style['parent-note-item']}>
                    <Note data={note} key={note.id}>
                        <div className={style.replies}>
                            {replies}
                        </div>
                        {
                            activeNoteReply && activeNoteReply.state !== 'hidden' ?
                            <NoteForm
                                defaultContent={activeNoteReply.content}
                                onClickOutside={onNoteFormClickOutside}
                                onSubmit={onSubmit}
                                state={activeNoteReply.state}
                            /> :
                            <Button primary mini className={style['reply-button']}
                                label="Reply" onClick={onClick}
                            />
                        }
                    </Note>
                    <IconMenu icon='more_vert' position='top-left'>
                        <MenuItem caption="Edit" />
                    </IconMenu>
                </div>
            );
        }
    );

    const onSubmit = (noteForm) => {
        onNoteFormSubmit(
            null, entity.id, entity.type,
            user.id, noteForm.getContent()
        );
    };

    return (
        <div className={style['note-list']}>
            <NoteForm onSubmit={onSubmit} />
            {notes}
        </div>
    );
}

NotesList.propTypes = {
    items: React.PropTypes.array.isRequired,
    activeNoteReplies: React.PropTypes.object,
    entity: React.PropTypes.object,
    onNoteFormOpen: React.PropTypes.func.isRequired,
    onNoteFormHide: React.PropTypes.func.isRequired,
    onNoteFormSubmit: React.PropTypes.func.isRequired,
    user: React.PropTypes.user,
};

const mapStateToProps = (state) => {
    const items = state.screen.notes && state.screen.notes.items || [];
    const activeNoteReplies = (
        state.screen.notes && state.screen.notes.noteReply || {}
    );
    const entity = state.screen.notes && state.screen.notes.entity || null;
    return {
        items,
        entity,
        activeNoteReplies,
        user: state.user,
    };
};

const mapDispatchToProps = (dispatch) => (
    {
        onNoteFormOpen: (...args) => dispatch(
            startNoteReply(...args)
        ),
        onNoteFormHide: (...args) => dispatch(
            hideNoteReply(...args)
        ),
        onNoteFormSubmit: (...args) => dispatch(
            submitNoteForm(...args)
        ),
    }
);

const NotesListView = connect(
    mapStateToProps,
    mapDispatchToProps
)(NotesList);

export default NotesListView;
