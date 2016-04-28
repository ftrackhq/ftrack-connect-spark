// :copyright: Copyright (c) 2016 ftrack
import { loadComponents, resolveComponentPaths } from '../lib/import';

import { notificationInfo } from 'action/notification';

import loglevel from 'loglevel';
const logger = loglevel.getLogger('adobe:mediator');

import AbstractMediator from '../abstract_mediator';

/**
 * Host Application support
 */
// eslint-disable-next-line no-unused-vars
const APPLICATION_IDS = {
    PHSP: 'Photoshop',
    PHXS: 'Photoshop Extended',
    IDSN: 'InDesign',
    AICY: 'InCopy',
    ILST: 'Illustrator',
    PPRO: 'Premiere Pro',
    PRLD: 'Prelude',
    AEFT: 'After Effects',
    FLPR: 'Flash Pro',
    AUDT: 'Audition',
    DRWV: 'Dreamweaver',
};
const PUBLISH_SUPPORTED_APP_IDS = ['PHSP', 'PHXS'];
const QUICK_REVIEW_SUPPORTED_APP_IDS = ['PHSP', 'PHXS', 'PPRO'];
const IMPORT_FILE_SUPPORTED_APP_IDS = ['PHSP', 'PHXS', 'PPRO', 'AEFT'];

/**
 * Adobe Mediator
 *
 * Provides adobe-specific logic by calling methods in
 * `ftrack-connect-spark-adobe` exposed on the `window` object.
 */
export class AdobeMediator extends AbstractMediator {

    /** Return components to import for *options*. */
    getImportComponents(options) {
        logger.info('Getting import components for version', options);
        const components = loadComponents(options.versionId);
        const resolvedComponents = components.then(resolveComponentPaths);
        return resolvedComponents;
    }

    /** Import *component* and resolve on success. */
    importComponent(component) {
        const _import = window.top.FT.import;
        const path = component.path;
        const meta = {
            component_id: component.id,
            version_id: component.version_id,
            asset_id: component.version.asset_id,
        };
        logger.info('Importing component', component);
        const promise = new Promise((resolve, reject) => {
            logger.info('Running promise', path, meta);
            _import.openDocument(path, meta, (error, response) => {
                logger.info('Open document', error, response);
                if (error) {
                    reject(error);
                } else {
                    resolve(response);
                }
            });
        });

        return promise;
    }

    /** Get publish options */
    getPublishOptions(options) {
        const exporter = window.top.FT.exporter;
        logger.info('Get publish options', options);

        const promise = new Promise((resolve, reject) => {
            exporter.getPublishOptions(options, (error, response) => {
                logger.info('Publish options', error, response);
                if (error) {
                    reject(error);
                } else {
                    resolve(response);
                }
            });
        });

        return promise;
    }

    /**
     * Export reviewable media.
     *
     * Return promise which is resolved with array of exported media objects,
     * in the following format: [{ path, name, extension, size }]
     *
     */
    exportMedia(options) {
        const exporter = window.top.FT.exporter;
        logger.info('Exporting media', options);

        const promise = new Promise((resolve, reject) => {
            exporter.exportMedia(options, (error, response) => {
                logger.info('Exported media', error, response);
                if (error) {
                    reject(error);
                } else {
                    // Recreate response since it may be an old Array prototype.
                    resolve([...response]);
                }
            });
        });

        return promise;
    }

    /**
     * Upload media
     *
     * Uploads *path* to *url* with specified *headers*.
     * Return promise which is resolved when upload is complete.
     */
    uploadMedia({ path, url, headers }) {
        const uploader = window.top.FT.uploader;
        logger.info('Uploading media');

        const promise = new Promise((resolve, reject) => {
            uploader.uploadFile(path, url, headers, (error, response) => {
                logger.info('Uploaded media', error, response);
                if (error) {
                    reject(error);
                } else {
                    resolve(response);
                }
            });
        });

        return promise;
    }

    /** Return ftrack API credentials. */
    getCredentials() {
        const util = window.top.FT.util;
        logger.info('Reading credentials from adobe mediator.');

        const promise = new Promise((resolve, reject) => {
            util.getCredentials((error, credentials) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(credentials);
                }
            });
        });

        return promise;
    }

    /** Download file from *url* or show a notification with *dispatch* if not supported. */
    downloadFileFromUrl(url, dispatch) {
        dispatch(
            notificationInfo(
                'Go to the ftrack web application to download this file'
            )
        );
    }

    /** Return host application environment. */
    getHostEnvironment() {
        if (!this._hostEnvironment) {
            const main = window.top.FT.main;
            this._hostEnvironment = Object.assign({}, main.getHostEnvironment());
        }
        return this._hostEnvironment;
    }

    /** Return application id */
    getAppId() {
        return this.getHostEnvironment().appId;
    }

    /**
     * Return if publish is supported by host application.
     */
    isPublishSupported() {
        return PUBLISH_SUPPORTED_APP_IDS.includes(this.getAppId());
    }

    /**
     * Return if Quick review is supported by host application.
     */
    isQuickReviewSupported() {
        return QUICK_REVIEW_SUPPORTED_APP_IDS.includes(this.getAppId());
    }

    /**
     * Return if file importing is supported by host application.
     */
    isImportFileSupported() {
        return IMPORT_FILE_SUPPORTED_APP_IDS.includes(this.getAppId());
    }
}

const adobeMediator = new AdobeMediator();

export default adobeMediator;
