/**
 * Add tags to the dictionary.
 *
 * @param {string} group The group key.
 * @param {object} tags The tags to add.
 */
export declare function addTagsToDictionary(group: string, tags: object): void;

/**
 * List of ViewConfigs indexed by dataIds.
 *
 * @typedef {Object<string, ViewConfig[]>} DataViewConfigs
 */
/**
 * Main application class.
 *
 * @example
 * // create the dwv app
 * const app = new dwv.App();
 * // initialise
 * const viewConfig0 = new ViewConfig('layerGroup0');
 * const viewConfigs = {'*': [viewConfig0]};
 * const options = new AppOptions(viewConfigs);
 * app.init(options);
 * // load dicom data
 * app.loadURLs([
 *   'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323851.dcm'
 * ]);
 */
export declare class App {
    /**
     * Get the image.
     *
     * @param {number} index The data index.
     * @returns {Image} The associated image.
     */
    getImage(index: number): Image_2;
    /**
     * Get the last loaded image.
     *
     * @returns {Image} The image.
     */
    getLastImage(): Image_2;
    /**
     * Set the image at the given index.
     *
     * @param {number} index The data index.
     * @param {Image} img The associated image.
     */
    setImage(index: number, img: Image_2): void;
    /**
     * Set the last image.
     *
     * @param {Image} img The associated image.
     */
    setLastImage(img: Image_2): void;
    /**
     * Add a new image.
     *
     * @param {Image} image The new image.
     * @param {object} meta The image meta.
     * @returns {number} The new image id.
     */
    addNewImage(image: Image_2, meta: object): number;
    /**
     * Get the meta data.
     *
     * @param {number} index The data index.
     * @returns {object} The list of meta data.
     */
    getMetaData(index: number): object;
    /**
     * Get the number of loaded data.
     *
     * @returns {number} The number.
     */
    getNumberOfLoadedData(): number;
    /**
     * Can the data be scrolled?
     *
     * @returns {boolean} True if the data has a third dimension greater than one.
     */
    canScroll(): boolean;
    /**
     * Can window and level be applied to the data?
     *
     * @returns {boolean} True if the data is monochrome.
     */
    canWindowLevel(): boolean;
    /**
     * Get the layer scale on top of the base scale.
     *
     * @returns {object} The scale as {x,y}.
     */
    getAddedScale(): object;
    /**
     * Get the base scale.
     *
     * @returns {object} The scale as {x,y}.
     */
    getBaseScale(): object;
    /**
     * Get the layer offset.
     *
     * @returns {object} The offset.
     */
    getOffset(): object;
    /**
     * Get the toolbox controller.
     *
     * @returns {ToolboxController} The controller.
     */
    getToolboxController(): ToolboxController;
    /**
     * Get the active layer group.
     * The layer is available after the first loaded item.
     *
     * @returns {LayerGroup} The layer group.
     */
    getActiveLayerGroup(): LayerGroup;
    /**
     * Get the view layers associated to a data index.
     * The layer are available after the first loaded item.
     *
     * @param {number} index The data index.
     * @returns {ViewLayer[]} The layers.
     */
    getViewLayersByDataIndex(index: number): ViewLayer[];
    /**
     * Get the draw layers associated to a data index.
     * The layer are available after the first loaded item.
     *
     * @param {number} index The data index.
     * @returns {DrawLayer[]} The layers.
     */
    getDrawLayersByDataIndex(index: number): DrawLayer[];
    /**
     * Get a layer group by div id.
     * The layer is available after the first loaded item.
     *
     * @param {string} divId The div id.
     * @returns {LayerGroup} The layer group.
     */
    getLayerGroupByDivId(divId: string): LayerGroup;
    /**
     * Get the number of layer groups.
     *
     * @returns {number} The number of groups.
     */
    getNumberOfLayerGroups(): number;
    /**
     * Get the app style.
     *
     * @returns {object} The app style.
     */
    getStyle(): object;
    /**
     * Add a command to the undo stack.
     *
     * @param {object} cmd The command to add.
     * @fires UndoStack#undoadd
     * @function
     */
    addToUndoStack: (cmd: object) => void;
    /**
     * Initialise the application.
     *
     * @param {AppOptions} opt The application options
     * @example
     * // create the dwv app
     * const app = new dwv.App();
     * // initialise
     * const viewConfig0 = new ViewConfig('layerGroup0');
     * const viewConfigs = {'*': [viewConfig0]};
     * const options = new AppOptions(viewConfigs);
     * options.viewOnFirstLoadItem = false;
     * app.init(options);
     * // render button
     * const button = document.createElement('button');
     * button.id = 'render';
     * button.disabled = true;
     * button.appendChild(document.createTextNode('render'));
     * document.body.appendChild(button);
     * app.addEventListener('load', function () {
     *   const button = document.getElementById('render');
     *   button.disabled = false;
     *   button.onclick = function () {
     *     // render data #0
     *     app.render(0);
     *   };
     * });
     * // load dicom data
     * app.loadURLs([
     *   'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323851.dcm'
     * ]);
     */
    init(opt: AppOptions): void;
    /**
     * Reset the application.
     */
    reset(): void;
    /**
     * Reset the layout of the application.
     */
    resetLayout(): void;
    /**
     * Add an event listener to this class.
     *
     * @param {string} type The event type.
     * @param {Function} callback The function associated with the provided
     *   event type, will be called with the fired event.
     */
    addEventListener(type: string, callback: Function): void;
    /**
     * Remove an event listener from this class.
     *
     * @param {string} type The event type.
     * @param {Function} callback The function associated with the provided
     *   event type.
     */
    removeEventListener(type: string, callback: Function): void;
    /**
     * Load a list of files. Can be image files or a state file.
     *
     * @param {File[]} files The list of files to load.
     * @fires App#loadstart
     * @fires App#loadprogress
     * @fires App#loaditem
     * @fires App#loadend
     * @fires App#loaderror
     * @fires App#loadabort
     * @function
     */
    loadFiles: (files: File[]) => void;
    /**
     * Load a list of URLs. Can be image files or a state file.
     *
     * @param {string[]} urls The list of urls to load.
     * @param {object} [options] The options object, can contain:
     *  - requestHeaders: an array of {name, value} to use as request headers
     *  - withCredentials: boolean xhr.withCredentials flag to pass to the request
     *  - batchSize: the size of the request url batch
     * @fires App#loadstart
     * @fires App#loadprogress
     * @fires App#loaditem
     * @fires App#loadend
     * @fires App#loaderror
     * @fires App#loadabort
     * @function
     */
    loadURLs: (urls: string[], options?: object) => void;
    /**
     * Load from an input uri.
     *
     * @param {string} uri The input uri, for example: 'window.location.href'.
     * @param {object} [options] Optional url request options.
     * @function
     */
    loadFromUri: (uri: string, options?: object) => void;
    /**
     * Load a list of ArrayBuffers.
     *
     * @param {Array} data The list of ArrayBuffers to load
     *   in the form of [{name: "", filename: "", data: data}].
     * @fires App#loadstart
     * @fires App#loadprogress
     * @fires App#loaditem
     * @fires App#loadend
     * @fires App#loaderror
     * @fires App#loadabort
     * @function
     */
    loadImageObject: (data: any[]) => void;
    /**
     * Abort the current load.
     */
    abortLoad(): void;
    /**
     * Fit the display to the data of each layer group.
     * To be called once the image is loaded.
     */
    fitToContainer(): void;
    /**
     * Init the Window/Level display
     */
    initWLDisplay(): void;
    /**
     * Get the data view config.
     * Carefull, returns a reference, do not modify without resetting.
     *
     * @returns {Object<string, ViewConfig[]>} The configuration list.
     */
    getDataViewConfigs(): {
        [x: string]: ViewConfig[];
    };
    /**
     * Set the data view configuration.
     * Resets the stage and recreates all the views.
     *
     * @param {Object<string, ViewConfig[]>} configs The configuration list.
     */
    setDataViewConfigs(configs: {
        [x: string]: ViewConfig[];
    }): void;
    /**
     * Set the layer groups binders.
     *
     * @param {Array} list The list of binder names.
     */
    setLayerGroupsBinders(list: any[]): void;
    /**
     * Render the current data.
     *
     * @param {number} dataIndex The data index to render.
     */
    render(dataIndex: number): void;
    /**
     * Zoom to the layers.
     *
     * @param {number} step The step to add to the current zoom.
     * @param {number} cx The zoom center X coordinate.
     * @param {number} cy The zoom center Y coordinate.
     */
    zoom(step: number, cx: number, cy: number): void;
    /**
     * Apply a translation to the layers.
     *
     * @param {number} tx The translation along X.
     * @param {number} ty The translation along Y.
     */
    translate(tx: number, ty: number): void;
    /**
     * Set the image layer opacity.
     *
     * @param {number} alpha The opacity ([0:1] range).
     */
    setOpacity(alpha: number): void;
    /**
     * Set the drawings on the current stage.
     *
     * @param {Array} drawings An array of drawings.
     * @param {Array} drawingsDetails An array of drawings details.
     */
    setDrawings(drawings: any[], drawingsDetails: any[]): void;
    /**
     * Get the JSON state of the app.
     *
     * @returns {string} The state of the app as a JSON string.
     */
    getJsonState(): string;
    /**
     * Apply a JSON state to this app.
     *
     * @param {string} jsonState The state of the app as a JSON string.
     */
    applyJsonState(jsonState: string): void;
    /**
     * Handle resize: fit the display to the window.
     * To be called once the image is loaded.
     * Can be connected to a window 'resize' event.
     *
     * @function
     */
    onResize: () => void;
    /**
     * Key down callback. Meant to be used in tools.
     *
     * @param {KeyboardEvent} event The key down event.
     * @fires App#keydown
     * @function
     */
    onKeydown: (event: KeyboardEvent) => void;
    /**
     * Key down event handler example.
     * - CRTL-Z: undo
     * - CRTL-Y: redo
     * - CRTL-ARROW_LEFT: next element on fourth dim
     * - CRTL-ARROW_UP: next element on third dim
     * - CRTL-ARROW_RIGHT: previous element on fourth dim
     * - CRTL-ARROW_DOWN: previous element on third dim
     *
     * @param {KeyboardEvent} event The key down event.
     * @fires UndoStack#undo
     * @fires UndoStack#redo
     * @function
     */
    defaultOnKeydown: (event: KeyboardEvent) => void;
    /**
     * Reset the display
     */
    resetDisplay(): void;
    /**
     * Reset the app zoom.s
     */
    resetZoom(): void;
    /**
     * Set the colour map.
     *
     * @param {string} name The colour map name.
     */
    setColourMap(name: string): void;
    /**
     * Set the window/level preset.
     *
     * @param {object} preset The window/level preset.
     */
    setWindowLevelPreset(preset: object): void;
    /**
     * Set the tool
     *
     * @param {string} tool The tool.
     */
    setTool(tool: string): void;
    /**
     * Set the tool live features.
     *
     * @param {object} list The list of features.
     */
    setToolFeatures(list: object): void;
    /**
     * Undo the last action
     *
     * @fires UndoStack#undo
     */
    undo(): void;
    /**
     * Redo the last action
     *
     * @fires UndoStack#redo
     */
    redo(): void;
    /**
     * Get the undo stack size.
     *
     * @returns {number} The size of the stack.
     */
    getStackSize(): number;
    /**
     * Get the current undo stack index.
     *
     * @returns {number} The stack index.
     */
    getCurrentStackIndex(): number;
    #private;
}

/**
 * Application options.
 */
export declare class AppOptions {
    /**
     * @param {Object<string, ViewConfig[]>} dataViewConfigs DataId
     *   indexed object containing the data view configurations.
     */
    constructor(dataViewConfigs: {
        [x: string]: ViewConfig[];
    });
    /**
     * DataId indexed object containing the data view configurations.
     *
     * @type {Object<string, ViewConfig[]>}
     */
    dataViewConfigs: {
        [x: string]: ViewConfig[];
    };
    /**
     * Tool name indexed object containing individual tool configurations.
     *
     * @type {Object<string, ToolConfig>|undefined}
     */
    tools: {
        [x: string]: ToolConfig;
    } | undefined;
    /**
     * Optional array of layerGroup binder names.
     *
     * @type {string[]|undefined}
     */
    binders: string[] | undefined;
    /**
     * Optional boolean flag to trigger the first data render
     *   after the first loaded data or not. Defaults to true;
     *
     * @type {boolean|undefined}
     */
    viewOnFirstLoadItem: boolean | undefined;
    /**
     * Optional default chraracter set string used for DICOM parsing if
     * not passed in DICOM file.
     * Valid values: https://developer.mozilla.org/en-US/docs/Web/API/Encoding_API/Encodings
     *
     * @type {string|undefined}
     */
    defaultCharacterSet: string | undefined;
}

