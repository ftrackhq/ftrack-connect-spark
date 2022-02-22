// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { ProgressBar } from 'react-toolbox';
import PropTypes from 'prop-types';

import style from './style';

/** An image component used as a child to a PreviewMedia component.
*
* The *url* prop is used as source for the image.
*/
export class PreviewImage extends React.Component {

    constructor() {
        super();

        this.state = {};
        this.state.isLoaded = false;
    }

    componentWillMount() {
        this.loadImage(this.props.url);
    }

    componentWillReceiveProps(nextProps) {
        this.loadImage(nextProps.url);
    }

    /** Load *url* in an off DOM image and set isLoaded when done. */
    loadImage(url) {
        this.setState({ isLoaded: false });

        this.image = new window.Image();
        this.image.onload = () => {
            this.setState({ isLoaded: true });
        };
        this.image.src = url;
    }

    render() {
        const { url } = this.props;
        const { isLoaded } = this.state;

        if (!isLoaded) {
            return (
                <div className={style.loading}>
                    <ProgressBar type="circular" mode="indeterminate" />
                </div>
            );
        }

        return (
            <div
                style={{
                    backgroundImage: `url('${url}')`,
                    maxWidth: this.image.width,
                    maxHeight: this.image.height,
                }}
                className={style['preview-image']}
            />
        );
    }

}

PreviewImage.propTypes = {
    url: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    downloadUrl: PropTypes.string,
};
