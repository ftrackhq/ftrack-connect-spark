// :copyright: Copyright (c) 2016 ftrack

import { loadComponents, resolveComponentPaths } from '../lib/import';
import publishLib from '../lib/publish';
const {
    createVersion, createComponents, uploadReviewMedia, updateComponentVersions,
} = publishLib;

import loglevel from 'loglevel';
const logger = loglevel.getLogger('main:mediator');

import AbstractMediator from '../abstract_mediator';

/** Return promise which is resolved after *ms* delay. */
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Return promise which is resolved with *result* after a random delay.
 *
 * *min* and *max* should be specified in milliseconds.
 */
export function delayedResponse(result, min = 200, max = 400) {
    const timeout = min + (max - min) * Math.random();
    const promise = new Promise((resolve) => {
        delay(timeout).then(resolve(result));
    });
    return promise;
}

/**
 * Main Mediator
 *
 * Used for development purposes only.
 */
export class MainMediator extends AbstractMediator {

    /** Return components to import for *options*. */
    getImportComponents(options) {
        logger.info('Getting import components for version', options);
        const components = loadComponents(options.versionId);
        const resolvedComponents = components.then(resolveComponentPaths);
        return resolvedComponents;
    }

    /** Import *component* and resolve on success. */
    importComponent(component) {
        logger.info('Importing component', component);
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // eslint-disable-next-line no-alert
                const value = window.prompt('Importing the component', component.path);

                if (value) {
                    resolve(value);
                } else {
                    reject(new Error('The import was aborted'));
                }
            }, 1000);
        });
    }

    exportMedia(options) {
        logger.info('[MainMediator]', 'Exporting media', options);
        const media = [];
        if (options.review) {
            media.push({
                use: 'review',
                name: 'image',
                path: '/Users/Shared/ftrack/media/image.jpg',
                extension: '.jpg',
                size: 10403354,
            });
        }
        if (options.delivery) {
            media.push({
                use: 'delivery',
                name: 'photoshop-document',
                path: '/Users/Shared/ftrack/media/image.psd',
                extension: '.psd',
                size: 20800042,
            });
        }
        return delayedResponse(media);
    }

    uploadMedia(options) {
        logger.info('[MainMediator]', 'Uploading media', options);
        return delayedResponse(true);
    }

    /** Return ftrack API credentials. */
    getCredentials() {
        let credentials = null;
        try {
            // eslint-disable-next-line global-require
            credentials = require('../../ftrack_api_credentials.json');
        } catch (error) {
            logger.error(error);
        }
        return credentials;
    }

    /** Download file from *url* or show a notification with *dispatch* if not supported. */
    downloadFileFromUrl(url) {
        window.location = url;
    }

    /**
     * Return if publish is supported by host application.
     * If true, application will show publish menu item and view.
     */
    isPublishSupported() { return true; }

    /**
     * Return if Quick review is supported by host application.
     * If true, application will show Quick review menu item and view.
     */
    isQuickReviewSupported() { return true; }

    /**
     * Return if file importing is supported by host application.
     * If true, application will show import buttons on versions.
     */
    isImportFileSupported() { return true; }

    getPublishOptions() {
        const items = [
            {
                label: 'Custom field',
                type: 'text',
                name: 'custom_field',
            },
            {
                label: 'Textarea field',
                type: 'textarea',
                name: 'custom_field_2',
            },
            {
                label: 'Number field',
                type: 'number',
                name: 'custom_field_3',
            },
            {
                label: 'Enumerator',
                type: 'enumerator',
                name: 'custom_field_4',
                data: [
                    {
                        label: 'Option 1',
                        value: 'opt1',
                    },
                    {
                        label: 'Option 2',
                        value: 'option_2',
                    },
                ],
            },
            {
                label: 'Include project file',
                type: 'boolean',
                name: 'custom_field_3',
                value: true,
            },
            {
                label: 'Source range',
                type: 'dropdown',
                name: 'source_range',
                help: 'Include an export of your sequence.',
                data: [
                    {
                        label: 'Do not export sequence',
                        value: 'none',
                    },
                    {
                        label: 'Entire sequence',
                        value: 'entire',
                    },
                    {
                        label: 'Sequence in/out',
                        value: 'sequence_in_out',
                    },
                    {
                        label: 'Work area',
                        value: 'work_area',
                    },
                ],
            },
        ];

        return delayedResponse({ name: 'testfile.txt', items });
    }
}

/** Export *MainMediator* instance. */
const mainMediator = new MainMediator();

/** Publish */
function* publish(values, callbacks) {
    yield callbacks.progress('Exporting media...');
    const media = yield this.exportMedia({
        review: true,
        delivery: true,
    });
    logger.info('Exported media', media);
    const reviewableMedia = media.filter((file) => file.use.includes('review'));
    const deliverableMedia = media.filter((file) => file.use === 'delivery');

    yield callbacks.progress('Uploading review media...');
    const componentIds = yield uploadReviewMedia(reviewableMedia);

    yield callbacks.progress('Creating version...');
    const versionId = yield createVersion(values, componentIds[0]);

    const componentVersions = componentIds.map((componentId) => ({ componentId, versionId }));
    yield updateComponentVersions(componentVersions);

    yield callbacks.progress('Publishing...');
    const reply = yield createComponents(versionId, deliverableMedia);
    logger.info('Finished publish', reply);
    yield true;
}
mainMediator.publish = publish;

export default mainMediator;