/**
 * Build a multipart message.
 * See: https://en.wikipedia.org/wiki/MIME#Multipart_messages
 * See: https://hg.orthanc-server.com/orthanc-dicomweb/file/tip/Resources/Samples/JavaScript/stow-rs.js
 *
 * @param {Array} parts The message parts as an array of object containing
 *   content headers and messages as the data property (as returned by parse).
 * @param {string} boundary The message boundary.
 * @returns {Uint8Array} The full multipart message.
 */
export declare function buildMultipart(parts: any[], boundary: string): Uint8Array;

/**
 * Colour map: red, green and blue components
 * to associate with intensity values.
 */
export declare class ColourMap {
    /**
     * @param {number[]} red Red component.
     * @param {number[]} green Green component.
     * @param {number[]} blue Blue component.
     */
    constructor(red: number[], green: number[], blue: number[]);
    /**
     * Red component: 256 values in the [0, 255] range.
     *
     * @type {number[]}
     */
    red: number[];
    /**
     * Green component: 256 values in the [0, 255] range.
     *
     * @type {number[]}
     */
    green: number[];
    /**
     * Blue component: 256 values in the [0, 255] range.
     *
     * @type {number[]}
     */
    blue: number[];
}

/**
 * Create an Image from DICOM elements.
 *
 * @param {object} elements The DICOM elements.
 * @returns {Image} The Image object.
 */
export declare function createImage(elements: object): Image_2;

/**
 * Create a mask Image from DICOM elements.
 *
 * @param {object} elements The DICOM elements.
 * @returns {Image} The mask Image object.
 */
export declare function createMaskImage(elements: object): Image_2;

/**
 * Create a View from DICOM elements and image.
 *
 * @param {object} elements The DICOM elements.
 * @param {Image} image The associated image.
 * @returns {View} The View object.
 */
export declare function createView(elements: object, image: Image_2): View;

export declare namespace customUI {
    /**
     * Open a dialogue to edit roi data. Defaults to window.prompt.
     *
     * @param {object} data The roi data.
     * @param {Function} callback The callback to launch on dialogue exit.
     */
    export function openRoiDialog(data: any, callback: Function): void;
}

/**
 * DICOM data element.
 */
export declare class DataElement {
    /**
     * @param {string} vr The element VR (Value Representation).
     */
    constructor(vr: string);
    /**
     * The element Value Representation.
     *
     * @type {string}
     */
    vr: string;
    /**
     * The element value.
     *
     * @type {Array}
     */
    value: any[];
    /**
     * The element dicom tag.
     *
     * @type {Tag}
     */
    tag: Tag;
    /**
     * The element Value Length.
     *
     * @type {number}
     */
    vl: number;
    /**
     * Flag to know if defined or undefined sequence length.
     *
     * @type {boolean}
     */
    undefinedLength: boolean;
    /**
     * The element start offset.
     *
     * @type {number}
     */
    startOffset: number;
    /**
     * The element end offset.
     *
     * @type {number}
     */
    endOffset: number;
    /**
     * The sequence items.
     *
     * @type {Array}
     */
    items: any[];
}

/**
 * Decoder scripts to be passed to web workers for image decoding.
 */
export declare const decoderScripts: {
    jpeg2000: string;
    'jpeg-lossless': string;
    'jpeg-baseline': string;
    rle: string;
};

/**
 * List of default window level presets.
 *
 * @type {Object.<string, Object.<string, {center: number, width: number}>>}
 */
export declare const defaultPresets: {
    [x: string]: {
        [x: string]: {
            center: number;
            width: number;
        };
    };
};

/**
 * DicomParser class.
 *
 * @example
 * // XMLHttpRequest onload callback
 * const onload = function (event) {
 *   // setup the dicom parser
 *   const dicomParser = new dwv.DicomParser();
 *   // parse the buffer
 *   dicomParser.parse(event.target.response);
 *   // get the dicom tags
 *   const tags = dicomParser.getDicomElements();
 *   // display the modality
 *   const div = document.getElementById('dwv');
 *   div.appendChild(document.createTextNode(
 *     'Modality: ' + tags['00080060'].value[0]
 *   ));
 * };
 * // DICOM file request
 * const request = new XMLHttpRequest();
 * const url = 'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323851.dcm';
 * request.open('GET', url);
 * request.responseType = 'arraybuffer';
 * request.onload = onload;
 * request.send();
 */
export declare class DicomParser {
    /**
     * Get the default character set.
     *
     * @returns {string} The default character set.
     */
    getDefaultCharacterSet(): string;
    /**
     * Set the default character set.
     *
     * @param {string} characterSet The input character set.
     */
    setDefaultCharacterSet(characterSet: string): void;
    /**
     * Set the text decoder character set.
     *
     * @param {string} characterSet The input character set.
     */
    setDecoderCharacterSet(characterSet: string): void;
    /**
     * Get the DICOM data elements.
     *
     * @returns {Object<string, DataElement>} The data elements.
     */
    getDicomElements(): {
        [x: string]: DataElement;
    };
    /**
     * Parse the complete DICOM file (given as input to the class).
     * Fills in the member object 'dataElements'.
     *
     * @param {ArrayBuffer} buffer The input array buffer.
     */
    parse(buffer: ArrayBuffer): void;
    #private;
}

/**
 * DICOM writer.
 *
 * @example
 * // XMLHttpRequest onload callback
 * const onload = function (event) {
 *   const parser = new DicomParser();
 *   parser.parse(event.target.response);
 *   // create writer with parser data elements
 *   const writer = new DicomWriter(parser.getDicomElements());
 *   // create modified buffer and put it in a Blol
 *   const blob = new Blob([writer.getBuffer()], {type: 'application/dicom'});
 *   // example download link
 *   const element = document.getElementById("download");
 *   element.href = URL.createObjectURL(blob);
 *   element.download = "anonym.dcm";
 * };
 * // DICOM file request
 * const request = new XMLHttpRequest();
 * const url = 'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323851.dcm';
 * request.open('GET', url);
 * request.responseType = 'arraybuffer';
 * request.onload = onload;
 * request.send();
 */
export declare class DicomWriter {
    /**
     * Set the use UN VR for private sequence flag.
     *
     * @param {boolean} flag True to use UN VR.
     */
    setUseUnVrForPrivateSq(flag: boolean): void;
    /**
     * Set the writing rules.
     * List of writer rules indexed by either `default`, tagName or groupName.
     * Each DICOM element will be checked to see if a rule is applicable.
     * First checked by tagName and then by groupName,
     * if nothing is found the default rule is applied.
     *
     * @param {Object<string, WriterRule>} rules The input rules.
     */
    setRules(rules: {
        [x: string]: WriterRule;
    }): void;
    /**
     * Use a TextEncoder instead of the default text decoder.
     */
    useSpecialTextEncoder(): void;
    /**
     * Use default anonymisation rules.
     */
    useDefaultAnonymisationRules(): void;
    /**
     * Get the element to write according to the class rules.
     * Priority order: tagName, groupName, default.
     *
     * @param {DataElement} element The element to check
     * @returns {DataElement|null} The element to write, can be null.
     */
    getElementToWrite(element: DataElement): DataElement | null;
    /**
     * Get the ArrayBuffer corresponding to input DICOM elements.
     *
     * @param {Object<string, DataElement>} dataElements The elements to write.
     * @returns {ArrayBuffer} The elements as a buffer.
     */
    getBuffer(dataElements: {
        [x: string]: DataElement;
    }): ArrayBuffer;
    #private;
}

/**
 * Draw layer.
 */
export declare class DrawLayer {
    /**
     * @param {HTMLDivElement} containerDiv The layer div, its id will be used
     *   as this layer id.
     */
    constructor(containerDiv: HTMLDivElement);
    /**
     * Get the associated data index.
     *
     * @returns {number} The index.
     */
    getDataIndex(): number;
    /**
     * Get the Konva stage.
     *
     * @returns {object} The stage.
     */
    getKonvaStage(): object;
    /**
     * Get the Konva layer.
     *
     * @returns {object} The layer.
     */
    getKonvaLayer(): object;
    /**
     * Get the draw controller.
     *
     * @returns {object} The controller.
     */
    getDrawController(): object;
    /**
     * Set the plane helper.
     *
     * @param {object} helper The helper.
     */
    setPlaneHelper(helper: object): void;
    /**
     * Get the id of the layer.
     *
     * @returns {string} The string id.
     */
    getId(): string;
    /**
     * Get the layer base size (without scale).
     *
     * @returns {object} The size as {x,y}.
     */
    getBaseSize(): object;
    /**
     * Get the layer opacity.
     *
     * @returns {number} The opacity ([0:1] range).
     */
    getOpacity(): number;
    /**
     * Set the layer opacity.
     *
     * @param {number} alpha The opacity ([0:1] range).
     */
    setOpacity(alpha: number): void;
    /**
     * Add a flip offset along the layer X axis.
     */
    addFlipOffsetX(): void;
    /**
     * Add a flip offset along the layer Y axis.
     */
    addFlipOffsetY(): void;
    /**
     * Set the layer scale.
     *
     * @param {object} newScale The scale as {x,y}.
     * @param {Point3D} [center] The scale center.
     */
    setScale(newScale: object, center?: Point3D): void;
    /**
     * Set the layer offset.
     *
     * @param {object} newOffset The offset as {x,y}.
     */
    setOffset(newOffset: object): void;
    /**
     * Set the base layer offset. Updates the layer offset.
     *
     * @param {Vector3D} scrollOffset The scroll offset vector.
     * @param {Vector3D} planeOffset The plane offset vector.
     * @returns {boolean} True if the offset was updated.
     */
    setBaseOffset(scrollOffset: Vector3D, planeOffset: Vector3D): boolean;
    /**
     * Display the layer.
     *
     * @param {boolean} flag Whether to display the layer or not.
     */
    display(flag: boolean): void;
    /**
     * Check if the layer is visible.
     *
     * @returns {boolean} True if the layer is visible.
     */
    isVisible(): boolean;
    /**
     * Draw the content (imageData) of the layer.
     * The imageData variable needs to be set
     */
    draw(): void;
    /**
     * Initialise the layer: set the canvas and context
     *
     * @param {object} size The image size as {x,y}.
     * @param {object} spacing The image spacing as {x,y}.
     * @param {number} index The associated data index.
     */
    initialise(size: object, spacing: object, index: number): void;
    /**
     * Fit the layer to its parent container.
     *
     * @param {number} fitScale1D The 1D fit scale.
     * @param {object} fitSize The fit size as {x,y}.
     * @param {object} fitOffset The fit offset as {x,y}.
     */
    fitToContainer(fitScale1D: number, fitSize: object, fitOffset: object): void;
    /**
     * Check the visibility of a given group.
     *
     * @param {string} id The id of the group.
     * @returns {boolean} True if the group is visible.
     */
    isGroupVisible(id: string): boolean;
    /**
     * Toggle the visibility of a given group.
     *
     * @param {string} id The id of the group.
     * @returns {boolean} False if the group cannot be found.
     */
    toggleGroupVisibility(id: string): boolean;
    /**
     * Delete a Draw from the stage.
     *
     * @param {string} id The id of the group to delete.
     * @param {object} exeCallback The callback to call once the
     *  DeleteCommand has been executed.
     */
    deleteDraw(id: string, exeCallback: object): void;
    /**
     * Delete all Draws from the stage.
     *
     * @param {object} exeCallback The callback to call once the
     *  DeleteCommand has been executed.
     */
    deleteDraws(exeCallback: object): void;
    /**
     * Enable and listen to container interaction events.
     */
    bindInteraction(): void;
    /**
     * Disable and stop listening to container interaction events.
     */
    unbindInteraction(): void;
    /**
     * Set the current position.
     *
     * @param {Point} position The new position.
     * @param {Index} index The new index.
     * @returns {boolean} True if the position was updated.
     */
    setCurrentPosition(position: Point, index: Index): boolean;
    /**
     * Add an event listener to this class.
     *
     * @param {string} type The event type.
     * @param {Function} callback The function associated with the provided
     *   event type, will be called with the fired event.
     */
    addEventListener(type: string, callback: Function): void;
    /**
     * Remove an event listener from this class.
     *
     * @param {string} type The event type.
     * @param {Function} callback The function associated with the provided
     *   event type.
     */
    removeEventListener(type: string, callback: Function): void;
    #private;
}

/**
 * 2D/3D Geometry class.
 */
