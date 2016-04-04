// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { Button } from 'react-toolbox';

import style from './style.scss';
import NoteForm from './form.js';

/** Display a reply button or a note form if *collapsed* is false.
*
* The *form* object is applied as properties to the the note form.
*
*/
function ReplyForm({ form, collapsed, onSubmitForm, onHideForm, onShowForm }) {
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

ReplyForm.propTypes = {
    parentNote: React.PropTypes.object,
    author: React.PropTypes.object,
    collapsed: React.PropTypes.bool,
    form: React.PropTypes.object,
    onShowForm: React.PropTypes.func,
    onHideForm: React.PropTypes.func,
    onSubmitForm: React.PropTypes.func,
};


export default ReplyForm;
