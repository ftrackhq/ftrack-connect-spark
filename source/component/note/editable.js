// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { IconMenu, MenuItem } from 'react-toolbox';

import Note from './note.js';
import NoteForm from './form.js';
import style from './style.scss';

import loglevel from 'loglevel';

const logger = loglevel.getLogger('note:editable');

/** Editable note component that displays either a note or a note form.
*
* Options to edit or delete are displayed if the *note* author is matching the
* *author*.
*
* Display the note form if *collpased* is false. The *form* object will be
* applied as properties to the underflying form.
*
*/
function EditableNote(
    { note, collapsed, pending, content, author, onShowForm, onHideForm, onSubmitForm, onRemove }
) {
    logger.debug('Render editable note');
    if (!collapsed) {
        return (
            <NoteForm
                pending={pending}
                content={content}
                onClickOutside={onHideForm}
                onSubmit={onSubmitForm}
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
            </IconMenu>,
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

EditableNote.propTypes = {
    note: React.PropTypes.object,
    collapsed: React.PropTypes.bool,
    content: React.PropTypes.string,
    pending: React.PropTypes.bool,
    onShowForm: React.PropTypes.func,
    onHideForm: React.PropTypes.func,
    onSubmitForm: React.PropTypes.func,
    onRemove: React.PropTypes.func,
    author: React.PropTypes.object,
};

export default EditableNote;
