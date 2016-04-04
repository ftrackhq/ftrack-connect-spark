// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { Button } from 'react-toolbox';

import style from './style.scss';
import NoteForm from './form.js';


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
    user: React.PropTypes.object,
    collapsed: React.PropTypes.bool,
    form: React.PropTypes.object,
    onShowForm: React.PropTypes.func,
    onHideForm: React.PropTypes.func,
    onSubmitForm: React.PropTypes.func,
};


export default ReplyForm;
