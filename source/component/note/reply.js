// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { Button } from 'react-toolbox';

import style from './style.scss';
import NoteForm from './form.js';

/** Display a reply button or a note form if *collapsed* is false.
*
* The *pending* and *content* props are passed to the note form.
*
*/
function ReplyForm({ content, pending, collapsed, onSubmitForm, onHideForm, onShowForm }) {
    if (!collapsed) {
        return (
            <NoteForm
                content={content}
                pending={pending}
                onClickOutside={onHideForm}
                onSubmit={onSubmitForm}
                autoFocus
            />
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
    content: React.PropTypes.string,
    pending: React.PropTypes.bool,
    onShowForm: React.PropTypes.func,
    onHideForm: React.PropTypes.func,
    onSubmitForm: React.PropTypes.func,
};


export default ReplyForm;
