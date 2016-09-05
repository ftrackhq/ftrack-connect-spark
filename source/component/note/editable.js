// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { IconMenu, MenuItem } from 'react-toolbox/lib/menu';
import Dialog from 'react-toolbox/lib/dialog';

import Note from './note.js';
import NoteForm from './form.js';
import style from './style.scss';

/** Editable note component that displays either a note or a note form.
*
* Options to edit or delete are displayed if the *note* author is matching the
* *author*.
*
* Display the note form if *collpased* is false. The *pending* and *content*
* props are passed ot the note form.
*
*/
class EditableNote extends React.Component {

    constructor() {
        super();

        this.state = {
            confirmRemove: false,
        };
    }

    /** Handle dialog interaction and remove note if *remove* is true. */
    handleDialog(remove) {
        if (remove === true) {
            this.props.onRemove();
        }

        this.setState({ confirmRemove: false });
    }

    render() {
        const {
            note, collapsed, pending, content, author, onShowForm, onHideForm,
            onSubmitForm, onAttachmentClick,
        } = this.props;

        const actions = [
            // eslint-disable-next-line react/jsx-no-bind
            { label: 'Cancel', onClick: this.handleDialog.bind(this, false) },
             // eslint-disable-next-line react/jsx-no-bind
            { label: 'Remove', onClick: this.handleDialog.bind(this, true) },
        ];

        if (!collapsed) {
            return (
                <NoteForm
                    pending={pending}
                    content={content}
                    onClickOutside={onHideForm}
                    onSubmit={onSubmitForm}
                    autoFocus
                    edit
                />
            );
        }

        let menu = false;

        if (author && note.author && author.id === note.author.id) {
            menu = (
                <IconMenu icon="more_vert" menuRipple>
                    <MenuItem
                        value="edit"
                        icon="edit"
                        caption="Edit"
                        onClick={onShowForm}
                    />
                    <MenuItem
                        value="delete"
                        icon="delete"
                        caption="Remove"
                        onClick={
                            () => this.setState({ confirmRemove: true })
                        }
                    />
                </IconMenu>
            );
        }

        let confirmationDialog = false;
        if (this.state.confirmRemove) {
            confirmationDialog = (
                <Dialog
                    title="Are you sure want to remove the note?"
                    actions={actions}
                    onEscKeyDown={() => this.handleDialog(false)}
                    active
                />
            );
        }

        return (
            <div className={style['editable-note-container']}>
                {confirmationDialog}
                <Note
                    data={note}
                    key={note.id}
                    category
                    onAttachmentClick={onAttachmentClick}
                />
                <div className={style['icon-menu']}>
                    {menu}
                </div>
            </div>
        );
    }
}

EditableNote.propTypes = {
    note: React.PropTypes.object,
    collapsed: React.PropTypes.bool,
    content: React.PropTypes.string,
    pending: React.PropTypes.bool,
    onShowForm: React.PropTypes.func,
    onHideForm: React.PropTypes.func,
    onSubmitForm: React.PropTypes.func,
    onRemove: React.PropTypes.func,
    onAttachmentClick: React.PropTypes.func,
    author: React.PropTypes.object,
};

export default EditableNote;
