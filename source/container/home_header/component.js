// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { Button, MenuItem } from 'react-toolbox';
import { hashHistory } from 'react-router';
import { connect } from 'react-redux';

import Header from 'component/header';
import ButtonMenu from 'component/button_menu';

import style from './style.scss';

/** Push new route on item selected. */
const navigateToMenu = (value) => {
    hashHistory.push(`/${value}`);
};

/**
 * Home header component with actions.
 */
function _HomeHeader(props) {
    const menuItems = [];
    if (props.quickReview) {
        menuItems.push(
            <MenuItem
                key="quickReview"
                value={`quick-review/${props.projectId || ''}`}
                icon="play_circle_outline"
                caption="Quick review"
            />
        );
    }
    if (props.publish) {
        menuItems.push(
            <MenuItem
                key="publish"
                value={`publish/${props.context}`}
                icon="file_upload"
                caption="Publish"
            />
        );
    }

    let shareButton = null;
    if (menuItems.length) {
        shareButton = (
            <ButtonMenu
                className={style.share}
                position="topRight"
                button={
                    <Button primary label="Share" />
                }
                onSelect={navigateToMenu}
            >
                    {menuItems}
            </ButtonMenu>
        );
    }

    return (
        <Header
            {...props}
            rightItems={shareButton}
            color="dark-200"
        />
    );
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
