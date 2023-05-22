/**
 * Main application class.
 *
 * @example
 * // create the dwv app
 * const app = new App();
 * // initialise
 * app.init({
 *   dataViewConfigs: {'*': [{divId: 'layerGroup0'}]}
 * });
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
     * Get the meta data with names instead of tag keys.
     *
     * @param {number} index The data index.
     * @returns {object} The list of meta data.
     */
    getMetaDataWithNames(index: number): object;
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
     * @returns {object} The controller.
     */
    getToolboxController(): object;
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
     * @returns {Array} The layers.
     */
    getViewLayersByDataIndex(index: number): any[];
    /**
     * Get the draw layers associated to a data index.
     * The layer are available after the first loaded item.
     *
     * @param {number} index The data index.
     * @returns {Array} The layers.
     */
    getDrawLayersByDataIndex(index: number): any[];
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
     */
    addToUndoStack: (cmd: object) => void;
    /**
     * Initialise the application.
     *
     * @param {object} opt The application option with:
     * - `dataViewConfigs`: data indexed object containing the data view
     *   configurations in the form of a list of objects containing:
     *   - divId: the HTML div id
     *   - orientation: optional 'axial', 'coronal' or 'sagittal' orientation
     *     string (default undefined keeps the original slice order)
     * - `binders`: array of layerGroup binders
     * - `tools`: tool name indexed object containing individual tool
     *   configurations in the form of a list of objects containing:
     *   - options: array of tool options
     * - `viewOnFirstLoadItem`: boolean flag to trigger the first data render
     *   after the first loaded data or not
     * - `defaultCharacterSet`: the default chraracter set string used for DICOM
     *   parsing
     * @example
     * // create the dwv app
     * const app = new App();
     * // initialise
     * app.init({
     *   dataViewConfigs: {'*': [{divId: 'layerGroup0'}]},
     *   viewOnFirstLoadItem: false
     * });
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
    init(opt: object): void;
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
     * @param {object} callback The method associated with the provided
     *   event type, will be called with the fired event.
     */
    addEventListener(type: string, callback: object): void;
    /**
     * Remove an event listener from this class.
     *
     * @param {string} type The event type.
     * @param {object} callback The method associated with the provided
     *   event type.
     */
    removeEventListener(type: string, callback: object): void;
    /**
     * Load a list of files. Can be image files or a state file.
     *
     * @param {FileList} files The list of files to load.
     * @fires App#loadstart
     * @fires App#loadprogress
     * @fires App#loaditem
     * @fires App#loadend
     * @fires App#loaderror
     * @fires App#loadabort
     */
    loadFiles: (files: FileList) => void;
    /**
     * Load a list of URLs. Can be image files or a state file.
     *
     * @param {Array} urls The list of urls to load.
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
     */
    loadURLs: (urls: any[], options?: object) => void;
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
     * @returns {object} The configuration list.
     */
    getDataViewConfig(): object;
    /**
     * Set the data view configuration (see the init options for details).
     *
     * @param {object} configs The configuration list.
     */
    setDataViewConfig(configs: object): void;
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
     * @returns {object} The state of the app as a JSON object.
     */
    getState(): object;
    /**
     * Handle resize: fit the display to the window.
     * To be called once the image is loaded.
     * Can be connected to a window 'resize' event.
     *
     * @param {object} _event The change event.
     */
    onResize: (_event: object) => void;
    /**
     * Key down callback. Meant to be used in tools.
     *
     * @param {object} event The key down event.
     * @fires App#keydown
     */
    onKeydown: (event: object) => void;
    /**
     * Key down event handler example.
     * - CRTL-Z: undo
     * - CRTL-Y: redo
     * - CRTL-ARROW_LEFT: next element on fourth dim
     * - CRTL-ARROW_UP: next element on third dim
     * - CRTL-ARROW_RIGHT: previous element on fourth dim
     * - CRTL-ARROW_DOWN: previous element on third dim
     *
     * @param {object} event The key down event.
     * @fires UndoStack#undo
     * @fires UndoStack#redo
     */
    defaultOnKeydown: (event: object) => void;
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
     * @param {string} colourMap The colour map name.
     */
    setColourMap(colourMap: string): void;
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
 * Custom UI object for client defined UI.
 */
export declare const customUI: {};

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
 * @type {{[key: string]: {[key: string]: {center: number, width: number}}}}
 */
