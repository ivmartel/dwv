// namespaces
var dwv = dwv || {};
dwv.gui = dwv.gui || {};
dwv.gui.base = dwv.gui.base || {};

/**
 * Get the size of the image display window.
 */
dwv.gui.base.getWindowSize = function ()
{
    return { 'width': window.innerWidth, 'height': window.innerHeight - 147 };
};

/**
 * Ask some text to the user.
 * @param {String} message Text to display to the user.
 * @param {String} defaultText Default value displayed in the text input field.
 * @return {String} Text entered by the user.
 */
dwv.gui.base.prompt = function (message, defaultText)
{
    return prompt(message, defaultText);
};

/**
 * Display a progress value.
 * @param {Number} percent The progress percentage.
 */
dwv.gui.base.displayProgress = function (/*percent*/)
{
    // default does nothing...
};

/**
 * Focus the view on the image.
 */
dwv.gui.base.focusImage = function ()
{
    // default does nothing...
};

/**
 * Post process a HTML table.
 * @param {Object} table The HTML table to process.
 * @return The processed HTML table.
 */
dwv.gui.base.postProcessTable = function (/*table*/)
{
    // default does nothing...
};

/**
 * Get a HTML element associated to a container div.
 * @param {Number} containerDivId The id of the container div.
 * @param {String} name The name or id to find.
 * @return {Object} The found element or null.
 */
dwv.gui.base.getElement = function (containerDivId, name)
{
    // get by class in the container div
    var parent = document.getElementById(containerDivId);
    var elements = parent.getElementsByClassName(name);
    // getting the last element since some libraries (ie jquery-mobile) creates
    // span in front of regular tags (such as select)...
    var element = elements[elements.length-1];
    // if not found get by id with 'containerDivId-className'
    if ( typeof element === "undefined" ) {
        element = document.getElementById(containerDivId + '-' + name);
    }
    return element;
 };

 /**
 * Refresh a HTML element. Mainly for jquery-mobile.
 * @param {String} element The HTML element to refresh.
 */
dwv.gui.base.refreshElement = function (/*element*/)
{
    // base does nothing...
};

/**
 * Set the selected item of a HTML select.
 * @param {String} element The HTML select element.
 * @param {String} value The value of the option to mark as selected.
 */
dwv.gui.setSelected = function (element, value)
{
    if ( element ) {
        var index = 0;
        for( index in element.options){
            if( element.options[index].value === value ) {
                break;
            }
        }
        element.selectedIndex = index;
        dwv.gui.refreshElement(element);
    }
};

/**
 * Slider base gui.
 * @constructor
 */
dwv.gui.base.Slider = function (app)
{
    /**
     * Append the slider HTML.
     */
    this.append = function ()
    {
        // default values
        var min = 0;
        var max = 1;

        // jquery-mobile range slider
        // minimum input
        var inputMin = document.createElement("input");
        inputMin.id = "threshold-min";
        inputMin.type = "range";
        inputMin.max = max;
        inputMin.min = min;
        inputMin.value = min;
        // maximum input
        var inputMax = document.createElement("input");
        inputMax.id = "threshold-max";
        inputMax.type = "range";
        inputMax.max = max;
        inputMax.min = min;
        inputMax.value = max;
        // slicer div
        var div = document.createElement("div");
        div.id = "threshold-div";
        div.setAttribute("data-role", "rangeslider");
        div.appendChild(inputMin);
        div.appendChild(inputMax);
        div.setAttribute("data-mini", "true");
        // append to document
        app.getElement("thresholdLi").appendChild(div);
        // bind change
        $("#threshold-div").on("change",
                function(/*event*/) {
                    app.onChangeMinMax(
                        { "min":$("#threshold-min").val(),
                          "max":$("#threshold-max").val() } );
                }
            );
        // refresh
        dwv.gui.refreshElement(app.getElement("toolList"));
    };

    /**
     * Initialise the slider HTML.
     */
    this.initialise = function ()
    {
        var min = app.getImage().getDataRange().min;
        var max = app.getImage().getDataRange().max;

        // minimum input
        var inputMin = document.getElementById("threshold-min");
        inputMin.max = max;
        inputMin.min = min;
        inputMin.value = min;
        // maximum input
        var inputMax = document.getElementById("threshold-max");
        inputMax.max = max;
        inputMax.min = min;
        inputMax.value = max;
        // refresh
        dwv.gui.refreshElement(app.getElement("toolList"));
    };

}; // class dwv.gui.base.Slider

/**
 * DICOM tags base gui.
 * @param {Object} app The associated application.
 * @constructor
 */
dwv.gui.base.DicomTags = function (app)
{
    /**
     * Update the DICOM tags table with the input info.
     * @param {Object} dataInfo The data information.
     */
    this.update = function (dataInfo)
    {
        // HTML node
        var node = app.getElement("tags");
        if( node === null ) {
            console.warn("Cannot find a node to append the DICOM tags.");
            return;
        }
        // remove possible previous
        while (node.hasChildNodes()) {
            node.removeChild(node.firstChild);
        }
        // tags HTML table
        var table = dwv.html.toTable(dataInfo);
        // css
        table.className = "tagsTable";

        // optional gui specific table post process
        dwv.gui.postProcessTable(table);

        // translate first row
        if (table.rows.length !== 0) {
            dwv.html.translateTableRow(table.rows.item(0));
        }

        // append search form
        node.appendChild(dwv.html.getHtmlSearchForm(table));
        // append tags table
        node.appendChild(table);
        // refresh
        dwv.gui.refreshElement(node);
    };

}; // class dwv.gui.base.DicomTags

