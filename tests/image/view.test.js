/**
 * Tests for the 'image/image.js' file.
 */
$(document).ready(function(){
    test("Test View.", function() {
        // create an image
        var size0 = 4;
        var imgSize0 = new dwv.image.Size(size0, size0, 1);
        var imgSpacing0 = new dwv.image.Spacing(1, 1, 1);
        var buffer0 = [];
        for(var i=0; i<size0*size0; ++i) buffer0[i] = i;
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

});
