// :copyright: Copyright (c) 2016 ftrack

import React from 'react';

import style from './style.scss';
import { session } from '../../ftrack_api';

import FontIcon from 'react-toolbox/lib/font_icon';

// Components file a file type in this list will be displayed using an img
// element.
const SUPPORTED_IMG_FILE_TYPES = [
    'png', 'gif', 'jpeg', 'jpg', 'bmp',
];

/** Attachment area component to display an array of *components*.
*
* *onAttachmentClick* prop is called when an attachment media or document is
* clicked.
*
*/
class AttachmentArea extends React.Component {

    /** Handle click on attachment *component*. */
    onAttachmentClick(component) {
        this.props.onAttachmentClick(this, component.id, this.isMedia(component));
    }

    /** Return a list of components that are assumed to contain media. */
    getMediaComponents() {
        return this.props.components.filter(this.isMedia);
    }

    /** Return true if *component* is assumed to be consumable media. */
    isMedia(component) {
        return SUPPORTED_IMG_FILE_TYPES.includes(
            component.file_type.slice(1).toLowerCase()
        );
    }

    render() {
        const { components } = this.props;

        const images = [];
        const other = [];

        components.forEach(
            component => {
                if (this.isMedia(component)) {
                    const thumbnailUrl = session.thumbnailUrl(component.id, 400);
                    images.push(
                        <div
                            key={component.id}
                            onClick={
                                () => this.onAttachmentClick(component)
                            }
                            className={style.image}
                            style={{ backgroundImage: `url('${thumbnailUrl}')` }}
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
                                    () => this.onAttachmentClick(component)
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
