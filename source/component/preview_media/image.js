
import React from 'react';
import { ProgressBar } from 'react-toolbox';

import style from './style';

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
    url: React.PropTypes.string.isRequired,
    name: React.PropTypes.string.isRequired,
    downloadUrl: React.PropTypes.string,
};
