// :copyright: Copyright (c) 2016 ftrack

import loglevel from 'loglevel';
const logger = loglevel.getLogger('adobe:mediator');

import AbstractMediator from '../abstract_mediator';

/**
 * Adobe Mediator
 *
 * Provides adobe-specific logic by calling methods in
 * `ftrack-connect-spark-adobe` exposed on the `window` object.
 */
export class AdobeMediator extends AbstractMediator {


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
                    resolve(response);
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
}

const adobeMediator = new AdobeMediator();

export default adobeMediator;
