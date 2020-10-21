// tags file
var _tagsFile = null;
var _images = null;
var _generating = false;

function getPixelGeneratorName() {
  var tags = JSON.parse(document.getElementById('tags').value);
  // optional pixel generator (cannot be propagated)
  var pixelGeneratorName = "mpr";
  if ( typeof tags.PixelData !== "undefined" ) {
      pixelGeneratorName = tags.PixelData;
  }
  return pixelGeneratorName;
}

// generate DICOM data
function generate() {
    if (_generating) {
      return;
    }

    // check tags validity
    if (!isValidTags()) {
        return;
    }
    var pixelGeneratorName = getPixelGeneratorName();

    var zip = new JSZip();

    var numberOfSlices = document.getElementById('numberofslices').value;

    console.log('Generating slices...');
    var blob;
    for (var k = 0; k < numberOfSlices; ++k) {
      try {
        blob = generateSlice(pixelGeneratorName, k);
      } catch (error) {
        console.error(error);
        alert(error.message);
        return;
      }
      zip.file("dwv-generated-slice" + k + ".dcm", blob);
    }

    zip.generateAsync({type:"blob"}).then(function (blob) {
        console.log('Zipping data...');
        var element = document.getElementById("generate");
        element.download = "dwv-generated.zip";
        element.href = URL.createObjectURL(blob);

        // simultate a click event to trigger download
        // (avoid infinte loop with generating flag)
        // see: https://github.com/eligrey/FileSaver.js
        _generating = true;
        element.dispatchEvent(new MouseEvent('click'));
        _generating = false;
        // revoke url to not download it twice
        setTimeout(function () {
          URL.revokeObjectURL(element.href)
        }, 2E3) // 2s
    }, function (error) {
        console.error(error);
        alert(error.message);
    });
}

function generateSlice(pixelGeneratorName, sliceNumber) {
    var numberOfSlices = document.getElementById('numberofslices').value;

    // get tags from the textarea
    var tags = JSON.parse(document.getElementById('tags').value);
    // remove extra
    delete tags.PixelData;
    // image position
    var spacing = tags.PixelSpacing[0];
    tags.ImagePositionPatient = [0, 0, sliceNumber * spacing];
    // convert JSON to DICOM element object
    var res = dwv.dicom.getElementsFromJSONTags(tags);
    var dicomElements = res.elements;
    // pixels
    dicomElements.x7FE00010 = dwv.dicom.generatePixelDataFromJSONTags(
        tags, res.offset, pixelGeneratorName, sliceNumber, _images, numberOfSlices);

    // create writer
    var writer = new dwv.dicom.DicomWriter();
    var dicomBuffer = writer.getBuffer(dicomElements);

    // view as Blob to allow download
    var blob = new Blob([dicomBuffer], {type: 'application/dicom'});
    return blob;
}

// save the tags as a JSON file
function saveTags()
{
    // check validity
    if (!isValidTags()) {
        return;
    }
    // get text from the textarea
    var text = document.getElementById('tags').value;
    // view as Blob to allow download
    var blob = new Blob([text], {type:"text/plain"});
    // update save button
    var element = document.getElementById("save");
    element.download = (_tagsFile === null ? "tags.json" : _tagsFile.name);
    element.href = URL.createObjectURL(blob);
}

// is the JSON valid?
function isValidTags()
{
    try {
        JSON.parse(document.getElementById('tags').value);
    }
    catch (error) {
        /* eslint-disable-next-line no-alert */
        alert("The JSON is not valid, please check it with JSONLint.");
        return false;
    }
    return true;
}

// open JSONLint to check the tags
function launchJSONlint()
{
    var text = document.getElementById('tags').value;
    var link = "http://jsonlint.com/?json=" + encodeURIComponent(text);
    window.open(link);
}

// handle input tags file
function onInputTagsFile(event)
{
    if (event.target.files.length === 0) {
        return;
    }
    _tagsFile = event.target.files[0];
    var reader = new FileReader();
    reader.onload = function (event) {
        document.getElementById('tags').value = event.target.result;
    };
    reader.readAsText(_tagsFile);
}

// handle input image file
function onInputImageFiles(event)
{
    if (event.target.files.length === 0) {
        return;
    }
    var files = event.target.files;

    // update number of slices field
    document.getElementById('numberofslices').value = files.length;

    var checkTags = function (tags, image) {
      return false;
    }
    var pixGeneratorName = getPixelGeneratorName();
    if (typeof dwv.dicom.pixelGenerators[pixGeneratorName] !== 'undefined') {
      checkTags = dwv.dicom.pixelGenerators[pixGeneratorName].checkTags;
    }

    function onReaderLoad(event) {
      var image = new Image();
      image.origin = file.name;
      // check size
      image.onload = function () {
        if (_images.length === 0) {
          // update tags if needed at first image load
          var tags = JSON.parse(document.getElementById('tags').value);
          if (checkTags(tags, this)) {
            /* eslint-disable-next-line no-alert */
            alert('Updating tags to input image meta data.');
            document.getElementById('tags').value = JSON.stringify(tags, null, 2);
          }
        } else {
          // check all images have equal sizes
          var message;
          if (this.width !== _images[0].width) {
            message = "Image width mismatch between input files: " +
              this.width + " != " + _images[0].width;
            console.error(message)
            alert(message);
            return;
          }
          if (this.height !== _images[0].height) {
            message = "Image height mismatch between input files: " +
              this.height + " != " + _images[0].height;
            console.error(message)
            alert(message);
            return;
          }
        }
        // save image
        _images.push(this);
      }
      // set src (triggers load)
      image.src = event.target.result;
    }

    _images = [];
    for (var i = 0; i < files.length; ++i) {
      var file = files[i];
      var reader = new FileReader();
      reader.onload = onReaderLoad;
      reader.readAsDataURL(file);
    }
}

// last minute
document.addEventListener('DOMContentLoaded', function (/*event*/) {
  var tags = JSON.parse(document.getElementById('tags').value);
  if (tags) {
    // set study date
    var today = new Date();
    var yearStr = today.getFullYear().toString();
    var monthStr = (today.getMonth() + 1).toString().padStart(2, '0');
    var dayStr = today.getDate().toString().padStart(2, '0');
    tags.StudyDate = yearStr + monthStr + dayStr;
    // instance UID
    tags.SOPInstanceUID = dwv.dicom.getUID('SOPInstanceUID');
    // write back
    document.getElementById('tags').value = JSON.stringify(tags, null, 2);
  }
});