export declare const defaultPresets: {
    [key: string]: {
        [key: string]: {
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
 *   const dicomParser = new DicomParser();
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
     * Get the raw DICOM data elements.
     *
     * @returns {object} The raw DICOM elements.
     */
    getDicomElements(): object;
    /**
     * Parse the complete DICOM file (given as input to the class).
     * Fills in the member object 'dicomElements'.
     *
     * @param {ArrayBuffer} buffer The input array buffer.
     */
    parse(buffer: ArrayBuffer): void;
    #private;
}

/**
 * DICOM writer.
 *
 * Example usage:
 *   const parser = new DicomParser();
 *   parser.parse(this.response);
 *
 *   const writer = new DicomWriter(parser.getDicomElements());
 *   const blob = new Blob([writer.getBuffer()], {type: 'application/dicom'});
 *
 *   const element = document.getElementById("download");
 *   element.href = URL.createObjectURL(blob);
 *   element.download = "anonym.dcm";
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
     *
     * @param {object} rules The input rules.
     */
    setRules(rules: object): void;
    /**
     * Use a TextEncoder instead of the default text decoder.
     */
    useSpecialTextEncoder(): void;
    /**
     * Use default anonymisation rules.
     */
    useDefaultAnonymisationRules(): void;
    /**
     * Get the ArrayBuffer corresponding to input DICOM elements.
     *
     * @param {Array} dicomElements The wrapped elements to write.
     * @returns {ArrayBuffer} The elements as a buffer.
     */
    getBuffer(dicomElements: any[]): ArrayBuffer;
    #private;
}

/**
 * DICOM tag dictionary 2022a.
 * Generated using xml standard conversion from {@link https://github.com/ivmartel/dcmStdToJs} v0.1.0.
 * Conversion changes:
 * - (vr) 'See Note' -> 'NONE'
 * - (vr) 'OB or OW' -> 'ox'
 * - (vr) 'US or SS' -> 'xs'
 * - (vr) 'US or OW' -> 'xx'
 * - (vr) 'US or SS or OW' -> 'xs'
 * - added 'GenericGroupLength' element to each group
 * Local changes:
 * - tag numbers with 'xx' were replaced with '00', 'xxx' with '001' and
 *  'xxxx' with '0004'
 */
export declare const dictionary: {
    '0000': {
        '0000': string[];
        '0001': string[];
        '0002': string[];
        '0003': string[];
        '0010': string[];
        '0100': string[];
        '0110': string[];
        '0120': string[];
        '0200': string[];
        '0300': string[];
        '0400': string[];
        '0600': string[];
        '0700': string[];
        '0800': string[];
        '0850': string[];
        '0860': string[];
        '0900': string[];
        '0901': string[];
        '0902': string[];
        '0903': string[];
        '1000': string[];
        '1001': string[];
        '1002': string[];
        '1005': string[];
        '1008': string[];
        '1020': string[];
        '1021': string[];
        '1022': string[];
        '1023': string[];
        '1030': string[];
        '1031': string[];
        '4000': string[];
        '4010': string[];
        '5010': string[];
        '5020': string[];
        '5110': string[];
        '5120': string[];
        '5130': string[];
        '5140': string[];
        '5150': string[];
        '5160': string[];
        '5170': string[];
        '5180': string[];
        '5190': string[];
        '51A0': string[];
        '51B0': string[];
    };
    '0002': {
        '0000': string[];
        '0001': string[];
        '0002': string[];
        '0003': string[];
        '0010': string[];
        '0012': string[];
        '0013': string[];
        '0016': string[];
        '0017': string[];
        '0018': string[];
        '0026': string[];
        '0027': string[];
        '0028': string[];
        '0031': string[];
        '0032': string[];
        '0033': string[];
        '0035': string[];
        '0036': string[];
        '0037': string[];
        '0038': string[];
        '0100': string[];
        '0102': string[];
    };
    '0004': {
        '0000': string[];
        '1130': string[];
        '1141': string[];
        '1142': string[];
        '1200': string[];
        '1202': string[];
        '1212': string[];
        '1220': string[];
        '1400': string[];
        '1410': string[];
        '1420': string[];
        '1430': string[];
        '1432': string[];
        '1500': string[];
        '1504': string[];
        '1510': string[];
        '1511': string[];
        '1512': string[];
        '151A': string[];
        '1600': string[];
    };
    '0008': {
        '0000': string[];
        '0001': string[];
        '0005': string[];
        '0006': string[];
        '0008': string[];
        '0010': string[];
        '0012': string[];
        '0013': string[];
        '0014': string[];
        '0015': string[];
        '0016': string[];
        '0018': string[];
        '001A': string[];
        '001B': string[];
        '0020': string[];
        '0021': string[];
        '0022': string[];
        '0023': string[];
        '0024': string[];
        '0025': string[];
        '002A': string[];
        '0030': string[];
        '0031': string[];
        '0032': string[];
        '0033': string[];
        '0034': string[];
        '0035': string[];
        '0040': string[];
        '0041': string[];
        '0042': string[];
        '0050': string[];
        '0051': string[];
        '0052': string[];
        '0053': string[];
        '0054': string[];
        '0055': string[];
        '0056': string[];
        '0058': string[];
        '0060': string[];
        '0061': string[];
        '0062': string[];
        '0063': string[];
        '0064': string[];
        '0068': string[];
        '0070': string[];
        '0080': string[];
        '0081': string[];
        '0082': string[];
        '0090': string[];
        '0092': string[];
        '0094': string[];
        '0096': string[];
        '009C': string[];
        '009D': string[];
        '0100': string[];
        '0101': string[];
        '0102': string[];
        '0103': string[];
        '0104': string[];
        '0105': string[];
        '0106': string[];
        '0107': string[];
        '0108': string[];
        '0109': string[];
        '010A': string[];
        '010B': string[];
        '010C': string[];
        '010D': string[];
        '010E': string[];
        '010F': string[];
        '0110': string[];
        '0112': string[];
        '0114': string[];
        '0115': string[];
        '0116': string[];
        '0117': string[];
        '0118': string[];
        '0119': string[];
        '0120': string[];
        '0121': string[];
        '0122': string[];
        '0123': string[];
        '0124': string[];
        '0201': string[];
        '0202': string[];
        '0220': string[];
        '0221': string[];
        '0222': string[];
        '0300': string[];
        '0301': string[];
        '0302': string[];
        '0303': string[];
        '0304': string[];
        '0305': string[];
        '0306': string[];
        '0307': string[];
        '0308': string[];
        '0309': string[];
        '030A': string[];
        '030B': string[];
        '030C': string[];
        '030D': string[];
        '030E': string[];
        '030F': string[];
        '0310': string[];
        '1000': string[];
        '1010': string[];
        '1030': string[];
        '1032': string[];
        '103E': string[];
        '103F': string[];
        '1040': string[];
        '1041': string[];
        '1048': string[];
        '1049': string[];
        '1050': string[];
        '1052': string[];
        '1060': string[];
        '1062': string[];
        '1070': string[];
        '1072': string[];
        '1080': string[];
        '1084': string[];
        '1090': string[];
        '1100': string[];
        '1110': string[];
        '1111': string[];
        '1115': string[];
        '1120': string[];
        '1125': string[];
        '1130': string[];
        '1134': string[];
        '113A': string[];
        '1140': string[];
        '1145': string[];
        '114A': string[];
        '114B': string[];
        '1150': string[];
        '1155': string[];
        '1156': string[];
        '115A': string[];
        '1160': string[];
        '1161': string[];
        '1162': string[];
        '1163': string[];
        '1164': string[];
        '1167': string[];
        '1190': string[];
        '1195': string[];
        '1196': string[];
        '1197': string[];
        '1198': string[];
        '1199': string[];
        '119A': string[];
        '1200': string[];
        '1250': string[];
        '2110': string[];
        '2111': string[];
        '2112': string[];
        '2120': string[];
        '2122': string[];
        '2124': string[];
        '2127': string[];
        '2128': string[];
        '2129': string[];
        '212A': string[];
        '2130': string[];
        '2132': string[];
        '2133': string[];
        '2134': string[];
        '2135': string[];
        '2142': string[];
        '2143': string[];
        '2144': string[];
        '2200': string[];
        '2204': string[];
        '2208': string[];
        '2218': string[];
        '2220': string[];
        '2228': string[];
        '2229': string[];
        '2230': string[];
        '2240': string[];
        '2242': string[];
        '2244': string[];
        '2246': string[];
        '2251': string[];
        '2253': string[];
        '2255': string[];
        '2256': string[];
        '2257': string[];
        '2258': string[];
        '2259': string[];
        '225A': string[];
        '225C': string[];
        '3001': string[];
        '3002': string[];
        '3010': string[];
        '3011': string[];
        '3012': string[];
        '4000': string[];
        '9007': string[];
        '9092': string[];
        '9121': string[];
        '9123': string[];
        '9124': string[];
        '9154': string[];
        '9205': string[];
        '9206': string[];
        '9207': string[];
        '9208': string[];
        '9209': string[];
        '9215': string[];
        '9237': string[];
        '9410': string[];
        '9458': string[];
        '9459': string[];
        '9460': string[];
    };
    '0010': {
        '0000': string[];
        '0010': string[];
        '0020': string[];
        '0021': string[];
        '0022': string[];
        '0024': string[];
        '0026': string[];
        '0027': string[];
        '0028': string[];
        '0030': string[];
        '0032': string[];
        '0033': string[];
        '0034': string[];
        '0035': string[];
        '0040': string[];
        '0050': string[];
        '0101': string[];
        '0102': string[];
        '0200': string[];
        '0201': string[];
        '0212': string[];
        '0213': string[];
        '0214': string[];
        '0215': string[];
        '0216': string[];
        '0217': string[];
        '0218': string[];
        '0219': string[];
        '0221': string[];
        '0222': string[];
        '0223': string[];
        '0229': string[];
        '1000': string[];
        '1001': string[];
        '1002': string[];
        '1005': string[];
        '1010': string[];
        '1020': string[];
        '1021': string[];
        '1022': string[];
        '1023': string[];
        '1024': string[];
        '1030': string[];
        '1040': string[];
        '1050': string[];
        '1060': string[];
        '1080': string[];
        '1081': string[];
        '1090': string[];
        '1100': string[];
        '2000': string[];
        '2110': string[];
        '2150': string[];
        '2152': string[];
        '2154': string[];
        '2155': string[];
        '2160': string[];
        '2180': string[];
        '21A0': string[];
        '21B0': string[];
        '21C0': string[];
        '21D0': string[];
        '21F0': string[];
        '2201': string[];
        '2202': string[];
        '2203': string[];
        '2210': string[];
        '2292': string[];
        '2293': string[];
        '2294': string[];
        '2295': string[];
        '2296': string[];
        '2297': string[];
        '2298': string[];
        '2299': string[];
        '4000': string[];
        '9431': string[];
    };
    '0012': {
        '0000': string[];
        '0010': string[];
        '0020': string[];
        '0021': string[];
        '0030': string[];
        '0031': string[];
        '0040': string[];
        '0042': string[];
        '0050': string[];
        '0051': string[];
        '0052': string[];
        '0053': string[];
        '0060': string[];
        '0062': string[];
        '0063': string[];
        '0064': string[];
        '0071': string[];
        '0072': string[];
        '0081': string[];
        '0082': string[];
        '0083': string[];
        '0084': string[];
        '0085': string[];
        '0086': string[];
        '0087': string[];
    };
    '0014': {
        '0000': string[];
        '0023': string[];
        '0024': string[];
        '0025': string[];
        '0028': string[];
        '0030': string[];
        '0032': string[];
        '0034': string[];
        '0042': string[];
        '0044': string[];
        '0045': string[];
        '0046': string[];
        '0050': string[];
        '0052': string[];
        '0054': string[];
        '0056': string[];
        '0100': string[];
        '0101': string[];
        '0102': string[];
        '0103': string[];
        '0104': string[];
        '0105': string[];
        '0106': string[];
        '0107': string[];
        '0108': string[];
        '1010': string[];
        '1020': string[];
        '1040': string[];
        '2002': string[];
        '2004': string[];
        '2006': string[];
        '2008': string[];
        '2012': string[];
        '2014': string[];
        '2016': string[];
        '2018': string[];
        '201A': string[];
        '201C': string[];
        '201E': string[];
        '2030': string[];
        '2032': string[];
        '2202': string[];
        '2204': string[];
        '2206': string[];
        '2208': string[];
        '220A': string[];
        '220C': string[];
        '220E': string[];
        '2210': string[];
        '2220': string[];
        '2222': string[];
        '2224': string[];
        '2226': string[];
        '2228': string[];
        '222A': string[];
        '222C': string[];
        '3011': string[];
        '3012': string[];
        '3020': string[];
        '3022': string[];
        '3024': string[];
        '3026': string[];
        '3028': string[];
        '3040': string[];
        '3050': string[];
        '3060': string[];
        '3070': string[];
        '3071': string[];
        '3072': string[];
        '3073': string[];
        '3074': string[];
        '3075': string[];
        '3076': string[];
        '3077': string[];
        '3080': string[];
        '3099': string[];
        '3100': string[];
        '3101': string[];
        '4002': string[];
        '4004': string[];
        '4006': string[];
        '4008': string[];
        '400A': string[];
        '400C': string[];
        '400E': string[];
        '400F': string[];
        '4010': string[];
        '4011': string[];
        '4012': string[];
        '4013': string[];
        '4014': string[];
        '4015': string[];
        '4016': string[];
        '4017': string[];
        '4018': string[];
        '4019': string[];
        '401A': string[];
        '401B': string[];
        '401C': string[];
        '401D': string[];
        '4020': string[];
        '4022': string[];
        '4024': string[];
        '4026': string[];
        '4028': string[];
        '4030': string[];
        '4031': string[];
        '4032': string[];
        '4033': string[];
        '4034': string[];
        '4035': string[];
        '4036': string[];
        '4038': string[];
        '403A': string[];
        '403C': string[];
        '4040': string[];
        '4050': string[];
        '4051': string[];
        '4052': string[];
        '4054': string[];
        '4056': string[];
        '4057': string[];
        '4058': string[];
        '4059': string[];
        '405A': string[];
        '405C': string[];
        '4060': string[];
        '4062': string[];
        '4064': string[];
        '4070': string[];
        '4072': string[];
        '4074': string[];
        '4076': string[];
        '4078': string[];
        '407A': string[];
        '407C': string[];
        '407E': string[];
        '4080': string[];
        '4081': string[];
        '4082': string[];
        '4083': string[];
        '4084': string[];
        '4085': string[];
        '4086': string[];
        '4087': string[];
        '4088': string[];
        '4089': string[];
        '408B': string[];
        '408C': string[];
        '408D': string[];
        '408E': string[];
        '4091': string[];
        '4092': string[];
        '409A': string[];
        '409B': string[];
        '409C': string[];
        '409D': string[];
        '409F': string[];
        '40A0': string[];
        '40A1': string[];
        '40A2': string[];
        '5002': string[];
        '5004': string[];
        '5100': string[];
        '5101': string[];
        '5102': string[];
        '5103': string[];
        '5104': string[];
        '5105': string[];
        '5106': string[];
        '5107': string[];
        '5108': string[];
        '5109': string[];
        '510A': string[];
        '510B': string[];
        '510C': string[];
        '510D': string[];
        '510E': string[];
        '510F': string[];
        '5110': string[];
        '5111': string[];
        '5112': string[];
        '5113': string[];
        '5114': string[];
        '5115': string[];
        '5116': string[];
        '5117': string[];
        '5118': string[];
        '5119': string[];
        '511A': string[];
        '511B': string[];
        '511C': string[];
        '511D': string[];
        '511E': string[];
        '511F': string[];
    };
    '0016': {
        '0000': string[];
        '0001': string[];
        '0002': string[];
        '0003': string[];
        '0004': string[];
        '0005': string[];
        '0006': string[];
        '0007': string[];
        '0008': string[];
        '0009': string[];
        '000A': string[];
        '000B': string[];
        '000C': string[];
        '000D': string[];
        '000E': string[];
        '000F': string[];
        '0010': string[];
        '0011': string[];
        '0012': string[];
        '0013': string[];
        '0014': string[];
        '0015': string[];
        '0016': string[];
        '0017': string[];
        '0018': string[];
        '0019': string[];
        '001A': string[];
        '001B': string[];
        '001C': string[];
        '001D': string[];
        '001E': string[];
        '001F': string[];
        '0020': string[];
        '0021': string[];
        '0022': string[];
        '0023': string[];
        '0024': string[];
        '0025': string[];
        '0026': string[];
        '0027': string[];
        '0028': string[];
        '0029': string[];
        '002A': string[];
        '002B': string[];
        '0030': string[];
        '0031': string[];
        '0032': string[];
        '0033': string[];
        '0034': string[];
        '0035': string[];
        '0036': string[];
        '0037': string[];
        '0038': string[];
        '0039': string[];
        '003A': string[];
        '003B': string[];
        '0041': string[];
        '0042': string[];
        '0043': string[];
        '0044': string[];
        '0045': string[];
        '0046': string[];
        '0047': string[];
        '0048': string[];
        '0049': string[];
        '004A': string[];
        '004B': string[];
        '004C': string[];
        '004D': string[];
        '004E': string[];
        '004F': string[];
        '0050': string[];
        '0051': string[];
        '0061': string[];
        '0062': string[];
        '0070': string[];
        '0071': string[];
        '0072': string[];
        '0073': string[];
        '0074': string[];
        '0075': string[];
        '0076': string[];
        '0077': string[];
        '0078': string[];
        '0079': string[];
        '007A': string[];
        '007B': string[];
        '007C': string[];
        '007D': string[];
        '007E': string[];
        '007F': string[];
        '0080': string[];
        '0081': string[];
        '0082': string[];
        '0083': string[];
        '0084': string[];
        '0085': string[];
        '0086': string[];
        '0087': string[];
        '0088': string[];
        '0089': string[];
        '008A': string[];
        '008B': string[];
        '008C': string[];
        '008D': string[];
        '008E': string[];
        '1001': string[];
        '1002': string[];
        '1003': string[];
        '1004': string[];
        '1005': string[];
    };
    '0018': {
        '0000': string[];
        '0010': string[];
        '0012': string[];
        '0013': string[];
        '0014': string[];
        '0015': string[];
        '0020': string[];
        '0021': string[];
        '0022': string[];
        '0023': string[];
        '0024': string[];
        '0025': string[];
        '0026': string[];
        '0027': string[];
        '0028': string[];
        '0029': string[];
        '002A': string[];
        '0030': string[];
        '0031': string[];
        '0032': string[];
        '0033': string[];
        '0034': string[];
        '0035': string[];
        '0036': string[];
        '0037': string[];
        '0038': string[];
        '0039': string[];
        '003A': string[];
        '0040': string[];
        '0042': string[];
        '0050': string[];
        '0060': string[];
        '0061': string[];
        '0070': string[];
        '0071': string[];
        '0072': string[];
        '0073': string[];
        '0074': string[];
        '0075': string[];
        '0080': string[];
        '0081': string[];
        '0082': string[];
        '0083': string[];
        '0084': string[];
        '0085': string[];
        '0086': string[];
        '0087': string[];
        '0088': string[];
        '0089': string[];
        '0090': string[];
        '0091': string[];
        '0093': string[];
        '0094': string[];
        '0095': string[];
        '1000': string[];
        '1002': string[];
        '1003': string[];
        '1004': string[];
        '1005': string[];
        '1006': string[];
        '1007': string[];
        '1008': string[];
        '1009': string[];
        '100A': string[];
        '100B': string[];
        '1010': string[];
        '1011': string[];
        '1012': string[];
        '1014': string[];
        '1016': string[];
        '1017': string[];
        '1018': string[];
        '1019': string[];
        '101A': string[];
        '101B': string[];
        '1020': string[];
        '1022': string[];
        '1023': string[];
        '1030': string[];
        '1040': string[];
        '1041': string[];
        '1042': string[];
        '1043': string[];
        '1044': string[];
        '1045': string[];
        '1046': string[];
        '1047': string[];
        '1048': string[];
        '1049': string[];
        '1050': string[];
        '1060': string[];
        '1061': string[];
        '1062': string[];
        '1063': string[];
        '1064': string[];
        '1065': string[];
        '1066': string[];
        '1067': string[];
        '1068': string[];
        '1069': string[];
        '106A': string[];
        '106C': string[];
        '106E': string[];
        '1070': string[];
        '1071': string[];
        '1072': string[];
        '1073': string[];
        '1074': string[];
        '1075': string[];
        '1076': string[];
        '1077': string[];
        '1078': string[];
        '1079': string[];
        '1080': string[];
        '1081': string[];
        '1082': string[];
        '1083': string[];
        '1084': string[];
        '1085': string[];
        '1086': string[];
        '1088': string[];
        '1090': string[];
        '1094': string[];
        '1100': string[];
        '1110': string[];
        '1111': string[];
        '1114': string[];
        '1120': string[];
        '1121': string[];
        '1130': string[];
        '1131': string[];
        '1134': string[];
        '1135': string[];
        '1136': string[];
        '1137': string[];
        '1138': string[];
        '113A': string[];
        '1140': string[];
        '1141': string[];
        '1142': string[];
        '1143': string[];
        '1144': string[];
        '1145': string[];
        '1146': string[];
        '1147': string[];
        '1149': string[];
        '1150': string[];
        '1151': string[];
        '1152': string[];
        '1153': string[];
        '1154': string[];
        '1155': string[];
        '1156': string[];
        '115A': string[];
        '115E': string[];
        '1160': string[];
        '1161': string[];
        '1162': string[];
        '1164': string[];
        '1166': string[];
        '1170': string[];
        '1180': string[];
        '1181': string[];
        '1182': string[];
        '1183': string[];
        '1184': string[];
        '1190': string[];
        '1191': string[];
        '11A0': string[];
        '11A2': string[];
        '11A3': string[];
        '11A4': string[];
        '11A5': string[];
        '11B0': string[];
        '11B1': string[];
        '11B2': string[];
        '11B3': string[];
        '11B4': string[];
        '11B5': string[];
        '11B6': string[];
        '11B7': string[];
        '11B8': string[];
        '11B9': string[];
        '11BA': string[];
        '11BB': string[];
        '11BC': string[];
        '11BD': string[];
        '11BE': string[];
        '11BF': string[];
        '11C0': string[];
        '11C1': string[];
        '1200': string[];
        '1201': string[];
        '1202': string[];
        '1203': string[];
        '1210': string[];
        '1240': string[];
        '1242': string[];
        '1243': string[];
        '1244': string[];
        '1250': string[];
        '1251': string[];
        '1260': string[];
        '1261': string[];
        '1271': string[];
        '1272': string[];
        '1300': string[];
        '1301': string[];
        '1302': string[];
        '1310': string[];
        '1312': string[];
        '1314': string[];
        '1315': string[];
        '1316': string[];
        '1318': string[];
        '1320': string[];
        '1400': string[];
        '1401': string[];
        '1402': string[];
        '1403': string[];
        '1404': string[];
        '1405': string[];
        '1411': string[];
        '1412': string[];
        '1413': string[];
        '1450': string[];
        '1460': string[];
        '1470': string[];
        '1480': string[];
        '1490': string[];
        '1491': string[];
        '1495': string[];
        '1500': string[];
        '1508': string[];
        '1510': string[];
        '1511': string[];
        '1520': string[];
        '1521': string[];
        '1530': string[];
        '1531': string[];
        '1600': string[];
        '1602': string[];
        '1604': string[];
        '1606': string[];
        '1608': string[];
        '1610': string[];
        '1612': string[];
        '1620': string[];
        '1622': string[];
        '1623': string[];
        '1624': string[];
        '1630': string[];
        '1631': string[];
        '1632': string[];
        '1633': string[];
        '1634': string[];
        '1635': string[];
        '1636': string[];
        '1637': string[];
        '1638': string[];
        '1700': string[];
        '1702': string[];
        '1704': string[];
        '1706': string[];
        '1708': string[];
        '1710': string[];
        '1712': string[];
        '1720': string[];
        '1800': string[];
        '1801': string[];
        '1802': string[];
        '1803': string[];
        '2001': string[];
        '2002': string[];
        '2003': string[];
        '2004': string[];
        '2005': string[];
        '2006': string[];
        '2010': string[];
        '2020': string[];
        '2030': string[];
        '2041': string[];
        '2042': string[];
        '2043': string[];
        '2044': string[];
        '2045': string[];
        '2046': string[];
        '3100': string[];
        '3101': string[];
        '3102': string[];
        '3103': string[];
        '3104': string[];
        '3105': string[];
        '4000': string[];
        '5000': string[];
        '5010': string[];
        '5011': string[];
        '5012': string[];
        '5020': string[];
        '5021': string[];
        '5022': string[];
        '5024': string[];
        '5026': string[];
        '5027': string[];
        '5028': string[];
        '5029': string[];
        '5030': string[];
        '5040': string[];
        '5050': string[];
        '5100': string[];
        '5101': string[];
        '5104': string[];
        '5210': string[];
        '5212': string[];
        '6000': string[];
        '6011': string[];
        '6012': string[];
        '6014': string[];
        '6016': string[];
        '6018': string[];
        '601A': string[];
        '601C': string[];
        '601E': string[];
        '6020': string[];
        '6022': string[];
        '6024': string[];
        '6026': string[];
        '6028': string[];
        '602A': string[];
        '602C': string[];
        '602E': string[];
        '6030': string[];
        '6031': string[];
        '6032': string[];
        '6034': string[];
        '6036': string[];
        '6038': string[];
        '6039': string[];
        '603A': string[];
        '603B': string[];
        '603C': string[];
        '603D': string[];
        '603E': string[];
        '603F': string[];
        '6040': string[];
        '6041': string[];
        '6042': string[];
        '6043': string[];
        '6044': string[];
        '6046': string[];
        '6048': string[];
        '604A': string[];
        '604C': string[];
        '604E': string[];
        '6050': string[];
        '6052': string[];
        '6054': string[];
        '6056': string[];
        '6058': string[];
        '605A': string[];
        '6060': string[];
        '6070': string[];
        '7000': string[];
        '7001': string[];
        '7004': string[];
        '7005': string[];
        '7006': string[];
        '7008': string[];
        '700A': string[];
        '700C': string[];
        '700E': string[];
        '7010': string[];
        '7011': string[];
        '7012': string[];
        '7014': string[];
        '7016': string[];
        '701A': string[];
        '7020': string[];
        '7022': string[];
        '7024': string[];
        '7026': string[];
        '7028': string[];
        '702A': string[];
        '702B': string[];
        '7030': string[];
        '7032': string[];
        '7034': string[];
        '7036': string[];
        '7038': string[];
        '7040': string[];
        '7041': string[];
        '7042': string[];
        '7044': string[];
        '7046': string[];
        '7048': string[];
        '704C': string[];
        '7050': string[];
        '7052': string[];
        '7054': string[];
        '7056': string[];
        '7058': string[];
        '7060': string[];
        '7062': string[];
        '7064': string[];
        '7065': string[];
        '8150': string[];
        '8151': string[];
        '9004': string[];
        '9005': string[];
        '9006': string[];
        '9008': string[];
        '9009': string[];
        '9010': string[];
        '9011': string[];
        '9012': string[];
        '9014': string[];
        '9015': string[];
        '9016': string[];
        '9017': string[];
        '9018': string[];
        '9019': string[];
        '9020': string[];
        '9021': string[];
        '9022': string[];
        '9024': string[];
        '9025': string[];
        '9026': string[];
        '9027': string[];
        '9028': string[];
        '9029': string[];
        '9030': string[];
        '9032': string[];
        '9033': string[];
        '9034': string[];
        '9035': string[];
        '9036': string[];
        '9037': string[];
        '9041': string[];
        '9042': string[];
        '9043': string[];
        '9044': string[];
        '9045': string[];
        '9046': string[];
        '9047': string[];
        '9048': string[];
        '9049': string[];
        '9050': string[];
        '9051': string[];
        '9052': string[];
        '9053': string[];
        '9054': string[];
        '9058': string[];
        '9059': string[];
        '9060': string[];
        '9061': string[];
        '9062': string[];
        '9063': string[];
        '9064': string[];
        '9065': string[];
        '9066': string[];
        '9067': string[];
        '9069': string[];
        '9070': string[];
        '9073': string[];
        '9074': string[];
        '9075': string[];
        '9076': string[];
        '9077': string[];
        '9078': string[];
        '9079': string[];
        '9080': string[];
        '9081': string[];
        '9082': string[];
        '9083': string[];
        '9084': string[];
        '9085': string[];
        '9087': string[];
        '9089': string[];
        '9090': string[];
        '9091': string[];
        '9092': string[];
        '9093': string[];
        '9094': string[];
        '9095': string[];
        '9096': string[];
        '9098': string[];
        '9100': string[];
        '9101': string[];
        '9103': string[];
        '9104': string[];
        '9105': string[];
        '9106': string[];
        '9107': string[];
        '9112': string[];
        '9114': string[];
        '9115': string[];
        '9117': string[];
        '9118': string[];
        '9119': string[];
        '9125': string[];
        '9126': string[];
        '9127': string[];
        '9147': string[];
        '9151': string[];
        '9152': string[];
        '9155': string[];
        '9159': string[];
        '9166': string[];
        '9168': string[];
        '9169': string[];
        '9170': string[];
        '9171': string[];
        '9172': string[];
        '9173': string[];
        '9174': string[];
        '9175': string[];
        '9176': string[];
        '9177': string[];
        '9178': string[];
        '9179': string[];
        '9180': string[];
        '9181': string[];
        '9182': string[];
        '9183': string[];
        '9184': string[];
        '9185': string[];
        '9186': string[];
        '9195': string[];
        '9196': string[];
        '9197': string[];
        '9198': string[];
        '9199': string[];
        '9200': string[];
        '9214': string[];
        '9217': string[];
        '9218': string[];
        '9219': string[];
        '9220': string[];
        '9226': string[];
        '9227': string[];
        '9231': string[];
        '9232': string[];
        '9234': string[];
        '9236': string[];
        '9239': string[];
        '9240': string[];
        '9241': string[];
        '9250': string[];
        '9251': string[];
        '9252': string[];
        '9253': string[];
        '9254': string[];
        '9255': string[];
        '9256': string[];
        '9257': string[];
        '9258': string[];
        '9259': string[];
        '925A': string[];
        '925B': string[];
        '925C': string[];
        '925D': string[];
        '925E': string[];
        '925F': string[];
        '9260': string[];
        '9295': string[];
        '9296': string[];
        '9297': string[];
        '9298': string[];
        '9301': string[];
        '9302': string[];
        '9303': string[];
        '9304': string[];
        '9305': string[];
        '9306': string[];
        '9307': string[];
        '9308': string[];
        '9309': string[];
        '9310': string[];
        '9311': string[];
        '9312': string[];
        '9313': string[];
        '9314': string[];
        '9315': string[];
        '9316': string[];
        '9317': string[];
        '9318': string[];
        '9319': string[];
        '9320': string[];
        '9321': string[];
        '9322': string[];
        '9323': string[];
        '9324': string[];
        '9325': string[];
        '9326': string[];
        '9327': string[];
        '9328': string[];
        '9329': string[];
        '9330': string[];
        '9332': string[];
        '9333': string[];
        '9334': string[];
        '9335': string[];
        '9337': string[];
        '9338': string[];
        '9340': string[];
        '9341': string[];
        '9342': string[];
        '9343': string[];
        '9344': string[];
        '9345': string[];
        '9346': string[];
        '9351': string[];
        '9352': string[];
        '9353': string[];
        '9360': string[];
        '9361': string[];
        '9362': string[];
        '9363': string[];
        '9364': string[];
        '9365': string[];
        '9366': string[];
        '9367': string[];
        '9368': string[];
        '9369': string[];
        '936A': string[];
        '936B': string[];
        '936C': string[];
        '936D': string[];
        '936E': string[];
        '936F': string[];
        '9370': string[];
        '9371': string[];
        '9372': string[];
        '9373': string[];
        '9374': string[];
        '9375': string[];
        '9376': string[];
        '9377': string[];
        '9378': string[];
        '9379': string[];
        '937A': string[];
        '937B': string[];
        '937C': string[];
        '937D': string[];
        '937E': string[];
        '937F': string[];
        '9380': string[];
        '9381': string[];
        '9382': string[];
        '9383': string[];
        '9384': string[];
        '9401': string[];
        '9402': string[];
        '9403': string[];
        '9404': string[];
        '9405': string[];
        '9406': string[];
        '9407': string[];
        '9410': string[];
        '9412': string[];
        '9417': string[];
        '9420': string[];
        '9423': string[];
        '9424': string[];
        '9425': string[];
        '9426': string[];
        '9427': string[];
        '9428': string[];
        '9429': string[];
        '9430': string[];
        '9432': string[];
        '9433': string[];
        '9434': string[];
        '9435': string[];
        '9436': string[];
        '9437': string[];
        '9438': string[];
        '9439': string[];
        '9440': string[];
        '9441': string[];
        '9442': string[];
        '9445': string[];
        '9447': string[];
        '9449': string[];
        '9451': string[];
        '9452': string[];
        '9455': string[];
        '9456': string[];
        '9457': string[];
        '9461': string[];
        '9462': string[];
        '9463': string[];
        '9464': string[];
        '9465': string[];
        '9466': string[];
        '9467': string[];
        '9468': string[];
        '9469': string[];
        '9470': string[];
        '9471': string[];
        '9472': string[];
        '9473': string[];
        '9474': string[];
        '9476': string[];
        '9477': string[];
        '9504': string[];
        '9506': string[];
        '9507': string[];
        '9508': string[];
        '9509': string[];
        '9510': string[];
        '9511': string[];
        '9514': string[];
        '9515': string[];
        '9516': string[];
        '9517': string[];
        '9518': string[];
        '9519': string[];
        '9524': string[];
        '9525': string[];
        '9526': string[];
        '9527': string[];
        '9528': string[];
        '9530': string[];
        '9531': string[];
        '9538': string[];
        '9541': string[];
        '9542': string[];
        '9543': string[];
        '9544': string[];
        '9545': string[];
        '9546': string[];
        '9547': string[];
        '9548': string[];
        '9549': string[];
        '9550': string[];
        '9551': string[];
        '9552': string[];
        '9553': string[];
        '9554': string[];
        '9555': string[];
        '9556': string[];
        '9557': string[];
        '9558': string[];
        '9559': string[];
        '9601': string[];
        '9602': string[];
        '9603': string[];
        '9604': string[];
        '9605': string[];
        '9606': string[];
        '9607': string[];
        '9621': string[];
        '9622': string[];
        '9623': string[];
        '9624': string[];
        '9701': string[];
        '9715': string[];
        '9716': string[];
        '9717': string[];
        '9718': string[];
        '9719': string[];
        '9720': string[];
        '9721': string[];
        '9722': string[];
        '9723': string[];
        '9724': string[];
        '9725': string[];
        '9726': string[];
        '9727': string[];
        '9729': string[];
        '9732': string[];
        '9733': string[];
        '9734': string[];
        '9735': string[];
        '9736': string[];
        '9737': string[];
        '9738': string[];
        '9739': string[];
        '9740': string[];
        '9749': string[];
        '9751': string[];
        '9755': string[];
        '9756': string[];
        '9758': string[];
        '9759': string[];
        '9760': string[];
        '9761': string[];
        '9762': string[];
        '9763': string[];
        '9764': string[];
        '9765': string[];
        '9766': string[];
        '9767': string[];
        '9768': string[];
        '9769': string[];
        '9770': string[];
        '9771': string[];
        '9772': string[];
        '9801': string[];
        '9803': string[];
        '9804': string[];
        '9805': string[];
        '9806': string[];
        '9807': string[];
        '9808': string[];
        '9809': string[];
        '980B': string[];
        '980C': string[];
        '980D': string[];
        '980E': string[];
        '980F': string[];
        '9810': string[];
        '9900': string[];
        '9901': string[];
        '9902': string[];
        '9903': string[];
        '9904': string[];
        '9905': string[];
        '9906': string[];
        '9907': string[];
        '9908': string[];
        '9909': string[];
        '990A': string[];
        '990B': string[];
        '990C': string[];
        '990D': string[];
        '990E': string[];
        '990F': string[];
        '9910': string[];
        '9911': string[];
        '9912': string[];
        '9913': string[];
        '9914': string[];
        '9915': string[];
        '9916': string[];
        '9917': string[];
        '9918': string[];
        '9919': string[];
        '991A': string[];
        '991B': string[];
        '991C': string[];
        '991D': string[];
        '991E': string[];
        '991F': string[];
        '9920': string[];
        '9921': string[];
        '9922': string[];
        '9923': string[];
        '9924': string[];
        '9930': string[];
        '9931': string[];
        '9932': string[];
        '9933': string[];
        '9934': string[];
        '9935': string[];
        '9936': string[];
        '9937': string[];
        '9938': string[];
        '9939': string[];
        '993A': string[];
        '993B': string[];
        '993C': string[];
        '993D': string[];
        '993E': string[];
        '9941': string[];
        '9942': string[];
        '9943': string[];
        '9944': string[];
        '9945': string[];
        '9946': string[];
        '9947': string[];
        A001: string[];
        A002: string[];
        A003: string[];
    };
    '0020': {
        '0000': string[];
        '000D': string[];
        '000E': string[];
        '0010': string[];
        '0011': string[];
        '0012': string[];
        '0013': string[];
        '0014': string[];
        '0015': string[];
        '0016': string[];
        '0017': string[];
        '0018': string[];
        '0019': string[];
        '0020': string[];
        '0022': string[];
        '0024': string[];
        '0026': string[];
        '0030': string[];
        '0032': string[];
        '0035': string[];
        '0037': string[];
        '0050': string[];
        '0052': string[];
        '0060': string[];
        '0062': string[];
        '0070': string[];
        '0080': string[];
        '00AA': string[];
        '0100': string[];
        '0105': string[];
        '0110': string[];
        '0200': string[];
        '0242': string[];
        '1000': string[];
        '1001': string[];
        '1002': string[];
        '1003': string[];
        '1004': string[];
        '1005': string[];
        '1020': string[];
        '103F': string[];
        '1040': string[];
        '1041': string[];
        '1070': string[];
        '1200': string[];
        '1202': string[];
        '1204': string[];
        '1206': string[];
        '1208': string[];
        '1209': string[];
        '3100': string[];
        '3401': string[];
        '3402': string[];
        '3403': string[];
        '3404': string[];
        '3405': string[];
        '3406': string[];
        '4000': string[];
        '5000': string[];
        '5002': string[];
        '9056': string[];
        '9057': string[];
        '9071': string[];
        '9072': string[];
        '9111': string[];
        '9113': string[];
        '9116': string[];
        '9128': string[];
        '9153': string[];
        '9154': string[];
        '9155': string[];
        '9156': string[];
        '9157': string[];
        '9158': string[];
        '9161': string[];
        '9162': string[];
        '9163': string[];
        '9164': string[];
        '9165': string[];
        '9167': string[];
        '9170': string[];
        '9171': string[];
        '9172': string[];
        '9213': string[];
        '9221': string[];
        '9222': string[];
        '9228': string[];
        '9238': string[];
        '9241': string[];
        '9245': string[];
        '9246': string[];
        '9247': string[];
        '9248': string[];
        '9249': string[];
        '9250': string[];
        '9251': string[];
        '9252': string[];
        '9253': string[];
        '9254': string[];
        '9255': string[];
        '9256': string[];
        '9257': string[];
        '9301': string[];
        '9302': string[];
        '9307': string[];
        '9308': string[];
        '9309': string[];
        '930A': string[];
        '930B': string[];
        '930C': string[];
        '930D': string[];
        '930E': string[];
        '930F': string[];
        '9310': string[];
        '9311': string[];
        '9312': string[];
        '9313': string[];
        '9421': string[];
        '9450': string[];
        '9453': string[];
        '9518': string[];
        '9529': string[];
        '9536': string[];
    };
    '0022': {
        '0000': string[];
        '0001': string[];
        '0002': string[];
        '0003': string[];
        '0004': string[];
        '0005': string[];
        '0006': string[];
        '0007': string[];
        '0008': string[];
        '0009': string[];
        '000A': string[];
        '000B': string[];
        '000C': string[];
        '000D': string[];
        '000E': string[];
        '0010': string[];
        '0011': string[];
        '0012': string[];
        '0013': string[];
        '0014': string[];
        '0015': string[];
        '0016': string[];
        '0017': string[];
        '0018': string[];
        '0019': string[];
        '001A': string[];
        '001B': string[];
        '001C': string[];
        '001D': string[];
        '001E': string[];
        '0020': string[];
        '0021': string[];
        '0022': string[];
        '0028': string[];
        '0030': string[];
        '0031': string[];
        '0032': string[];
        '0035': string[];
        '0036': string[];
        '0037': string[];
        '0038': string[];
        '0039': string[];
        '0041': string[];
        '0042': string[];
        '0048': string[];
        '0049': string[];
        '004E': string[];
        '0055': string[];
        '0056': string[];
        '0057': string[];
        '0058': string[];
        '1007': string[];
        '1008': string[];
        '1009': string[];
        '1010': string[];
        '1012': string[];
        '1019': string[];
        '1024': string[];
        '1025': string[];
        '1028': string[];
        '1029': string[];
        '1033': string[];
        '1035': string[];
        '1036': string[];
        '1037': string[];
        '1039': string[];
        '1040': string[];
        '1044': string[];
        '1045': string[];
        '1046': string[];
        '1047': string[];
        '1048': string[];
        '1049': string[];
        '104A': string[];
        '104B': string[];
        '1050': string[];
        '1053': string[];
        '1054': string[];
        '1059': string[];
        '1065': string[];
        '1066': string[];
        '1090': string[];
        '1092': string[];
        '1093': string[];
        '1094': string[];
        '1095': string[];
        '1096': string[];
        '1097': string[];
        '1100': string[];
        '1101': string[];
        '1103': string[];
        '1121': string[];
        '1122': string[];
        '1125': string[];
        '1127': string[];
        '1128': string[];
        '112A': string[];
        '112B': string[];
        '112C': string[];
        '1130': string[];
        '1131': string[];
        '1132': string[];
        '1133': string[];
        '1134': string[];
        '1135': string[];
        '1140': string[];
        '1150': string[];
        '1153': string[];
        '1155': string[];
        '1159': string[];
        '1210': string[];
        '1211': string[];
        '1212': string[];
        '1220': string[];
        '1225': string[];
        '1230': string[];
        '1250': string[];
        '1255': string[];
        '1257': string[];
        '1260': string[];
        '1262': string[];
        '1265': string[];
        '1273': string[];
        '1300': string[];
        '1310': string[];
        '1330': string[];
        '1415': string[];
        '1420': string[];
        '1423': string[];
        '1436': string[];
        '1443': string[];
        '1445': string[];
        '1450': string[];
        '1452': string[];
        '1454': string[];
        '1458': string[];
        '1460': string[];
        '1463': string[];
        '1465': string[];
        '1466': string[];
        '1467': string[];
        '1468': string[];
        '1470': string[];
        '1472': string[];
        '1512': string[];
        '1513': string[];
        '1515': string[];
        '1517': string[];
        '1518': string[];
        '1525': string[];
        '1526': string[];
        '1527': string[];
        '1528': string[];
        '1529': string[];
        '1530': string[];
        '1531': string[];
        '1612': string[];
        '1615': string[];
        '1616': string[];
        '1618': string[];
        '1620': string[];
        '1622': string[];
        '1624': string[];
        '1626': string[];
        '1628': string[];
        '1630': string[];
        '1640': string[];
        '1642': string[];
        '1643': string[];
        '1644': string[];
        '1645': string[];
        '1646': string[];
        '1649': string[];
        '1650': string[];
        '1658': string[];
    };
    '0024': {
        '0000': string[];
        '0010': string[];
        '0011': string[];
        '0012': string[];
        '0016': string[];
        '0018': string[];
        '0020': string[];
        '0021': string[];
        '0024': string[];
        '0025': string[];
        '0028': string[];
        '0032': string[];
        '0033': string[];
        '0034': string[];
        '0035': string[];
        '0036': string[];
        '0037': string[];
        '0038': string[];
        '0039': string[];
        '0040': string[];
        '0042': string[];
        '0044': string[];
        '0045': string[];
        '0046': string[];
        '0048': string[];
        '0050': string[];
        '0051': string[];
        '0052': string[];
        '0053': string[];
        '0054': string[];
        '0055': string[];
        '0056': string[];
        '0057': string[];
        '0058': string[];
        '0059': string[];
        '0060': string[];
        '0061': string[];
        '0062': string[];
        '0063': string[];
        '0064': string[];
        '0065': string[];
        '0066': string[];
        '0067': string[];
        '0068': string[];
        '0069': string[];
        '0070': string[];
        '0071': string[];
        '0072': string[];
        '0073': string[];
        '0074': string[];
        '0075': string[];
        '0076': string[];
        '0077': string[];
        '0078': string[];
        '0079': string[];
        '0080': string[];
        '0081': string[];
        '0083': string[];
        '0085': string[];
        '0086': string[];
        '0087': string[];
        '0088': string[];
        '0089': string[];
        '0090': string[];
        '0091': string[];
        '0092': string[];
        '0093': string[];
        '0094': string[];
        '0095': string[];
        '0096': string[];
        '0097': string[];
        '0098': string[];
        '0100': string[];
        '0102': string[];
        '0103': string[];
        '0104': string[];
        '0105': string[];
        '0106': string[];
        '0107': string[];
        '0108': string[];
        '0110': string[];
        '0112': string[];
        '0113': string[];
        '0114': string[];
        '0115': string[];
        '0117': string[];
        '0118': string[];
        '0120': string[];
        '0122': string[];
        '0124': string[];
        '0126': string[];
        '0202': string[];
        '0306': string[];
        '0307': string[];
        '0308': string[];
        '0309': string[];
        '0317': string[];
        '0320': string[];
        '0325': string[];
        '0338': string[];
        '0341': string[];
        '0344': string[];
    };
    '0028': {
        '0000': string[];
        '0002': string[];
        '0003': string[];
        '0004': string[];
        '0005': string[];
        '0006': string[];
        '0008': string[];
        '0009': string[];
        '000A': string[];
        '0010': string[];
        '0011': string[];
        '0012': string[];
        '0014': string[];
        '0020': string[];
        '0030': string[];
        '0031': string[];
        '0032': string[];
        '0034': string[];
        '0040': string[];
        '0050': string[];
        '0051': string[];
        '005F': string[];
        '0060': string[];
        '0061': string[];
        '0062': string[];
        '0063': string[];
        '0065': string[];
        '0066': string[];
        '0068': string[];
        '0069': string[];
        '0070': string[];
        '0071': string[];
        '0080': string[];
        '0081': string[];
        '0082': string[];
        '0090': string[];
        '0091': string[];
        '0092': string[];
        '0093': string[];
        '0094': string[];
        '0100': string[];
        '0101': string[];
        '0102': string[];
        '0103': string[];
        '0104': string[];
        '0105': string[];
        '0106': string[];
        '0107': string[];
        '0108': string[];
        '0109': string[];
        '0110': string[];
        '0111': string[];
        '0120': string[];
        '0121': string[];
        '0122': string[];
        '0123': string[];
        '0124': string[];
        '0125': string[];
        '0200': string[];
        '0300': string[];
        '0301': string[];
        '0302': string[];
        '0303': string[];
        '0304': string[];
        '0400': string[];
        '0401': string[];
        '0402': string[];
        '0403': string[];
        '0404': string[];
        '04x0': string[];
        '04x1': string[];
        '04x2': string[];
        '04x3': string[];
        '0700': string[];
        '0701': string[];
        '0702': string[];
        '0710': string[];
        '0720': string[];
        '0721': string[];
        '0722': string[];
        '0730': string[];
        '0740': string[];
        '08x0': string[];
        '08x2': string[];
        '08x3': string[];
        '08x4': string[];
        '08x8': string[];
        '0A02': string[];
        '0A04': string[];
        '1040': string[];
        '1041': string[];
        '1050': string[];
        '1051': string[];
        '1052': string[];
        '1053': string[];
        '1054': string[];
        '1055': string[];
        '1056': string[];
        '1080': string[];
        '1090': string[];
        '1100': string[];
        '1101': string[];
        '1102': string[];
        '1103': string[];
        '1104': string[];
        '1111': string[];
        '1112': string[];
        '1113': string[];
        '1199': string[];
        '1200': string[];
        '1201': string[];
        '1202': string[];
        '1203': string[];
        '1204': string[];
        '1211': string[];
        '1212': string[];
        '1213': string[];
        '1214': string[];
        '1221': string[];
        '1222': string[];
        '1223': string[];
        '1224': string[];
        '1230': string[];
        '1231': string[];
        '1232': string[];
        '1300': string[];
        '1350': string[];
        '1351': string[];
        '1352': string[];
        '135A': string[];
        '1401': string[];
        '1402': string[];
        '1403': string[];
        '1404': string[];
        '1405': string[];
        '1406': string[];
        '1407': string[];
        '1408': string[];
        '140B': string[];
        '140C': string[];
        '140D': string[];
        '140E': string[];
        '140F': string[];
        '1410': string[];
        '2000': string[];
        '2002': string[];
        '2110': string[];
        '2112': string[];
        '2114': string[];
        '3000': string[];
        '3002': string[];
        '3003': string[];
        '3004': string[];
        '3006': string[];
        '3010': string[];
        '3110': string[];
        '4000': string[];
        '5000': string[];
        '6010': string[];
        '6020': string[];
        '6022': string[];
        '6023': string[];
        '6030': string[];
        '6040': string[];
        '6100': string[];
        '6101': string[];
        '6102': string[];
        '6110': string[];
        '6112': string[];
        '6114': string[];
        '6120': string[];
        '6190': string[];
        '7000': string[];
        '7001': string[];
        '7002': string[];
        '7003': string[];
        '7004': string[];
        '7005': string[];
        '7006': string[];
        '7007': string[];
        '7008': string[];
        '7009': string[];
        '700A': string[];
        '700B': string[];
        '700C': string[];
        '700D': string[];
        '700E': string[];
        '700F': string[];
        '7010': string[];
        '7011': string[];
        '7012': string[];
        '7013': string[];
        '7014': string[];
        '7015': string[];
        '7016': string[];
        '7017': string[];
        '7018': string[];
        '7019': string[];
        '701A': string[];
        '701B': string[];
        '701C': string[];
        '701D': string[];
        '701E': string[];
        '701F': string[];
        '7020': string[];
        '7021': string[];
        '7022': string[];
        '7023': string[];
        '7024': string[];
        '7025': string[];
        '7026': string[];
        '7027': string[];
        '7028': string[];
        '7029': string[];
        '702A': string[];
        '702B': string[];
        '702C': string[];
        '702D': string[];
        '702E': string[];
        '7FE0': string[];
        '9001': string[];
        '9002': string[];
        '9003': string[];
        '9099': string[];
        '9108': string[];
        '9110': string[];
        '9132': string[];
        '9145': string[];
        '9235': string[];
        '9411': string[];
        '9415': string[];
        '9416': string[];
        '9422': string[];
        '9443': string[];
        '9444': string[];
        '9445': string[];
        '9446': string[];
        '9454': string[];
        '9474': string[];
        '9478': string[];
        '9501': string[];
        '9502': string[];
        '9503': string[];
        '9505': string[];
        '9506': string[];
        '9507': string[];
        '9520': string[];
        '9537': string[];
    };
    '0032': {
        '0000': string[];
        '000A': string[];
        '000C': string[];
        '0012': string[];
        '0032': string[];
        '0033': string[];
        '0034': string[];
        '0035': string[];
        '1000': string[];
        '1001': string[];
        '1010': string[];
        '1011': string[];
        '1020': string[];
        '1021': string[];
        '1030': string[];
        '1031': string[];
        '1032': string[];
        '1033': string[];
        '1034': string[];
        '1040': string[];
        '1041': string[];
        '1050': string[];
        '1051': string[];
        '1055': string[];
        '1060': string[];
        '1064': string[];
        '1065': string[];
        '1066': string[];
        '1067': string[];
        '1070': string[];
        '4000': string[];
    };
    '0034': {
        '0000': string[];
        '0001': string[];
        '0002': string[];
        '0003': string[];
        '0004': string[];
        '0005': string[];
        '0007': string[];
        '0008': string[];
        '0009': string[];
        '000A': string[];
        '000B': string[];
        '000C': string[];
        '000D': string[];
    };
    '0038': {
        '0000': string[];
        '0004': string[];
        '0008': string[];
        '0010': string[];
        '0011': string[];
        '0014': string[];
        '0016': string[];
        '001A': string[];
        '001B': string[];
        '001C': string[];
        '001D': string[];
        '001E': string[];
        '0020': string[];
        '0021': string[];
        '0030': string[];
        '0032': string[];
        '0040': string[];
        '0044': string[];
        '0050': string[];
        '0060': string[];
        '0061': string[];
        '0062': string[];
        '0064': string[];
        '0100': string[];
        '0101': string[];
        '0102': string[];
        '0300': string[];
        '0400': string[];
        '0500': string[];
        '0502': string[];
        '4000': string[];
    };
    '003A': {
        '0000': string[];
        '0004': string[];
        '0005': string[];
        '0010': string[];
        '001A': string[];
        '0020': string[];
        '0200': string[];
        '0202': string[];
        '0203': string[];
        '0205': string[];
        '0208': string[];
        '0209': string[];
        '020A': string[];
        '020C': string[];
        '0210': string[];
        '0211': string[];
        '0212': string[];
        '0213': string[];
        '0214': string[];
        '0215': string[];
        '0218': string[];
        '021A': string[];
        '0220': string[];
        '0221': string[];
        '0222': string[];
        '0223': string[];
        '0230': string[];
        '0231': string[];
        '0240': string[];
        '0241': string[];
        '0242': string[];
        '0244': string[];
        '0245': string[];
        '0246': string[];
        '0247': string[];
        '0248': string[];
        '0300': string[];
        '0301': string[];
        '0302': string[];
        '0310': string[];
        '0311': string[];
        '0312': string[];
        '0313': string[];
        '0314': string[];
        '0315': string[];
        '0316': string[];
    };
    '0040': {
        '0000': string[];
        '0001': string[];
        '0002': string[];
        '0003': string[];
        '0004': string[];
        '0005': string[];
        '0006': string[];
        '0007': string[];
        '0008': string[];
        '0009': string[];
        '000A': string[];
        '000B': string[];
        '0010': string[];
        '0011': string[];
        '0012': string[];
        '0020': string[];
        '0026': string[];
        '0027': string[];
        '0031': string[];
        '0032': string[];
        '0033': string[];
        '0035': string[];
        '0036': string[];
        '0039': string[];
        '003A': string[];
        '0100': string[];
        '0220': string[];
        '0241': string[];
        '0242': string[];
        '0243': string[];
        '0244': string[];
        '0245': string[];
        '0250': string[];
        '0251': string[];
        '0252': string[];
        '0253': string[];
        '0254': string[];
        '0255': string[];
        '0260': string[];
        '0261': string[];
        '0270': string[];
        '0275': string[];
        '0280': string[];
        '0281': string[];
        '0293': string[];
        '0294': string[];
        '0295': string[];
        '0296': string[];
        '0300': string[];
        '0301': string[];
        '0302': string[];
        '0303': string[];
        '0306': string[];
        '0307': string[];
        '030E': string[];
        '0310': string[];
        '0312': string[];
        '0314': string[];
        '0316': string[];
        '0318': string[];
        '0320': string[];
        '0321': string[];
        '0324': string[];
        '0330': string[];
        '0340': string[];
        '0400': string[];
        '0440': string[];
        '0441': string[];
        '0500': string[];
        '050A': string[];
        '0512': string[];
        '0513': string[];
        '0515': string[];
        '0518': string[];
        '051A': string[];
        '0520': string[];
        '0550': string[];
        '0551': string[];
        '0552': string[];
        '0553': string[];
        '0554': string[];
        '0555': string[];
        '0556': string[];
        '0560': string[];
        '0562': string[];
        '059A': string[];
        '0600': string[];
        '0602': string[];
        '0610': string[];
        '0612': string[];
        '0620': string[];
        '06FA': string[];
        '0710': string[];
        '071A': string[];
        '072A': string[];
        '073A': string[];
        '074A': string[];
        '08D8': string[];
        '08DA': string[];
        '08EA': string[];
        '09F8': string[];
        '1001': string[];
        '1002': string[];
        '1003': string[];
        '1004': string[];
        '1005': string[];
        '1006': string[];
        '1007': string[];
        '1008': string[];
        '1009': string[];
        '100A': string[];
        '1010': string[];
        '1011': string[];
        '1012': string[];
        '1060': string[];
        '1101': string[];
        '1102': string[];
        '1103': string[];
        '1104': string[];
        '1400': string[];
        '2001': string[];
        '2004': string[];
        '2005': string[];
        '2006': string[];
        '2007': string[];
        '2008': string[];
        '2009': string[];
        '2010': string[];
        '2011': string[];
        '2016': string[];
        '2017': string[];
        '2400': string[];
        '3001': string[];
        '4001': string[];
        '4002': string[];
        '4003': string[];
        '4004': string[];
        '4005': string[];
        '4006': string[];
        '4007': string[];
        '4008': string[];
        '4009': string[];
        '4010': string[];
        '4011': string[];
        '4015': string[];
        '4016': string[];
        '4018': string[];
        '4019': string[];
        '4020': string[];
        '4021': string[];
        '4022': string[];
        '4023': string[];
        '4025': string[];
        '4026': string[];
        '4027': string[];
        '4028': string[];
        '4029': string[];
        '4030': string[];
        '4031': string[];
        '4032': string[];
        '4033': string[];
        '4034': string[];
        '4035': string[];
        '4036': string[];
        '4037': string[];
        '4040': string[];
        '4041': string[];
        '4050': string[];
        '4051': string[];
        '4052': string[];
        '4070': string[];
        '4071': string[];
        '4072': string[];
        '4073': string[];
        '4074': string[];
        '8302': string[];
        '8303': string[];
        '9092': string[];
        '9094': string[];
        '9096': string[];
        '9098': string[];
        '9210': string[];
        '9211': string[];
        '9212': string[];
        '9213': string[];
        '9214': string[];
        '9216': string[];
        '9220': string[];
        '9224': string[];
        '9225': string[];
        A007: string[];
        A010: string[];
        A020: string[];
        A021: string[];
        A022: string[];
        A023: string[];
        A024: string[];
        A026: string[];
        A027: string[];
        A028: string[];
        A030: string[];
        A032: string[];
        A033: string[];
        A040: string[];
        A043: string[];
        A047: string[];
        A050: string[];
        A057: string[];
        A060: string[];
        A066: string[];
        A067: string[];
        A068: string[];
        A070: string[];
        A073: string[];
        A074: string[];
        A075: string[];
        A076: string[];
        A078: string[];
        A07A: string[];
        A07C: string[];
        A080: string[];
        A082: string[];
        A084: string[];
        A085: string[];
        A088: string[];
        A089: string[];
        A090: string[];
        A0B0: string[];
        A110: string[];
        A112: string[];
        A120: string[];
        A121: string[];
        A122: string[];
        A123: string[];
        A124: string[];
        A125: string[];
        A130: string[];
        A132: string[];
        A136: string[];
        A138: string[];
        A13A: string[];
        A160: string[];
        A161: string[];
        A162: string[];
        A163: string[];
        A167: string[];
        A168: string[];
        A16A: string[];
        A170: string[];
        A171: string[];
        A172: string[];
        A173: string[];
        A174: string[];
        A180: string[];
        A192: string[];
        A193: string[];
        A194: string[];
        A195: string[];
        A224: string[];
        A290: string[];
        A296: string[];
        A297: string[];
        A29A: string[];
        A300: string[];
        A301: string[];
        A307: string[];
        A30A: string[];
        A313: string[];
        A33A: string[];
        A340: string[];
        A352: string[];
        A353: string[];
        A354: string[];
        A358: string[];
        A360: string[];
        A370: string[];
        A372: string[];
        A375: string[];
        A380: string[];
        A385: string[];
        A390: string[];
        A402: string[];
        A403: string[];
        A404: string[];
        A491: string[];
        A492: string[];
        A493: string[];
        A494: string[];
        A496: string[];
        A504: string[];
        A525: string[];
        A600: string[];
        A601: string[];
        A603: string[];
        A730: string[];
        A731: string[];
        A732: string[];
        A744: string[];
        A801: string[];
        A802: string[];
        A803: string[];
        A804: string[];
        A805: string[];
        A806: string[];
        A807: string[];
        A808: string[];
        A992: string[];
        B020: string[];
        DB00: string[];
        DB06: string[];
        DB07: string[];
        DB0B: string[];
        DB0C: string[];
        DB0D: string[];
        DB73: string[];
        E001: string[];
        E004: string[];
        E006: string[];
        E008: string[];
        E010: string[];
        E011: string[];
        E020: string[];
        E021: string[];
        E022: string[];
        E023: string[];
        E024: string[];
        E025: string[];
        E030: string[];
        E031: string[];
    };
    '0042': {
        '0000': string[];
        '0010': string[];
        '0011': string[];
        '0012': string[];
        '0013': string[];
        '0014': string[];
        '0015': string[];
    };
    '0044': {
        '0000': string[];
        '0001': string[];
        '0002': string[];
        '0003': string[];
        '0004': string[];
        '0007': string[];
        '0008': string[];
        '0009': string[];
        '000A': string[];
        '000B': string[];
        '0010': string[];
        '0011': string[];
        '0012': string[];
        '0013': string[];
        '0019': string[];
        '0100': string[];
        '0101': string[];
        '0102': string[];
        '0103': string[];
        '0104': string[];
        '0105': string[];
        '0106': string[];
        '0107': string[];
        '0108': string[];
        '0109': string[];
        '010A': string[];
    };
    '0046': {
        '0000': string[];
        '0012': string[];
        '0014': string[];
        '0015': string[];
        '0016': string[];
        '0018': string[];
        '0028': string[];
        '0030': string[];
        '0032': string[];
        '0034': string[];
        '0036': string[];
        '0038': string[];
        '0040': string[];
        '0042': string[];
        '0044': string[];
        '0046': string[];
        '0047': string[];
        '0050': string[];
        '0052': string[];
        '0060': string[];
        '0062': string[];
        '0063': string[];
        '0064': string[];
        '0070': string[];
        '0071': string[];
        '0074': string[];
        '0075': string[];
        '0076': string[];
        '0077': string[];
        '0080': string[];
        '0092': string[];
        '0094': string[];
        '0095': string[];
        '0097': string[];
        '0098': string[];
        '0100': string[];
        '0101': string[];
        '0102': string[];
        '0104': string[];
        '0106': string[];
        '0110': string[];
        '0111': string[];
        '0112': string[];
        '0113': string[];
        '0114': string[];
        '0115': string[];
        '0116': string[];
        '0117': string[];
        '0118': string[];
        '0121': string[];
        '0122': string[];
        '0123': string[];
        '0124': string[];
        '0125': string[];
        '0135': string[];
        '0137': string[];
        '0139': string[];
        '0145': string[];
        '0146': string[];
        '0147': string[];
        '0201': string[];
        '0202': string[];
        '0203': string[];
        '0204': string[];
        '0205': string[];
        '0207': string[];
        '0208': string[];
        '0210': string[];
        '0211': string[];
        '0212': string[];
        '0213': string[];
        '0215': string[];
        '0218': string[];
        '0220': string[];
        '0224': string[];
        '0227': string[];
        '0230': string[];
        '0232': string[];
        '0234': string[];
        '0236': string[];
        '0238': string[];
        '0242': string[];
        '0244': string[];
        '0247': string[];
        '0248': string[];
        '0249': string[];
        '0250': string[];
        '0251': string[];
        '0252': string[];
        '0253': string[];
    };
    '0048': {
        '0000': string[];
        '0001': string[];
        '0002': string[];
        '0003': string[];
        '0006': string[];
        '0007': string[];
        '0008': string[];
        '0010': string[];
        '0011': string[];
        '0012': string[];
        '0013': string[];
        '0014': string[];
        '0015': string[];
        '0100': string[];
        '0102': string[];
        '0105': string[];
        '0106': string[];
        '0107': string[];
        '0108': string[];
        '0110': string[];
        '0111': string[];
        '0112': string[];
        '0113': string[];
        '0120': string[];
        '0200': string[];
        '0201': string[];
        '0202': string[];
        '0207': string[];
        '021A': string[];
        '021E': string[];
        '021F': string[];
        '0301': string[];
        '0302': string[];
        '0303': string[];
    };
    '0050': {
        '0000': string[];
        '0004': string[];
        '0010': string[];
        '0012': string[];
        '0013': string[];
        '0014': string[];
        '0015': string[];
        '0016': string[];
        '0017': string[];
        '0018': string[];
        '0019': string[];
        '001A': string[];
        '001B': string[];
        '001C': string[];
        '001D': string[];
        '001E': string[];
        '0020': string[];
        '0021': string[];
    };
    '0052': {
        '0000': string[];
        '0001': string[];
        '0002': string[];
        '0003': string[];
        '0004': string[];
        '0006': string[];
        '0007': string[];
        '0008': string[];
        '0009': string[];
        '0011': string[];
        '0012': string[];
        '0013': string[];
        '0014': string[];
        '0016': string[];
        '0025': string[];
        '0026': string[];
        '0027': string[];
        '0028': string[];
        '0029': string[];
        '0030': string[];
        '0031': string[];
        '0033': string[];
        '0034': string[];
        '0036': string[];
        '0038': string[];
        '0039': string[];
        '003A': string[];
    };
    '0054': {
        '0000': string[];
        '0010': string[];
        '0011': string[];
        '0012': string[];
        '0013': string[];
        '0014': string[];
        '0015': string[];
        '0016': string[];
        '0017': string[];
        '0018': string[];
        '0020': string[];
        '0021': string[];
        '0022': string[];
        '0030': string[];
        '0031': string[];
        '0032': string[];
        '0033': string[];
        '0036': string[];
        '0038': string[];
        '0039': string[];
        '0050': string[];
        '0051': string[];
        '0052': string[];
        '0053': string[];
        '0060': string[];
        '0061': string[];
        '0062': string[];
        '0063': string[];
        '0070': string[];
        '0071': string[];
        '0072': string[];
        '0073': string[];
        '0080': string[];
        '0081': string[];
        '0090': string[];
        '0100': string[];
        '0101': string[];
        '0200': string[];
        '0202': string[];
        '0210': string[];
        '0211': string[];
        '0220': string[];
        '0222': string[];
        '0300': string[];
        '0302': string[];
        '0304': string[];
        '0306': string[];
        '0308': string[];
        '0400': string[];
        '0410': string[];
        '0412': string[];
        '0414': string[];
        '0500': string[];
        '0501': string[];
        '1000': string[];
        '1001': string[];
        '1002': string[];
        '1004': string[];
        '1006': string[];
        '1100': string[];
        '1101': string[];
        '1102': string[];
        '1103': string[];
        '1104': string[];
        '1105': string[];
        '1200': string[];
        '1201': string[];
        '1202': string[];
        '1203': string[];
        '1210': string[];
        '1220': string[];
        '1300': string[];
        '1310': string[];
        '1311': string[];
        '1320': string[];
        '1321': string[];
        '1322': string[];
        '1323': string[];
        '1324': string[];
        '1330': string[];
        '1400': string[];
        '1401': string[];
    };
    '0060': {
        '0000': string[];
        '3000': string[];
        '3002': string[];
        '3004': string[];
        '3006': string[];
        '3008': string[];
        '3010': string[];
        '3020': string[];
    };
    '0062': {
        '0000': string[];
        '0001': string[];
        '0002': string[];
        '0003': string[];
        '0004': string[];
        '0005': string[];
        '0006': string[];
        '0007': string[];
        '0008': string[];
        '0009': string[];
        '000A': string[];
        '000B': string[];
        '000C': string[];
        '000D': string[];
        '000E': string[];
        '000F': string[];
        '0010': string[];
        '0011': string[];
        '0012': string[];
        '0013': string[];
        '0020': string[];
        '0021': string[];
    };
    '0064': {
        '0000': string[];
        '0002': string[];
        '0003': string[];
        '0005': string[];
        '0007': string[];
        '0008': string[];
        '0009': string[];
        '000F': string[];
        '0010': string[];
    };
    '0066': {
        '0000': string[];
        '0001': string[];
        '0002': string[];
        '0003': string[];
        '0004': string[];
        '0009': string[];
        '000A': string[];
        '000B': string[];
        '000C': string[];
        '000D': string[];
        '000E': string[];
        '0010': string[];
        '0011': string[];
        '0012': string[];
        '0013': string[];
        '0015': string[];
        '0016': string[];
        '0017': string[];
        '0018': string[];
        '0019': string[];
        '001A': string[];
        '001B': string[];
        '001C': string[];
        '001E': string[];
        '001F': string[];
        '0020': string[];
        '0021': string[];
        '0022': string[];
        '0023': string[];
        '0024': string[];
        '0025': string[];
        '0026': string[];
        '0027': string[];
        '0028': string[];
        '0029': string[];
        '002A': string[];
        '002B': string[];
        '002C': string[];
        '002D': string[];
        '002E': string[];
        '002F': string[];
        '0030': string[];
        '0031': string[];
        '0032': string[];
        '0034': string[];
        '0035': string[];
        '0036': string[];
        '0037': string[];
        '0038': string[];
        '0040': string[];
        '0041': string[];
        '0042': string[];
        '0043': string[];
        '0101': string[];
        '0102': string[];
        '0103': string[];
        '0104': string[];
        '0105': string[];
        '0106': string[];
        '0107': string[];
        '0108': string[];
        '0121': string[];
        '0124': string[];
        '0125': string[];
        '0129': string[];
        '0130': string[];
        '0132': string[];
        '0133': string[];
        '0134': string[];
    };
    '0068': {
        '0000': string[];
        '6210': string[];
        '6221': string[];
        '6222': string[];
        '6223': string[];
        '6224': string[];
        '6225': string[];
        '6226': string[];
        '6230': string[];
        '6260': string[];
        '6265': string[];
        '6270': string[];
        '6280': string[];
        '62A0': string[];
        '62A5': string[];
        '62C0': string[];
        '62D0': string[];
        '62D5': string[];
        '62E0': string[];
        '62F0': string[];
        '62F2': string[];
        '6300': string[];
        '6310': string[];
        '6320': string[];
        '6330': string[];
        '6340': string[];
        '6345': string[];
        '6346': string[];
        '6347': string[];
        '6350': string[];
        '6360': string[];
        '6380': string[];
        '6390': string[];
        '63A0': string[];
        '63A4': string[];
        '63A8': string[];
        '63AC': string[];
        '63B0': string[];
        '63C0': string[];
        '63D0': string[];
        '63E0': string[];
        '63F0': string[];
        '6400': string[];
        '6410': string[];
        '6420': string[];
        '6430': string[];
        '6440': string[];
        '6450': string[];
        '6460': string[];
        '6470': string[];
        '6490': string[];
        '64A0': string[];
        '64C0': string[];
        '64D0': string[];
        '64F0': string[];
        '6500': string[];
        '6510': string[];
        '6520': string[];
        '6530': string[];
        '6540': string[];
        '6545': string[];
        '6550': string[];
        '6560': string[];
        '6590': string[];
        '65A0': string[];
        '65B0': string[];
        '65D0': string[];
        '65E0': string[];
        '65F0': string[];
        '6610': string[];
        '6620': string[];
        '7001': string[];
        '7002': string[];
        '7003': string[];
        '7004': string[];
        '7005': string[];
    };
    '006A': {
        '0000': string[];
        '0001': string[];
        '0002': string[];
        '0003': string[];
        '0005': string[];
        '0006': string[];
        '0007': string[];
        '0008': string[];
        '0009': string[];
        '000A': string[];
        '000B': string[];
        '000C': string[];
        '000D': string[];
        '000E': string[];
        '000F': string[];
        '0010': string[];
        '0011': string[];
    };
    '0070': {
        '0000': string[];
        '0001': string[];
        '0002': string[];
        '0003': string[];
        '0004': string[];
        '0005': string[];
        '0006': string[];
        '0008': string[];
        '0009': string[];
        '0010': string[];
        '0011': string[];
        '0012': string[];
        '0014': string[];
        '0015': string[];
        '0020': string[];
        '0021': string[];
        '0022': string[];
        '0023': string[];
        '0024': string[];
        '0040': string[];
        '0041': string[];
        '0042': string[];
        '0050': string[];
        '0051': string[];
        '0052': string[];
        '0053': string[];
        '005A': string[];
        '0060': string[];
        '0062': string[];
        '0066': string[];
        '0067': string[];
        '0068': string[];
        '0080': string[];
        '0081': string[];
        '0082': string[];
        '0083': string[];
        '0084': string[];
        '0086': string[];
        '0087': string[];
        '0100': string[];
        '0101': string[];
        '0102': string[];
        '0103': string[];
        '0207': string[];
        '0208': string[];
        '0209': string[];
        '0226': string[];
        '0227': string[];
        '0228': string[];
        '0229': string[];
        '0230': string[];
        '0231': string[];
        '0232': string[];
        '0233': string[];
        '0234': string[];
        '0241': string[];
        '0242': string[];
        '0243': string[];
        '0244': string[];
        '0245': string[];
        '0246': string[];
        '0247': string[];
        '0248': string[];
        '0249': string[];
        '0250': string[];
        '0251': string[];
        '0252': string[];
        '0253': string[];
        '0254': string[];
        '0255': string[];
        '0256': string[];
        '0257': string[];
        '0258': string[];
        '0261': string[];
        '0262': string[];
        '0273': string[];
        '0274': string[];
        '0278': string[];
        '0279': string[];
        '0282': string[];
        '0284': string[];
        '0285': string[];
        '0287': string[];
        '0288': string[];
        '0289': string[];
        '0294': string[];
        '0295': string[];
        '0306': string[];
        '0308': string[];
        '0309': string[];
        '030A': string[];
        '030B': string[];
        '030C': string[];
        '030D': string[];
        '030F': string[];
        '0310': string[];
        '0311': string[];
        '0312': string[];
        '0314': string[];
        '0318': string[];
        '031A': string[];
        '031B': string[];
        '031C': string[];
        '031E': string[];
        '031F': string[];
        '0401': string[];
        '0402': string[];
        '0403': string[];
        '0404': string[];
        '0405': string[];
        '1101': string[];
        '1102': string[];
        '1103': string[];
        '1104': string[];
        '1201': string[];
        '1202': string[];
        '1203': string[];
        '1204': string[];
        '1205': string[];
        '1206': string[];
        '1207': string[];
        '1208': string[];
        '1209': string[];
        '120A': string[];
        '120B': string[];
        '120C': string[];
        '120D': string[];
        '1301': string[];
        '1302': string[];
        '1303': string[];
        '1304': string[];
        '1305': string[];
        '1306': string[];
        '1309': string[];
        '1501': string[];
        '1502': string[];
        '1503': string[];
        '1505': string[];
        '1507': string[];
        '1508': string[];
        '150C': string[];
        '150D': string[];
        '1511': string[];
        '1512': string[];
        '1602': string[];
        '1603': string[];
        '1604': string[];
        '1605': string[];
        '1606': string[];
        '1607': string[];
        '1701': string[];
        '1702': string[];
        '1703': string[];
        '1704': string[];
        '1705': string[];
        '1706': string[];
        '1801': string[];
        '1802': string[];
        '1803': string[];
        '1804': string[];
        '1805': string[];
        '1806': string[];
        '1807': string[];
        '1808': string[];
        '1901': string[];
        '1903': string[];
        '1904': string[];
        '1905': string[];
        '1907': string[];
        '1A01': string[];
        '1A03': string[];
        '1A04': string[];
        '1A05': string[];
        '1A06': string[];
        '1A07': string[];
        '1A08': string[];
        '1A09': string[];
        '1B01': string[];
        '1B02': string[];
        '1B03': string[];
        '1B04': string[];
        '1B06': string[];
        '1B07': string[];
        '1B08': string[];
        '1B11': string[];
        '1B12': string[];
        '1B13': string[];
        '1B14': string[];
    };
    '0072': {
        '0000': string[];
        '0002': string[];
        '0004': string[];
        '0006': string[];
        '0008': string[];
        '000A': string[];
        '000C': string[];
        '000E': string[];
        '0010': string[];
        '0012': string[];
        '0014': string[];
        '0020': string[];
        '0022': string[];
        '0024': string[];
        '0026': string[];
        '0028': string[];
        '0030': string[];
        '0032': string[];
        '0034': string[];
        '0038': string[];
        '003A': string[];
        '003C': string[];
        '003E': string[];
        '0040': string[];
        '0050': string[];
        '0052': string[];
        '0054': string[];
        '0056': string[];
        '005E': string[];
        '005F': string[];
        '0060': string[];
        '0061': string[];
        '0062': string[];
        '0063': string[];
        '0064': string[];
        '0065': string[];
        '0066': string[];
        '0067': string[];
        '0068': string[];
        '0069': string[];
        '006A': string[];
        '006B': string[];
        '006C': string[];
        '006D': string[];
        '006E': string[];
        '006F': string[];
        '0070': string[];
        '0071': string[];
        '0072': string[];
        '0073': string[];
        '0074': string[];
        '0075': string[];
        '0076': string[];
        '0078': string[];
        '007A': string[];
        '007C': string[];
        '007E': string[];
        '007F': string[];
        '0080': string[];
        '0081': string[];
        '0082': string[];
        '0083': string[];
        '0100': string[];
        '0102': string[];
        '0104': string[];
        '0106': string[];
        '0108': string[];
        '010A': string[];
        '010C': string[];
        '010E': string[];
        '0200': string[];
        '0202': string[];
        '0203': string[];
        '0204': string[];
        '0206': string[];
        '0208': string[];
        '0210': string[];
        '0212': string[];
        '0214': string[];
        '0216': string[];
        '0218': string[];
        '0300': string[];
        '0302': string[];
        '0304': string[];
        '0306': string[];
        '0308': string[];
        '0310': string[];
        '0312': string[];
        '0314': string[];
        '0316': string[];
        '0318': string[];
        '0320': string[];
        '0330': string[];
        '0400': string[];
        '0402': string[];
        '0404': string[];
        '0406': string[];
        '0420': string[];
        '0421': string[];
        '0422': string[];
        '0424': string[];
        '0427': string[];
        '0430': string[];
        '0432': string[];
        '0434': string[];
        '0500': string[];
        '0510': string[];
        '0512': string[];
        '0514': string[];
        '0516': string[];
        '0520': string[];
        '0600': string[];
        '0602': string[];
        '0604': string[];
        '0700': string[];
        '0702': string[];
        '0704': string[];
        '0705': string[];
        '0706': string[];
        '0710': string[];
        '0712': string[];
        '0714': string[];
        '0716': string[];
        '0717': string[];
        '0718': string[];
    };
    '0074': {
        '0000': string[];
        '0120': string[];
        '0121': string[];
        '1000': string[];
        '1002': string[];
        '1004': string[];
        '1006': string[];
        '1007': string[];
        '1008': string[];
        '100A': string[];
        '100C': string[];
        '100E': string[];
        '1020': string[];
        '1022': string[];
        '1024': string[];
        '1025': string[];
        '1026': string[];
        '1027': string[];
        '1028': string[];
        '102A': string[];
        '102B': string[];
        '102C': string[];
        '102D': string[];
        '1030': string[];
        '1032': string[];
        '1034': string[];
        '1036': string[];
        '1038': string[];
        '103A': string[];
        '1040': string[];
        '1042': string[];
        '1044': string[];
        '1046': string[];
        '1048': string[];
        '104A': string[];
        '104C': string[];
        '104E': string[];
        '1050': string[];
        '1052': string[];
        '1054': string[];
        '1056': string[];
        '1057': string[];
        '1200': string[];
        '1202': string[];
        '1204': string[];
        '1210': string[];
        '1212': string[];
        '1216': string[];
        '1220': string[];
        '1222': string[];
        '1224': string[];
        '1230': string[];
        '1234': string[];
        '1236': string[];
        '1238': string[];
        '1242': string[];
        '1244': string[];
        '1246': string[];
        '1324': string[];
        '1338': string[];
        '133A': string[];
        '1401': string[];
        '1402': string[];
        '1403': string[];
        '1404': string[];
        '1405': string[];
        '1406': string[];
        '1407': string[];
        '1408': string[];
        '1409': string[];
        '140A': string[];
        '140B': string[];
        '140C': string[];
        '140D': string[];
        '140E': string[];
    };
    '0076': {
        '0000': string[];
        '0001': string[];
        '0003': string[];
        '0006': string[];
        '0008': string[];
        '000A': string[];
        '000C': string[];
        '000E': string[];
        '0010': string[];
        '0020': string[];
        '0030': string[];
        '0032': string[];
        '0034': string[];
        '0036': string[];
        '0038': string[];
        '0040': string[];
        '0055': string[];
        '0060': string[];
        '0070': string[];
        '0080': string[];
        '0090': string[];
        '00A0': string[];
        '00B0': string[];
        '00C0': string[];
    };
    '0078': {
        '0000': string[];
        '0001': string[];
        '0010': string[];
        '0020': string[];
        '0024': string[];
        '0026': string[];
        '0028': string[];
        '002A': string[];
        '002E': string[];
        '0050': string[];
        '0060': string[];
        '0070': string[];
        '0090': string[];
        '00A0': string[];
        '00B0': string[];
        '00B2': string[];
        '00B4': string[];
        '00B6': string[];
        '00B8': string[];
    };
    '0080': {
        '0000': string[];
        '0001': string[];
        '0002': string[];
        '0003': string[];
        '0004': string[];
        '0005': string[];
        '0006': string[];
        '0007': string[];
        '0008': string[];
        '0009': string[];
        '0010': string[];
        '0011': string[];
        '0012': string[];
        '0013': string[];
    };
    '0082': {
        '0000': string[];
        '0001': string[];
        '0003': string[];
        '0004': string[];
        '0005': string[];
        '0006': string[];
        '0007': string[];
        '0008': string[];
        '000A': string[];
        '000C': string[];
        '0010': string[];
        '0016': string[];
        '0017': string[];
        '0018': string[];
        '0019': string[];
        '0021': string[];
        '0022': string[];
        '0023': string[];
        '0032': string[];
        '0033': string[];
        '0034': string[];
        '0035': string[];
        '0036': string[];
        '0037': string[];
        '0038': string[];
    };
    '0088': {
        '0000': string[];
        '0130': string[];
        '0140': string[];
        '0200': string[];
        '0904': string[];
        '0906': string[];
        '0910': string[];
        '0912': string[];
    };
    '0100': {
        '0000': string[];
        '0410': string[];
        '0420': string[];
        '0424': string[];
        '0426': string[];
    };
    '0400': {
        '0000': string[];
        '0005': string[];
        '0010': string[];
        '0015': string[];
        '0020': string[];
        '0100': string[];
        '0105': string[];
        '0110': string[];
        '0115': string[];
        '0120': string[];
        '0305': string[];
        '0310': string[];
        '0315': string[];
        '0401': string[];
        '0402': string[];
        '0403': string[];
        '0404': string[];
        '0500': string[];
        '0510': string[];
        '0520': string[];
        '0550': string[];
        '0551': string[];
        '0552': string[];
        '0561': string[];
        '0562': string[];
        '0563': string[];
        '0564': string[];
        '0565': string[];
        '0600': string[];
    };
    '1000': {
        '0000': string[];
        '0010': string[];
        '0011': string[];
        '0012': string[];
        '0013': string[];
        '0014': string[];
        '0015': string[];
    };
    '1010': {
        '0000': string[];
        '0004': string[];
    };
    '2000': {
        '0000': string[];
        '0010': string[];
        '001E': string[];
        '0020': string[];
        '0030': string[];
        '0040': string[];
        '0050': string[];
        '0060': string[];
        '0061': string[];
        '0062': string[];
        '0063': string[];
        '0065': string[];
        '0067': string[];
        '0069': string[];
        '006A': string[];
        '00A0': string[];
        '00A1': string[];
        '00A2': string[];
        '00A4': string[];
        '00A8': string[];
        '0500': string[];
        '0510': string[];
    };
    '2010': {
        '0000': string[];
        '0010': string[];
        '0030': string[];
        '0040': string[];
        '0050': string[];
        '0052': string[];
        '0054': string[];
        '0060': string[];
        '0080': string[];
        '00A6': string[];
        '00A7': string[];
        '00A8': string[];
        '00A9': string[];
        '0100': string[];
        '0110': string[];
        '0120': string[];
        '0130': string[];
        '0140': string[];
        '0150': string[];
        '0152': string[];
        '0154': string[];
        '015E': string[];
        '0160': string[];
        '0376': string[];
        '0500': string[];
        '0510': string[];
        '0520': string[];
    };
    '2020': {
        '0000': string[];
        '0010': string[];
        '0020': string[];
        '0030': string[];
        '0040': string[];
        '0050': string[];
        '00A0': string[];
        '00A2': string[];
        '0110': string[];
        '0111': string[];
        '0130': string[];
        '0140': string[];
    };
    '2030': {
        '0000': string[];
        '0010': string[];
        '0020': string[];
    };
    '2040': {
        '0000': string[];
        '0010': string[];
        '0011': string[];
        '0020': string[];
        '0060': string[];
        '0070': string[];
        '0072': string[];
        '0074': string[];
        '0080': string[];
        '0082': string[];
        '0090': string[];
        '0100': string[];
        '0500': string[];
    };
    '2050': {
        '0000': string[];
        '0010': string[];
        '0020': string[];
        '0500': string[];
    };
    '2100': {
        '0000': string[];
        '0010': string[];
        '0020': string[];
        '0030': string[];
        '0040': string[];
        '0050': string[];
        '0070': string[];
        '0140': string[];
        '0160': string[];
        '0170': string[];
        '0500': string[];
    };
    '2110': {
        '0000': string[];
        '0010': string[];
        '0020': string[];
        '0030': string[];
        '0099': string[];
    };
    '2120': {
        '0000': string[];
        '0010': string[];
        '0050': string[];
        '0070': string[];
    };
    '2130': {
        '0000': string[];
        '0010': string[];
        '0015': string[];
        '0030': string[];
        '0040': string[];
        '0050': string[];
        '0060': string[];
        '0080': string[];
        '00A0': string[];
        '00C0': string[];
    };
    '2200': {
        '0000': string[];
        '0001': string[];
        '0002': string[];
        '0003': string[];
        '0004': string[];
        '0005': string[];
        '0006': string[];
        '0007': string[];
        '0008': string[];
        '0009': string[];
        '000A': string[];
        '000B': string[];
        '000C': string[];
        '000D': string[];
        '000E': string[];
        '000F': string[];
        '0020': string[];
    };
    '3002': {
        '0000': string[];
        '0002': string[];
        '0003': string[];
        '0004': string[];
        '000A': string[];
        '000C': string[];
        '000D': string[];
        '000E': string[];
        '0010': string[];
        '0011': string[];
        '0012': string[];
        '0020': string[];
        '0022': string[];
        '0024': string[];
        '0026': string[];
        '0028': string[];
        '0029': string[];
        '0030': string[];
        '0032': string[];
        '0034': string[];
        '0040': string[];
        '0041': string[];
        '0042': string[];
        '0050': string[];
        '0051': string[];
        '0052': string[];
    };
    '3004': {
        '0000': string[];
        '0001': string[];
        '0002': string[];
        '0004': string[];
        '0005': string[];
        '0006': string[];
        '0008': string[];
        '000A': string[];
        '000C': string[];
        '000E': string[];
        '0010': string[];
        '0012': string[];
        '0014': string[];
        '0040': string[];
        '0042': string[];
        '0050': string[];
        '0052': string[];
        '0054': string[];
        '0056': string[];
        '0058': string[];
        '0060': string[];
        '0062': string[];
        '0070': string[];
        '0072': string[];
        '0074': string[];
    };
    '3006': {
        '0000': string[];
        '0002': string[];
        '0004': string[];
        '0006': string[];
        '0008': string[];
        '0009': string[];
        '0010': string[];
        '0012': string[];
        '0014': string[];
        '0016': string[];
        '0018': string[];
        '0020': string[];
        '0022': string[];
        '0024': string[];
        '0026': string[];
        '0028': string[];
        '002A': string[];
        '002C': string[];
        '0030': string[];
        '0033': string[];
        '0036': string[];
        '0037': string[];
        '0038': string[];
        '0039': string[];
        '0040': string[];
        '0042': string[];
        '0044': string[];
        '0045': string[];
        '0046': string[];
        '0048': string[];
        '0049': string[];
        '004A': string[];
        '0050': string[];
        '0080': string[];
        '0082': string[];
        '0084': string[];
        '0085': string[];
        '0086': string[];
        '0088': string[];
        '00A0': string[];
        '00A4': string[];
        '00A6': string[];
        '00B0': string[];
        '00B2': string[];
        '00B4': string[];
        '00B6': string[];
        '00B7': string[];
        '00B8': string[];
        '00B9': string[];
        '00C0': string[];
        '00C2': string[];
        '00C4': string[];
        '00C6': string[];
        '00C8': string[];
        '00C9': string[];
        '00CA': string[];
        '00CB': string[];
    };
    '3008': {
        '0000': string[];
        '0010': string[];
        '0012': string[];
        '0014': string[];
        '0016': string[];
        '0020': string[];
        '0021': string[];
        '0022': string[];
        '0024': string[];
        '0025': string[];
        '002A': string[];
        '002B': string[];
        '002C': string[];
        '0030': string[];
        '0032': string[];
        '0033': string[];
        '0036': string[];
        '0037': string[];
        '003A': string[];
        '003B': string[];
        '0040': string[];
        '0041': string[];
        '0042': string[];
        '0044': string[];
        '0045': string[];
        '0046': string[];
        '0047': string[];
        '0048': string[];
        '0050': string[];
        '0052': string[];
        '0054': string[];
        '0056': string[];
        '005A': string[];
        '0060': string[];
        '0061': string[];
        '0062': string[];
        '0063': string[];
        '0064': string[];
        '0065': string[];
        '0066': string[];
        '0067': string[];
        '0068': string[];
        '006A': string[];
        '0070': string[];
        '0072': string[];
        '0074': string[];
        '0076': string[];
        '0078': string[];
        '007A': string[];
        '0080': string[];
        '0082': string[];
        '0090': string[];
        '0092': string[];
        '00A0': string[];
        '00B0': string[];
        '00C0': string[];
        '00D0': string[];
        '00D1': string[];
        '00E0': string[];
        '00F0': string[];
        '00F2': string[];
        '00F4': string[];
        '00F6': string[];
        '0100': string[];
        '0105': string[];
        '0110': string[];
        '0116': string[];
        '0120': string[];
        '0122': string[];
        '0130': string[];
        '0132': string[];
        '0134': string[];
        '0136': string[];
        '0138': string[];
        '013A': string[];
        '013C': string[];
        '0140': string[];
        '0142': string[];
        '0150': string[];
        '0152': string[];
        '0160': string[];
        '0162': string[];
        '0164': string[];
        '0166': string[];
        '0168': string[];
        '0171': string[];
        '0172': string[];
        '0173': string[];
        '0200': string[];
        '0202': string[];
        '0220': string[];
        '0223': string[];
        '0224': string[];
        '0230': string[];
        '0240': string[];
        '0250': string[];
        '0251': string[];
    };
    '300A': {
        '0000': string[];
        '0002': string[];
        '0003': string[];
        '0004': string[];
        '0006': string[];
        '0007': string[];
        '0009': string[];
        '000A': string[];
        '000B': string[];
        '000C': string[];
        '000E': string[];
        '0010': string[];
        '0012': string[];
        '0013': string[];
        '0014': string[];
        '0015': string[];
        '0016': string[];
        '0018': string[];
        '001A': string[];
        '0020': string[];
        '0021': string[];
        '0022': string[];
        '0023': string[];
        '0025': string[];
        '0026': string[];
        '0027': string[];
        '0028': string[];
        '002A': string[];
        '002B': string[];
        '002C': string[];
        '002D': string[];
        '0040': string[];
        '0042': string[];
        '0043': string[];
        '0044': string[];
        '0046': string[];
        '0048': string[];
        '004A': string[];
        '004B': string[];
        '004C': string[];
        '004E': string[];
        '004F': string[];
        '0050': string[];
        '0051': string[];
        '0052': string[];
        '0053': string[];
        '0055': string[];
        '0070': string[];
        '0071': string[];
        '0072': string[];
        '0078': string[];
        '0079': string[];
        '007A': string[];
        '007B': string[];
        '0080': string[];
        '0082': string[];
        '0083': string[];
        '0084': string[];
        '0086': string[];
        '0088': string[];
        '0089': string[];
        '008A': string[];
        '008B': string[];
        '008C': string[];
        '008D': string[];
        '008E': string[];
        '008F': string[];
        '0090': string[];
        '0091': string[];
        '0092': string[];
        '0093': string[];
        '0094': string[];
        '00A0': string[];
        '00A2': string[];
        '00A4': string[];
        '00B0': string[];
        '00B2': string[];
        '00B3': string[];
        '00B4': string[];
        '00B6': string[];
        '00B8': string[];
        '00BA': string[];
        '00BB': string[];
        '00BC': string[];
        '00BE': string[];
        '00C0': string[];
        '00C2': string[];
        '00C3': string[];
        '00C4': string[];
        '00C5': string[];
        '00C6': string[];
        '00C7': string[];
        '00C8': string[];
        '00CA': string[];
        '00CC': string[];
        '00CE': string[];
        '00D0': string[];
        '00D1': string[];
        '00D2': string[];
        '00D3': string[];
        '00D4': string[];
        '00D5': string[];
        '00D6': string[];
        '00D7': string[];
        '00D8': string[];
        '00D9': string[];
        '00DA': string[];
        '00DB': string[];
        '00DC': string[];
        '00DD': string[];
        '00DE': string[];
        '00E0': string[];
        '00E1': string[];
        '00E2': string[];
        '00E3': string[];
        '00E4': string[];
        '00E5': string[];
        '00E6': string[];
        '00E7': string[];
        '00E8': string[];
        '00E9': string[];
        '00EA': string[];
        '00EB': string[];
        '00EC': string[];
        '00ED': string[];
        '00EE': string[];
        '00EF': string[];
        '00F0': string[];
        '00F2': string[];
        '00F3': string[];
        '00F4': string[];
        '00F5': string[];
        '00F6': string[];
        '00F7': string[];
        '00F8': string[];
        '00F9': string[];
        '00FA': string[];
        '00FB': string[];
        '00FC': string[];
        '00FE': string[];
        '0100': string[];
        '0102': string[];
        '0104': string[];
        '0106': string[];
        '0107': string[];
        '0108': string[];
        '0109': string[];
        '010A': string[];
        '010C': string[];
        '010E': string[];
        '0110': string[];
        '0111': string[];
        '0112': string[];
        '0114': string[];
        '0115': string[];
        '0116': string[];
        '0118': string[];
        '011A': string[];
        '011C': string[];
        '011E': string[];
        '011F': string[];
        '0120': string[];
        '0121': string[];
        '0122': string[];
        '0123': string[];
        '0124': string[];
        '0125': string[];
        '0126': string[];
        '0128': string[];
        '0129': string[];
        '012A': string[];
        '012C': string[];
        '012E': string[];
        '0130': string[];
        '0131': string[];
        '0132': string[];
        '0133': string[];
        '0134': string[];
        '0140': string[];
        '0142': string[];
        '0144': string[];
        '0146': string[];
        '0148': string[];
        '014A': string[];
        '014C': string[];
        '014E': string[];
        '0150': string[];
        '0151': string[];
        '0152': string[];
        '0153': string[];
        '0154': string[];
        '0155': string[];
        '0180': string[];
        '0182': string[];
        '0183': string[];
        '0184': string[];
        '0190': string[];
        '0192': string[];
        '0194': string[];
        '0196': string[];
        '0198': string[];
        '0199': string[];
        '019A': string[];
        '01A0': string[];
        '01A2': string[];
        '01A4': string[];
        '01A6': string[];
        '01A8': string[];
        '01B0': string[];
        '01B2': string[];
        '01B4': string[];
        '01B6': string[];
        '01B8': string[];
        '01BA': string[];
        '01BC': string[];
        '01D0': string[];
        '01D2': string[];
        '01D4': string[];
        '01D6': string[];
        '0200': string[];
        '0202': string[];
        '0206': string[];
        '0210': string[];
        '0212': string[];
        '0214': string[];
        '0216': string[];
        '0218': string[];
        '021A': string[];
        '021B': string[];
        '021C': string[];
        '0222': string[];
        '0224': string[];
        '0226': string[];
        '0228': string[];
        '0229': string[];
        '022A': string[];
        '022B': string[];
        '022C': string[];
        '022E': string[];
        '0230': string[];
        '0232': string[];
        '0234': string[];
        '0236': string[];
        '0238': string[];
        '0240': string[];
        '0242': string[];
        '0244': string[];
        '0250': string[];
        '0260': string[];
        '0262': string[];
        '0263': string[];
        '0264': string[];
        '0266': string[];
        '026A': string[];
        '026C': string[];
        '0271': string[];
        '0272': string[];
        '0273': string[];
        '0274': string[];
        '0280': string[];
        '0282': string[];
        '0284': string[];
        '0286': string[];
        '0288': string[];
        '028A': string[];
        '028C': string[];
        '0290': string[];
        '0291': string[];
        '0292': string[];
        '0294': string[];
        '0296': string[];
        '0298': string[];
        '029C': string[];
        '029E': string[];
        '02A0': string[];
        '02A1': string[];
        '02A2': string[];
        '02A4': string[];
        '02B0': string[];
        '02B2': string[];
        '02B3': string[];
        '02B4': string[];
        '02B8': string[];
        '02BA': string[];
        '02C8': string[];
        '02D0': string[];
        '02D2': string[];
        '02D4': string[];
        '02D6': string[];
        '02E0': string[];
        '02E1': string[];
        '02E2': string[];
        '02E3': string[];
        '02E4': string[];
        '02E5': string[];
        '02E6': string[];
        '02E7': string[];
        '02E8': string[];
        '02EA': string[];
        '02EB': string[];
        '0302': string[];
        '0304': string[];
        '0306': string[];
        '0308': string[];
        '0309': string[];
        '030A': string[];
        '030C': string[];
        '030D': string[];
        '030F': string[];
        '0312': string[];
        '0314': string[];
        '0316': string[];
        '0318': string[];
        '0320': string[];
        '0322': string[];
        '0330': string[];
        '0332': string[];
        '0334': string[];
        '0336': string[];
        '0338': string[];
        '033A': string[];
        '033C': string[];
        '0340': string[];
        '0342': string[];
        '0344': string[];
        '0346': string[];
        '0348': string[];
        '034A': string[];
        '034C': string[];
        '0350': string[];
        '0352': string[];
        '0354': string[];
        '0355': string[];
        '0356': string[];
        '0358': string[];
        '035A': string[];
        '0360': string[];
        '0362': string[];
        '0364': string[];
        '0366': string[];
        '0370': string[];
        '0372': string[];
        '0374': string[];
        '0380': string[];
        '0382': string[];
        '0384': string[];
        '0386': string[];
        '0388': string[];
        '038A': string[];
        '038F': string[];
        '0390': string[];
        '0391': string[];
        '0392': string[];
        '0393': string[];
        '0394': string[];
        '0395': string[];
        '0396': string[];
        '0398': string[];
        '0399': string[];
        '039A': string[];
        '03A0': string[];
        '03A2': string[];
        '03A4': string[];
        '03A6': string[];
        '03A8': string[];
        '03AA': string[];
        '03AC': string[];
        '0401': string[];
        '0402': string[];
        '0410': string[];
        '0412': string[];
        '0420': string[];
        '0421': string[];
        '0422': string[];
        '0423': string[];
        '0424': string[];
        '0425': string[];
        '0426': string[];
        '0431': string[];
        '0432': string[];
        '0433': string[];
        '0434': string[];
        '0435': string[];
        '0436': string[];
        '0440': string[];
        '0441': string[];
        '0442': string[];
        '0443': string[];
        '0450': string[];
        '0451': string[];
        '0452': string[];
        '0453': string[];
        '0501': string[];
        '0502': string[];
        '0503': string[];
        '0504': string[];
        '0505': string[];
        '0506': string[];
        '0507': string[];
        '0508': string[];
        '0509': string[];
        '0510': string[];
        '0511': string[];
        '0512': string[];
        '0600': string[];
        '0601': string[];
        '0602': string[];
        '0603': string[];
        '0604': string[];
        '0605': string[];
        '0606': string[];
        '0607': string[];
        '0608': string[];
        '0609': string[];
        '060A': string[];
        '060B': string[];
        '060C': string[];
        '060D': string[];
        '060E': string[];
        '060F': string[];
        '0610': string[];
        '0611': string[];
        '0612': string[];
        '0613': string[];
        '0614': string[];
        '0615': string[];
        '0616': string[];
        '0617': string[];
        '0618': string[];
        '0619': string[];
        '061A': string[];
        '061B': string[];
        '061C': string[];
        '061D': string[];
        '061E': string[];
        '061F': string[];
        '0620': string[];
        '0621': string[];
        '0622': string[];
        '0623': string[];
        '0624': string[];
        '0625': string[];
        '0626': string[];
        '0627': string[];
        '0628': string[];
        '0629': string[];
        '062A': string[];
        '062B': string[];
        '062C': string[];
        '062D': string[];
        '062E': string[];
        '062F': string[];
        '0630': string[];
        '0631': string[];
        '0632': string[];
        '0634': string[];
        '0635': string[];
        '0636': string[];
        '0637': string[];
        '0638': string[];
        '0639': string[];
        '063A': string[];
        '063B': string[];
        '063C': string[];
        '063D': string[];
        '063E': string[];
        '063F': string[];
        '0640': string[];
        '0641': string[];
        '0642': string[];
        '0643': string[];
        '0644': string[];
        '0645': string[];
        '0646': string[];
        '0647': string[];
        '0648': string[];
        '0649': string[];
        '064A': string[];
        '064B': string[];
        '064C': string[];
        '064D': string[];
        '064E': string[];
        '064F': string[];
        '0650': string[];
        '0651': string[];
        '0652': string[];
        '0653': string[];
        '0654': string[];
        '0655': string[];
        '0656': string[];
        '0657': string[];
        '0658': string[];
        '0659': string[];
        '065A': string[];
        '065B': string[];
        '065C': string[];
        '065D': string[];
        '065E': string[];
        '065F': string[];
        '0660': string[];
        '0661': string[];
        '0662': string[];
        '0663': string[];
        '0664': string[];
        '0665': string[];
        '0666': string[];
        '0667': string[];
        '0668': string[];
        '0669': string[];
        '066A': string[];
        '066B': string[];
        '066C': string[];
        '066D': string[];
        '066E': string[];
        '066F': string[];
        '0670': string[];
        '0671': string[];
        '0672': string[];
        '0673': string[];
        '0674': string[];
        '0675': string[];
        '0676': string[];
        '0677': string[];
        '0678': string[];
        '0679': string[];
        '067A': string[];
        '067B': string[];
        '067C': string[];
        '067D': string[];
        '067E': string[];
        '067F': string[];
        '0680': string[];
        '0681': string[];
        '0682': string[];
        '0683': string[];
        '0684': string[];
        '0685': string[];
        '0686': string[];
        '0687': string[];
        '0688': string[];
        '0689': string[];
        '068A': string[];
        '0700': string[];
        '0701': string[];
        '0702': string[];
        '0703': string[];
        '0704': string[];
        '0705': string[];
        '0706': string[];
        '0707': string[];
        '0708': string[];
        '0709': string[];
        '0714': string[];
        '0715': string[];
        '0716': string[];
        '0722': string[];
        '0723': string[];
        '0730': string[];
        '0731': string[];
        '0732': string[];
        '0733': string[];
        '0734': string[];
        '0735': string[];
        '0736': string[];
        '073A': string[];
        '073B': string[];
        '073E': string[];
        '073F': string[];
        '0740': string[];
        '0741': string[];
        '0742': string[];
        '0743': string[];
        '0744': string[];
        '0745': string[];
        '0746': string[];
        '0760': string[];
        '0761': string[];
        '0762': string[];
        '0772': string[];
        '0773': string[];
        '0774': string[];
        '0780': string[];
        '0782': string[];
        '0783': string[];
        '0784': string[];
        '0785': string[];
        '0786': string[];
        '0787': string[];
        '0788': string[];
        '0789': string[];
        '078A': string[];
        '078B': string[];
        '078C': string[];
        '078D': string[];
        '078E': string[];
        '078F': string[];
        '0790': string[];
        '0791': string[];
        '0792': string[];
        '0793': string[];
        '0794': string[];
        '0795': string[];
        '0796': string[];
        '0797': string[];
        '0798': string[];
        '0799': string[];
        '079A': string[];
        '079B': string[];
        '079C': string[];
        '079D': string[];
        '079E': string[];
    };
    '300C': {
        '0000': string[];
        '0002': string[];
        '0004': string[];
        '0006': string[];
        '0007': string[];
        '0008': string[];
        '0009': string[];
        '000A': string[];
        '000C': string[];
        '000E': string[];
        '0020': string[];
        '0022': string[];
        '0040': string[];
        '0042': string[];
        '0050': string[];
        '0051': string[];
        '0055': string[];
        '0060': string[];
        '006A': string[];
        '0080': string[];
        '00A0': string[];
        '00B0': string[];
        '00C0': string[];
        '00D0': string[];
        '00E0': string[];
        '00F0': string[];
        '00F2': string[];
        '00F4': string[];
        '00F6': string[];
        '0100': string[];
        '0102': string[];
        '0104': string[];
        '0111': string[];
        '0112': string[];
        '0113': string[];
        '0114': string[];
        '0115': string[];
        '0116': string[];
        '0117': string[];
        '0118': string[];
        '0119': string[];
        '0120': string[];
        '0121': string[];
        '0122': string[];
        '0123': string[];
        '0124': string[];
        '0125': string[];
        '0126': string[];
        '0127': string[];
        '0128': string[];
    };
    '300E': {
        '0000': string[];
        '0002': string[];
        '0004': string[];
        '0005': string[];
        '0008': string[];
    };
    '3010': {
        '0000': string[];
        '0001': string[];
        '0002': string[];
        '0003': string[];
        '0004': string[];
        '0005': string[];
        '0006': string[];
        '0007': string[];
        '0008': string[];
        '0009': string[];
        '000A': string[];
        '000B': string[];
        '000C': string[];
        '000D': string[];
        '000E': string[];
        '000F': string[];
        '0010': string[];
        '0011': string[];
        '0012': string[];
        '0013': string[];
        '0014': string[];
        '0015': string[];
        '0016': string[];
        '0017': string[];
        '0018': string[];
        '0019': string[];
        '001A': string[];
        '001B': string[];
        '001C': string[];
        '001D': string[];
        '001E': string[];
        '001F': string[];
        '0020': string[];
        '0021': string[];
        '0022': string[];
        '0023': string[];
        '0024': string[];
        '0025': string[];
        '0026': string[];
        '0027': string[];
        '0028': string[];
        '0029': string[];
        '002A': string[];
        '002B': string[];
        '002C': string[];
        '002D': string[];
        '002E': string[];
        '002F': string[];
        '0030': string[];
        '0031': string[];
        '0032': string[];
        '0033': string[];
        '0034': string[];
        '0035': string[];
        '0036': string[];
        '0037': string[];
        '0038': string[];
        '0039': string[];
        '003A': string[];
        '003B': string[];
        '003C': string[];
        '003D': string[];
        '003E': string[];
        '003F': string[];
        '0040': string[];
        '0041': string[];
        '0042': string[];
        '0043': string[];
        '0044': string[];
        '0045': string[];
        '0046': string[];
        '0047': string[];
        '0048': string[];
        '0049': string[];
        '004A': string[];
        '004B': string[];
        '004C': string[];
        '004D': string[];
        '004E': string[];
        '004F': string[];
        '0050': string[];
        '0051': string[];
        '0052': string[];
        '0053': string[];
        '0054': string[];
        '0055': string[];
        '0056': string[];
        '0057': string[];
        '0058': string[];
        '0059': string[];
        '005A': string[];
        '005B': string[];
        '005C': string[];
        '005D': string[];
        '005E': string[];
        '005F': string[];
        '0060': string[];
        '0061': string[];
        '0062': string[];
        '0063': string[];
        '0064': string[];
        '0065': string[];
        '0066': string[];
        '0067': string[];
        '0068': string[];
        '0069': string[];
        '006A': string[];
        '006B': string[];
        '006C': string[];
        '006D': string[];
        '006E': string[];
        '006F': string[];
        '0070': string[];
        '0071': string[];
        '0073': string[];
        '0074': string[];
        '0075': string[];
        '0076': string[];
        '0077': string[];
        '0078': string[];
        '0079': string[];
        '007A': string[];
        '007B': string[];
        '007C': string[];
        '007D': string[];
        '007E': string[];
        '007F': string[];
        '0080': string[];
        '0081': string[];
        '0082': string[];
        '0083': string[];
        '0084': string[];
        '0085': string[];
        '0086': string[];
        '0087': string[];
        '0088': string[];
        '0089': string[];
        '0090': string[];
        '0091': string[];
        '0092': string[];
        '0093': string[];
        '0094': string[];
        '0095': string[];
        '0096': string[];
        '0097': string[];
        '0098': string[];
        '0099': string[];
        '009A': string[];
    };
    '4000': {
        '0000': string[];
        '0010': string[];
        '4000': string[];
    };
    '4008': {
        '0000': string[];
        '0040': string[];
        '0042': string[];
        '0050': string[];
        '00FF': string[];
        '0100': string[];
        '0101': string[];
        '0102': string[];
        '0103': string[];
        '0108': string[];
        '0109': string[];
        '010A': string[];
        '010B': string[];
        '010C': string[];
        '0111': string[];
        '0112': string[];
        '0113': string[];
        '0114': string[];
        '0115': string[];
        '0117': string[];
        '0118': string[];
        '0119': string[];
        '011A': string[];
        '0200': string[];
        '0202': string[];
        '0210': string[];
        '0212': string[];
        '0300': string[];
        '4000': string[];
    };
    '4010': {
        '0000': string[];
        '0001': string[];
        '0002': string[];
        '0004': string[];
        '1001': string[];
        '1004': string[];
        '1005': string[];
        '1006': string[];
        '1007': string[];
        '1008': string[];
        '1009': string[];
        '100A': string[];
        '1010': string[];
        '1011': string[];
        '1012': string[];
        '1013': string[];
        '1014': string[];
        '1015': string[];
        '1016': string[];
        '1017': string[];
        '1018': string[];
        '1019': string[];
        '101A': string[];
        '101B': string[];
        '101C': string[];
        '101D': string[];
        '101E': string[];
        '101F': string[];
        '1020': string[];
        '1021': string[];
        '1023': string[];
        '1024': string[];
        '1025': string[];
        '1026': string[];
        '1027': string[];
        '1028': string[];
        '1029': string[];
        '102A': string[];
        '102B': string[];
        '1031': string[];
        '1033': string[];
        '1034': string[];
        '1037': string[];
        '1038': string[];
        '1039': string[];
        '103A': string[];
        '1041': string[];
        '1042': string[];
        '1043': string[];
        '1044': string[];
        '1045': string[];
        '1046': string[];
        '1047': string[];
        '1048': string[];
        '1051': string[];
        '1052': string[];
        '1053': string[];
        '1054': string[];
        '1055': string[];
        '1056': string[];
        '1058': string[];
        '1059': string[];
        '1060': string[];
        '1061': string[];
        '1062': string[];
        '1064': string[];
        '1067': string[];
        '1068': string[];
        '1069': string[];
        '106C': string[];
        '106D': string[];
        '106E': string[];
        '106F': string[];
        '1070': string[];
        '1071': string[];
        '1072': string[];
        '1073': string[];
        '1075': string[];
        '1076': string[];
        '1077': string[];
        '1078': string[];
        '1079': string[];
        '107A': string[];
        '107B': string[];
        '107C': string[];
        '107D': string[];
        '107E': string[];
    };
    '4FFE': {
        '0000': string[];
        '0001': string[];
    };
    '5000': {
        '0000': string[];
        '0005': string[];
        '0010': string[];
        '0020': string[];
        '0022': string[];
        '0030': string[];
        '0040': string[];
        '0103': string[];
        '0104': string[];
        '0105': string[];
        '0106': string[];
        '0110': string[];
        '0112': string[];
        '0114': string[];
        '1001': string[];
        '2000': string[];
        '2002': string[];
        '2004': string[];
        '2006': string[];
        '2008': string[];
        '200A': string[];
        '200C': string[];
        '200E': string[];
        '2500': string[];
        '2600': string[];
        '2610': string[];
        '3000': string[];
    };
    '5200': {
        '0000': string[];
        '9229': string[];
        '9230': string[];
    };
    '5400': {
        '0000': string[];
        '0100': string[];
        '0110': string[];
        '0112': string[];
        '1004': string[];
        '1006': string[];
        '100A': string[];
        '1010': string[];
    };
    '5600': {
        '0000': string[];
        '0010': string[];
        '0020': string[];
    };
    '6000': {
        '0000': string[];
        '0010': string[];
        '0011': string[];
        '0012': string[];
        '0015': string[];
        '0022': string[];
        '0040': string[];
        '0045': string[];
        '0050': string[];
        '0051': string[];
        '0052': string[];
        '0060': string[];
        '0061': string[];
        '0062': string[];
        '0063': string[];
        '0066': string[];
        '0068': string[];
        '0069': string[];
        '0100': string[];
        '0102': string[];
        '0110': string[];
        '0200': string[];
        '0800': string[];
        '0802': string[];
        '0803': string[];
        '0804': string[];
        '1001': string[];
        '1100': string[];
        '1101': string[];
        '1102': string[];
        '1103': string[];
        '1200': string[];
        '1201': string[];
        '1202': string[];
        '1203': string[];
        '1301': string[];
        '1302': string[];
        '1303': string[];
        '1500': string[];
        '3000': string[];
        '4000': string[];
    };
    '7F00': {
        '0000': string[];
        '0010': string[];
        '0011': string[];
        '0020': string[];
        '0030': string[];
        '0040': string[];
    };
    '7FE0': {
        '0000': string[];
        '0001': string[];
        '0002': string[];
        '0008': string[];
        '0009': string[];
        '0010': string[];
        '0020': string[];
        '0030': string[];
        '0040': string[];
    };
    FFFA: {
        '0000': string[];
        FFFA: string[];
    };
    FFFC: {
        '0000': string[];
        FFFC: string[];
    };
    FFFE: {
        '0000': string[];
        E000: string[];
        E00D: string[];
        E0DD: string[];
    };
};

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
     * @param {Point3D} center The scale center.
     */
    setScale(newScale: object, center: Point3D): void;
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
    toogleGroupVisibility(id: string): boolean;
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
     * @param {object} callback The method associated with the provided
     *   event type, will be called with the fired event.
     */
    addEventListener(type: string, callback: object): void;
    /**
     * Remove an event listener from this class.
     *
     * @param {string} type The event type.
     * @param {object} callback The method associated with the provided
     *   event type.
     */
    removeEventListener(type: string, callback: object): void;
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
 * Get the version of the library.
 *
 * @returns {string} The version of the library.
 */
export declare function getDwvVersion(): string;

/**
 * Get the DICOM elements from a DICOM json tags object.
 * The json is a simplified version of the oficial DICOM json with
 * tag names instead of keys and direct values (no value property) for
 * simple tags.
 *
 * @param {object} jsonTags The DICOM json tags object.
 * @returns {object} The DICOM elements.
 */
export declare function getElementsFromJSONTags(jsonTags: object): object;

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
 * Get the query part, split into an array, of an input URI.
 * The URI scheme is: 'base?query#fragment'
 *
 * @param {string} uri The input URI.
 * @returns {object} The query part, split into an array, of the input URI.
 */
export declare function getUriQuery(uri: string): object;

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
 *   // setup the dicom parser
 *   const dicomParser = new DicomParser();
 *   // parse the buffer
 *   dicomParser.parse(event.target.response);
 *   // create the image
 *   const imageFactory = new ImageFactory();
 *   // inputs are dicom tags and buffer
 *   const image = imageFactory.create(
 *     dicomParser.getDicomElements(),
 *     dicomParser.getDicomElements()['7FE00010'].value[0]
 *   );
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
     * @param {object} callback The method associated with the provided
     *   event type, will be called with the fired event.
     */
    addEventListener(type: string, callback: object): void;
    /**
     * Remove an event listener from this class.
     *
     * @param {string} type The event type.
     * @param {object} callback The method associated with the provided
     *   event type.
     */
    removeEventListener(type: string, callback: object): void;
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
     * @param {Array} values The index values.
     */
    constructor(values: any[]);
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
     * @returns {Array} The array of values.
     */
    getValues(): any[];
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
     * @returns {Array} The list of different dimensions.
     */
    compare(rhs: Index): any[];
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
     * @param {Array} [dims] Optional list of dimensions to use.
     * @returns {string} The string id.
     */
    toStringId(dims?: any[]): string;
    #private;
}

