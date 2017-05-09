/**
 * Application GUI.
 */

// Default window level presets.
dwv.tool.defaultpresets = {};
// Default window level presets for CT.
dwv.tool.defaultpresets.CT = {
    "mediastinum": {"center": 40, "width": 400},
    "lung": {"center": -500, "width": 1500},
    "bone": {"center": 500, "width": 2000},
};

// decode query
dwv.utils.decodeQuery = dwv.utils.base.decodeQuery;

// Window
dwv.gui.getWindowSize = function () {
    return { 'width': ($(window).width()), 'height': ($(window).height() - 147) };
};
// Progress
/* global NProgress */
dwv.gui.displayProgress = function (percent) {
    console.log(percent);
    NProgress.configure({ showSpinner: false });
    if( percent < 100 ) {
        NProgress.set(percent/100);
    }
    else if( percent >= 100 ) {
        NProgress.done();
    }
};
// get element
dwv.gui.getElement = dwv.gui.base.getElement;
// Focus
dwv.gui.focusImage = dwv.gui.base.focusImage;
// refresh
dwv.gui.refreshElement = function (element) {
    if( $(element)[0].nodeName.toLowerCase() === 'select' ) {
        $(element).selectmenu('refresh');
    }
    else {
        $(element).enhanceWithin();
    }
};
// Slider
dwv.gui.Slider = null;
// Tags table
dwv.gui.DicomTags = null;
// DrawList table
dwv.gui.DrawList = function (app)
{
    /**
     * Update the draw list html element
     * @param {Object} event A change event, decides if the table is editable or not.
     */
    this.update = function (/*event*/)
    {
        // HTML node
        var node = app.getElement("drawList");
        if( node === null ) {
            return;
        }
        // remove possible previous
        while (node.hasChildNodes()) {
            node.removeChild(node.firstChild);
        }
        // tags HTML table
        var drawDisplayDetails = app.getDrawDisplayDetails();
        var table = dwv.html.toTable(drawDisplayDetails);
        table.className = "drawsTable";

        // optional gui specific table post process
        dwv.gui.postProcessTable(table);

        // translate first row
        if (table.rows.length !== 0) {
            dwv.html.translateTableRow(table.rows.item(0));
        }

        // do not go there if just one row...
        if ( table.rows.length > 0 ) {
            // create a row onclick handler
            var createRowOnClick = function (slice, frame) {
                return function () {
                    // update slice
                    var pos = app.getViewController().getCurrentPosition();
                    pos.k = slice;
                    app.getViewController().setCurrentPosition(pos);
                    // update frame
                    app.getViewController().setCurrentFrame(frame);
                    // focus on the image
                    dwv.gui.focusImage();
                };
            };

            // loop through rows
            for (var r = 1; r < table.rows.length; ++r) {
                var row = table.rows.item(r);
                var cells = row.cells;

                // allow click on row
                row.onclick = createRowOnClick(
                    cells[1].firstChild.data,
                    cells[2].firstChild.data);
                row.onmouseover = dwv.html.setCursorToPointer;
                row.onmouseout = dwv.html.setCursorToDefault;

                // color: just display the input color with no callback
                dwv.html.makeCellEditable(cells[4], null, "color");
            }
        } // if more than one row

        // draw list table
        node.appendChild(table);
        // refresh
        dwv.gui.refreshElement(node);
    };
};
// post process table
dwv.gui.postProcessTable = function (table) {
    var tableClass = table.className;
    // css
    table.className += " table-stripe ui-responsive";
    // add columntoggle
    table.setAttribute("data-role", "table");
    table.setAttribute("data-mode", "columntoggle");
    table.setAttribute("data-column-btn-text", dwv.i18n("basics.columns") + "...");
    // add priority columns for columntoggle
    var addDataPriority = function (cell) {
        var text = cell.firstChild.data;
        if ( tableClass === "tagsTable" ) {
            if ( text !== "value" && text !== "name" ) {
                cell.setAttribute("data-priority", "5");
            }
        }
        else if ( tableClass === "drawsTable" ) {
            if ( text === "description" ) {
                cell.setAttribute("data-priority", "1");
            }
            else if ( text === "id" || text === "frame" || text === "slice" ) {
                cell.setAttribute("data-priority", "5");
            }

        }
    };
    if (table.rows.length !== 0) {
        var hCells = table.rows.item(0).cells;
        for (var c = 0; c < hCells.length; ++c) {
            addDataPriority(hCells[c]);
        }
    }

    if (table.rows.length !== 0) {
        for (var r = 0; r < table.rows.length; ++r) {
            var cells = table.rows.item(r).cells;
            for (var c1 = 0; c1 < cells.length; ++c1) {
                // hide first 4 columns
                if (c1 >= 0 && c1 < 4 ) {
                    cells[c1].style.display = "none";
                }
            }
        }
    }

    // return
    return table;
};