export declare class Geometry {
    /**
     * @param {Point3D} origin The object origin (a 3D point).
     * @param {Size} size The object size.
     * @param {Spacing} spacing The object spacing.
     * @param {Matrix33} [orientation] The object orientation (3*3 matrix,
     *   default to 3*3 identity).
     * @param {number} [time] Optional time index.
     */
    constructor(origin: Point3D, size: Size, spacing: Spacing, orientation?: Matrix33, time?: number);
    /**
     * Get the time value that was passed at construction.
     *
     * @returns {number} The time value.
     */
    getInitialTime(): number;
    /**
     * Get the total number of slices.
     * Can be different from what is stored in the size object
     *  during a volume with time points creation process.
     *
     * @returns {number} The total count.
     */
    getCurrentTotalNumberOfSlices(): number;
    /**
     * Check if a time point has associated slices.
     *
     * @param {number} time The time point to check.
     * @returns {boolean} True if slices are present.
     */
    hasSlicesAtTime(time: number): boolean;
    /**
     * Get the number of slices stored for time points preceding
     * the input one.
     *
     * @param {number} time The time point to check.
     * @returns {number|undefined} The count.
     */
    getCurrentNumberOfSlicesBeforeTime(time: number): number | undefined;
    /**
     * Get the object origin.
     * This should be the lowest origin to ease calculations (?).
     *
     * @returns {Point3D} The object origin.
     */
    getOrigin(): Point3D;
    /**
     * Get the object origins.
     *
     * @returns {Array} The object origins.
     */
    getOrigins(): any[];
    /**
     * Check if a point is in the origin list.
     *
     * @param {Point3D} point3D The point to check.
     * @param {number} tol The comparison tolerance
     *   default to Number.EPSILON.
     * @returns {boolean} True if in list.
     */
    includesOrigin(point3D: Point3D, tol: number): boolean;
    /**
     * Get the object size.
     * Warning: the size comes as stored in DICOM, meaning that it could
     * be oriented.
     *
     * @param {Matrix33} [viewOrientation] The view orientation (optional)
     * @returns {Size} The object size.
     */
    getSize(viewOrientation?: Matrix33): Size;
    /**
     * Get the object spacing.
     * Warning: the spacing comes as stored in DICOM, meaning that it could
     * be oriented.
     *
     * @param {Matrix33} [viewOrientation] The view orientation (optional)
     * @returns {Spacing} The object spacing.
     */
    getSpacing(viewOrientation?: Matrix33): Spacing;
    /**
     * Get the image spacing in real world.
     *
     * @returns {Spacing} The object spacing.
     */
    getRealSpacing(): Spacing;
    /**
     * Get the object orientation.
     *
     * @returns {Matrix33} The object orientation.
     */
    getOrientation(): Matrix33;
    /**
     * Get the slice position of a point in the current slice layout.
     * Slice indices increase with decreasing origins (high index -> low origin),
     * this simplified the handling of reconstruction since it means
     * the displayed data is in the same 'direction' as the extracted data.
     * As seen in the getOrigin method, the main origin is the lowest one.
     * This implies that the index to world and reverse method do some flipping
     * magic...
     *
     * @param {Point3D} point The point to evaluate.
     * @param {number} time Optional time index.
     * @returns {number} The slice index.
     */
    getSliceIndex(point: Point3D, time: number): number;
    /**
     * Append an origin to the geometry.
     *
     * @param {Point3D} origin The origin to append.
     * @param {number} index The index at which to append.
     * @param {number} [time] Optional time index.
     */
    appendOrigin(origin: Point3D, index: number, time?: number): void;
    /**
     * Append a frame to the geometry.
     *
     * @param {Point3D} origin The origin to append.
     * @param {number} time Optional time index.
     */
    appendFrame(origin: Point3D, time: number): void;
    /**
     * Get a string representation of the geometry.
     *
     * @returns {string} The geometry as a string.
     */
    toString(): string;
    /**
     * Check for equality.
     *
     * @param {Geometry} rhs The object to compare to.
     * @returns {boolean} True if both objects are equal.
     */
    equals(rhs: Geometry): boolean;
    /**
     * Check that a point is within bounds.
     *
     * @param {Point} point The point to check.
     * @returns {boolean} True if the given coordinates are within bounds.
     */
    isInBounds(point: Point): boolean;
    /**
     * Check that a index is within bounds.
     *
     * @param {Index} index The index to check.
     * @param {Array} [dirs] Optional list of directions to check.
     * @returns {boolean} True if the given coordinates are within bounds.
     */
    isIndexInBounds(index: Index, dirs?: any[]): boolean;
    /**
     * Convert an index into world coordinates.
     *
     * @param {Index} index The index to convert.
     * @returns {Point} The corresponding point.
     */
    indexToWorld(index: Index): Point;
    /**
     * Convert a 3D point into world coordinates.
     *
     * @param {Point3D} point The 3D point to convert.
     * @returns {Point3D} The corresponding world 3D point.
     */
    pointToWorld(point: Point3D): Point3D;
    /**
     * Convert world coordinates into an index.
     *
     * @param {Point} point The point to convert.
     * @returns {Index} The corresponding index.
     */
    worldToIndex(point: Point): Index;
    /**
     * Convert world coordinates into an point.
     *
     * @param {Point} point The world point to convert.
     * @returns {Point3D} The corresponding point.
     */
    worldToPoint(point: Point): Point3D;
    #private;
}

/**
 * List of DICOM data elements indexed via a 8 character string formed from
 * the group and element numbers.
 *
 * @typedef {Object<string, DataElement>} DataElements
 */
/**
 * Get the version of the library.
 *
 * @returns {string} The version of the library.
 */
export declare function getDwvVersion(): string;

/**
 * Get the DICOM elements from a 'simple' DICOM json tags object.
 * The json is a simplified version of the oficial DICOM json with
 * tag names instead of keys and direct values (no value property) for
 * simple tags. See synthetic test data (in tests/dicom) for examples.
 *
 * @param {Object<string, any>} jsonTags The DICOM
 *   json tags object.
 * @returns {Object<string, DataElement>} The DICOM elements.
 */
export declare function getElementsFromJSONTags(jsonTags: {
    [x: string]: any;
}): {
    [x: string]: DataElement;
};

/**
 * Get the name of an image orientation patient.
 *
 * @param {Array} orientation The image orientation patient.
 * @returns {string} The orientation name: axial, coronal or sagittal.
 */
export declare function getOrientationName(orientation: any[]): string;

/**
 * Get the PixelData Tag.
 *
 * @returns {Tag} The tag.
 */
export declare function getPixelDataTag(): Tag;

/**
 * Get patient orientation label in the reverse direction.
 *
 * @param {string} ori Patient Orientation value.
 * @returns {string} Reverse Orientation Label.
 */
export declare function getReverseOrientation(ori: string): string;

/**
 * Split a group-element key used to store DICOM elements.
 *
 * @param {string} key The key in form "00280102" as generated by tag::getKey.
 * @returns {Tag} The DICOM tag.
 */
export declare function getTagFromKey(key: string): Tag;

/**
 * Get the appropriate TypedArray in function of arguments.
 *
 * @param {number} bitsAllocated The number of bites used to store
 *   the data: [8, 16, 32].
 * @param {number} pixelRepresentation The pixel representation,
 *   0:unsigned;1:signed.
 * @param {number} size The size of the new array.
 * @returns {Uint8Array|Int8Array|Uint16Array|Int16Array|Uint32Array|Int32Array}
 *   The good typed array.
 */
export declare function getTypedArray(bitsAllocated: number, pixelRepresentation: number, size: number): Uint8Array | Int8Array | Uint16Array | Int16Array | Uint32Array | Int32Array;

/**
 * Get a UID for a DICOM tag.
 * Note: Use https://github.com/uuidjs/uuid?
 *
 * @see http://dicom.nema.org/dicom/2013/output/chtml/part05/chapter_9.html
 * @see http://dicomiseasy.blogspot.com/2011/12/chapter-4-dicom-objects-in-chapter-3.html
 * @see https://stackoverflow.com/questions/46304306/how-to-generate-unique-dicom-uid
 * @param {string} tagName The input tag.
 * @returns {string} The corresponding UID.
 */
export declare function getUID(tagName: string): string;

/**
 * Check that an input buffer includes the DICOM prefix 'DICM'
 * after the 128 bytes preamble.
 * Ref: [DICOM File Meta]{@link https://dicom.nema.org/dicom/2013/output/chtml/part10/chapter_7.html#sect_7.1}
 *
 * @param {ArrayBuffer} buffer The buffer to check.
 * @returns {boolean} True if the buffer includes the prefix.
 */
export declare function hasDicomPrefix(buffer: ArrayBuffer): boolean;

export declare namespace i18n {
    /**
     * Get the translated text.
     *
     * @param {string} key The key to the text entry.
     * @returns {string|undefined} The translated text.
     */
    export function t(key: string): string;
}

/**
 * Image class.
 * Usable once created, optional are:
 * - rescale slope and intercept (default 1:0),
 * - photometric interpretation (default MONOCHROME2),
 * - planar configuration (default RGBRGB...).
 *
 * @example
 * // XMLHttpRequest onload callback
 * const onload = function (event) {
 *   // parse the dicom buffer
 *   const dicomParser = new dwv.DicomParser();
 *   dicomParser.parse(event.target.response);
 *   // create the image object
 *   const image = dwv.createImage(dicomParser.getDicomElements());
 *   // result div
 *   const div = document.getElementById('dwv');
 *   // display the image size
 *   const size = image.getGeometry().getSize();
 *   div.appendChild(document.createTextNode(
 *     'Size: ' + size.toString() +
 *     ' (should be 256,256,1)'));
 *   // break line
 *   div.appendChild(document.createElement('br'));
 *   // display a pixel value
 *   div.appendChild(document.createTextNode(
 *     'Pixel @ [128,40,0]: ' +
 *     image.getRescaledValue(128,40,0) +
 *     ' (should be 101)'));
 * };
 * // DICOM file request
 * const request = new XMLHttpRequest();
 * const url = 'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323851.dcm';
 * request.open('GET', url);
 * request.responseType = 'arraybuffer';
 * request.onload = onload;
 * request.send();
 */
