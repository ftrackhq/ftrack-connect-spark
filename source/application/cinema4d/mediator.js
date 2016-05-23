// :copyright: Copyright (c) 2016 ftrack

import loglevel from 'loglevel';
const logger = loglevel.getLogger('cinema4d:mediator');

import { session } from '../../ftrack_api';
import Event from '../../ftrack_api/event';
import { showProgress } from '../lib/share';

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

    /**
     * Return if publish is supported by host application.
     * If true, application will show publish menu item and view.
     */
    isPublishSupported() { return true; }

    /**
     * Return if Quick review is supported by host application.
     * If true, application will show Quick review menu item and view.
     */
    isQuickReviewSupported() { return false; }

    /**
     * Return if file importing is supported by host application.
     * If true, application will show import buttons on versions.
     */
    isImportFileSupported() { return false; }

    /**
     * Publish media to ftrack based on form *values*.
     * Return promise resolved once publish has completed.
     */
    publish(values) {
        const message = (
            'This may take up to a few minutes, please keep this window open until finished.'
        );
        showProgress({ header: 'Publishing...', message });

        const promise = this._rpcEvent(
            'publish_media', values
        ).then((reply) => {
            logger.info('Finished publish', reply);
            return Promise.resolve(reply);
        });

        return promise;
    }

    /** Return identifier. */
    getIdentifier() {
        return 'spark-cinema4d';
    }

    /** Return host version. */
    getHostVersion() {
        return this._options.host_version || 'undefined';
    }

    /** Return plugin version */
    getPluginVersion() {
        return this._options.plugin_version || 'undefined';
    }

}

const cinema4dMediator = new Cinema4dMediator();
export default cinema4dMediator;
