
import React from 'react';
import { IconButton } from 'react-toolbox';

import style from './style';
import Header from 'component/header';

import Mousetrap from 'mousetrap';

export class PreviewMedia extends React.Component {

    constructor(props) {
        super();
        this.state = {
            index: props.defaultIndex,
        };
    }

    componentWillMount() {
        Mousetrap.bind('esc', this.props.onDismiss);
        Mousetrap.bind(
            'left', () => this.handleChange(this.state.index - 1)
        );
        Mousetrap.bind(
            'right', () => this.handleChange(this.state.index + 1)
        );
    }

    componentWillUnmount() {
        Mousetrap.unbind('esc');
        Mousetrap.unbind('left');
        Mousetrap.unbind('right');
    }

    handleChange(index) {
        let adjustedIndex = index;

        if (adjustedIndex < 0) {
            adjustedIndex = this.props.children.length - 1;
        }

        if (adjustedIndex > this.props.children.length - 1) {
            adjustedIndex = 0;
        }

        this.setState({ index: adjustedIndex });
    }

    render() {
        const { children, onDismiss, onDownload } = this.props;
        const { index } = this.state;
        const closeButton = <IconButton icon="close" onClick={onDismiss} />;
        const downloadButton = (
            <IconButton
                icon="file_download"
                label="Download"
                onClick={
                    () => {
                        const child = children[this.state.index];
                        onDownload(child.props.downloadUrl);
                    }
                }
            />
        );

        let centerItems = (
            <div className={style['media-control']}>
                <span
                    className={style['control-button']}
                    onClick={
                        () => this.handleChange(index - 1)
                    }
                >&#10094;</span>
                {`${index + 1} of ${children.length}`}
                <span
                    className={style['control-button']}
                    onClick={
                        () => this.handleChange(index + 1)
                    }
                >&#10095;</span>
            </div>
        );

        let child = children[index];
        if (!child) {
            child = <div>No media to show...</div>;
            centerItems = '';
        }

        return (
            <div className={style['preview-media']}>
                <Header
                    className={style.header}
                    title={child.props.name}
                    rightItems={[downloadButton, closeButton]}
                    centerItems={centerItems}
                />
                <div className={style.body}>
                    {child}
                </div>
            </div>
        );
    }
}

PreviewMedia.propTypes = {
    children: React.PropTypes.arrayOf(Image),
    defaultIndex: React.PropTypes.number,
    onDismiss: React.PropTypes.func.isRequired,
    onDownload: React.PropTypes.func.isRequired,
};

PreviewMedia.defaultProps = {
    children: [],
    defaultIndex: 0,
};