declare class Image_2 {
    /**
     * @param {Geometry} geometry The geometry of the image.
     * @param {TypedArray} buffer The image data as a one dimensional buffer.
     * @param {Array} [imageUids] An array of Uids indexed to slice number.
     */
    constructor(geometry: Geometry, buffer: Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array, imageUids?: any[]);
    /**
     * Get the image UID at a given index.
     *
     * @param {Index} [index] The index at which to get the id.
     * @returns {string} The UID.
     */
    getImageUid(index?: Index): string;
    /**
     * Get the geometry of the image.
     *
     * @returns {Geometry} The geometry.
     */
    getGeometry(): Geometry;
    /**
     * Get the data buffer of the image.
     *
     * @todo dangerous...
     * @returns {TypedArray} The data buffer of the image.
     */
    getBuffer(): Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array;
    /**
     * Can the image values be quantified?
     *
     * @returns {boolean} True if only one component.
     */
    canQuantify(): boolean;
    /**
     * Can window and level be applied to the data?
     *
     * @returns {boolean} True if the data is monochrome.
     */
    canWindowLevel(): boolean;
    /**
     * Can the data be scrolled?
     *
     * @param {Matrix33} viewOrientation The view orientation.
     * @returns {boolean} True if the data has a third dimension greater than one
     *   after applying the view orientation.
     */
    canScroll(viewOrientation: Matrix33): boolean;
    /**
     * Get the secondary offset: an offset that takes into account
     *   the slice and above dimension numbers.
     *
     * @param {Index} index The index.
     * @returns {number} The offset.
     */
    getSecondaryOffset(index: Index): number;
    /**
     * Get the rescale slope and intercept.
     *
     * @param {Index} [index] The index (only needed for non constant rsi).
     * @returns {object} The rescale slope and intercept.
     */
    getRescaleSlopeAndIntercept(index?: Index): object;
    /**
     * Set the rescale slope and intercept.
     *
     * @param {object} inRsi The input rescale slope and intercept.
     * @param {number} [offset] The rsi offset (only needed for non constant rsi).
     */
    setRescaleSlopeAndIntercept(inRsi: object, offset?: number): void;
    /**
     * Are all the RSIs identity (1,0).
     *
     * @returns {boolean} True if they are.
     */
    isIdentityRSI(): boolean;
    /**
     * Are all the RSIs equal.
     *
     * @returns {boolean} True if they are.
     */
    isConstantRSI(): boolean;
    /**
     * Get the photometricInterpretation of the image.
     *
     * @returns {string} The photometricInterpretation of the image.
     */
    getPhotometricInterpretation(): string;
    /**
     * Set the photometricInterpretation of the image.
     *
     * @param {string} interp The photometricInterpretation of the image.
     */
    setPhotometricInterpretation(interp: string): void;
    /**
     * Get the planarConfiguration of the image.
     *
     * @returns {number} The planarConfiguration of the image.
     */
    getPlanarConfiguration(): number;
    /**
     * Set the planarConfiguration of the image.
     *
     * @param {number} config The planarConfiguration of the image.
     */
    setPlanarConfiguration(config: number): void;
    /**
     * Get the numberOfComponents of the image.
     *
     * @returns {number} The numberOfComponents of the image.
     */
    getNumberOfComponents(): number;
    /**
     * Get the meta information of the image.
     *
     * @returns {object} The meta information of the image.
     */
    getMeta(): object;
    /**
     * Set the meta information of the image.
     *
     * @param {object} rhs The meta information of the image.
     */
    setMeta(rhs: object): void;
    /**
     * Get value at offset. Warning: No size check...
     *
     * @param {number} offset The desired offset.
     * @returns {number} The value at offset.
     */
    getValueAtOffset(offset: number): number;
    /**
     * Get the offsets where the buffer equals the input value.
     * Loops through the whole volume, can get long for big data...
     *
     * @param {number|object} value The value to check.
     * @returns {Array} The list of offsets.
     */
    getOffsets(value: number | object): any[];
    /**
     * Check if the input values are in the buffer.
     * Could loop through the whole volume, can get long for big data...
     *
     * @param {Array} values The values to check.
     * @returns {Array} A list of booleans for each input value,
     *   set to true if the value is present in the buffer.
     */
    hasValues(values: any[]): any[];
    /**
     * Clone the image.
     *
     * @returns {Image} A clone of this image.
     */
    clone(): Image_2;
    /**
     * Append a slice to the image.
     *
     * @param {Image} rhs The slice to append.
     */
    appendSlice(rhs: Image_2): void;
    /**
     * Append a frame buffer to the image.
     *
     * @param {object} frameBuffer The frame buffer to append.
     * @param {number} frameIndex The frame index.
     */
    appendFrameBuffer(frameBuffer: object, frameIndex: number): void;
    /**
     * Append a frame to the image.
     *
     * @param {number} time The frame time value.
     * @param {Point3D} origin The origin of the frame.
     */
    appendFrame(time: number, origin: Point3D): void;
    /**
     * Get the data range.
     *
     * @returns {object} The data range.
     */
    getDataRange(): object;
    /**
     * Get the rescaled data range.
     *
     * @returns {object} The rescaled data range.
     */
    getRescaledDataRange(): object;
    /**
     * Get the histogram.
     *
     * @returns {Array} The histogram.
     */
    getHistogram(): any[];
    /**
     * Add an event listener to this class.
     *
     * @param {string} type The event type.
     * @param {Function} callback The function associated with the provided
     *   event type, will be called with the fired event.
     */
    addEventListener(type: string, callback: Function): void;
    /**
     * Remove an event listener from this class.
     *
     * @param {string} type The event type.
     * @param {Function} callback The function associated with the provided
     *   event type.
     */
    removeEventListener(type: string, callback: Function): void;
    /**
     * Set the inner buffer values at given offsets.
     *
     * @param {Array} offsets List of offsets where to set the data.
     * @param {object} value The value to set at the given offsets.
     * @fires Image#imagechange
     */
    setAtOffsets(offsets: any[], value: object): void;
    /**
     * Set the inner buffer values at given offsets.
     *
     * @param {Array} offsetsLists List of offset lists where to set the data.
     * @param {object} value The value to set at the given offsets.
     * @returns {Array} A list of objects representing the original values before
     *  replacing them.
     * @fires Image#imagechange
     */
    setAtOffsetsAndGetOriginals(offsetsLists: any[], value: object): any[];
    /**
     * Set the inner buffer values at given offsets.
     *
     * @param {Array} offsetsLists List of offset lists where to set the data.
     * @param {object|Array} value The value to set at the given offsets.
     * @fires Image#imagechange
     */
    setAtOffsetsWithIterator(offsetsLists: any[], value: object | any[]): void;
    /**
     * Get the value of the image at a specific coordinate.
     *
     * @param {number} i The X index.
     * @param {number} j The Y index.
     * @param {number} k The Z index.
     * @param {number} f The frame number.
     * @returns {number} The value at the desired position.
     * Warning: No size check...
     */
    getValue(i: number, j: number, k: number, f: number): number;
    /**
     * Get the value of the image at a specific index.
     *
     * @param {Index} index The index.
     * @returns {number} The value at the desired position.
     * Warning: No size check...
     */
    getValueAtIndex(index: Index): number;
    /**
     * Get the rescaled value of the image at a specific position.
     *
     * @param {number} i The X index.
     * @param {number} j The Y index.
     * @param {number} k The Z index.
     * @param {number} f The frame number.
     * @returns {number} The rescaled value at the desired position.
     * Warning: No size check...
     */
    getRescaledValue(i: number, j: number, k: number, f: number): number;
    /**
     * Get the rescaled value of the image at a specific index.
     *
     * @param {Index} index The index.
     * @returns {number} The rescaled value at the desired position.
     * Warning: No size check...
     */
    getRescaledValueAtIndex(index: Index): number;
    /**
     * Get the rescaled value of the image at a specific offset.
     *
     * @param {number} offset The desired offset.
     * @returns {number} The rescaled value at the desired offset.
     * Warning: No size check...
     */
    getRescaledValueAtOffset(offset: number): number;
    /**
     * Calculate the data range of the image.
     * WARNING: for speed reasons, only calculated on the first frame...
     *
     * @returns {object} The range {min, max}.
     */
    calculateDataRange(): object;
    /**
     * Calculate the rescaled data range of the image.
     * WARNING: for speed reasons, only calculated on the first frame...
     *
     * @returns {object} The range {min, max}.
     */
    calculateRescaledDataRange(): object;
    /**
     * Calculate the histogram of the image.
     *
     * @returns {object} The histogram, data range and rescaled data range.
     */
    calculateHistogram(): object;
    /**
     * Convolute the image with a given 2D kernel.
     *
     * Note: Uses raw buffer values.
     *
     * @param {Array} weights The weights of the 2D kernel as a 3x3 matrix.
     * @returns {Image} The convoluted image.
     */
    convolute2D(weights: any[]): Image_2;
    /**
     * Convolute an image buffer with a given 2D kernel.
     *
     * Note: Uses raw buffer values.
     *
     * @param {Array} weights The weights of the 2D kernel as a 3x3 matrix.
     * @param {TypedArray} buffer The buffer to convolute.
     * @param {number} startOffset The index to start at.
     */
    convoluteBuffer(weights: any[], buffer: Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array, startOffset: number): void;
    /**
     * Transform an image using a specific operator.
     * WARNING: no size check!
     *
     * @param {Function} operator The operator to use when transforming.
     * @returns {Image} The transformed image.
     * Note: Uses the raw buffer values.
     */
    transform(operator: Function): Image_2;
    /**
     * Compose this image with another one and using a specific operator.
     * WARNING: no size check!
     *
     * @param {Image} rhs The image to compose with.
     * @param {Function} operator The operator to use when composing.
     * @returns {Image} The composed image.
     * Note: Uses the raw buffer values.
     */
    compose(rhs: Image_2, operator: Function): Image_2;
    #private;
}
export { Image_2 as Image }

/**
 * Immutable index.
 * Warning: the input array is NOT cloned, modifying it will
 *  modify the index values.
 */
export declare class Index {
    /**
     * @param {number[]} values The index values.
     */
    constructor(values: number[]);
    /**
     * Get the index value at the given array index.
     *
     * @param {number} i The index to get.
     * @returns {number|undefined} The value or undefined if not in range.
     */
    get(i: number): number | undefined;
    /**
     * Get the length of the index.
     *
     * @returns {number} The length.
     */
    length(): number;
    /**
     * Get a string representation of the Index.
     *
     * @returns {string} The Index as a string.
     */
    toString(): string;
    /**
     * Get the values of this index.
     *
     * @returns {number[]} The array of values.
     */
    getValues(): number[];
    /**
     * Check if the input index can be compared to this one.
     *
     * @param {Index} rhs The index to compare to.
     * @returns {boolean} True if both indices are comparable.
     */
    canCompare(rhs: Index): boolean;
    /**
     * Check for Index equality.
     *
     * @param {Index} rhs The index to compare to.
     * @returns {boolean} True if both indices are equal.
     */
    equals(rhs: Index): boolean;
    /**
     * Compare indices and return different dimensions.
     *
     * @param {Index} rhs The index to compare to.
     * @returns {number[]} The list of different dimensions.
     */
    compare(rhs: Index): number[];
    /**
     * Add another index to this one.
     *
     * @param {Index} rhs The index to add.
     * @returns {Index} The index representing the sum of both indices.
     */
    add(rhs: Index): Index;
    /**
     * Get the current index with a new 2D base.
     *
     * @param {number} i The new 0 index.
     * @param {number} j The new 1 index.
     * @returns {Index} The new index.
     */
    getWithNew2D(i: number, j: number): Index;
    /**
     * Get a string id from the index values in the form of: '#0-1_#1-2'.
     *
     * @param {number[]} [dims] Optional list of dimensions to use.
     * @returns {string} The string id.
     */
    toStringId(dims?: number[]): string;
    #private;
}

/**
 * Layer group.
 *
 * Display position: {x,y}
 * Plane position: Index (access: get(i))
 * (world) Position: Point3D (access: getX, getY, getZ)
 *
 * Display -> World:
 * planePos = viewLayer.displayToPlanePos(displayPos)
 * -> compensate for layer scale and offset
 * pos = viewController.getPositionFromPlanePoint(planePos)
 *
 * World -> display
 * planePos = viewController.getOffset3DFromPlaneOffset(pos)
 * no need yet for a planePos to displayPos...
 */
export declare class LayerGroup {
    /**
     * @param {HTMLElement} containerDiv The associated HTML div.
     */
    constructor(containerDiv: HTMLElement);
    /**
     * Get the target orientation.
     *
     * @returns {Matrix33} The orientation matrix.
     */
    getTargetOrientation(): Matrix33;
    /**
     * Set the target orientation.
     *
     * @param {Matrix33} orientation The orientation matrix.
     */
    setTargetOrientation(orientation: Matrix33): void;
    /**
     * Get the showCrosshair flag.
     *
     * @returns {boolean} True to display the crosshair.
     */
    getShowCrosshair(): boolean;
    /**
     * Set the showCrosshair flag.
     *
     * @param {boolean} flag True to display the crosshair.
     */
    setShowCrosshair(flag: boolean): void;
    /**
     * Get the Id of the container div.
     *
     * @returns {string} The id of the div.
     */
    getDivId(): string;
    /**
     * Get the layer scale.
     *
     * @returns {object} The scale as {x,y,z}.
     */
    getScale(): object;
    /**
     * Get the base scale.
     *
     * @returns {object} The scale as {x,y,z}.
     */
    getBaseScale(): object;
    /**
     * Get the added scale: the scale added to the base scale
     *
     * @returns {object} The scale as {x,y,z}.
     */
    getAddedScale(): object;
    /**
     * Get the layer offset.
     *
     * @returns {object} The offset as {x,y,z}.
     */
    getOffset(): object;
    /**
     * Get the number of layers handled by this class.
     *
     * @returns {number} The number of layers.
     */
    getNumberOfLayers(): number;
    /**
     * Get the active image layer.
     *
     * @returns {ViewLayer} The layer.
     */
    getActiveViewLayer(): ViewLayer;
    /**
     * Get the view layers associated to a data index.
     *
     * @param {number} index The data index.
     * @returns {ViewLayer[]} The layers.
     */
    getViewLayersByDataIndex(index: number): ViewLayer[];
    /**
     * Search view layers for equal imae meta data.
     *
     * @param {object} meta The meta data to find.
     * @returns {ViewLayer[]} The list of view layers that contain matched data.
     */
    searchViewLayers(meta: object): ViewLayer[];
    /**
     * Get the view layers data indices.
     *
     * @returns {Array} The list of indices.
     */
    getViewDataIndices(): any[];
    /**
     * Get the active draw layer.
     *
     * @returns {DrawLayer} The layer.
     */
    getActiveDrawLayer(): DrawLayer;
    /**
     * Get the draw layers associated to a data index.
     *
     * @param {number} index The data index.
     * @returns {DrawLayer[]} The layers.
     */
    getDrawLayersByDataIndex(index: number): DrawLayer[];
    /**
     * Set the active view layer.
     *
     * @param {number} index The index of the layer to set as active.
     */
    setActiveViewLayer(index: number): void;
    /**
     * Set the active view layer with a data index.
     *
     * @param {number} index The data index.
     */
    setActiveViewLayerByDataIndex(index: number): void;
    /**
     * Set the active draw layer.
     *
     * @param {number} index The index of the layer to set as active.
     */
    setActiveDrawLayer(index: number): void;
    /**
     * Set the active draw layer with a data index.
     *
     * @param {number} index The data index.
     */
    setActiveDrawLayerByDataIndex(index: number): void;
    /**
     * Add a view layer.
     *
     * @returns {ViewLayer} The created layer.
     */
    addViewLayer(): ViewLayer;
    /**
     * Add a draw layer.
     *
     * @returns {DrawLayer} The created layer.
     */
    addDrawLayer(): DrawLayer;
    /**
     * Empty the layer list.
     */
    empty(): void;
    /**
     * Update layers (but not the active view layer) to a position change.
     *
     * @param {object} event The position change event.
     * @function
     */
    updateLayersToPositionChange: (event: object) => void;
    /**
     * Calculate the fit scale: the scale that fits the largest data.
     *
     * @returns {number|undefined} The fit scale.
     */
    calculateFitScale(): number | undefined;
    /**
     * Set the layer group fit scale.
     *
     * @param {number} scaleIn The fit scale.
     */
    setFitScale(scaleIn: number): void;
    /**
     * Get the largest data size.
     *
     * @returns {object|undefined} The largest size as {x,y}.
     */
    getMaxSize(): object | undefined;
    /**
     * Flip all layers along the Z axis without offset compensation.
     */
    flipScaleZ(): void;
    /**
     * Add scale to the layers. Scale cannot go lower than 0.1.
     *
     * @param {number} scaleStep The scale to add.
     * @param {Point3D} center The scale center Point3D.
     */
    addScale(scaleStep: number, center: Point3D): void;
    /**
     * Set the layers' scale.
     *
     * @param {object} newScale The scale to apply as {x,y,z}.
     * @param {Point3D} [center] The scale center Point3D.
     * @fires LayerGroup#zoomchange
     */
    setScale(newScale: object, center?: Point3D): void;
    /**
     * Add translation to the layers.
     *
     * @param {object} translation The translation as {x,y,z}.
     */
    addTranslation(translation: object): void;
    /**
     * Set the layers' offset.
     *
     * @param {object} newOffset The offset as {x,y,z}.
     * @fires LayerGroup#offsetchange
     */
    setOffset(newOffset: object): void;
    /**
     * Reset the stage to its initial scale and no offset.
     */
    reset(): void;
    /**
     * Draw the layer.
     */
    draw(): void;
    /**
     * Display the layer.
     *
     * @param {boolean} flag Whether to display the layer or not.
     */
    display(flag: boolean): void;
    /**
     * Add an event listener to this class.
     *
     * @param {string} type The event type.
     * @param {Function} callback The function associated with the provided
     *   event type, will be called with the fired event.
     */
    addEventListener(type: string, callback: Function): void;
    /**
     * Remove an event listener from this class.
     *
     * @param {string} type The event type.
     * @param {Function} callback The function associated with the provided
     *   event type.
     */
    removeEventListener(type: string, callback: Function): void;
    #private;
}

