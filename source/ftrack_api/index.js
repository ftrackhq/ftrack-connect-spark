// :copyright: Copyright (c) 2016 ftrack
import io from 'socket.io-client';
import uuid from 'uuid';
import loglevel from 'loglevel';


/** Return create operation object for entity *type* and *data*. */
export function createOperation(type, data) {
    const operation = { action: 'create', entity_type: type };
    operation.entity_data = Object.assign({}, data, { __entity_type__: type });
    return operation;
}


/** Return query operation object for *expression*. */
export function queryOperation(expression) {
    return { action: 'query', expression };
}

/**
 * Return update operation object for entity *type* identified by *keys*.
 *
 * *data* should be an object of values to update.
 */
export function updateOperation(type, keys, data) {
    const operation = {
        action: 'update',
        entity_type: type,
        entity_key: keys,
    };
    operation.entity_data = Object.assign({}, data, { __entity_type__: type });
    return operation;
}

/**
 * ftrack API Event class.
 */
export class Event {

    /** Construct EventHub instance with API credentials. */
    constructor(topic, data) {
        this._data = {
            topic,
            data,
            id: uuid.v4(),
            sent: null,
            target: '',
            inReplyToEvent: null,
        };
    }

    /** Return event data. */
    getData() {
        return this._data;
    }

    /** Add source. */
    addSource(source) {
        this._data.source = source;
    }

}

/**
 * ftrack API Event hub.
 */
class EventHub {

    /** Construct EventHub instance with API credentials. */
    constructor(serverUrl, apiUser, apiKey) {
        this.logger = loglevel.getLogger('ftrack_api:EventHub');
        this._apiUser = apiUser;
        this._apiKey = apiKey;
        this._serverUrl = serverUrl;
        this._id = uuid.v4();
        this._replyCallbacks = {};
        this._callbacks = [];
        this._socketIo = null;
    }

    /** Connect to the event server. */
    connect() {
        this._socketIo = io.connect(this._serverUrl, {
            'max reconnection attempts': Infinity,
            'reconnection limit': 10000,
            'reconnection delay': 5000,
            transports: ['websocket'],
            query: ''.concat(
                'api_user=', this._apiUser, '&api_key=', this._apiKey
            ),
        });

        this._socketIo.on('connect', this._onSocketConnected.bind(this));
        this._socketIo.on(
            'ftrack.event', this._handleEvent.bind(this)
        );
    }

    /** Return true if connected to event server. */
    isConnected() {
        return this._socketIo && this._socketIo.socket.connected;
    }

    /** Handle on connect event. */
    _onSocketConnected() {
        this.logger.debug('Connected to event server.');

        // Subscribe to reply events.
        this.subscribe('topic=ftrack.meta.reply').catch((error) => {
            this.logger.debug('Unable to subscribe to replies.', error);
        });

        // Run any publish callbacks.
        const callbacks = this._callbacks;
        if (callbacks.length) {
            this._callbacks = [];
            this.logger.debug(`Publishing ${callbacks.length} unsent events.`);
            for (const callback of callbacks) {
                this._runWhenConnected(callback);
            }
        }
    }

    /** Publish event and return promise. */
    publish(event, reply = false, timeout = 5) {
        event.addSource(
            {
                id: this._id,
                applicationId: 'ftrack.client.spark',
                user: {
                    username: this._apiUser,
                },
            }
        );

        const onConnected = new Promise((resolve, reject) => {
            this._runWhenConnected(resolve);

            if (timeout) {
                setTimeout(() => reject(
                    new Error('Unable to connect to event server within timeout.')
                ), timeout * 1000);
            }
        });

        const onPublish = onConnected.then(() => {
            this._socketIo.emit(
                'ftrack.event',
                event.getData()
            );
            this.logger.debug('Publishing event.', event.getData());

            return Promise.resolve();
        });

        if (reply) {
            const onReply = new Promise((resolve, reject) => {
                this._replyCallbacks[event.getData().id] = resolve;

                if (timeout) {
                    setTimeout(() => reject(
                        new Error('No reply event received within timeout.')
                    ), timeout * 1000);
                }
            });

            return onReply;
        }

        return onPublish;
    }

    /** Run *callback* if event hub is connected to server. */
    _runWhenConnected(callback) {
        if (!this.isConnected()) {
            this.logger.debug(
                'Event hub is not connected, event is delayed.'
            );
            this._callbacks.push(callback);
        } else {
            callback();
        }
    }

    /** Subscribe to *subscription* events. */
    subscribe(subscription) {
        const subscribeEvent = new Event(
            'ftrack.meta.subscribe',
            {
                subscriber: {
                    id: this._id,
                    applicationId: 'ftrack.client.spark',
                },
                subscription,
            }
        );

        return this.publish(subscribeEvent, false, 0);
    }

    /** Handle replies. */
    _handleEvent(event) {
        const resolve = this._replyCallbacks[event.inReplyToEvent];
        if (resolve) {
            resolve(event);
        }

        // TODO: Handle other subscriptions.
    }

}

/**
 * ftrack API session
 */
class Session {

    /** Construct Session instance with API credentials. */
    constructor(serverUrl, apiUser, apiKey, autoConnectEventHub = false) {
        this._apiUser = apiUser;
        this._apiKey = apiKey;
        this._serverUrl = serverUrl;
        this.eventHub = new EventHub(serverUrl, apiUser, apiKey);

        if (autoConnectEventHub) {
            this.eventHub.connect();
        }
    }

    /**
     * Initialize session
     * Returns promise which will be resolved once session is ready for use.
     */
    initialize() {
        const operations = [
            { action: 'query_server_information' },
            { action: 'query_schemas' },
        ];
        const request = this._call(operations);

        request.then(
            (responses) => {
                this._serverInformation = responses[0];
                this._schemas = responses[1];
            }
        );

        return request;
    }

    /**
     * Call API with array of operation objects in *operations*.
     *
     * Returns promise which will be resolved with an array of decoded
     * responses.
     */
    _call(operations) {
        const url = `${this._serverUrl}/api`;

        let request = fetch(url, {
            method: 'post',
            credentials: 'include',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'ftrack-api-key': this._apiKey,
                'ftrack-user': this._apiUser,
            },
            body: JSON.stringify(operations),
        });

        request = request.then(
            (response) => response.json()
        );

        // Reject promise on API exception.
        request = request.then((response) => {
            if (response.exception) {
                return Promise.reject(
                    new Error(`${response.exception}: ${response.content}`)
                );
            }
            return Promise.resolve(response);
        });

        return request;
    }

    /**
     * Perform a single query operation with *expression*.
     *
     * Returns a promise which will be resolved with an array of matched
     * entities.
     */
    _query(expression) {
        const operation = queryOperation(expression);
        let request = this._call([operation]);
        request = request.then((responses) => responses[0].data);

        return request;
    }
}

/** Shared API session instance. */
export let session = null;

/**
 * Configure shared session instance.
 *
 * Returns promise which will be resolved once session is ready for use.
 */
export function configureSharedApiSession(
    serverUrl, apiUser, apiKey
) {
    session = new Session(serverUrl, apiUser, apiKey, true);
    return session.initialize();
}
