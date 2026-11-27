This page is part of the dwv [architecture](/tutorials/architecture) description and
describes the dwv load process.

Summary:

- [Load classes](#load-classes)
- [Load sequence](#load-sequence)
- [DICOM parsing](#dicom-parsing)
- [Pixel decompression](#pixel-decompression)
- [Image construction](#image-construction)
- [Multi-volume data](#multi-volume-data)

## Load classes

Data can come from 3 types of source: url (via a [XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)), file (via a [FileReader](https://developer.mozilla.org/en-US/docs/Web/API/FileReader)) or directly as a memory buffer. The 3 'meta' loaders responsible for each source are: {@link UrlsLoader}, {@link FilesLoader} and {@link MemoryLoader}.

![classes-io](classes-io.png)

*Classes involved in the load process.*

Each 'meta' loader retrieves the data and passes it to a specialised loader according
to its answer to the `canLoadUrl` or `canLoadFile` call. Specialised loaders will
typically convert the binary retrieved data into a local class, for example an {@link Image}.

The current specialised loaders are:

- {@link DicomDataLoader}: for DICOM data
- {@link RawImageLoader}: for image formats supported by the browser
- {@link RawVideoLoader}: for video formats supported by the browser
- {@link ZipLoader}: for data compressed in a ZIP file
- {@link MultipartLoader}: for WADO-RS `multipart/related` responses

They all extend `LoaderBase` (which implements the `LoadHandlers` `on*`
callback contract). Loader capability is queried via `canLoadFile`,
`canLoadUrl` or `canLoadMemory` (extension or media type based) and the 'meta'
loaders pick the first matching one. The loader list is built lazily
(`getLoaderList` in `src/io/loaderList.js`) to avoid a circular import.

Regarding DICOMweb, dwv is a User Agent for retrieval only (WADO-URI,
WADO-RS). Searching (QIDO-RS) or storing (STOW-RS) data is the job of the
embedding application (see the `dev/pacs` demo for an example). There is no
DIMSE networking.

The legacy JSON app state (`.json` inputs) is no longer loadable since v0.37,
annotations are loaded and saved as DICOM SR.

The main specialised loader, the {@link DicomDataLoader}, parses the binary dicom file
to extract all the meta data and then creates an {@link Image}, at first with only one slice.
When multiple items are loaded, it will append the extracted data to the first image to create a multi slice
image. Note that the dicom image data can be stored in a compressed format, in that case the DICOM loader will
decompress the data to create the image.

## Load sequence

Here are the events triggered during the complete load process (meaning the load of all the items):

- `loadstart`: the load started!
- `loadprogress`: the progress of the complete load (all items),
- `loaditem`: an item finished loading, an item can be a url or a file,
- `load`: all items were loaded successfully,
- `error`: an error has occured during load,
- `abort`: the load process has been aborted,
- `loadend`: the process has completed, whether successfully (after `load`) or unsuccessfully (after `abort` or `error`).

Once the load is started a unique `dataId` (string) is associated to the data being loaded.

![sequence-load](sequence-load.png)

*Example successful load sequence for loading a list of urls.*

The {@link LoadController} re-dispatches these events tagged with the
`dataid` and, for `loaditem`, an `isfirstitem` flag.

## DICOM parsing

[DicomParser::parse]{@link DicomParser#parse} reads the preamble, the File
Meta group (including the `TransferSyntaxUID`), then the dataset via the
`DataReader` (endian and VR aware). It uses the dictionary
(`src/dicom/dictionary.js`) for the VR and transfer syntax tables and produces
a tag key indexed list of {@link DataElement}s.

Private tags (not in the dictionary) read from implicit VR data come out with
VR `UN` and raw byte values; callers decode them as needed.

The {@link DicomWriter} writes data back using per-tag writing rules.
Its `setRemovePrivateTags(true)` drops all odd group tags (including inside
sequences) and overrides the rules.

## Pixel decompression

`getSyntaxDecompressionName` maps the transfer syntax to one of
`jpeg2000`, `jpeg-baseline`, `jpeg-lossless` or `rle` (or undefined if
uncompressed). When decompression is needed, the `DicomBufferToData` class
(`src/image/dicomBufferToData.js`, called by the {@link DicomDataLoader})
builds a `PixelBufferDecoder` which dispatches to a `ThreadPool`
(`src/utils/thread.js`) of web workers:

- `src/decoders/pdfjs/`: vendored Mozilla [pdf.js](https://github.com/mozilla/pdf.js)
  (patched for 16-bit signed grayscale), for JPEG Baseline and JPEG2000,
- `src/decoders/rii-mango/`: vendored
  [JPEGLosslessDecoderJS](https://github.com/rii-mango/JPEGLosslessDecoderJS),
  for JPEG Lossless,
- `src/decoders/dwv/`: dwv's own RLE decoder.

The same `ThreadPool`/`WorkerTask` mechanism is reused for image labeling
(`src/image/labelingThread.js`, for ex flood fill) and resampling
(`src/image/resamplingThread.js`).

## Image construction

The {@link DataController} routes the parsed data to a factory according to
its content:

- `ImageFactory`: builds an {@link Image} (pixel buffer and
  {@link Geometry}, rescale slope and intercept, SUV factor for PET,
  per-frame functional groups),
- {@link MaskFactory}: builds a {@link MaskImage} from DICOM SEG,
- {@link AnnotationGroupFactory}: parses DICOM SR into an
  {@link AnnotationGroup} (see [annotations](/tutorials/arch-annotations)),
- {@link RtStructFactory}: rasterizes RTSTRUCT contours into a
  {@link MaskImage}.

Images are built progressively: the first load item creates the `Image`,
later items (slices, or frames of a multi-frame file) are added via
`appendSlice` or `appendFrameBuffer` into a buffer preallocated from
`meta.sliceCapacity` (load items × frames per item). It is not to be confused
with `numberOfItems` (loader option and {@link DicomData} property: how many
files, urls, buffers or multipart parts are in the load); the image factory
is where the latter becomes the former.

The exported `demoCreateImage`, `demoCreateMaskImage` and `demoCreateView`
helpers are single file shortcuts for demos, not the application path.

## Multi-volume data

The tag that discriminates volumes (for ex in 4D data) is not known until all
data is loaded, so `guessVolumeIndices` (`src/dicom/dicomVolume.js`) tries an
ordered list of volume id getters (`defaultVolumeIdCandidates`:
TemporalPositionIdentifier, TemporalPositionIndex, DiffusionBValue (including
private b-value tags via `defaultPrivateBValueRules`, VR `UN` values decoded
as ASCII), ..., AcquisitionTime last) and keeps the first that yields a
valid and consistent per volume grouping. Candidates flagged `preLoad` are
also used while loading and must not vary within a volume.

The same logic serves both a series of files (`DicomSliceDataList` used by
the {@link DataController}, which buffers same-origin slices until the load
completes) and the frames of a single multi-frame file
(`getSortedFramesGeometry` in `src/dicom/dicomGeometry.js`, used by the image
factory). The candidate lists can be changed via the `custom` object, see
[extensibility](/tutorials/architecture#extensibility).