/**
 * Drawing list base gui.
 * @param {Object} app The associated application.
 * @constructor
 */
dwv.gui.base.DrawList = function (app)
{
    /**
     * Closure to self.
     */
    var self = this;

    /**
     * Update the draw list html element
     * @param {Object} event A change event, decides if the table is editable or not.
     */
    this.update = function (event)
    {
        var isEditable = false;
        if (typeof event.editable !== "undefined") {
            isEditable = event.editable;
        }

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

        // translate shape names
        dwv.html.translateTableColumn(table, 3, "shape", "name");

        // do not go there if just one row...
        if ( table.rows.length > 1 ) {

            // create a color onkeyup handler
            var createColorOnKeyUp = function (details) {
                return function () {
                    details.color = this.value;
                    app.updateDraw(details);
                };
            };
            // create a text onkeyup handler
            var createTextOnKeyUp = function (details) {
                return function () {
                    details.label = this.value;
                    app.updateDraw(details);
                };
            };
            // create a long text onkeyup handler
            var createLongTextOnKeyUp = function (details) {
                return function () {
                    details.description = this.value;
                    app.updateDraw(details);
                };
            };
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
            // create visibility handler
            var createVisibleOnClick = function (details) {
                return function () {
                    app.toogleGroupVisibility(details);
                };
            };

            // append visible column to the header row
            var row0 = table.rows.item(0);
            var cell00 = row0.insertCell(0);
            cell00.outerHTML = "<th>" + dwv.i18n("basics.visible") + "</th>";

            // loop through rows
            for (var r = 1; r < table.rows.length; ++r) {
                var drawId = r - 1;
                var drawDetails = drawDisplayDetails[drawId];
                var row = table.rows.item(r);
                var cells = row.cells;

                // loop through cells
                for (var c = 0; c < cells.length; ++c) {
                    // show short ID
                    if (c === 0) {
                        cells[c].firstChild.data = cells[c].firstChild.data.substring(0, 5);
                    }

                    if (isEditable) {
                        // color
                        if (c === 4) {
                            dwv.html.makeCellEditable(cells[c], createColorOnKeyUp(drawDetails), "color");
                        }
                        // text
                        else if (c === 5) {
                            dwv.html.makeCellEditable(cells[c], createTextOnKeyUp(drawDetails));
                        }
                        // long text
                        else if (c === 6) {
                            dwv.html.makeCellEditable(cells[c], createLongTextOnKeyUp(drawDetails));
                        }
                    }
                    else {
                        // id: link to image
                        cells[0].onclick = createRowOnClick(
                            cells[1].firstChild.data,
                            cells[2].firstChild.data);
                        cells[0].onmouseover = dwv.html.setCursorToPointer;
                        cells[0].onmouseout = dwv.html.setCursorToDefault;
                        // color: just display the input color with no callback
                        if (c === 4) {
                            dwv.html.makeCellEditable(cells[c], null, "color");
                        }
                    }
                }

                // append visible column
                var cell0 = row.insertCell(0);
                var input = document.createElement("input");
                input.setAttribute("type", "checkbox");
                input.checked = app.isGroupVisible(drawDetails);
                input.onclick = createVisibleOnClick(drawDetails);
                cell0.appendChild(input);
            }

            // editable checkbox
            var tickBox = document.createElement("input");
            tickBox.setAttribute("type", "checkbox");
            tickBox.id = "checkbox-editable";
            tickBox.checked = isEditable;
            tickBox.onclick = function () { self.update({"editable": this.checked}); };
            // checkbox label
            var tickLabel = document.createElement("label");
            tickLabel.setAttribute( "for", tickBox.id );
            tickLabel.setAttribute( "class", "inline" );
            tickLabel.appendChild( document.createTextNode( dwv.i18n("basics.editMode") ) );
            // checkbox div
            var tickDiv = document.createElement("div");
            tickDiv.appendChild(tickLabel);
            tickDiv.appendChild(tickBox);

            // search form
            node.appendChild(dwv.html.getHtmlSearchForm(table));
            // tick form
            node.appendChild(tickDiv);

        } // if more than one row

        // draw list table
        node.appendChild(table);

        // delete button
        if ( table.rows.length > 0 ) {
            // delete draw button
            var deleteButton = document.createElement("button");
            deleteButton.onclick = function () { app.deleteDraws(); };
            deleteButton.setAttribute( "class", "ui-btn ui-btn-inline" );
            deleteButton.appendChild( document.createTextNode( dwv.i18n("basics.deleteDraws") ) );
            if (!isEditable) {
                deleteButton.style.display = "none";
            }
            node.appendChild(deleteButton);
        }

        // refresh
        dwv.gui.refreshElement(node);
    };

}; // class dwv.gui.base.DrawList