export declare namespace logger {
    export namespace levels {
        const TRACE: number;
        const DEBUG: number;
        const INFO: number;
        const WARN: number;
        const ERROR: number;
    }
    const level: number;
    export function trace(msg: string): void;
    export function debug(msg: string): void;
    export function info(msg: string): void;
    export function warn(msg: string): void;
    export function error(msg: string): void;
}

/**
 * List of available lookup tables (lut).
 *
 * @type {Object<string, ColourMap>}
 */
export declare const luts: {
    [x: string]: ColourMap;
};

/**
 * Immutable 3x3 Matrix.
 */
export declare class Matrix33 {
    /**
     * @param {Array} values row-major ordered 9 values.
     */
    constructor(values: any[]);
    /**
     * Get a value of the matrix.
     *
     * @param {number} row The row at wich to get the value.
     * @param {number} col The column at wich to get the value.
     * @returns {number} The value at the position.
     */
    get(row: number, col: number): number;
    /**
     * Get the inverse of this matrix.
     *
     * @returns {Matrix33|undefined} The inverse matrix or undefined
     *   if the determinant is zero.
     */
    getInverse(): Matrix33 | undefined;
    /**
     * Check for Matrix33 equality.
     *
     * @param {Matrix33} rhs The other matrix to compare to.
     * @param {number} [p] A numeric expression for the precision to use in check
     *   (ex: 0.001). Defaults to Number.EPSILON if not provided.
     * @returns {boolean} True if both matrices are equal.
     */
    equals(rhs: Matrix33, p?: number): boolean;
    /**
     * Get a string representation of the Matrix33.
     *
     * @returns {string} The matrix as a string.
     */
    toString(): string;
    /**
     * Multiply this matrix by another.
     *
     * @param {Matrix33} rhs The matrix to multiply by.
     * @returns {Matrix33} The product matrix.
     */
    multiply(rhs: Matrix33): Matrix33;
    /**
     * Get the absolute value of this matrix.
     *
     * @returns {Matrix33} The result matrix.
     */
    getAbs(): Matrix33;
    /**
     * Multiply this matrix by a 3D array.
     *
     * @param {Array} array3D The input 3D array.
     * @returns {Array} The result 3D array.
     */
    multiplyArray3D(array3D: any[]): any[];
    /**
     * Multiply this matrix by a 3D vector.
     *
     * @param {Vector3D} vector3D The input 3D vector.
     * @returns {Vector3D} The result 3D vector.
     */
    multiplyVector3D(vector3D: Vector3D): Vector3D;
    /**
     * Multiply this matrix by a 3D point.
     *
     * @param {Point3D} point3D The input 3D point.
     * @returns {Point3D} The result 3D point.
     */
    multiplyPoint3D(point3D: Point3D): Point3D;
    /**
     * Multiply this matrix by a 3D index.
     *
     * @param {Index} index3D The input 3D index.
     * @returns {Index} The result 3D index.
     */
    multiplyIndex3D(index3D: Index): Index;
    /**
     * Get the index of the maximum in absolute value of a row.
     *
     * @param {number} row The row to get the maximum from.
     * @returns {object} The {value,index} of the maximum.
     */
    getRowAbsMax(row: number): object;
    /**
     * Get the index of the maximum in absolute value of a column.
     *
     * @param {number} col The column to get the maximum from.
     * @returns {object} The {value,index} of the maximum.
     */
    getColAbsMax(col: number): object;
    /**
     * Get this matrix with only zero and +/- ones instead of the maximum,
     *
     * @returns {Matrix33} The simplified matrix.
     */
    asOneAndZeros(): Matrix33;
    /**
     * Get the third column direction index of an orientation matrix.
     *
     * @returns {number} The index of the absolute maximum of the last column.
     */
    getThirdColMajorDirection(): number;
    #private;
}

/**
 * Immutable point.
 * Warning: the input array is NOT cloned, modifying it will
 *  modify the index values.
 */
export declare class Point {
    /**
     * @param {number[]} values The point values.
     */
    constructor(values: number[]);
    /**
     * Get the index value at the given array index.
     *
     * @param {number} i The index to get.
     * @returns {number} The value.
     */
    get(i: number): number;
    /**
     * Get the length of the index.
     *
     * @returns {number} The length.
     */
    length(): number;
    /**
     * Get a string representation of the Index.
     *
     * @returns {string} The Index as a string.
     */
    toString(): string;
    /**
     * Get the values of this index.
     *
     * @returns {number[]} The array of values.
     */
    getValues(): number[];
    /**
     * Check if the input point can be compared to this one.
     *
     * @param {Point} rhs The point to compare to.
     * @returns {boolean} True if both points are comparable.
     */
    canCompare(rhs: Point): boolean;
    /**
     * Check for Point equality.
     *
     * @param {Point} rhs The point to compare to.
     * @returns {boolean} True if both points are equal.
     */
    equals(rhs: Point): boolean;
    /**
     * Compare points and return different dimensions.
     *
     * @param {Point} rhs The point to compare to.
     * @returns {number[]} The list of different dimensions.
     */
    compare(rhs: Point): number[];
    /**
     * Get the 3D part of this point.
     *
     * @returns {Point3D} The Point3D.
     */
    get3D(): Point3D;
    /**
     * Add another point to this one.
     *
     * @param {Point} rhs The point to add.
     * @returns {Point} The point representing the sum of both points.
     */
    add(rhs: Point): Point;
    /**
     * Merge this point with a Point3D to create a new point.
     *
     * @param {Point3D} rhs The Point3D to merge with.
     * @returns {Point} The merge result.
     */
    mergeWith3D(rhs: Point3D): Point;
    #private;
}

/**
 * Immutable 2D point.
 */
export declare class Point2D {
    /**
     * @param {number} x The X coordinate for the point.
     * @param {number} y The Y coordinate for the point.
     */
    constructor(x: number, y: number);
    /**
     * Get the X position of the point.
     *
     * @returns {number} The X position of the point.
     */
    getX(): number;
    /**
     * Get the Y position of the point.
     *
     * @returns {number} The Y position of the point.
     */
    getY(): number;
    /**
     * Check for Point2D equality.
     *
     * @param {Point2D} rhs The other point to compare to.
     * @returns {boolean} True if both points are equal.
     */
    equals(rhs: Point2D): boolean;
    /**
     * Get a string representation of the Point2D.
     *
     * @returns {string} The point as a string.
     */
    toString(): string;
    /**
     * Get the distance to another Point2D.
     *
     * @param {Point2D} point2D The input point.
     * @returns {number} The distance to the input point.
     */
    getDistance(point2D: Point2D): number;
    /**
     * Round a Point2D.
     *
     * @returns {Point2D} The rounded point.
     */
    getRound(): Point2D;
    #private;
}

/**
 * Immutable 3D point.
 */
export declare class Point3D {
    /**
     * @param {number} x The X coordinate for the point.
     * @param {number} y The Y coordinate for the point.
     * @param {number} z The Z coordinate for the point.
     */
    constructor(x: number, y: number, z: number);
    /**
     * Get the X position of the point.
     *
     * @returns {number} The X position of the point.
     */
    getX(): number;
    /**
     * Get the Y position of the point.
     *
     * @returns {number} The Y position of the point.
     */
    getY(): number;
    /**
     * Get the Z position of the point.
     *
     * @returns {number} The Z position of the point.
     */
    getZ(): number;
    /**
     * Check for Point3D equality.
     *
     * @param {Point3D} rhs The other point to compare to.
     * @returns {boolean} True if both points are equal.
     */
    equals(rhs: Point3D): boolean;
    /**
     * Check for Point3D similarity.
     *
     * @param {Point3D} rhs The other point to compare to.
     * @param {number} tol Optional comparison tolerance,
     *   default to Number.EPSILON.
     * @returns {boolean} True if both points are equal.
     */
    isSimilar(rhs: Point3D, tol: number): boolean;
    /**
     * Get a string representation of the Point3D.
     *
     * @returns {string} The point as a string.
     */
    toString(): string;
    /**
     * Get the distance to another Point3D.
     *
     * @param {Point3D} point3D The input point.
     * @returns {number} Ths distance to the input point.
     */
    getDistance(point3D: Point3D): number;
    /**
     * Get the difference to another Point3D.
     *
     * @param {Point3D} point3D The input point.
     * @returns {Vector3D} The 3D vector from the input point to this one.
     */
    minus(point3D: Point3D): Vector3D;
    #private;
}

/**
 * Round a float number to a given precision.
 * Inspired from https://stackoverflow.com/a/49729715/3639892.
 * Can be a solution to not have trailing zero as when
 * using toFixed or toPrecision.
 * '+number.toFixed(precision)' does not pass all the tests...
 *
 * @param {number} number The number to round.
 * @param {number} precision The rounding precision.
 * @returns {number} The rounded number.
 */
export declare function precisionRound(number: number, precision: number): number;

/**
 * Rescale LUT class.
 * Typically converts from integer to float.
 */
export declare class RescaleLut {
    /**
     * @param {RescaleSlopeAndIntercept} rsi The rescale slope and intercept.
     * @param {number} bitsStored The number of bits used to store the data.
     */
    constructor(rsi: RescaleSlopeAndIntercept, bitsStored: number);
    /**
     * Get the Rescale Slope and Intercept (RSI).
     *
     * @returns {RescaleSlopeAndIntercept} The rescale slope and intercept object.
     */
    getRSI(): RescaleSlopeAndIntercept;
    /**
     * Is the lut ready to use or not? If not, the user must
     * call 'initialise'.
     *
     * @returns {boolean} True if the lut is ready to use.
     */
    isReady(): boolean;
    /**
     * Initialise the LUT.
     */
    initialise(): void;
    /**
     * Get the length of the LUT array.
     *
     * @returns {number} The length of the LUT array.
     */
    getLength(): number;
    /**
     * Get the value of the LUT at the given offset.
     *
     * @param {number} offset The input offset in [0,2^bitsStored] range.
     * @returns {number} The float32 value of the LUT at the given offset.
     */
    getValue(offset: number): number;
    #private;
}

/**
 * Rescale Slope and Intercept
 */
export declare class RescaleSlopeAndIntercept {
    /**
     * @param {number} slope The slope of the RSI.
     * @param {number} intercept The intercept of the RSI.
     */
    constructor(slope: number, intercept: number);
    /**
     * Get the slope of the RSI.
     *
     * @returns {number} The slope of the RSI.
     */
    getSlope(): number;
    /**
     * Get the intercept of the RSI.
     *
     * @returns {number} The intercept of the RSI.
     */
    getIntercept(): number;
    /**
     * Apply the RSI on an input value.
     *
     * @param {number} value The input value.
     * @returns {number} The value to rescale.
     */
    apply(value: number): number;
    /**
     * Check for RSI equality.
     *
     * @param {RescaleSlopeAndIntercept} rhs The other RSI to compare to.
     * @returns {boolean} True if both RSI are equal.
     */
    equals(rhs: RescaleSlopeAndIntercept): boolean;
    /**
     * Get a string representation of the RSI.
     *
     * @returns {string} The RSI as a string.
     */
    toString(): string;
    /**
     * Is this RSI an ID RSI.
     *
     * @returns {boolean} True if the RSI has a slope of 1 and no intercept.
     */
    isID(): boolean;
    #private;
}

