// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { connect } from 'react-redux';

import Input from 'react-toolbox/lib/input';
import DatePicker from 'react-toolbox/lib/date_picker';
import Button from 'react-toolbox/lib/button';

import ProjectSelector from 'container/project_selector';
import Reveal from 'component/reveal';
import { quickReviewSubmit } from 'action/quick_review';
import style from './style.scss';

/** Quick Review Preview (Placeholder element) */
function QuickReviewPreview() {
    return (
        <div className={style.preview}>[Preview]</div>
    );
}

/** Quick review view */
class QuickReviewView extends React.Component {
    constructor() {
        super();
        this.state = {
            values: {
                name: '',
                collaborators: '',
                description: '',
                expiryDate: undefined,
            },
        };
        this._onFieldChange = this._onFieldChange.bind(this);
        this._onCancelClick = this._onCancelClick.bind(this);
        this._onSubmit = this._onSubmit.bind(this);
    }

    /** Update internal state when field is changed. */
    _onFieldChange(name) {
        return (value) => {
            console.info('field changed', name, value); // eslint-disable-line no-console
            const nextState = {
                values: Object.assign(
                    {}, this.state.values, { [name]: value }
                ),
            };
            this.setState(nextState);
        };
    }

    /** Navigate back on cancel clicked */
    _onCancelClick(e) {
        e.preventDefault();
        this.context.router.goBack();
    }

    /** Call onSubmit prop on form submission. */
    _onSubmit(e) {
        e.preventDefault();
        this.props.onSubmit(this.state.values);
    }

    render() {
        return (
            <form
                className={style['quick-review']}
                onSubmit={this._onSubmit}
            >
                <h2>Share a quick review</h2>
                <QuickReviewPreview />
                <ProjectSelector
                    onChange={this._onFieldChange('project')}
                    projects={this.props.projects}
                />
                <Input
                    type="text"
                    label="Review session name"
                    name="name"
                    value={this.state.values.name}
                    onChange={this._onFieldChange('name')}
                />
                <Input
                    type="text"
                    label="Invite collaborators"
                    name="collaborators"
                    value={this.state.values.collaborators}
                    onChange={this._onFieldChange('collaborators')}
                />
                <Reveal label="Add description" className={style['align-left']}>
                    <Input
                        type="text"
                        label="Description"
                        name="description"
                        value={this.state.values.description}
                        onChange={this._onFieldChange('description')}
                        autoFocus
                    />
                </Reveal>
                <Reveal label="Add expiry" className={style['align-left']}>
                    <DatePicker
                        label="Expiry date"
                        value={this.state.values.expiryDate}
                        onChange={this._onFieldChange('expiryDate')}
                    />
                </Reveal>
                <div className={style.actions}>
                    <Button
                        label="Cancel"
                        onClick={this._onCancelClick}
                    />
                    <Button
                        label="Share"
                        raised
                        primary
                    />
                </div>
            </form>
        );
    }
}

QuickReviewView.contextTypes = {
    router: React.PropTypes.object.isRequired,
};

QuickReviewView.propTypes = {
    onSubmit: React.PropTypes.func,
    projects: React.PropTypes.object,
};

function mapDispatchToProps(dispatch) {
    return {
        onSubmit(values) {
            dispatch(quickReviewSubmit(values));
        },
    };
}

QuickReviewView = connect(
    null,
    mapDispatchToProps
)(QuickReviewView);


export default QuickReviewView;