/**
 * Check if the input is an array.
 *
 * @param {*} unknown The input to check.
 * @returns {boolean} True if the input is an array.
 * ref: https://github.com/jashkenas/underscore/blob/1.9.1/underscore.js#L1313-L1317
 */
export declare function isArray(unknown: any): boolean;

/**
 * Check if the input is a generic object, including arrays.
 *
 * @param {*} unknown The input to check.
 * @returns {boolean} True if the input is an object.
 * ref: https://github.com/jashkenas/underscore/blob/1.9.1/underscore.js#L1319-L1323
 */
export declare function isObject(unknown: any): boolean;

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
     * @param {object} callback The method associated with the provided
     *   event type, will be called with the fired event.
     */
    addEventListener(type: string, callback: object): void;
    /**
     * Remove an event listener from this class.
     *
     * @param {string} type The event type.
     * @param {object} callback The method associated with the provided
     *   event type.
     */
    removeEventListener(type: string, callback: object): void;
    #private;
}

/**
 * Load from an input uri
 *
 * @param {string} uri The input uri, for example: 'window.location.href'.
 * @param {App} app The associated app that handles the load.
 * @param {object} [options] Optional url request options.
 */
export declare function loadFromUri(uri: string, app: App, options?: object): void;

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
 * @type {{[key: string]: {red: number[], green: number[], blue: number[]}}}
 */