// Toolbox
dwv.gui.Toolbox = function (app)
{
    this.setup = function (/*list*/)
    {
        var mainFieldset = document.createElement("fieldset");
        mainFieldset.className = "mainfieldset";
        mainFieldset.setAttribute("data-role", "controlgroup");
        mainFieldset.setAttribute("data-type", "horizontal");

        var toolFieldset = document.createElement("fieldset");
        toolFieldset.className = "toolfieldset";
        toolFieldset.setAttribute("data-role", "controlgroup");
        toolFieldset.setAttribute("data-type", "horizontal");
        toolFieldset.setAttribute("style", "padding-right:10px;");

        mainFieldset.appendChild(toolFieldset);

        var node = app.getElement("toolbar");
        node.appendChild(mainFieldset);
        dwv.gui.refreshElement(node);
    };

    this.display = function (/*bool*/)
    {
        // does nothing...
    };
    this.initialise = function (list)
    {
        // not wonderful: first one should be scroll...
        if ( list[0] === false ) {
            var inputScroll = app.getElement("scrollLi");
            inputScroll.parentNode.style.display = "none";
            inputScroll.checked = false;
            var inputZoom = app.getElement("zoomLi");
            inputZoom.checked = true;
        }

        // refresh
        $("input[type='radio']").checkboxradio("refresh");
        var node = app.getElement("toolfieldset");
        dwv.gui.refreshElement(node);
    };
};

// Window/level
dwv.gui.WindowLevel = function (app)
{
    this.setup = function ()
    {
        var input = document.createElement("input");
        input.id = "wlLi";
        input.className = "wlLi";
        input.name = "radio-choice";
        input.type = "radio";
        input.value = "WindowLevel";
        input.onclick = app.onChangeTool;

        var label = document.createElement("label");
        label.setAttribute("for", "wlLi");
        label.appendChild(document.createTextNode(dwv.i18n("tool.WindowLevel.name")));

        var node = app.getElement("toolfieldset");
        $(node).controlgroup("container").append(input);
        $(node).controlgroup("container").append(label);
        dwv.gui.refreshElement(node);
    };
    this.display = function (/*bool*/)
    {
        // does nothing...
    };
    this.initialise = function ()
    {
        // clear previous
        $(".presetSelect").remove();
        $(".presetLabel").remove();

        // create preset select
        var select = dwv.html.createHtmlSelect("presetSelect",
            app.getViewController().getWindowLevelPresetsNames(), "wl.presets", true);
        select.onchange = app.onChangeWindowLevelPreset;
        select.title = "Select w/l preset.";
        select.setAttribute("data-inline","true");

        // label as span (otherwise creates new line)
        var span = document.createElement("span");
        span.className = "presetLabel";
        span.appendChild(document.createTextNode(dwv.i18n("basics.presets") + ": "));

        var node = app.getElement("mainfieldset");
        node.appendChild(span);
        node.appendChild(select);
        dwv.gui.refreshElement(node);
    };
};

// Zoom
dwv.gui.ZoomAndPan = function (app)
{
    this.setup = function ()
    {
        var input = document.createElement("input");
        input.id = "zoomLi";
        input.className = "zoomLi";
        input.name = "radio-choice";
        input.type = "radio";
        input.value = "ZoomAndPan";
        input.onclick = app.onChangeTool;

        var label = document.createElement("label");
        label.setAttribute("for", "zoomLi");
        label.appendChild(document.createTextNode(dwv.i18n("tool.ZoomAndPan.name")));

        var node = app.getElement("toolfieldset");
        $(node).controlgroup("container").append(input);
        $(node).controlgroup("container").append(label);
        dwv.gui.refreshElement(node);
    };
    this.display = function (/*bool*/)
    {
        // does nothing...
    };
};

// Scroll
dwv.gui.Scroll = function (app)
{
    this.setup = function ()
    {
        var input = document.createElement("input");
        input.id = "scrollLi";
        input.className = "scrollLi";
        input.name = "radio-choice";
        input.checked = "checked";
        input.type = "radio";
        input.value = "Scroll";
        input.onclick = app.onChangeTool;

        var label = document.createElement("label");
        label.setAttribute("for", "scrollLi");
        label.appendChild(document.createTextNode(dwv.i18n("tool.Scroll.name") ));

        var node = app.getElement("toolfieldset");
        $(node).controlgroup("container").append(input);
        $(node).controlgroup("container").append(label);
        dwv.gui.refreshElement(node);
    };
    this.display = function (/*bool*/)
    {
        // does nothing...
    };
};

//Reset
dwv.gui.appendResetHtml = function (app)
{
    var button = document.createElement("button");
    button.className = "resetLi";
    button.value = "reset";
    button.onclick = app.onDisplayReset;
    button.appendChild(document.createTextNode(dwv.i18n("basics.reset")));
    button.setAttribute("class","ui-btn ui-btn-inline");

    var node = app.getElement("mainfieldset");
    node.appendChild(button);
    dwv.gui.refreshElement(node);
};

// Draw: does nothing, we want drawings but not the draw tool...
dwv.gui.Draw = function (/*app*/)
{
    this.getDefaultColour = function () { return ""; };
    this.setup = function (/*shapeList*/) {} ;
    this.display = function (/*bool*/) {};
    this.initialise = function () {};
};
