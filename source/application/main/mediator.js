// :copyright: Copyright (c) 2016 ftrack
import { session } from '../../ftrack_api';
import Event from '../../ftrack_api/event';

import loglevel from 'loglevel';
const logger = loglevel.getLogger('main:mediator');

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
export class MainMediator {

    /** Return components to import for *options*. */
    getImportComponents(options) {
        logger.info('Getting import components for version', options);
        const components = this._loadComponents(options.versionId);
        const resolvedComponents = components.then(this._resolveComponentPaths);
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

    /** Resolve component paths via events. */
    _resolveComponentPaths(components) {
        const resolveEventPromises = components.map((component) => {
            const event = new Event(
                'ftrack.location.request-resolve',
                { componentId: component.id, locationName: null, platform: 'Linux' }
            );
            const reply = session.eventHub.publish(
                event, { reply: true, timeout: 10 }
            );

            const item = reply.then(
                (responseEvent) => {
                    // Disable components resolved to ftrack.server
                    const path = responseEvent.data.path;
                    let isDisabled = false;
                    if (!path || path.startsWith('http')) {
                        isDisabled = true;
                    }

                    return Promise.resolve({
                        caption: `${component.name}${component.file_type || ''}`,
                        disabled: isDisabled,
                        icon: null,
                        data: Object.assign({}, component, responseEvent.data),
                    });
                },
                () => Promise.resolve({
                    caption: `${component.name}${component.file_type || ''} (failed to resolve)`,
                    disabled: true,
                    icon: null,
                    data: Object.assign({}, component),
                })
            );
            return item;
        });
        return Promise.all(resolveEventPromises);
    }

    /** Load components for *versionId*. */
    _loadComponents(versionId) {
        const select = [
            'id',
            'system_type',
            'name',
            'size',
            'file_type',
            'container_id',
            'version_id',
            'version.asset_id',
        ];
        const queryString = (
            `select ${select.join(', ')} from Component where ` +
            `version_id is ${versionId} order by name, file_type, id`
        );

        const request = session._query(queryString);
        const components = request.then(
            (response) => Promise.resolve(
                response.data.map(component => component)
            )
        );

        return components;
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
            credentials = require('../../ftrack_api_credentials.json');
        } catch (error) {
            logger.error(error);
        }
        return credentials;
    }

}

/** Export *MainMediator* instance. */
const mainMediator = new MainMediator();
export default mainMediator;
