
import React from 'react';
import { IconButton, ProgressBar } from 'react-toolbox';

import style from './style';
import Header from 'component/header';

import Mousetrap from 'mousetrap';


class PreviewImage extends React.Component {

    constructor() {
        super()

        this.state = {};
        this.state.isLoaded = false;
    }

    componentWillReceiveProps(nextProps) {
        this.loadImage(nextProps.url);
    }

    componentWillMount() {
        this.loadImage(this.props.url);   
    }

    loadImage(url) {        
        this.setState({isLoaded: false});

        this.image = new window.Image();
        this.image.onload = () => {
            this.setState({isLoaded: true})
        };
        this.image.src = url;
    }

    render() {
        const { url } = this.props;
        const { isLoaded } = this.state;

        if (!isLoaded) {
            return <ProgressBar type="circular" mode="indeterminate" />;
        }

        return <img src={url} className={style['preview-image']}/>;
    }

}

PreviewImage.propTypes = {
    url: React.PropTypes.string.isRequired,
    name: React.PropTypes.string.isRequired,
    downloadUrl: React.PropTypes.string,
};


class PreviewMedia extends React.Component {

    componentWillMount() {
        Mousetrap.bind('esc', this.props.onDismiss);
        Mousetrap.bind(
            'left', () => this.handleChange(this.props.index - 1)
        );
        Mousetrap.bind(
            'right', () => this.handleChange(this.props.index + 1)
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

        this.props.onChange(adjustedIndex);
    }

    render() {
        const { children, visible, index, onDismiss, onDownload, onChange } = this.props;
        const closeButton = <IconButton icon="close" onClick={onDismiss} />;

        if (!visible) {
            return null;
        }

        const centerItems = (
            <h4 className={style['media-control']}>
                <span
                    className={style['control-button']}
                    onClick={this.handleChange.bind(this, index - 1)}
                >&#10094;</span>
                {`${index + 1} of ${children.length}`}
                <span
                    className={style['control-button']}
                    onClick={this.handleChange.bind(this, index + 1)}
                >&#10095;</span>
            </h4>
        );

        const child = children[index];

        return (
            <div
                className={style['preview-media']}
                onKeyDown={
                    (event) => {
                        debugger;
                    }
                }
            >
                <Header
                    className={style.header}
                    title={child.props.name}
                    rightButton={closeButton}
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
    index: React.PropTypes.number,
    visible: React.PropTypes.bool,
    onDismiss: React.PropTypes.func.isRequired,
    onDownload: React.PropTypes.func.isRequired,
    onChange: React.PropTypes.func.isRequired,
};

PreviewMedia.defaultProps = {
    children: [
        <PreviewImage url="https://i.ytimg.com/vi/tntOCGkgt98/maxresdefault.jpg" name="Cat1.png" />,
        <PreviewImage url="http://sites.psu.edu/siowfa15/wp-content/uploads/sites/29639/2015/10/cat.jpg" name="Cat2.jpg" />,
        <PreviewImage url="http://www.factslides.com/imgs/black-cat.jpg" name="Cat3 is here.jpg" />,
        <PreviewImage url="http://i.kinja-img.com/gawker-media/image/upload/s--gRG2YWja--/efg4piwisx1tcco4byit.png" name="Small.jpg" />
    ],
    index: 0,
    visible: true,
};

export default PreviewMedia;
