/**
 * jpeg.js: trying to load JPEG files...
 */
var canvas = document.getElementById("image");
var context = canvas.getContext("2d");

function postProcess(image)
{
    var link = document.createElement("a");
    //link.href = img.src;
    link.href = canvas.toDataURL("image/png");
    link.appendChild(document.createTextNode("image"));
    document.body.appendChild(link);
    
    var imageData = context.getImageData(0, 0, image.width, image.height);
    for (var x = 0; x < imageData.width; x++) {
        for (var y = 0; y < imageData.height; y++) {
            var offset = (y * imageData.width + x) * 4;
            //imageData.data[offset]; // red
            imageData.data[offset + 1] += 50; // green
            //imageData.data[offset + 2]; // blue
            //imageData.data[offset + 3]; // alpha
        }
    }
    context.putImageData(imageData, 0, 0);
}

function loadImageData(data, extension)
{
    var bytes = new Uint8Array(data);
    var t0 = new Date().getTime();
    var image = openjpeg(bytes, extension);
    console.log('---> openjpeg() total time: ', ((new Date().getTime()) - t0) + 'ms');
    
    canvas.width = image.width;
    canvas.height = image.height;
    
    var imageData = context.getImageData(0, 0, image.width, image.height);
    var pixelsPerChannel = image.width * image.height;
    var offset = pixelsPerChannel;
    // one layer
    if( image.data.length === pixelsPerChannel ) {
        console.log("Only one layer.");
        offset = 0;
    }
    
    for( var i=0; i < pixelsPerChannel; ++i ) {
        imageData.data[4*i]   = image.data[i];
        imageData.data[4*i+1] = image.data[i + offset];
        imageData.data[4*i+2] = image.data[i + 2*offset];
        imageData.data[4*i+3] = 0xff;
    }
    context.putImageData(imageData, 0, 0);
}

function loadImage(file)
{
    var image = new Image();
    image.src = file.name;
    canvas.width = image.width;
    canvas.height = image.height;
    image.onload = function() {
        context.drawImage(image, 0, 0, image.width, image.height);
        postProcess(image);
    };
}

function loadFile(file)
{
    var reader = new FileReader();
    reader.onload = (function(theFile) {
        return function(e) {
            var ext = file.name.substr(file.name.indexOf('.')+1, file.name.length);
            loadImageData(e.target.result, ext);
        };
      }(file));
    reader.readAsArrayBuffer(file);
}

function handleFilesSelect(evt)
{
    var files = evt.target.files; // FileList object
    var output = [];
    for (var i = 0; i < files.length; i++) {
        var f = files[i];
        output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
                  f.size, ' bytes, last modified: ',
                  f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
                  '</li>');
        
        var imageType = /image.*/; 
        if( f.type.match(imageType) ) {
            loadImage(f);
        }
        else {
            loadFile(f);
        }
    }
    document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
}

//bind open files with method
document.getElementById('files').addEventListener('change', handleFilesSelect, false);