/**
 * Immutable Size class.
 * Warning: the input array is NOT cloned, modifying it will
 *  modify the index values.
 */
export declare class Size {
    /**
     * @param {Array} values The size values.
     */
    constructor(values: any[]);
    /**
     * Get the size value at the given array index.
     *
     * @param {number} i The index to get.
     * @returns {number} The value.
     */
    get(i: number): number;
    /**
     * Get the length of the index.
     *
     * @returns {number} The length.
     */
    length(): number;
    /**
     * Get a string representation of the size.
     *
     * @returns {string} The Size as a string.
     */
    toString(): string;
    /**
     * Get the values of this index.
     *
     * @returns {Array} The array of values.
     */
    getValues(): any[];
    /**
     * Check if a dimension exists and has more than one element.
     *
     * @param {number} dimension The dimension to check.
     * @returns {boolean} True if the size is more than one.
     */
    moreThanOne(dimension: number): boolean;
    /**
     * Check if the associated data is scrollable in 3D.
     *
     * @param {Matrix33} [viewOrientation] The orientation matrix.
     * @returns {boolean} True if scrollable.
     */
    canScroll3D(viewOrientation?: Matrix33): boolean;
    /**
     * Check if the associated data is scrollable: either in 3D or
     * in other directions.
     *
     * @param {Matrix33} viewOrientation The orientation matrix.
     * @returns {boolean} True if scrollable.
     */
    canScroll(viewOrientation: Matrix33): boolean;
    /**
     * Get the size of a given dimension.
     *
     * @param {number} dimension The dimension.
     * @param {number} [start] Optional start dimension to start counting from.
     * @returns {number} The size.
     */
    getDimSize(dimension: number, start?: number): number;
    /**
     * Get the total size.
     *
     * @param {number} [start] Optional start dimension to base the offset on.
     * @returns {number} The total size.
     */
    getTotalSize(start?: number): number;
    /**
     * Check for equality.
     *
     * @param {Size} rhs The object to compare to.
     * @returns {boolean} True if both objects are equal.
     */
    equals(rhs: Size): boolean;
    /**
     * Check that an index is within bounds.
     *
     * @param {Index} index The index to check.
     * @param {Array} dirs Optional list of directions to check.
     * @returns {boolean} True if the given coordinates are within bounds.
     */
    isInBounds(index: Index, dirs: any[]): boolean;
    /**
     * Convert an index to an offset in memory.
     *
     * @param {Index} index The index to convert.
     * @param {number} [start] Optional start dimension to base the offset on.
     * @returns {number} The offset.
     */
    indexToOffset(index: Index, start?: number): number;
    /**
     * Convert an offset in memory to an index.
     *
     * @param {number} offset The offset to convert.
     * @returns {Index} The index.
     */
    offsetToIndex(offset: number): Index;
    /**
     * Get the 2D base of this size.
     *
     * @returns {object} The 2D base [0,1] as {x,y}.
     */
    get2D(): object;
    #private;
}

/**
 * Immutable Spacing class.
 * Warning: the input array is NOT cloned, modifying it will
 *  modify the index values.
 */
export declare class Spacing {
    /**
     * @param {Array} values The spacing values.
     */
    constructor(values: any[]);
    /**
     * Get the spacing value at the given array index.
     *
     * @param {number} i The index to get.
     * @returns {number} The value.
     */
    get(i: number): number;
    /**
     * Get the length of the spacing.
     *
     * @returns {number} The length.
     */
    length(): number;
    /**
     * Get a string representation of the spacing.
     *
     * @returns {string} The spacing as a string.
     */
    toString(): string;
    /**
     * Get the values of this spacing.
     *
     * @returns {Array} The array of values.
     */
    getValues(): any[];
    /**
     * Check for equality.
     *
     * @param {Spacing} rhs The object to compare to.
     * @returns {boolean} True if both objects are equal.
     */
    equals(rhs: Spacing): boolean;
    /**
     * Get the 2D base of this size.
     *
     * @returns {object} The 2D base [col,row] as {x,y}.
     */
    get2D(): object;
    #private;
}

/**
 * Immutable tag.
 */
export declare class Tag {
    /**
     * @param {string} group The tag group as '####'.
     * @param {string} element The tag element as '####'.
     */
    constructor(group: string, element: string);
    /**
     * Get the tag group.
     *
     * @returns {string} The tag group.
     */
    getGroup(): string;
    /**
     * Get the tag element.
     *
     * @returns {string} The tag element.
     */
    getElement(): string;
    /**
     * Get as string representation of the tag: 'key: name'.
     *
     * @returns {string} A string representing the tag.
     */
    toString(): string;
    /**
     * Check for Tag equality.
     *
     * @param {Tag} rhs The other tag to compare to.
     * @returns {boolean} True if both tags are equal.
     */
    equals(rhs: Tag): boolean;
    /**
     * Get the group-element key used to store DICOM elements.
     *
     * @returns {string} The key as '########'.
     */
    getKey(): string;
    /**
     * Get the group name as defined in TagGroups.
     *
     * @returns {string} The name.
     */
    getGroupName(): string;
    /**
     * Does this tag have a VR.
     * Basically not the Item, ItemDelimitationItem nor
     *  SequenceDelimitationItem tags.
     *
     * @returns {boolean} True if this tag has a VR.
     */
    isWithVR(): boolean;
    /**
     * Is the tag group a private tag group ?
     * see: http://dicom.nema.org/medical/dicom/2015a/output/html/part05.html#sect_7.8
     *
     * @returns {boolean} True if the tag group is private,
     *   ie if its group is an odd number.
     */
    isPrivate(): boolean;
    /**
     * Get the tag info from the dicom dictionary.
     *
     * @returns {Array|undefined} The info as [vr, multiplicity, name].
     */
    getInfoFromDictionary(): any[] | undefined;
    /**
     * Get the tag Value Representation (VR) from the dicom dictionary.
     *
     * @returns {string|undefined} The VR.
     */
    getVrFromDictionary(): string | undefined;
    /**
     * Get the tag name from the dicom dictionary.
     *
     * @returns {string|undefined} The VR.
     */
    getNameFromDictionary(): string | undefined;
    #private;
}

/**
 * Methods used to extract values from DICOM elements.
 *
 * Implemented as class and method to allow for override via its prototype.
 */
export declare class TagValueExtractor {
    /**
     * Get the time.
     *
     * @param {Object<string, DataElement>} _elements The DICOM elements.
     * @returns {number|undefined} The time value if available.
     */
    getTime(_elements: {
        [x: string]: DataElement;
    }): number | undefined;
}

/**
 * Toolbox controller.
 */
export declare class ToolboxController {
    /**
     * @param {object} toolList The list of tool objects.
     */
    constructor(toolList: object);
    /**
     * Initialise.
     */
    init(): void;
    /**
     * Get the tool list.
     *
     * @returns {Array} The list of tool objects.
     */
    getToolList(): any[];
    /**
     * Check if a tool is in the tool list.
     *
     * @param {string} name The name to check.
     * @returns {boolean} The tool list element for the given name.
     */
    hasTool(name: string): boolean;
    /**
     * Get the selected tool.
     *
     * @returns {object} The selected tool.
     */
    getSelectedTool(): object;
    /**
     * Get the selected tool event handler.
     *
     * @param {string} eventType The event type, for example
     *   mousedown, touchstart...
     * @returns {Function} The event handler.
     */
    getSelectedToolEventHandler(eventType: string): Function;
    /**
     * Set the selected tool.
     *
     * @param {string} name The name of the tool.
     */
    setSelectedTool(name: string): void;
    /**
     * Set the selected tool live features.
     *
     * @param {object} list The list of features.
     */
    setToolFeatures(list: object): void;
    /**
     * Listen to layer interaction events.
     *
     * @param {object} layer The layer to listen to.
     * @param {string} layerGroupDivId The associated layer group div id.
     */
    bindLayer(layer: object, layerGroupDivId: string): void;
    #private;
}

/**
 * Tool configuration.
 */
export declare class ToolConfig {
    /**
     * @param {string[]} [options] Optional tool options.
     */
    constructor(options?: string[]);
    /**
     * Optional tool options.
     * For Draw: list of shape names.
     * For Filter: list of filter names.
     *
     * @type {string[]|undefined}
     */
    options: string[] | undefined;
}

/**
 * Immutable 3D vector.
 */
export declare class Vector3D {
    /**
     * @param {number} x The X component of the vector.
     * @param {number} y The Y component of the vector.
     * @param {number} z The Z component of the vector.
     */
    constructor(x: number, y: number, z: number);
    /**
     * Get the X component of the vector.
     *
     * @returns {number} The X component of the vector.
     */
    getX(): number;
    /**
     * Get the Y component of the vector.
     *
     * @returns {number} The Y component of the vector.
     */
    getY(): number;
    /**
     * Get the Z component of the vector.
     *
     * @returns {number} The Z component of the vector.
     */
    getZ(): number;
    /**
     * Check for Vector3D equality.
     *
     * @param {Vector3D} rhs The other vector to compare to.
     * @returns {boolean} True if both vectors are equal.
     */
    equals(rhs: Vector3D): boolean;
    /**
     * Get a string representation of the Vector3D.
     *
     * @returns {string} The vector as a string.
     */
    toString(): string;
    /**
     * Get the norm of the vector.
     *
     * @returns {number} The norm.
     */
    norm(): number;
    /**
     * Get the cross product with another Vector3D, ie the
     * vector that is perpendicular to both a and b.
     * If both vectors are parallel, the cross product is a zero vector.
     *
     * @see https://en.wikipedia.org/wiki/Cross_product
     * @param {Vector3D} vector3D The input vector.
     * @returns {Vector3D} The result vector.
     */
    crossProduct(vector3D: Vector3D): Vector3D;
    /**
     * Get the dot product with another Vector3D.
     *
     * @see https://en.wikipedia.org/wiki/Dot_product
     * @param {Vector3D} vector3D The input vector.
     * @returns {number} The dot product.
     */
    dotProduct(vector3D: Vector3D): number;
    #private;
}

/**
 * View class.
 *
 * Need to set the window lookup table once created
 * (either directly or with helper methods).
 *
 * @example
 * // XMLHttpRequest onload callback
 * const onload = function (event) {
 *   // parse the dicom buffer
 *   const dicomParser = new dwv.DicomParser();
 *   dicomParser.parse(event.target.response);
 *   // create the image object
 *   const image = createImage(dicomParser.getDicomElements());
 *   // create the view
 *   const view = createView(dicomParser.getDicomElements(), image);
 *   // setup canvas
 *   const canvas = document.createElement('canvas');
 *   canvas.width = 256;
 *   canvas.height = 256;
 *   const ctx = canvas.getContext("2d");
 *   // update the image data
 *   const imageData = ctx.createImageData(256, 256);
 *   view.generateImageData(imageData);
 *   ctx.putImageData(imageData, 0, 0);
 *   // update html
 *   const div = document.getElementById('dwv');
 *   div.appendChild(canvas);;
 * };
 * // DICOM file request
 * const request = new XMLHttpRequest();
 * const url = 'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323851.dcm';
 * request.open('GET', url);
 * request.responseType = 'arraybuffer';
 * request.onload = onload;
 * request.send();
 */