export declare const lut: {
    [key: string]: {
        red: number[];
        green: number[];
        blue: number[];
    };
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
 * Dump an object to an array.
 *
 * @param {object} obj The input object as: {key0: {}, key1: {}}
 * @returns {Array} The corresponding array:
 *   [{name: key0, {}}, {name: key1, {}}]
 */
export declare function objectToArray(obj: object): any[];

/**
 * Immutable point.
 * Warning: the input array is NOT cloned, modifying it will
 *  modify the index values.
 */
export declare class Point {
    /**
     * @param {Array} values The point values.
     */
    constructor(values: any[]);
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
     * @returns {Array} The array of values.
     */
    getValues(): any[];
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
     * @returns {Array} The list of different dimensions.
     */
    compare(rhs: Point): any[];
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
     * Basically the Item, ItemDelimitationItem and SequenceDelimitationItem tags.
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
     * @param {object} _elements The DICOM elements.
     * @returns {number|undefined} The time value if available.
     */
    getTime(_elements: object): number | undefined;
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
     * @param {object} rhs The other vector to compare to.
     * @returns {boolean} True if both vectors are equal.
     */
    equals(rhs: object): boolean;
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
     * @param {object} map The colour map.
     */
    setDefaultColourMap(map: object): void;
    /**
     * Add window presets to the existing ones.
     *
     * @param {object} presets The window presets.
     */
    addWindowPresets(presets: object): void;
    /**
     * Get the colour map of the image.
     *
     * @returns {object} The colour map of the image.
     */
    getColourMap(): object;
    /**
     * Set the colour map of the image.
     *
     * @param {object} map The colour map of the image.
     * @fires View#colourchange
     */
    setColourMap(map: object): void;
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
     * @param {object} callback The method associated with the provided
     *   event type, will be called with the fired event.
     */
    addEventListener(type: string, callback: object): void;
    /**
     * Remove an event listener from this class.
     *
     * @param {string} type The event type.
     * @param {object} callback The method associated with the provided
     *   event type.
     */
    removeEventListener(type: string, callback: object): void;
    /**
     * Get the image window/level that covers the full data range.
     * Warning: uses the latest set rescale LUT or the default linear one.
     *
     * @returns {object} A min/max window level.
     */
    getWindowLevelMinMax(): object;
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
     * @param {boolean} silent If true, does not fire a positionchange event.
     * @returns {boolean} False if not in bounds.
     */
    setCurrentIndex(index: Index, silent: boolean): boolean;
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
     * @returns {object} The colour map.
     */
    getColourMap(): object;
    /**
     * Set the colour map.
     *
     * @param {object} colourMap The colour map.
     */
    setColourMap(colourMap: object): void;
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
     * @param {object} callback The method associated with the provided
     *   event type, will be called with the fired event.
     */
    addEventListener(type: string, callback: object): void;
    /**
     * Remove an event listener from this class.
     *
     * @param {string} type The event type.
     * @param {object} callback The method associated with the provided
     *   event type.
     */
    removeEventListener(type: string, callback: object): void;
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
     */
    onimageset: (event: object) => void;
    /**
     * Handle an image change event.
     *
     * @param {object} event The event.
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
     * @param {Point3D} center The scale center.
     */
    setScale(newScale: object, center: Point3D): void;
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
     * @param {object} callback The method associated with the provided
     *   event type, will be called with the fired event.
     */
    addEventListener(type: string, callback: object): void;
    /**
     * Remove an event listener from this class.
     *
     * @param {string} type The event type.
     * @param {object} callback The method associated with the provided
     *   event type.
     */
    removeEventListener(type: string, callback: object): void;
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
 * WindowLevel class.
 * <br>Pseudo-code:
 * <pre>
 *  if (x &lt;= c - 0.5 - (w-1)/2), then y = ymin
 *  else if (x > c - 0.5 + (w-1)/2), then y = ymax,
 *  else y = ((x - (c - 0.5)) / (w-1) + 0.5) * (ymax - ymin) + ymin
 * </pre>
 *
 * @see DICOM doc for [Window Center and Window Width]{@link http://dicom.nema.org/dicom/2013/output/chtml/part03/sect_C.11.html#sect_C.11.2.1.2}
 */
export declare class WindowLevel {
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
     * @param {WindowLevel} rhs The other window level to compare to.
     * @returns {boolean} True if both window level are equal.
     */
    equals(rhs: WindowLevel): boolean;
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
     * @returns {WindowLevel} The window / level.
     */
    getWindowLevel(): WindowLevel;
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
     * @param {WindowLevel} wl The window level.
     */
    setWindowLevel(wl: WindowLevel): void;
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

export { }
