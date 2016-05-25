// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import Header from 'component/header';
import { Button, Menu, MenuItem } from 'react-toolbox';
import { hashHistory } from 'react-router';
import { connect } from 'react-redux';
import style from './style.scss';

/** Push new route on item selected. */
const navigateToMenu = (value) => {
    hashHistory.push(`/${value}`);
};

/**
 * Home header component with actions.
 */
class _HomeHeader extends React.Component {

    /** Instantiate home header. */
    constructor() {
        super();
        this._onShareClick = this._onShareClick.bind(this);
    }

    /** Show menu when share button is clicked */
    _onShareClick() {
        this.refs.menu.show();
    }

    /** Return share button */
    _getShareButton() {
        if (!this.props.publish && !this.props.quickReview) {
            return null;
        }

        const menuItems = [];
        if (this.props.quickReview) {
            menuItems.push(
                <MenuItem
                    key="quickReview"
                    value={`quick-review/${this.props.projectId || ''}`}
                    icon="play_circle_outline"
                    caption="Quick review"
                />
            );
        }
        if (this.props.publish) {
            menuItems.push(
                <MenuItem
                    key="publish"
                    value={`publish/${this.props.context}`}
                    icon="file_upload"
                    caption="Publish"
                />
            );
        }

        return (
            <div className={style.share}>
                <Button primary label="Share" onClick={this._onShareClick} />
                <Menu
                    ref="menu"
                    className={style.menu}
                    position="auto"
                    onSelect={navigateToMenu}
                    menuRipple
                >
                    {menuItems}
                </Menu>
            </div>
        );
    }

    /** Render component. */
    render() {
        return (
            <Header
                {...this.props}
                rightItems={this._getShareButton()}
                color="dark-200"
            />
        );
    }
}

_HomeHeader.propTypes = {
    publish: React.PropTypes.bool,
    quickReview: React.PropTypes.bool,
    context: React.PropTypes.string,
    projectId: React.PropTypes.string,
};

_HomeHeader.defaultProps = {
    publish: false,
    quickReview: false,
    context: null,
    projectId: null,
};

/** Map application configuration to props. */
function mapStateToProps(state) {
    return {
        publish: state.application.config.isPublishSupported,
        quickReview: state.application.config.isQuickReviewSupported,
    };
}

const HomeHeader = connect(mapStateToProps)(_HomeHeader);


export default HomeHeader;
