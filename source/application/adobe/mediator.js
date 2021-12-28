// :copyright: Copyright (c) 2016 ftrack
import { loadComponents, resolveComponentPaths } from '../lib/import';
import {
    showProgress, ensureConnectIsRunning, createVersion, createComponents,
    uploadReviewMedia, updateComponentVersions,
} from '../lib/share';

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
const PUBLISH_SUPPORTED_APP_IDS = ['PHSP', 'PHXS', 'PPRO', 'AEFT', 'ILST'];
const QUICK_REVIEW_SUPPORTED_APP_IDS = ['PHSP', 'PHXS', 'PPRO', 'ILST'];
const IMPORT_FILE_SUPPORTED_APP_IDS = ['PHSP', 'PHXS', 'PPRO', 'AEFT', 'ILST'];

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
            asset_name: component.version.asset && component.version.asset.name,
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

        let promise = ensureConnectIsRunning();

        promise = promise.then(() => {
            const publishOptions = new Promise((resolve, reject) => {
                exporter.getPublishOptions(options, (error, response) => {
                    logger.info('Publish options', error, response);
                    const items = this.getPublishOptionsItems(response);
                    if (error) {
                        reject(error);
                    } else {
                        resolve(Object.assign({ items }, response));
                    }
                });
            });
            return publishOptions;
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

    /** Return identifier. */
    getIdentifier() {
        const appId = window.top.csInterface.getHostEnvironment().appId;
        let niceName = APPLICATION_IDS[appId];
        niceName = niceName.replace(' ', '-');
        niceName = niceName.toLowerCase();

        return `spark-adobe-${niceName}`;
    }

    /** Return host version. */
    getHostVersion() {
        return window.top.csInterface.getHostEnvironment().appVersion;
    }

    /** Return plugin version */
    getPluginVersion() {
        return 'undefined';
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

    /** Return publish interface options for the current host application. */
    getPublishOptionsItems(options) {
        const appId = this.getAppId();
        const items = [];
        if (appId === 'PPRO') {
            items.push(
                {
                    label: 'Project file',
                    description: 'Include a copy of the Premiere project file.',
                    type: 'boolean',
                    name: 'include_project_file',
                    value: true,
                },
                {
                    label: 'Source range',
                    type: 'dropdown',
                    name: 'source_range',
                    help: 'Include an export of your sequence.',
                    value: 'inout',
                    data: [
                        {
                            label: 'Do not export sequence',
                            value: null,
                        },
                        {
                            label: 'Entire sequence',
                            value: 'entire',
                        },
                        {
                            label: 'Sequence in/out',
                            value: 'inout',
                        },
                        {
                            label: 'Work area',
                            value: 'workarea',
                        },
                    ],
                }
            );
        } else if (appId === 'AEFT') {
            if (options.exportOptions) {
                let defaultValue = null;
                const data = [];
                for (const name of options.exportOptions.compositionNames) {
                    data.push({
                        label: name,
                        value: name,
                    });
                }
                if (options.exportOptions.compositionNames.length) {
                    defaultValue = options.exportOptions.compositionNames[0];
                }
                items.push(
                    {
                        label: 'Composition',
                        type: 'dropdown',
                        name: 'composition',
                        help: 'Composition to use for export and thumbnail generation.',
                        value: defaultValue,
                        data,
                    }
                );
            }
            items.push(
                {
                    label: 'Project file',
                    description: 'Include a copy of the After Effects project file.',
                    type: 'boolean',
                    name: 'include_project_file',
                    value: true,
                },
                {
                    label: 'Render composition',
                    description: 'Include a render of the select composition.',
                    type: 'boolean',
                    name: 'render_composition',
                    value: true,
                }
            );
            if (options.exportOptions) {
                const outputModules = options.exportOptions.outputModules;
                let defaultValue = null;
                let data = [];
                for (const name of outputModules) {
                    if (name.includes('_HIDDEN')) {
                        continue;
                    }
                    data.push({
                        label: name,
                        value: name,
                    });
                }
                if (outputModules.length) {
                    defaultValue = outputModules[0];
                }
                items.push(
                    {
                        label: 'Output module',
                        type: 'dropdown',
                        name: 'output_module',
                        help: 'Select output module that should be used.',
                        value: defaultValue,
                        data,
                    }
                );

                const renderSettings = options.exportOptions.renderSettings;
                defaultValue = null;
                data = [];
                for (const name of renderSettings) {
                    if (name.includes('_HIDDEN')) {
                        continue;
                    }
                    data.push({
                        label: name,
                        value: name,
                    });
                }
                if (renderSettings.length) {
                    defaultValue = renderSettings[0];
                }
                items.push(
                    {
                        label: 'Render setting',
                        type: 'dropdown',
                        name: 'render_setting',
                        help: 'Render setting that should be used.',
                        value: defaultValue,
                        data,
                    }
                );
            }
        } else if (appId === 'ILST') {
            items.push(
                {
                    label: 'Review PDF',
                    type: 'boolean',
                    name: 'include_pdf',
                    description: 'Export and upload PDF for review',
                    value: true,
                }
            );
        }
        if (options && options.exportOptions && options.exportOptions.component_name) {
            items.push(
                {
                    label: 'Component name',
                    type: 'text',
                    name: 'component_name',
                    description: 'Name for deliverable component',
                    value: options.exportOptions.component_name,
                }
            );
        }
        if (options && options.exportOptions && options.exportOptions.formats.length) {
            const formats = options.exportOptions.formats;
            items.push(
                {
                    label: 'Format',
                    type: 'dropdown',
                    name: 'save_as_format',
                    description: 'Format for the saved document',
                    value: formats[0].value,
                    data: formats,
                }
            );
        }

        return items;
    }

    /** Return publish export options for the current host application. */
    getPublishExportOptions(values) {
        switch (this.getAppId()) {
            case 'PHSP':
            case 'PHXS':
                return {
                    review: true,
                    delivery: true,
                    save_as_format: values.save_as_format,
                    component_name: values.component_name,
                };
            case 'ILST':
                return {
                    component_name: values.component_name,
                    review: true,
                    delivery: true,
                    include_pdf: values.include_pdf,
                    save_as_format: values.save_as_format,
                };
            case 'PPRO':
                return {
                    component_name: values.component_name,
                    thumbnail: true,
                    project_file: values.include_project_file,
                    rendered_sequence: !!values.source_range,
                    source_range: values.source_range,
                };
            case 'AEFT':
                return {
                    component_name: values.component_name,
                    thumbnail: true,
                    project_file: values.include_project_file,
                    render_composition: values.render_composition,
                    render_setting: values.render_setting,
                    output_module: values.output_module,
                    composition: values.composition,
                };
            default:
                return {};
        }
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

    /**
     * Publish media to ftrack based on form *values*.
     * Return promise resolved once publish has completed.
     */
    publish(values) {
        const message = `
            This may take a few minutes, please keep this window open until finished.
        `;
        showProgress({ header: 'Publishing...', message });
        const uploadMedia = [];
        const publishMedia = [];
        let componentIds;
        let versionId;

        const publishExportOptions = this.getPublishExportOptions(values);
        const promise = this.exportMedia(
            Object.assign({ showProgress }, publishExportOptions)
        ).then((media) => {
            for (const file of media) {
                const isUpload = (
                    file.use.includes('review') ||
                    file.use === 'thumbnail'
                );

                if (isUpload) {
                    uploadMedia.push(file);
                } else {
                    publishMedia.push(file);
                }
            }
            logger.debug('Exported media', uploadMedia, publishMedia);

            showProgress({ header: 'Uploading media...', message });
            return uploadReviewMedia(uploadMedia);
        }).then((_componentIds) => {
            componentIds = _componentIds;
            logger.debug('Uploaded components', _componentIds);

            showProgress({ header: 'Creating version...', message });
            return createVersion(values, componentIds[0]);
        }).then((_versionId) => {
            logger.debug('Created version', _versionId);
            versionId = _versionId;
            const componentVersions = componentIds.map(
                (componentId) => ({ componentId, versionId })
            );

            return updateComponentVersions(componentVersions);
        }).then(() => {
            showProgress({ header: 'Publishing...', message });
            return createComponents(versionId, publishMedia);
        }).then((reply) => {
            logger.info('Finished publish', reply);
            return Promise.resolve(reply);
        });

        return promise;
    }

    /** Write a data file to the connect folder with *data* and *filename*. */
    writeSecurePublishFile(filename, data) {
        const util = window.top.FT.util;
        logger.info('Writing data file.');

        const promise = new Promise((resolve, reject) => {
            util.writeSecurePublishFile(filename, data, (error, filePath) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(filePath);
                }
            });
        });

        return promise;
    }

    getEnv(name) {
        return window.top.FT.main.env[name];
    }
}

const adobeMediator = new AdobeMediator();
export default adobeMediator;
