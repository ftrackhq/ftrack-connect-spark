
import React from 'react';
import { connect } from 'react-redux';
import { Avatar, Button, Input, ProgressBar, IconMenu, MenuItem } from 'react-toolbox';
import loglevel from 'loglevel';
import TimeAgo from 'react-timeago';
import clickOutSide from 'react-click-outside';

import { session } from '../../ftrack_api';
import { openNoteForm, hideNoteForm, submitNoteForm, removeNote } from 'action/note';

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
            content: props.content || undefined,
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ content: nextProps.content });
    }

    getContent() {
        return this.state.content;
    }

    handleClickOutside() {
        if (this.props.onClickOutside) {
            this.props.onClickOutside(this);
        }
    }

    expand() {
        if (this.props.onExpand) {
            this.props.onExpand(this);
        }
    }

    render() {
        const content = this.state.content;
        const collapsed = this.props.collapsed;
        const pending = this.props.pending;
        const edit = this.props.edit;

        return (
            <div className={style['note-form']}>
                <Input
                    value={content}
                    ref="content"
                    label={
                        edit ?
                        'Update your note...' : 'Write a comment...'
                    }
                    disabled={pending}
                    name="content"
                    multiline
                    onChange={
                        (value) => this.setState({ content: value })
                    }
                    onFocus={
                        () => {
                            if (collapsed) {
                                this.expand();
                            }
                        }
                    }
                />
                {
                    collapsed ? [] : (
                        <div className={style.toolbar}>
                            {
                                pending ?
                                <div className={style.progressbar}>
                                    <ProgressBar type="circular" mode="indeterminate" />
                                </div> :
                                <Button
                                    onClick={
                                        () => this.props.onSubmit(this)
                                    }
                                    label={
                                        edit ? 'Update' : 'Comment'
                                    }
                                />
                            }
                        </div>
                    )
                }
            </div>
        );
    }
}

_NoteForm.propTypes = {
    content: React.PropTypes.string,
    onClickOutside: React.PropTypes.func,
    onSubmit: React.PropTypes.func,
    onExpand: React.PropTypes.func,
    state: React.PropTypes.string,
    edit: React.PropTypes.bool,
    collapsed: React.PropTypes.bool,
    pending: React.PropTypes.bool,
};

const NoteForm = clickOutSide(_NoteForm);


function _EditableNote(
    { note, collapsed, form, author, onShowForm, onHideForm, onSubmitForm, onRemove }
) {
    if (!collapsed) {
        return (
            <NoteForm
                {...form}
                onClickOutside={(noteForm) => onHideForm(noteForm.getContent())}
                onSubmit={(noteForm) => onSubmitForm(noteForm.getContent())}
                edit
            />
        );
    }

    let menu = [];

    if (author && author.id === note.author.id) {
        menu = [
            <IconMenu icon="more_vert" menuRipple>
                <MenuItem value="edit" icon="edit" caption="Edit"
                    onClick={onShowForm}
                />
                <MenuItem value="delete" icon="delete" caption="Remove"
                    onClick={onRemove}
                />
            </IconMenu>
        ];
    }
 
    return (
        <div className={style['editable-note-container']}>
            <Note data={note} key={note.id} category />
            <div className={style['icon-menu']}>
                {menu}
            </div>
        </div>
    );
}

_EditableNote.propTypes = {
    note: React.PropTypes.object,
    collapsed: React.PropTypes.bool,
    form: React.PropTypes.object,
    onShowForm: React.PropTypes.func,
    onHideForm: React.PropTypes.func,
    onSubmitForm: React.PropTypes.func,
    onRemove: React.PropTypes.func,
    author: React.PropTypes.object,
};


function editableNoteStateToProps() {
    return (state, props) => {
        const forms = (
            state.screen.notes && state.screen.notes.forms || {}
        );
        const form = forms[`edit-${props.note.id}`] || {};

        return {
            form: {
                content: form.content || props.note.content,
                pending: form.state === 'pending',
            },
            collapsed: form.state === undefined || form.state === 'hidden',
        };
    };
}

function ediatbleNoteDispatchToProps() {
    return (dispatch, props) => {
        const formKey = `edit-${props.note.id}`;
        return {
            onShowForm: () => dispatch(openNoteForm(formKey, {})),
            onHideForm: (content) => dispatch(hideNoteForm(formKey, content)),
            onSubmitForm: (content) => {
                const data = {
                    content,
                    id: props.note.id,
                };
                dispatch(submitNoteForm(formKey, data));
            },
            onRemove: () => dispatch(removeNote(props.note.id)),
        };
    };
}

