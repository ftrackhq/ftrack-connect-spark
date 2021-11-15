// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { Button } from 'react-toolbox';
import PropTypes from 'prop-types';

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
        <Button
            label="Reply"
            className={style['reply-button']}
            mini
            onClick={onShowForm}
        />
    );
}

ReplyForm.propTypes = {
    parentNote: PropTypes.object,
    author: PropTypes.object,
    collapsed: PropTypes.bool,
    content: PropTypes.string,
    pending: PropTypes.bool,
    onShowForm: PropTypes.func,
    onHideForm: PropTypes.func,
    onSubmitForm: PropTypes.func,
};


export default ReplyForm;
