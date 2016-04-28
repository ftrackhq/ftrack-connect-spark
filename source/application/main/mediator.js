// :copyright: Copyright (c) 2016 ftrack

import { loadComponents, resolveComponentPaths } from '../lib/import';

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
export function delayedResponse(result, min = 500, max = 750) {
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

    /** Return publish options */
    getPublishOptions() {
        logger.info('[MainMediator]', 'Get publish options');
        return delayedResponse({
            name: 'image',
        });
    }

    exportMedia(options) {
        logger.info('[MainMediator]', 'Exporting media', options);
        const media = [];
        if (options.reviewable) {
            media.push({
                use: 'review',
                name: 'image',
                path: '/Users/Shared/ftrack/media/image.jpg',
                extension: '.jpg',
                size: 10403354,
            });
        }
        if (options.deliverable) {
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
}

/** Export *MainMediator* instance. */
const mainMediator = new MainMediator();
export default mainMediator;