const EditableNote = connect(
    editableNoteStateToProps,
    ediatbleNoteDispatchToProps
)(_EditableNote);


function _ReplyForm({ form, collapsed, onSubmitForm, onHideForm, onShowForm }) {
    if (!collapsed) {
        return (
            <NoteForm {...form} onClickOutside={onHideForm} onSubmit={onSubmitForm} />
        );
    }

    return (
        <Button label="Reply" className={style['reply-button']} primary mini
            onClick={onShowForm}
        />
    );
}

_ReplyForm.propTypes = {
    parentNote: React.PropTypes.object,
    user: React.PropTypes.object,
    collapsed: React.PropTypes.bool,
    form: React.PropTypes.object,
    onShowForm: React.PropTypes.func,
    onHideForm: React.PropTypes.func,
    onSubmitForm: React.PropTypes.func,
};


function replyDispatchToProps() {
    return (dispatch, props) => {
        const { user, parentNote } = props;
        const formKey = `reply-${parentNote.id}`;
        return {
            onHideForm: (noteForm) => dispatch(hideNoteForm(formKey, noteForm.getContent())),
            onShowForm: () => dispatch(openNoteForm(formKey, {})),
            onSubmitForm: (noteForm) => {
                const data = {
                    content: noteForm.getContent(),
                    user_id: user.id,
                    in_reply_to_id: parentNote.id,
                    parent_id: parentNote.parent_id,
                    parent_type: parentNote.parent_type,
                };
                dispatch(submitNoteForm(formKey, data));
            },
        };
    };
}

function replyStateToProps() {
    return (state, props) => {
        const forms = (
            state.screen.notes && state.screen.notes.forms || {}
        );
        const form = forms[`reply-${props.parentNote.id}`] || {};
        return {
            form: {
                content: form.content || '',
                pending: form.state === 'pending',
            },
            collapsed: form.state === undefined || form.state === 'hidden',
        };
    };
}

const ReplyForm = connect(
    replyStateToProps,
    replyDispatchToProps
)(_ReplyForm);


function newNoteStateToProps() {
    return (state, props) => {
        const forms = (
            state.screen.notes && state.screen.notes.forms || {}
        );
        const form = forms[`new-${props.entity.id}`] || {};
        const collapsed = !form.state || form.state === 'hidden';

        return {
            content: collapsed ? '' : form.content,
            pending: form.state === 'pending',
            collapsed,
        };
    };
}

function newNoteDispatchToProps() {
    return (dispatch, props) => {
        const formKey = `new-${props.entity.id}`;
        const { user, entity } = props;
        return {
            onExpand: () => dispatch(openNoteForm(formKey, {})),
            onClickOutside: (noteForm) => {
                if (!noteForm.props.collapsed) {
                    dispatch(hideNoteForm(formKey, noteForm.getContent()));
                }
            },
            onSubmit: (noteForm) => {
                const data = {
                    content: noteForm.getContent(),
                    user_id: user.id,
                    parent_id: entity.id,
                    parent_type: entity.type,
                };
                dispatch(submitNoteForm(formKey, data));
            },
        };
    };
}

const NewNoteForm = connect(
    newNoteStateToProps,
    newNoteDispatchToProps
)(NoteForm);

function NotesList({ items, entity, user }) {
    logger.debug('Rendering notes');

    if (entity === null) {
        return (
            <div>
                Empty
            </div>
        );
    }

    const notes = [];

    items.forEach(
        note => {
            const replies = (note.replies || []).map(
                reply => <EditableNote note={reply} key={reply.id} author={user} />
            );

            notes.push(
                <div className={style['parent-note-item']} key={note.id}>
                    <EditableNote note={note} author={user} />
                    <div className={style['parent-note-tail']} >
                        <div className={style.replies}>
                            {replies}
                        </div>
                        <ReplyForm parentNote={note} user={user} />
                    </div>
                </div>
            );
        }
    );

    return (
        <div className={style['note-list']}>
            <NewNoteForm entity={entity} user={user} />
            {notes}
        </div>
    );
}

NotesList.propTypes = {
    items: React.PropTypes.array.isRequired,
    entity: React.PropTypes.object,
    user: React.PropTypes.object,
};

const mapStateToProps = (state) => {
    const items = state.screen.notes && state.screen.notes.items || [];
    const entity = state.screen.notes && state.screen.notes.entity || null;
    return {
        items,
        entity,
        user: state.user,
    };
};

const NotesListView = connect(
    mapStateToProps,
    null
)(NotesList);

export default NotesListView;
