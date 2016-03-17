// :copyright: Copyright (c) 2016 ftrack
import uuid from 'uuid';

import {
    session, createOperation, queryOperation,
} from '../../ftrack_api';

import loglevel from 'loglevel';
const logger = loglevel.getLogger('saga:lib:share');


// This is the `Upload` asset type, which is guaranteed to exist.
const _uploadTypeId = '8f4144e0-a8e6-11e2-9e96-0800200c9a66';

/**
 * Return promise which will be resolved with an array of two elements:
 *
 * Assets
 *     Array of assets either existing or to be created.
 * createOperations
 *     Array of API operations to create assets not existing on server.
 */
export function gatherAssets(assets) {
    const result = [...assets];

    const operations = [];
    for (const asset of result) {
        asset.type_id = asset.type_id || _uploadTypeId;
        operations.push(queryOperation(
            `select id from Asset where
            context_id is "${asset.context_id}" and
            type_id is "${asset.type_id}" and
            name is "${asset.name}"
            limit 1`
        ));
    }

    const request = session._call(operations);
    const createOperations = [];
    const promise = request.then((responses) => {
        for (let i = 0; i < responses.length; i += 1) {
            logger.info(responses);
            const asset = responses[i].data && responses[i].data[0];
            if (asset) {
                result[i].id = asset.id;
                logger.info('Existing asset', result[i].id);
            } else {
                result[i].id = uuid.v4();
                logger.info('New asset', result[i].id);

                createOperations.push(createOperation(
                    'Asset', Object.assign({}, result[i])
                ));
            }
        }
        return Promise.resolve([result, createOperations]);
    });

    return promise;
}
