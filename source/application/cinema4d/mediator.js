// :copyright: Copyright (c) 2016 ftrack

import loglevel from 'loglevel';
const logger = loglevel.getLogger('cinema4d:mediator');

import { session } from '../../ftrack_api';
import Event from '../../ftrack_api/event';

import AbstractMediator from '../abstract_mediator';

/**
 * Cinema 4D Mediator
 *
 * Provides cinema-4d-specific logic by calling methods in
 * `ftrack-connect-cinema-4d` via events.
 */
export class Cinema4dMediator extends AbstractMediator {
    constructor() {
        super();
        this._options = {};

        try {
            this._options = this._loadOptions();
            logger.info('Loaded application options', this._options);
        } catch (err) {
            logger.error(err);
        }
    }

    /** Load encoded options in query parameters. */
    _loadOptions() {
        const encodedValue = window.location.search.split('=')[1];
        const decodedValue = JSON.parse(window.atob(encodedValue));
        return decodedValue;
    }

    /** Return event target string. */
    _getTarget() {
        const c4dSubscriptionId = this._options.subscription_id || null;
        return c4dSubscriptionId ? `id=${c4dSubscriptionId}` : '';
    }

    /**
     * Send RPC event executing *method* in `ftrack-connect-cinema-4d`.
     *
     * *data* should be an object of event data.
     *
     * Returns promise which will be resolved with event reply.
     */
    _rpcEvent(method, data = {}) {
        const event = new Event(
            `ftrack.connect-cinema-4d.${method}`,
            data,
            { target: this._getTarget() }
        );

        let promise = session.eventHub.publish(event, { reply: true });
        promise = promise.then((reply) => {
            const response = reply.data;
            if (response.exception) {
                return Promise.reject(
                    new Error(`${response.exception}: ${response.content}`)
                );
            }
            return Promise.resolve(response.output || null);
        });
        return promise;
    }

    /** Return credentials */
    getCredentials() {
        return {
            serverUrl: this._options.server_url,
            apiUser: this._options.api_user,
            apiKey: this._options.api_key,
        };
    }

    /** Return publish options */
    getPublishOptions(options) {
        logger.info('Get publish options', options);
        return this._rpcEvent('get_publish_options', options);
    }

    /** Exported media and resolve with array of files. */
    exportMedia(options) {
        logger.info('Export media', options);
        return this._rpcEvent('export_media', options);
    }

    /** Upload media. */
    uploadMedia(options) {
        logger.info('Upload media', options);
        return this._rpcEvent('upload_media', options);
    }

    getImportComponents(options) {
        logger.info('Get import components', options);
        return this._rpcEvent('get_import_components', options);
    }

    importComponent(options) {
        logger.info('Import component', options);
        return this._rpcEvent('import_component', options);
    }
}

const cinema4dMediator = new Cinema4dMediator();
export default cinema4dMediator;
