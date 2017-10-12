// :copyright: Copyright (c) 2016 ftrack

import { session } from '../../ftrack_api';
import { Event } from 'ftrack-javascript-api';


/** Resolve component paths via events. */
export function resolveComponentPaths(components) {
    const resolveEventPromises = components.map((component) => {
        const event = new Event(
            'ftrack.location.request-resolve',
            { componentId: component.id, locationName: null, platform: 'Linux' }
        );
        const reply = session.eventHub.publishAndWaitForReply(
            event, { timeout: 10 }
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
                caption: `${component.name}${component.file_type || ''} (Unavailable)`,
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
export function loadComponents(versionId) {
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

    const request = session.query(queryString);
    const components = request.then(
        (response) => Promise.resolve(
            response.data.map(component => component)
        )
    );

    return components;
}
