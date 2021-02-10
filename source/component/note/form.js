// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import ReactDOM from 'react-dom';
import { Input, ProgressBar, Button } from 'react-toolbox';
import clickOutSide from 'react-click-outside';
import PropTypes from 'prop-types';

import style from './style.scss';

/** Note form use to create or edit a note. */
class _NoteForm extends React.Component {

    constructor(props) {
        super(props);
        this.multiline = true;
        this.state = {
            content: props.content || undefined,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.refs.content && nextProps.autoFocus && !this.props.autoFocus) {
            const element = this.multiline ? 'textarea' : 'input';
            ReactDOM.findDOMNode(this).querySelector(element).focus();
        }
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
        const { collapsed, pending, edit, autoFocus } = this.props;
        const _classNames = [style['note-form']];

        if (this.props.className) {
            _classNames.push(this.props.className);
        }

        if (!collapsed) {
            _classNames.push(style.expanded);
        }

        return (
            <div className={_classNames.join(' ')}>
                <Input
                    value={content}
                    label={
                        edit ?
                        'Update your note...' : 'Write a comment...'
                    }
                    disabled={pending}
                    name="content"
                    multiline={this.multiline}
                    onChange={
                        (value) => this.setState({ content: value })
                    }
                    autoFocus={autoFocus === true}
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
                            {pending ? (
                                <div className={style.progressbar}>
                                    <ProgressBar
                                        type="circular"
                                        mode="indeterminate"
                                    />
                                </div>
                            ) : (
                                <Button
                                    onClick={
                                        () => this.props.onSubmit(this)
                                    }
                                    label={
                                        edit ? 'Update' : 'Comment'
                                    }
                                    accent
                                />
                            )}
                        </div>
                    )
                }
            </div>
        );
    }
}

_NoteForm.propTypes = {
    content: PropTypes.string,
    className: PropTypes.string,
    onClickOutside: PropTypes.func,
    onSubmit: PropTypes.func,
    onExpand: PropTypes.func,
    state: PropTypes.string,
    edit: PropTypes.bool,
    collapsed: PropTypes.bool,
    pending: PropTypes.bool,
    autoFocus: PropTypes.bool,
    author: PropTypes.object,
};

const NoteForm = clickOutSide(_NoteForm);


export default NoteForm;
