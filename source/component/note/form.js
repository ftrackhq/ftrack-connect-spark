// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { Input, ProgressBar, Button } from 'react-toolbox';
import clickOutSide from 'react-click-outside';

import style from './style.scss';

/** Note form use to create or edit a note. */
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
        const _classNames = [style['note-form']];

        if (this.props.className) {
            _classNames.push(this.props.className);
        }

        return (
            <div className={_classNames.join(' ')}>
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
    className: React.PropTypes.string,
    onClickOutside: React.PropTypes.func,
    onSubmit: React.PropTypes.func,
    onExpand: React.PropTypes.func,
    state: React.PropTypes.string,
    edit: React.PropTypes.bool,
    collapsed: React.PropTypes.bool,
    pending: React.PropTypes.bool,
    author: React.PropTypes.object,
};

const NoteForm = clickOutSide(_NoteForm);


export default NoteForm;