export declare class View {
    /**
     * @param {Image} image The associated image.
     */
    constructor(image: Image_2);
    /**
     * Get the associated image.
     *
     * @returns {Image} The associated image.
     */
    getImage(): Image_2;
    /**
     * Set the associated image.
     *
     * @param {Image} inImage The associated image.
     */
    setImage(inImage: Image_2): void;
    /**
     * Get the view orientation.
     *
     * @returns {Matrix33} The orientation matrix.
     */
    getOrientation(): Matrix33;
    /**
     * Set the view orientation.
     *
     * @param {Matrix33} mat33 The orientation matrix.
     */
    setOrientation(mat33: Matrix33): void;
    /**
     * Initialise the view: set initial index.
     */
    init(): void;
    /**
     * Set the initial index to 0.
     */
    setInitialIndex(): void;
    /**
     * Get the milliseconds per frame from frame rate.
     *
     * @param {number} recommendedDisplayFrameRate Recommended Display Frame Rate.
     * @returns {number} The milliseconds per frame.
     */
    getPlaybackMilliseconds(recommendedDisplayFrameRate: number): number;
    /**
     * @callback alphaFn@callback alphaFn
     * @param {object} value The pixel value.
     * @param {object} index The values' index.
     * @returns {number} The value to display.
     */
    /**
     * Get the alpha function.
     *
     * @returns {alphaFn} The function.
     */
    getAlphaFunction(): (value: object, index: object) => number;
    /**
     * Set alpha function.
     *
     * @param {alphaFn} func The function.
     * @fires View#alphafuncchange
     */
    setAlphaFunction(func: (value: object, index: object) => number): void;
    /**
     * Get the window LUT of the image.
     * Warning: can be undefined in no window/level was set.
     *
     * @param {object} [rsi] Optional image rsi, will take the one of the
     *   current slice otherwise.
     * @returns {WindowLut} The window LUT of the image.
     * @fires View#wlchange
     */
    getCurrentWindowLut(rsi?: object): WindowLut;
    /**
     * Add the window LUT to the list.
     *
     * @param {WindowLut} wlut The window LUT of the image.
     */
    addWindowLut(wlut: WindowLut): void;
    /**
     * Get the window presets.
     *
     * @returns {object} The window presets.
     */
    getWindowPresets(): object;
    /**
     * Get the window presets names.
     *
     * @returns {object} The list of window presets names.
     */
    getWindowPresetsNames(): object;
    /**
     * Set the window presets.
     *
     * @param {object} presets The window presets.
     */
    setWindowPresets(presets: object): void;
    /**
     * Set the default colour map.
     *
     * @param {ColourMap} map The colour map.
     */
    setDefaultColourMap(map: ColourMap): void;
    /**
     * Add window presets to the existing ones.
     *
     * @param {object} presets The window presets.
     */
    addWindowPresets(presets: object): void;
    /**
     * Get the colour map of the image.
     *
     * @returns {ColourMap} The colour map of the image.
     */
    getColourMap(): ColourMap;
    /**
     * Set the colour map of the image.
     *
     * @param {ColourMap} map The colour map of the image.
     * @fires View#colourchange
     */
    setColourMap(map: ColourMap): void;
    /**
     * Get the current position.
     *
     * @returns {Point} The current position.
     */
    getCurrentPosition(): Point;
    /**
     * Get the current index.
     *
     * @returns {Index} The current index.
     */
    getCurrentIndex(): Index;
    /**
     * Check is the provided position can be set.
     *
     * @param {Point} position The position.
     * @returns {boolean} True is the position is in bounds.
     */
    canSetPosition(position: Point): boolean;
    /**
     * Get the origin at a given position.
     *
     * @param {Point} position The position.
     * @returns {Point} The origin.
     */
    getOrigin(position: Point): Point;
    /**
     * Set the current position.
     *
     * @param {Point} position The new position.
     * @param {boolean} silent Flag to fire event or not.
     * @returns {boolean} False if not in bounds
     * @fires View#positionchange
     */
    setCurrentPosition(position: Point, silent: boolean): boolean;
    /**
     * Set the current index.
     *
     * @param {Index} index The new index.
     * @param {boolean} [silent] Flag to fire event or not.
     * @returns {boolean} False if not in bounds.
     * @fires View#positionchange
     */
    setCurrentIndex(index: Index, silent?: boolean): boolean;
    /**
     * Set the view window/level.
     *
     * @param {number} center The window center.
     * @param {number} width The window width.
     * @param {string} [name] Associated preset name, defaults to 'manual'.
     * Warning: uses the latest set rescale LUT or the default linear one.
     * @param {boolean} [silent] Flag to launch events with skipGenerate.
     * @fires View#wlchange
     */
    setWindowLevel(center: number, width: number, name?: string, silent?: boolean): void;
    /**
     * Set the window level to the preset with the input name.
     *
     * @param {string} name The name of the preset to activate.
     * @param {boolean} [silent] Flag to launch events with skipGenerate.
     */
    setWindowLevelPreset(name: string, silent?: boolean): void;
    /**
     * Set the window level to the preset with the input id.
     *
     * @param {number} id The id of the preset to activate.
     * @param {boolean} [silent] Flag to launch events with skipGenerate.
     */
    setWindowLevelPresetById(id: number, silent?: boolean): void;
    /**
     * Add an event listener to this class.
     *
     * @param {string} type The event type.
     * @param {Function} callback The function associated with the provided
     *   event type, will be called with the fired event.
     */
    addEventListener(type: string, callback: Function): void;
    /**
     * Remove an event listener from this class.
     *
     * @param {string} type The event type.
     * @param {Function} callback The function associated with the provided
     *   event type.
     */
    removeEventListener(type: string, callback: Function): void;
    /**
     * Get the image window/level that covers the full data range.
     * Warning: uses the latest set rescale LUT or the default linear one.
     *
     * @returns {WindowCenterAndWidth} A min/max window level.
     */
    getWindowLevelMinMax(): WindowCenterAndWidth;
    /**
     * Set the image window/level to cover the full data range.
     * Warning: uses the latest set rescale LUT or the default linear one.
     */
    setWindowLevelMinMax(): void;
    /**
     * Generate display image data to be given to a canvas.
     *
     * @param {ImageData} data The iamge data to fill in.
     * @param {Index} index Optional index at which to generate,
     *   otherwise generates at current index.
     */
    generateImageData(data: ImageData, index: Index): void;
    /**
     * Increment the provided dimension.
     *
     * @param {number} dim The dimension to increment.
     * @param {boolean} silent Do not send event.
     * @returns {boolean} False if not in bounds.
     */
    incrementIndex(dim: number, silent: boolean): boolean;
    /**
     * Decrement the provided dimension.
     *
     * @param {number} dim The dimension to increment.
     * @param {boolean} silent Do not send event.
     * @returns {boolean} False if not in bounds.
     */
    decrementIndex(dim: number, silent: boolean): boolean;
    /**
     * Get the scroll dimension index.
     *
     * @returns {number} The index.
     */
    getScrollIndex(): number;
    /**
     * Decrement the scroll dimension index.
     *
     * @param {boolean} silent Do not send event.
     * @returns {boolean} False if not in bounds.
     */
    decrementScrollIndex(silent: boolean): boolean;
    /**
     * Increment the scroll dimension index.
     *
     * @param {boolean} silent Do not send event.
     * @returns {boolean} False if not in bounds.
     */
    incrementScrollIndex(silent: boolean): boolean;
    #private;
}

/**
 * View configuration: mainly defines the ´divId´
 * of the associated HTML div.
 */
export declare class ViewConfig {
    /**
     * @param {string} divId The associated HTML div id.
     */
    constructor(divId: string);
    /**
     * Associated HTML div id.
     *
     * @type {string}
     */
    divId: string;
    /**
     * Optional orientation of the data; 'axial', 'coronal' or 'sagittal'.
     * If undefined, will use the data aquisition plane.
     *
     * @type {string|undefined}
     */
    orientation: string | undefined;
    /**
     * Optional view colour map.
     *
     * @type {ColourMap|undefined}
     */
    colourMap: ColourMap | undefined;
    /**
     * Optional layer opacity; in [0, 1] range.
     *
     * @type {number|undefined}
     */
    opacity: number | undefined;
}

/**
 * View controller.
 */
export declare class ViewController {
    /**
     * @param {View} view The associated view.
     * @param {number} index The associated data index.
     */
    constructor(view: View, index: number);
    /**
     * Get the plane helper.
     *
     * @returns {object} The helper.
     */
    getPlaneHelper(): object;
    /**
     * Check is the associated image is a mask.
     *
     * @returns {boolean} True if the associated image is a mask.
     */
    isMask(): boolean;
    /**
     * Get the mask segment helper.
     *
     * @returns {object} The helper.
     */
    getMaskSegmentHelper(): object;
    /**
     * Apply the hidden segments list by setting
     * the corresponding alpha function.
     */
    applyHiddenSegments(): void;
    /**
     * Delete a segment.
     *
     * @param {number} segmentNumber The segment number.
     * @param {Function} exeCallback The post execution callback.
     */
    deleteSegment(segmentNumber: number, exeCallback: Function): void;
    /**
     * Initialise the controller.
     */
    initialise(): void;
    /**
     * Get the window/level presets names.
     *
     * @returns {Array} The presets names.
     */
    getWindowLevelPresetsNames(): any[];
    /**
     * Add window/level presets to the view.
     *
     * @param {object} presets A preset object.
     * @returns {object} The list of presets.
     */
    addWindowLevelPresets(presets: object): object;
    /**
     * Set the window level to the preset with the input name.
     *
     * @param {string} name The name of the preset to activate.
     */
    setWindowLevelPreset(name: string): void;
    /**
     * Set the window level to the preset with the input id.
     *
     * @param {number} id The id of the preset to activate.
     */
    setWindowLevelPresetById(id: number): void;
    /**
     * Check if the controller is playing.
     *
     * @returns {boolean} True if the controler is playing.
     */
    isPlaying(): boolean;
    /**
     * Get the current position.
     *
     * @returns {Point} The position.
     */
    getCurrentPosition(): Point;
    /**
     * Get the current index.
     *
     * @returns {Index} The current index.
     */
    getCurrentIndex(): Index;
    /**
     * Get the current oriented index.
     *
     * @returns {Index} The index.
     */
    getCurrentOrientedIndex(): Index;
    /**
     * Get the scroll index.
     *
     * @returns {number} The index.
     */
    getScrollIndex(): number;
    /**
     * Get the current scroll index value.
     *
     * @returns {object} The value.
     */
    getCurrentScrollIndexValue(): object;
    /**
     * Get the origin at a given posittion.
     *
     * @param {Point} position The input position.
     * @returns {Point} The origin.
     */
    getOrigin(position: Point): Point;
    /**
     * Get the current scroll position value.
     *
     * @returns {object} The value.
     */
    getCurrentScrollPosition(): object;
    /**
     * Generate display image data to be given to a canvas.
     *
     * @param {ImageData} array The array to fill in.
     * @param {Index} index Optional index at which to generate,
     *   otherwise generates at current index.
     */
    generateImageData(array: ImageData, index: Index): void;
    /**
     * Set the associated image.
     *
     * @param {Image} img The associated image.
     * @param {number} index The data index of the image.
     */
    setImage(img: Image_2, index: number): void;
    /**
     * Get the current spacing.
     *
     * @returns {Array} The 2D spacing.
     */
    get2DSpacing(): any[];
    /**
     * Get the image rescaled value at the input position.
     *
     * @param {Point} position the input position.
     * @returns {number|undefined} The image value or undefined if out of bounds
     *   or no quantifiable (for ex RGB).
     */
    getRescaledImageValue(position: Point): number | undefined;
    /**
     * Get the image pixel unit.
     *
     * @returns {string} The unit
     */
    getPixelUnit(): string;
    /**
     * Get some values from the associated image in a region.
     *
     * @param {Point2D} min Minimum point.
     * @param {Point2D} max Maximum point.
     * @returns {Array} A list of values.
     */
    getImageRegionValues(min: Point2D, max: Point2D): any[];
    /**
     * Get some values from the associated image in variable regions.
     *
     * @param {Array} regions A list of regions.
     * @returns {Array} A list of values.
     */
    getImageVariableRegionValues(regions: any[]): any[];
    /**
     * Can the image values be quantified?
     *
     * @returns {boolean} True if possible.
     */
    canQuantifyImage(): boolean;
    /**
     * Can window and level be applied to the data?
     *
     * @returns {boolean} True if possible.
     */
    canWindowLevel(): boolean;
    /**
     * Can the data be scrolled?
     *
     * @returns {boolean} True if the data has either the third dimension
     * or above greater than one.
     */
    canScroll(): boolean;
    /**
     * Get the image size.
     *
     * @returns {Size} The size.
     */
    getImageSize(): Size;
    /**
     * Get the image world (mm) 2D size.
     *
     * @returns {object} The 2D size as {x,y}.
     */
    getImageWorldSize(): object;
    /**
     * Get the image rescaled data range.
     *
     * @returns {object} The range as {min, max}.
     */
    getImageRescaledDataRange(): object;
    /**
     * Compare the input meta data to the associated image one.
     *
     * @param {object} meta The meta data.
     * @returns {boolean} True if the associated image has equal meta data.
     */
    equalImageMeta(meta: object): boolean;
    /**
     * Check is the provided position can be set.
     *
     * @param {Point} position The position.
     * @returns {boolean} True is the position is in bounds.
     */
    canSetPosition(position: Point): boolean;
    /**
     * Set the current position.
     *
     * @param {Point} pos The position.
     * @param {boolean} [silent] If true, does not fire a
     *   positionchange event.
     * @returns {boolean} False if not in bounds.
     */
    setCurrentPosition(pos: Point, silent?: boolean): boolean;
    /**
     * Get a position from a 2D (x,y) position.
     *
     * @param {number} x The column position.
     * @param {number} y The row position.
     * @returns {Point} The associated position.
     */
    getPositionFromPlanePoint(x: number, y: number): Point;
    /**
     * Get a 2D (x,y) position from a position.
     *
     * @param {Point} point The 3D position.
     * @returns {object} The 2D position.
     */
    getPlanePositionFromPosition(point: Point): object;
    /**
     * Set the current index.
     *
     * @param {Index} index The index.
     * @param {boolean} [silent] If true, does not fire a positionchange event.
     * @returns {boolean} False if not in bounds.
     */
    setCurrentIndex(index: Index, silent?: boolean): boolean;
    /**
     * Get a plane 3D position from a plane 2D position: does not compensate
     *   for the image origin. Needed for setting the scale center...
     *
     * @param {object} point2D The 2D position as {x,y}.
     * @returns {Point3D} The 3D point.
     */
    getPlanePositionFromPlanePoint(point2D: object): Point3D;
    /**
     * Get a 3D offset from a plane one.
     *
     * @param {object} offset2D The plane offset as {x,y}.
     * @returns {Vector3D} The 3D world offset.
     */
    getOffset3DFromPlaneOffset(offset2D: object): Vector3D;
    /**
     * Increment the provided dimension.
     *
     * @param {number} dim The dimension to increment.
     * @param {boolean} [silent] Do not send event.
     * @returns {boolean} False if not in bounds.
     */
    incrementIndex(dim: number, silent?: boolean): boolean;
    /**
     * Decrement the provided dimension.
     *
     * @param {number} dim The dimension to increment.
     * @param {boolean} [silent] Do not send event.
     * @returns {boolean} False if not in bounds.
     */
    decrementIndex(dim: number, silent?: boolean): boolean;
    /**
     * Decrement the scroll dimension index.
     *
     * @param {boolean} [silent] Do not send event.
     * @returns {boolean} False if not in bounds.
     */
    decrementScrollIndex(silent?: boolean): boolean;
    /**
     * Increment the scroll dimension index.
     *
     * @param {boolean} [silent] Do not send event.
     * @returns {boolean} False if not in bounds.
     */
    incrementScrollIndex(silent?: boolean): boolean;
    /**
     * Scroll play: loop through all slices.
     */
    play(): void;
    /**
     * Stop scroll playing.
     */
    stop(): void;
    /**
     * Get the window/level.
     *
     * @returns {object} The window center and width.
     */
    getWindowLevel(): object;
    /**
     * Set the window/level.
     *
     * @param {number} wc The window center.
     * @param {number} ww The window width.
     */
    setWindowLevel(wc: number, ww: number): void;
    /**
     * Get the colour map.
     *
     * @returns {ColourMap} The colour map.
     */
    getColourMap(): ColourMap;
    /**
     * Set the colour map.
     *
     * @param {ColourMap} colourMap The colour map.
     */
    setColourMap(colourMap: ColourMap): void;
    /**
     * @callback alphaFn@callback alphaFn
     * @param {object} value The pixel value.
     * @param {object} index The values' index.
     * @returns {number} The value to display.
     */
    /**
     * Set the view per value alpha function.
     *
     * @param {alphaFn} func The function.
     */
    setViewAlphaFunction(func: (value: object, index: object) => number): void;
    /**
     * Set the colour map from a name.
     *
     * @param {string} name The name of the colour map to set.
     */
    setColourMapFromName(name: string): void;
    /**
     * Add an event listener to this class.
     *
     * @param {string} type The event type.
     * @param {Function} callback The function associated with the provided
     *   event type, will be called with the fired event.
     */
    addEventListener(type: string, callback: Function): void;
    /**
     * Remove an event listener from this class.
     *
     * @param {string} type The event type.
     * @param {Function} callback The function associated with the provided
     *   event type.
     */
    removeEventListener(type: string, callback: Function): void;
    #private;
}

