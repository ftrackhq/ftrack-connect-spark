// :copyright: Copyright (c) 2016 ftrack

import React from 'react';

import style from './style.scss';
import { session } from '../../ftrack_api';

import FontIcon from 'react-toolbox/lib/font_icon';

// Components file a file type in this list will be displayed using an img
// element.
const SUPPORTED_IMG_FILE_TYPES = [
    'png', 'gif', 'jpeg', 'jpg', 'bmp', 'tif', 'tiff',
];

/** Attachment area component to display an array of *components*. */
class AttachmentArea extends React.Component {

    isMedia(component) {
        return SUPPORTED_IMG_FILE_TYPES.includes(
            component.file_type.slice(1).toLowerCase()
        );   
    }

    getMediaComponents() {
        return this.props.components.filter(this.isMedia);
    }

    onAttachmentClick(component) {
        this.props.onAttachmentClick(this, component.id, this.isMedia(component))
    }

    render() {
        const { components } = this.props;

        const images = [];
        const other = [];

        components.forEach(
            component => {
                if (this.isMedia(component)) {
                    images.push(
                        <div
                            key={component.id}
                            onClick={
                                this.onAttachmentClick.bind(this, component)
                            }
                            className={style.image}
                            style={{
                                backgroundImage: `url('${session.thumbnail(component.id, 400)}')`
                            }}
                        />);
                } else {
                    other.push(
                        <p
                            key={component.id}
                        >
                            <FontIcon className={style['attachment-icon']} value="attachment" />
                            <span
                                className={style['file-name']}
                                onClick={
                                    this.onAttachmentClick.bind(this, component)
                                }
                            >
                                {`${component.name}${component.file_type}`}
                            </span>
                        </p>
                    );
                }
            }
        );

        return (
            <div className={style['attachments-area']}>
                <div className={style.images}>
                    {images}
                </div>
                <div className={style.other}>
                    {other}
                </div>
            </div>
        );
    }
}

AttachmentArea.propTypes = {
    components: React.PropTypes.array.isRequired,
    onAttachmentClick: React.PropTypes.func.isRequired,
};

export default AttachmentArea;
