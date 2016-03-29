// :copyright: Copyright (c) 2016 ftrack

import loglevel from 'loglevel';
const logger = loglevel.getLogger('cinema4d:mediator');

import { session } from '../../ftrack_api';
import Event from '../../ftrack_api/event';

/**
 * Cinema 4D Mediator
 *
 * Provides cinema-4d-specific logic by calling methods in
 * `ftrack-connect-cinema-4d` via events.
 */
export class Cinema4dMediator {
    _getOption(name, defaultValue = null) {
        try {
            return window.__FTRACK_C4D.options[name];
        } catch (err) {
            return defaultValue;
        }
    }

    _getTarget() {
        const c4dEventHubId = this._getOption('event_hub_id');
        return c4dEventHubId ? `id=${c4dEventHubId}` : '';
    }

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
            return Promise.resolve(response);
        });
        return promise;
    }

    getPublishOptions(options) {
        logger.info('Get publish options', options);
        return this._rpcEvent('get_publish_options', options);
    }

    exportMedia(options) {
        logger.info('Export media', options);
        return this._rpcEvent('export_media', options);
    }

    uploadMedia(options) {
        logger.info('Upload media', options);
        return this._rpcEvent('upload_media', options);
    }
}

const cinema4dMediator = new Cinema4dMediator();

export default cinema4dMediator;