/**
 * View layer.
 */
export declare class ViewLayer {
    /**
     * @param {HTMLElement} containerDiv The layer div, its id will be used
     *   as this layer id.
     */
    constructor(containerDiv: HTMLElement);
    /**
     * Get the associated data index.
     *
     * @returns {number} The index.
     */
    getDataIndex(): number;
    /**
     * Set the imageSmoothingEnabled flag value.
     *
     * @param {boolean} flag True to enable smoothing.
     */
    enableImageSmoothing(flag: boolean): void;
    /**
     * Set the associated view.
     *
     * @param {object} view The view.
     * @param {number} index The associated data index.
     */
    setView(view: object, index: number): void;
    /**
     * Get the view controller.
     *
     * @returns {ViewController} The controller.
     */
    getViewController(): ViewController;
    /**
     * Get the canvas image data.
     *
     * @returns {object} The image data.
     */
    getImageData(): object;
    /**
     * Handle an image set event.
     *
     * @param {object} event The event.
     * @function
     */
    onimageset: (event: object) => void;
    /**
     * Handle an image change event.
     *
     * @param {object} event The event.
     * @function
     */
    onimagechange: (event: object) => void;
    /**
     * Get the id of the layer.
     *
     * @returns {string} The string id.
     */
    getId(): string;
    /**
     * Get the layer base size (without scale).
     *
     * @returns {object} The size as {x,y}.
     */
    getBaseSize(): object;
    /**
     * Get the image world (mm) 2D size.
     *
     * @returns {object} The 2D size as {x,y}.
     */
    getImageWorldSize(): object;
    /**
     * Get the layer opacity.
     *
     * @returns {number} The opacity ([0:1] range).
     */
    getOpacity(): number;
    /**
     * Set the layer opacity.
     *
     * @param {number} alpha The opacity ([0:1] range).
     */
    setOpacity(alpha: number): void;
    /**
     * Add a flip offset along the layer X axis.
     */
    addFlipOffsetX(): void;
    /**
     * Add a flip offset along the layer Y axis.
     */
    addFlipOffsetY(): void;
    /**
     * Set the layer scale.
     *
     * @param {object} newScale The scale as {x,y}.
     * @param {Point3D} [center] The scale center.
     */
    setScale(newScale: object, center?: Point3D): void;
    /**
     * Set the base layer offset. Updates the layer offset.
     *
     * @param {Vector3D} scrollOffset The scroll offset vector.
     * @param {Vector3D} planeOffset The plane offset vector.
     * @returns {boolean} True if the offset was updated.
     */
    setBaseOffset(scrollOffset: Vector3D, planeOffset: Vector3D): boolean;
    /**
     * Set the layer offset.
     *
     * @param {object} newOffset The offset as {x,y}.
     */
    setOffset(newOffset: object): void;
    /**
     * Transform a display position to an index.
     *
     * @param {number} x The X position.
     * @param {number} y The Y position.
     * @returns {Index} The equivalent index.
     */
    displayToPlaneIndex(x: number, y: number): Index;
    /**
     * Remove scale from a display position.
     *
     * @param {number} x The X position.
     * @param {number} y The Y position.
     * @returns {object} The de-scaled position as {x,y}.
     */
    displayToPlaneScale(x: number, y: number): object;
    /**
     * Get a plane position from a display position.
     *
     * @param {number} x The X position.
     * @param {number} y The Y position.
     * @returns {object} The plane position as {x,y}.
     */
    displayToPlanePos(x: number, y: number): object;
    /**
     * Get a display position from a plane position.
     *
     * @param {number} x The X position.
     * @param {number} y The Y position.
     * @returns {object} The display position as {x,y}.
     */
    planePosToDisplay(x: number, y: number): object;
    /**
     * Get a main plane position from a display position.
     *
     * @param {number} x The X position.
     * @param {number} y The Y position.
     * @returns {object} The main plane position as {x,y}.
     */
    displayToMainPlanePos(x: number, y: number): object;
    /**
     * Display the layer.
     *
     * @param {boolean} flag Whether to display the layer or not.
     */
    display(flag: boolean): void;
    /**
     * Check if the layer is visible.
     *
     * @returns {boolean} True if the layer is visible.
     */
    isVisible(): boolean;
    /**
     * Draw the content (imageData) of the layer.
     * The imageData variable needs to be set
     *
     * @fires App#renderstart
     * @fires App#renderend
     */
    draw(): void;
    /**
     * Initialise the layer: set the canvas and context
     *
     * @param {object} size The image size as {x,y}.
     * @param {object} spacing The image spacing as {x,y}.
     * @param {number} alpha The initial data opacity.
     */
    initialise(size: object, spacing: object, alpha: number): void;
    /**
     * Fit the layer to its parent container.
     *
     * @param {number} fitScale1D The 1D fit scale.
     * @param {object} fitSize The fit size as {x,y}.
     * @param {object} fitOffset The fit offset as {x,y}.
     */
    fitToContainer(fitScale1D: number, fitSize: object, fitOffset: object): void;
    /**
     * Enable and listen to container interaction events.
     */
    bindInteraction(): void;
    /**
     * Disable and stop listening to container interaction events.
     */
    unbindInteraction(): void;
    /**
     * Add an event listener to this class.
     *
     * @param {string} type The event type.
     * @param {Function} callback The function associated with the provided
     *   event type, will be called with the fired event.
     */
    addEventListener(type: string, callback: Function): void;
    /**
     * Remove an event listener from this class.
     *
     * @param {string} type The event type.
     * @param {Function} callback The function associated with the provided
     *   event type.
     */
    removeEventListener(type: string, callback: Function): void;
    /**
     * Set the current position.
     *
     * @param {Point} position The new position.
     * @param {Index} _index The new index.
     * @returns {boolean} True if the position was updated.
     */
    setCurrentPosition(position: Point, _index: Index): boolean;
    /**
     * Clear the context.
     */
    clear(): void;
    #private;
}

/**
 * WindowCenterAndWidth class.
 * <br>Pseudo-code:
 * <pre>
 *  if (x &lt;= c - 0.5 - (w-1)/2), then y = ymin
 *  else if (x > c - 0.5 + (w-1)/2), then y = ymax,
 *  else y = ((x - (c - 0.5)) / (w-1) + 0.5) * (ymax - ymin) + ymin
 * </pre>
 *
 * @see DICOM doc for [Window Center and Window Width]{@link http://dicom.nema.org/dicom/2013/output/chtml/part03/sect_C.11.html#sect_C.11.2.1.2}
 */
export declare class WindowCenterAndWidth {
    /**
     * @param {number} center The window center.
     * @param {number} width The window width.
     */
    constructor(center: number, width: number);
    /**
     * Get the window center.
     *
     * @returns {number} The window center.
     */
    getCenter(): number;
    /**
     * Get the window width.
     *
     * @returns {number} The window width.
     */
    getWidth(): number;
    /**
     * Set the output value range.
     *
     * @param {string} min The output value minimum.
     * @param {string} max The output value maximum.
     */
    setRange(min: string, max: string): void;
    /**
     * Set the signed offset.
     *
     * @param {number} offset The signed data offset,
     *   typically: slope * ( size / 2).
     */
    setSignedOffset(offset: number): void;
    /**
     * Apply the window level on an input value.
     *
     * @param {number} value The value to rescale as an integer.
     * @returns {number} The leveled value, in the
     *  [ymin, ymax] range (default [0,255]).
     */
    apply(value: number): number;
    /**
     * Check for window level equality.
     *
     * @param {WindowCenterAndWidth} rhs The other window level to compare to.
     * @returns {boolean} True if both window level are equal.
     */
    equals(rhs: WindowCenterAndWidth): boolean;
    /**
     * Get a string representation of the window level.
     *
     * @returns {string} The window level as a string.
     */
    toString(): string;
    #private;
}

/**
 * Window LUT class.
 * Typically converts from float to integer.
 */
export declare class WindowLut {
    /**
     * @param {RescaleLut} rescaleLut The associated rescale LUT.
     * @param {boolean} isSigned Flag to know if the data is signed or not.
     */
    constructor(rescaleLut: RescaleLut, isSigned: boolean);
    /**
     * Get the window / level.
     *
     * @returns {WindowCenterAndWidth} The window / level.
     */
    getWindowLevel(): WindowCenterAndWidth;
    /**
     * Get the signed flag.
     *
     * @returns {boolean} The signed flag.
     */
    isSigned(): boolean;
    /**
     * Get the rescale lut.
     *
     * @returns {RescaleLut} The rescale lut.
     */
    getRescaleLut(): RescaleLut;
    /**
     * Is the lut ready to use or not? If not, the user must
     * call 'update'.
     *
     * @returns {boolean} True if the lut is ready to use.
     */
    isReady(): boolean;
    /**
     * Set the window center and width.
     *
     * @param {WindowCenterAndWidth} wl The window level.
     */
    setWindowLevel(wl: WindowCenterAndWidth): void;
    /**
     * Update the lut if needed..
     */
    update(): void;
    /**
     * Get the length of the LUT array.
     *
     * @returns {number} The length of the LUT array.
     */
    getLength(): number;
    /**
     * Get the value of the LUT at the given offset.
     *
     * @param {number} offset The input offset in [0,2^bitsStored] range.
     * @returns {number} The integer value (default [0,255]) of the LUT
     *   at the given offset.
     */
    getValue(offset: number): number;
    #private;
}

/**
 * Writer rule.
 */
export declare class WriterRule {
    /**
     * @param {string} action The rule action.
     */
    constructor(action: string);
    /**
     * Rule action: `copy`, `remove`, `clear` or `replace`.
     *
     * @type {string}
     */
    action: string;
    /**
     * Optional value to use for replace action.
     *
     * @type {any|undefined}
     */
    value: any | undefined;
}

export { }
