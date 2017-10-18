// :copyright: Copyright (c) 2016 ftrack

import { Session } from 'ftrack-javascript-api';

/** Shared API session instance. */
// eslint-disable-next-line import/no-mutable-exports
export let session = null;

/**
 * Configure shared session instance.
 *
 * Returns promise which will be resolved once session is ready for use.
 */
export function configureSharedApiSession(
    serverUrl, apiUser, apiKey
) {
    session = new Session(
        serverUrl, apiUser, apiKey, {
            autoConnectEventHub: true,
            eventHubOptions: {
                applicationId: 'ftrack.client.spark',
            },
        }
    );

    return session.initializing;
}
