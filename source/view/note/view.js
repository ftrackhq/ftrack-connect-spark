
import React from 'react';
import { connect } from 'react-redux';
import { Avatar, Button, Input, ProgressBar, IconMenu, MenuItem } from 'react-toolbox';
import loglevel from 'loglevel';
import TimeAgo from 'react-timeago';
import clickOutSide from 'react-click-outside';

import { session } from '../../ftrack_api';
import { openNoteForm, hideNoteForm, submitNoteForm } from 'action/note';

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
            collapsed: props.defaultCollapsed || false,
            content: props.defaultContent || undefined,
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

    expand() {
        this.setState({ collapsed: false });
        if (this.props.onExpand) {
            this.props.onExpand(this);
        }
    }

    render() {
        const content = this.state.content;
        const collapsed = this.state.collapsed;
        const expanded = this.state.expanded;
        const pending = this.props.pending;

        return (
            <div className={style['note-form']}>
                <Input
                    value={content} ref="content" label="Write a comment..."
                    disabled={pending}
                    name="content"
                    onChange={
                        (value) => this.setState({content: value})
                    }
                    onFocus={
                        () => {
                            {
                                if (this.state.collapsed) {
                                    this.expand();
                                }
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
                                <Button onClick={
                                        () => this.props.onSubmit(this)
                                    } label="Comment"
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
    state: React.PropTypes.string,
};

const NoteForm = clickOutSide(_NoteForm);

function NotesList({
    items, onNoteFormOpen, onNoteFormHide, onNoteFormSubmit,
    entity, forms = {}, user = {},
}) {

    if (entity === null) {
        return (
            <div >
                Empty
            </div>
        )
    }
    logger.debug('Rendering notes', items);
    const notes = [];

    const onSubmit = (formKey, parentNoteId, noteForm) => {
        onNoteFormSubmit(
            formKey, parentNoteId, entity.id, entity.type,
            user.id, noteForm.getContent()
        );
    };
    const onClick = (formKey) => onNoteFormOpen(formKey);

    const onNoteFormClickOutside = (formKey, noteForm) => {
        const content = noteForm.getContent();
        onNoteFormHide(formKey, content);
    };

    items.forEach(
        note => {
            const replies = (note.replies || []).map(
                reply => <Note data={reply} />
            );

            const formKey = `${note.id}-reply`;
            const activeNoteReply = forms[formKey];
            logger.debug('activeNoteReply', activeNoteReply);
            const pending = activeNoteReply && activeNoteReply.state === 'pending';

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
                                onClickOutside={onNoteFormClickOutside.bind(this, formKey)}
                                onSubmit={
                                    onSubmit.bind(this, formKey, note.id)
                                }
                                key={formKey}
                                pending={pending}
                            /> :
                            <Button
                                primary mini className={style['reply-button']}
                                label="Reply"
                                onClick={onClick.bind(this, formKey)}
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

    const formKey = `${entity.id}-new`;

    return (
        <div className={style['note-list']}>
            <NoteForm
                key={formKey}
                onSubmit={onSubmit.bind(this, formKey, undefined)}
                onExpand={onClick.bind(this, formKey)}
                defaultCollapsed
            />
            {notes}
        </div>
    );
}

NotesList.propTypes = {
    items: React.PropTypes.array.isRequired,
    forms: React.PropTypes.object,
    entity: React.PropTypes.object,
    onNoteFormOpen: React.PropTypes.func.isRequired,
    onNoteFormHide: React.PropTypes.func.isRequired,
    onNoteFormSubmit: React.PropTypes.func.isRequired,
    user: React.PropTypes.user,
};

const mapStateToProps = (state) => {
    const items = state.screen.notes && state.screen.notes.items || [];
    const forms = (
        state.screen.notes && state.screen.notes.forms || {}
    );
    const entity = state.screen.notes && state.screen.notes.entity || null;
    return {
        items,
        entity,
        forms,
        user: state.user,
    };
};

const mapDispatchToProps = (dispatch) => (
    {
        onNoteFormOpen: (...args) => dispatch(
            openNoteForm(...args)
        ),
        onNoteFormHide: (...args) => dispatch(
            hideNoteForm(...args)
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
