/**
 * Tests for the 'view/view.js' file.
 */
module("view");

test("Test listeners.", function() {
    // create an image
    var size0 = 4;
    var imgSize0 = new dwv.image.Size(size0, size0, 1);
    var imgSpacing0 = new dwv.image.Spacing(1, 1, 1);
    var buffer0 = [];
    for(var i=0; i<size0*size0; ++i) {
        buffer0[i] = i;
    }
    var image0 = new dwv.image.Image(imgSize0, imgSpacing0, buffer0);
    // create a view
    var view0 = new dwv.image.View(image0);
    
    // listeners
    var listener1 = function(event){
        equal( event.wc, 0, "Expected call to listener1.");
    };
    var listener2 = function(event){
        equal( event.ww, 1, "Expected call to listener2.");
    };
    // with two listeners
    view0.addEventListener("wlchange", listener1 );
    view0.addEventListener("wlchange", listener2 );
    view0.setWindowLevel(0,1);
    // without listener2
    view0.removeEventListener("wlchange", listener2 );
    view0.setWindowLevel(0,2);
    // without listener1
    view0.removeEventListener("wlchange", listener1 );
    view0.setWindowLevel(1,1);
});

test("Test generate data.", function() {
    // create an image
    var size0 = 128;
    var imgSize0 = new dwv.image.Size(size0, size0, 1);
    var imgSpacing0 = new dwv.image.Spacing(1, 1, 1);
    var buffer0 = [];
    for(var i=0; i<size0*size0; ++i) {
        buffer0[i] = i;
    }
    var image0 = new dwv.image.Image(imgSize0, imgSpacing0, buffer0);
    // create a view
    var view0 = new dwv.image.View(image0);
    // create the image data
    // TODO Uint8ClampedArray not in phantom??
    var imageData = {"width": size0, "height": size0, "data": new Uint8Array(size0*size0) };
    
    // default window level
    view0.setWindowLevelMinMax();
    
    // start time
    // TODO window.performance.now() not in phantom??
    var start0 = (new Date()).getMilliseconds(); 
    // call generate data
    view0.generateImageData(imageData);
    // time taken 
    var time0 = (new Date()).getMilliseconds() - start0;
    // check time taken
    ok( time0 < 90, "First generateImageData: "+time0+"ms.");
    
    // Change the window level
    view0.setWindowLevel(4000, 200);
    
    // start time
    var start1 = (new Date()).getMilliseconds();
    // call generate data
    view0.generateImageData(imageData);
    // time taken 
    var time1 = (new Date()).getMilliseconds() - start1;
    // check time taken
    ok( time1 < 90, "Second generateImageData: "+time1+"ms.");
});
