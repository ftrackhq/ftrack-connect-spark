// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { connect } from 'react-redux';
import loglevel from 'loglevel';
import { ProgressBar } from 'react-toolbox';
import Waypoint from 'react-waypoint';

import {
    openNoteForm, hideNoteForm, submitNoteForm, removeNote, notesLoadNextPage,
} from 'action/note';

import { openPreviewMedia } from 'action/preview_media';

import { session } from '../../ftrack_api';

import components from 'component/note';

const { EditableNote, ReplyForm, NoteForm } = components;

import style from './style.scss';

const logger = loglevel.getLogger('view:note');

function editableNoteStateToProps() {
    return (state, props) => {
        const forms = (
            state.screen.notes && state.screen.notes.forms || {}
        );
        const form = forms[`edit-${props.note.id}`] || {};

        return {
            content: form.content || props.note.content,
            pending: form.state === 'pending',
            collapsed: form.state === undefined || form.state === 'hidden',
        };
    };
}

function editableNoteDispatchToProps() {
    return (dispatch, props) => {
        const formKey = `edit-${props.note.id}`;
        return {
            onShowForm: () => dispatch(openNoteForm(formKey, {})),
            onHideForm: (noteForm) => dispatch(hideNoteForm(formKey, noteForm.getContent())),
            onSubmitForm: (noteForm) => {
                const data = {
                    content: noteForm.getContent(),
                    id: props.note.id,
                };
                dispatch(submitNoteForm(formKey, data));
            },
            onRemove: () => dispatch(removeNote(props.note.id)),
            onAttachmentClick: (attachmentArea, componentId, isMedia) => {
                if (isMedia) {
                    const items = attachmentArea.getMediaComponents();
                    const index = items.findIndex(
                        (component) => component.id === componentId
                    );
                    dispatch(openPreviewMedia(Math.max(index, 0), items));
                } else {
                    window.location = session.getComponent(componentId);
                }
            },
        };
    };
}

const EditableNoteContainer = connect(
    editableNoteStateToProps,
    editableNoteDispatchToProps
)(EditableNote);

function replyDispatchToProps() {
    return (dispatch, props) => {
        const { author, parentNote } = props;
        const formKey = `reply-${parentNote.id}`;
        return {
            onHideForm: (noteForm) => dispatch(hideNoteForm(formKey, noteForm.getContent())),
            onShowForm: () => dispatch(openNoteForm(formKey, {})),
            onSubmitForm: (noteForm) => {
                const data = {
                    content: noteForm.getContent(),
                    user_id: author.id,
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
            content: form.content || '',
            pending: form.state === 'pending',
            collapsed: form.state === undefined || form.state === 'hidden',
        };
    };
}

const ReplyFormContainer = connect(
    replyStateToProps,
    replyDispatchToProps
)(ReplyForm);


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
        const { author, entity } = props;
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
                    user_id: author.id,
                    parent_id: entity.id,
                    parent_type: entity.type,
                };
                dispatch(submitNoteForm(formKey, data));
            },
        };
    };
}

const NewNoteFormContainer = connect(
    newNoteStateToProps,
    newNoteDispatchToProps
)(NoteForm);

/** List an array of note *items* with support for editing and creating notes.
*
* The *entity* is the currently loaded entity, e.g. a task or a version. This
* is used as parent when creating new notes.
*
* The *user* object is the active user and is used as author for any new notes.
*/
function NotesList({ items, entity, user, loading, nextOffset, onFetchMore }) {
    logger.debug('Rendering notes');

    if (entity === null) {
        // TODO: Implement a proper empty state.
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
                reply => <EditableNoteContainer note={reply} key={reply.id} author={user} />
            );

            notes.push(
                <div className={style['parent-note-item']} key={note.id}>
                    <EditableNoteContainer note={note} author={user} />
                    <div className={style['parent-note-tail']} >
                        {
                            replies.length ?
                            (
                                <div className={style.replies}>
                                    {replies}
                                </div>
                            )
                            : ''
                        }
                        <ReplyFormContainer parentNote={note} author={user} />
                    </div>
                </div>
            );
        }
    );

    const content = [
        <NewNoteFormContainer
            key="new-note-form"
            className={style['new-note-form']}
            entity={entity}
            author={user}
        />,
        <div key="note-list-inner" className={style['note-list-inner']}>
            {notes}
        </div>,
    ];

    if (loading) {
        content.push(
            <div key="loading" className={style.loading}>
                <ProgressBar type="circular" mode="indeterminate" />
            </div>
        );
    }

    if (loading === false && nextOffset !== null && items.length) {
        // Only add way point if not loading, there are items already loaded
        // and there are more pages to load.
        notes.push(
            <Waypoint
                onEnter={
                    () => onFetchMore(entity, nextOffset)
                }
            />
        );
    }

    return (
        <div className={style['note-list']}>
            {content}
        </div>
    );
}

NotesList.propTypes = {
    items: React.PropTypes.array.isRequired,
    entity: React.PropTypes.object,
    user: React.PropTypes.object,
    loading: React.PropTypes.bool,
    nextOffset: React.PropTypes.number,
    onFetchMore: React.PropTypes.func,
};

const mapStateToProps = (state) => {
    const items = state.screen.notes && state.screen.notes.items || [];
    const entity = state.screen.notes && state.screen.notes.entity || null;
    const loading = state.screen.notes && state.screen.notes.loading || false;
    const nextOffset = state.screen.notes && state.screen.notes.nextOffset;

    return {
        items,
        nextOffset,
        entity,
        loading,
        user: state.user,
    };
};

const mapDispatchToProps = (dispatch) => ({
    onFetchMore: (entity, nextOffset) => {
        dispatch(notesLoadNextPage(entity.id, entity.type, nextOffset));
    },
});

const NotesListView = connect(
    mapStateToProps,
    mapDispatchToProps
)(NotesList);

export default NotesListView;
