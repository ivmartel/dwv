// namespaces
var dwv = dwv || {};

/**
 * View controller.
 * @constructor
 */
dwv.ViewController = function ( view )
{
    // closure to self
    var self = this;
    // Window/level presets
    var presets = null;
    // Slice/frame player ID (created by setInterval)
    var playerID = null;

    /**
     * Get the window/level presets.
     * @return {Object} The presets.
     */
    this.getPresets = function () { return presets; };

    /**
     * Check if the controller is playing.
     * @return {Boolean} True is the controler is playing slices/frames.
     */
    this.isPlaying = function () { return (playerID !== null); };

    /**
     * Get the current position.
     * @return {Object} The position.
      */
    this.getCurrentPosition = function ()
    {
        return view.getCurrentPosition();
    };

    /**
     * Set the current position.
     * @param {Object} pos The position.
     * @return {Boolean} False if not in bounds.
      */
    this.setCurrentPosition = function (pos)
    {
        return view.setCurrentPosition(pos);
    };

    /**
     * Set the current 2D (i,j) position.
     * @param {Number} i The column index.
     * @param {Number} j The row index.
     * @return {Boolean} False if not in bounds.
      */
    this.setCurrentPosition2D = function (i, j)
    {
        return view.setCurrentPosition({
            "i": i,
            "j": j,
            "k": view.getCurrentPosition().k
        });
    };

    /**
     * Set the current slice position.
     * @param {Number} k The slice index.
     * @return {Boolean} False if not in bounds.
      */
    this.setCurrentSlice = function (k)
    {
        return view.setCurrentPosition({
            "i": view.getCurrentPosition().i,
            "j": view.getCurrentPosition().j,
            "k": k
        });
    };

    /**
     * Increment the current slice number.
     * @return {Boolean} False if not in bounds.
     */
    this.incrementSliceNb = function ()
    {
        return self.setCurrentSlice( view.getCurrentPosition().k + 1 );
    };

    /**
     * Decrement the current slice number.
     * @return {Boolean} False if not in bounds.
     */
    this.decrementSliceNb = function ()
    {
        return self.setCurrentSlice( view.getCurrentPosition().k - 1 );
    };

    /**
     * Get the current frame.
     * @return {Number} The frame number.
      */
    this.getCurrentFrame = function ()
    {
        return view.getCurrentFrame();
    };

    /**
     * Set the current frame.
     * @param {Number} number The frame number.
     * @return {Boolean} False if not in bounds.
      */
    this.setCurrentFrame = function (number)
    {
        return view.setCurrentFrame(number);
    };

    /**
     * Increment the current frame.
     * @return {Boolean} False if not in bounds.
     */
    this.incrementFrameNb = function ()
    {
        return view.setCurrentFrame( view.getCurrentFrame() + 1 );
    };

    /**
     * Decrement the current frame.
     * @return {Boolean} False if not in bounds.
     */
    this.decrementFrameNb = function ()
    {
        return view.setCurrentFrame( view.getCurrentFrame() - 1 );
    };

    /**
     * Go to first slice .
     * @return {Boolean} False if not in bounds.
     * @deprecated Use the setCurrentSlice function.
     */
    this.goFirstSlice = function()
    {
        return view.setCurrentPosition({
            "i": view.getCurrentPosition().i,
            "j": view.getCurrentPosition().j,
            "k": 0
        });
    };

    /**
     *
     */
     this.play = function ()
     {
         if ( playerID === null ) {
             var nSlices = view.getImage().getGeometry().getSize().getNumberOfSlices();
             var nFrames = view.getImage().getNumberOfFrames();

             playerID = setInterval( function () {
                 if ( nSlices !== 1 ) {
                     if ( !self.incrementSliceNb() ) {
                         self.setCurrentSlice(0);
                     }
                 } else if ( nFrames !== 1 ) {
                     if ( !self.incrementFrameNb() ) {
                         self.setCurrentFrame(0);
                     }
                 }

             }, 300);
         } else {
             this.stop();
         }
     };

     /**
      *
      */
      this.stop = function ()
      {
          if ( playerID !== null ) {
              clearInterval(playerID);
              playerID = null;
          }
      };

    /**
     * Get the window/level.
     * @return {Object} The window center and width.
     */
    this.getWindowLevel = function ()
    {
        return {
            "width": view.getWindowLut().getWidth(),
            "center": view.getWindowLut().getCenter()
        };
    };

    /**
     * Set the window/level.
     * @param {Number} wc The window center.
     * @param {Number} ww The window width.
     */
    this.setWindowLevel = function (wc, ww)
    {
        view.setWindowLevel(wc,ww);
    };

    /**
     * Update the window/level presets.
     * @param {Object} image The associated image.
     * @param {Boolean} full If true, shows all presets.
     */
    this.updatePresets = function (image)
    {
        // store the manual preset
        var manual = null;
        if ( presets ) {
            manual = presets.manual;
        }
        // reinitialize the presets
        presets = {};

        // DICOM presets
        var dicomPresets = view.getWindowPresets();
        if ( dicomPresets ) {
            for( var i = 0; i < dicomPresets.length; ++i ) {
                presets[dicomPresets[i].name.toLowerCase()] = dicomPresets[i];
            }
        }

        // Image presets

        // min/max preset
        var range = image.getRescaledDataRange();
        var width = range.max - range.min;
        var center = range.min + width/2;
        presets.minmax = {"center": center, "width": width};
        // optional modality presets
        if ( typeof dwv.tool.defaultpresets !== "undefined" ) {
            var modality = image.getMeta().Modality;
            for( var key in dwv.tool.defaultpresets[modality] ) {
                presets[key] = dwv.tool.defaultpresets[modality][key];
            }
        }

        // Manual preset
        if ( manual ){
            presets.manual = manual;
        }
    };

    /**
     * Get the colour map.
     * @return {Object} The colour map.
     */
    this.getColourMap = function ()
    {
        return view.getColourMap();
    };

    /**
     * Set the colour map.
     * @param {Object} colourMap The colour map.
     */
    this.setColourMap = function (colourMap)
    {
        view.setColourMap(colourMap);
    };

    /**
     * Set the colour map from a name.
     * @param {String} name The name of the colour map to set.
     */
    this.setColourMapFromName = function (name)
    {
        // check if we have it
        if ( !dwv.tool.colourMaps[name] ) {
            throw new Error("Unknown colour map: '" + name + "'");
        }
        // enable it
        this.setColourMap( dwv.tool.colourMaps[name] );
    };

}; // class dwv.ViewController
