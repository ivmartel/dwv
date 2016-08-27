/**
 * Application GUI.
 */

// Default colour maps.
dwv.tool.colourMaps = {
    "plain": dwv.image.lut.plain,
    "invplain": dwv.image.lut.invPlain,
    "rainbow": dwv.image.lut.rainbow,
    "hot": dwv.image.lut.hot,
    "hotiron": dwv.image.lut.hot_iron,
    "pet": dwv.image.lut.pet,
    "hotmetalblue": dwv.image.lut.hot_metal_blue,
    "pet20step": dwv.image.lut.pet_20step
};
// Default window level presets.
dwv.tool.defaultpresets = {};
// Default window level presets for CT.
dwv.tool.defaultpresets.CT = {
    "mediastinum": {"center": 40, "width": 400},
    "lung": {"center": -500, "width": 1500},
    "bone": {"center": 500, "width": 2000},
    "brain": {"center": 40, "width": 80},
    "head": {"center": 90, "width": 350}
};

//decode query
dwv.utils.decodeQuery = dwv.utils.base.decodeQuery;

// Window
dwv.gui.getWindowSize = function () {
    return { 'width': ($('#pageMain').width() - 360), 'height': ($('#pageMain').height() - 75) };
};
// Progress
dwv.gui.displayProgress = function (percent) {
    // jquery-ui progress bar
    if( percent <= 100 ) {
        $("#progressbar").progressbar({ value: percent });
    }
};
// get element
dwv.gui.getElement = dwv.gui.base.getElement;
// refresh
dwv.gui.refreshElement = dwv.gui.base.refreshElement;
// Slider
dwv.gui.Slider = function (app)
{
    this.append = function ()
    {
        // nothing to do
    };
    this.initialise = function ()
    {
        var min = app.getImage().getDataRange().min;
        var max = app.getImage().getDataRange().max;

        // jquery-ui slider
        $( ".thresholdLi" ).slider({
            range: true,
            min: min,
            max: max,
            values: [ min, max ],
            slide: function( event, ui ) {
                app.onChangeMinMax(
                        {'min':ui.values[0], 'max':ui.values[1]});
            }
        });
    };
};

function toggle(dialogId)
{
    if( $(dialogId).dialog('isOpen') ) {
        $(dialogId).dialog('close');
    }
    else {
        $(dialogId).dialog('open');
    }
}
// Tags table
dwv.gui.DicomTags = dwv.gui.base.DicomTags;

// Loaders
dwv.gui.Loadbox = dwv.gui.base.Loadbox;
// File loader
dwv.gui.FileLoad = dwv.gui.base.FileLoad;
// Url loader
dwv.gui.UrlLoad =  dwv.gui.base.UrlLoad;

// Toolbox
dwv.gui.Toolbox = function (app)
{
    var base = new dwv.gui.base.Toolbox(app);

    this.setup = function(list)
    {
        base.setup(list);

        // toolbar
        var open = document.createElement("button");
        open.appendChild(document.createTextNode(dwv.i18n("basics.open")));
        open.onclick = function() { toggle(".openData"); };

        var toolbox = document.createElement("button");
        toolbox.appendChild(document.createTextNode(dwv.i18n("basics.toolbox")));
        toolbox.onclick = function() { toggle(".toolList"); };

        var history = document.createElement("button");
        history.appendChild(document.createTextNode(dwv.i18n("basics.history")));
        history.onclick = function() { toggle(".history"); };

        var tags = document.createElement("button");
        tags.appendChild(document.createTextNode(dwv.i18n("basics.dicomTags")));
        tags.onclick = function() { toggle(".tags"); };

        var image = document.createElement("button");
        image.appendChild(document.createTextNode(dwv.i18n("basics.image")));
        image.onclick = function() { toggle(".layerDialog"); };

        var info = document.createElement("button");
        info.appendChild(document.createTextNode(dwv.i18n("basics.info")));
        info.onclick = app.onToggleInfoLayer;

        var help = document.createElement("button");
        help.appendChild(document.createTextNode(dwv.i18n("basics.help")));
        help.onclick = function() { toggle(".help"); };

        var node = app.getElement("toolbar");
        node.appendChild(open);
        node.appendChild(toolbox);
        node.appendChild(history);
        node.appendChild(tags);
        node.appendChild(image);
        node.appendChild(info);
        node.appendChild(help);

        // apply button style
        $("button").button();

        // save state button
        var saveButton = document.createElement("button");
        saveButton.appendChild(document.createTextNode(dwv.i18n("basics.downloadState")));
        // save state link
        var toggleSaveState = document.createElement("a");
        toggleSaveState.onclick = app.onStateSave;
        toggleSaveState.download = "state.json";
        toggleSaveState.id = "download-state";
        toggleSaveState.appendChild(saveButton);
        // add to openData window
        node = app.getElement("openData");
        node.appendChild(toggleSaveState);
    };
    this.display = function (bool)
    {
        base.display(bool);
    };
    this.initialise = function (list)
    {
        base.initialise(list);
    };
};

//Window/level
dwv.gui.WindowLevel = dwv.gui.base.WindowLevel;
// Draw
dwv.gui.Draw = dwv.gui.base.Draw;
// Livewire
dwv.gui.Livewire = dwv.gui.base.Livewire;
// ZoomAndPan
dwv.gui.ZoomAndPan = dwv.gui.base.ZoomAndPan;
// Scroll
dwv.gui.Scroll = dwv.gui.base.Scroll;
// Filter
dwv.gui.Filter = dwv.gui.base.Filter;

// Filter: threshold
dwv.gui.Threshold = dwv.gui.base.Threshold;
// Filter: sharpen
dwv.gui.Sharpen = dwv.gui.base.Sharpen;
// Filter: sobel
dwv.gui.Sobel = dwv.gui.base.Sobel;

// Undo/redo
dwv.gui.Undo = dwv.gui.base.Undo;
// Help
dwv.gui.appendHelpHtml = dwv.gui.base.appendHelpHtml;
// Version
dwv.gui.appendVersionHtml = dwv.gui.base.appendVersionHtml;

// special setup
dwv.gui.setup = function () {
    $(".toggleInfoLayer").button({ icons:
        { primary: "ui-icon-comment" }, text: false,
        appendTo: "#dwv"
    });
    // create dialogs
    $(".openData").dialog({ position:
        {my: "left top", at: "left top", of: "#pageMain"},
        appendTo: "#dwv"
    });
    $(".toolList").dialog({ position:
        {my: "left top+160", at: "left top", of: "#pageMain"},
        appendTo: "#dwv"
    });
    $(".history").dialog({ position:
        {my: "left top+350", at: "left top", of: "#pageMain"},
        appendTo: "#dwv"
    });
    $(".tags").dialog({ position:
        {my: "right top", at: "right top", of: "#pageMain"},
        autoOpen: false, width: 500, height: 590,
        appendTo: "#dwv"
    });
    $(".help").dialog({ position:
        {my: "right top", at: "right top", of: "#pageMain"},
        autoOpen: false, width: 500, height: 590,
        appendTo: "#dwv"
    });

    // image dialog
    $(".layerDialog").dialog({ position:
        {my: "left+320 top", at: "left top", of: "#pageMain"},
        appendTo: "#dwv"
    });
    // default size
    $(".layerDialog").dialog({ width: "auto", resizable: false });
    // Resizable but keep aspect ratio
    // TODO it seems to add a border that bothers getting the cursor position...
    //$("#layerContainer").resizable({ aspectRatio: true });
};
