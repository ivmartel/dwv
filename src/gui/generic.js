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
 * @constructor
 */
dwv.gui.base.DicomTags = function (app)
{
    /**
     * Initialise the DICOM tags table. To be called once the DICOM has been parsed.
     * @param {Object} dataInfo The data information.
     */
    this.initialise = function (dataInfo)
    {
        // HTML node
        var node = app.getElement("tags");
        if( node === null ) {
            return;
        }
        // remove possible previous
        while (node.hasChildNodes()) {
            node.removeChild(node.firstChild);
        }
        // tags HTML table
        var table = dwv.html.toTable(dataInfo);
        table.className = "tagsTable table-stripe";

        // TODO jquery-mobile specific...
        table.setAttribute("data-role", "table");
        table.setAttribute("data-mode", "columntoggle");
        table.setAttribute("data-column-btn-text", dwv.i18n("basics.columns") + "...");
        // add priority on first row for columntoggle
        var addDataPriority = function (cell) {
            var text = cell.firstChild.data;
            if ( text !== dwv.i18n("basics.value") && text !== dwv.i18n("basics.name") ) {
                cell.setAttribute("data-priority", "1");
            }
        };
        var hCells = table.rows.item(0).cells;
        for (var c = 0; c < hCells.length; ++c) {
            addDataPriority(hCells[c]);
        }

        // search form
        node.appendChild(dwv.html.getHtmlSearchForm(table));
        // tags table
        node.appendChild(table);
        // refresh
        dwv.gui.refreshElement(node);
    };

}; // class dwv.gui.base.DicomTags

/**
 * Drawing list base gui.
 * @constructor
 */
dwv.gui.base.DrawList = function (app)
{
    var self = this;

    /**
     *
     */
    function makeCellEditable(cell, drawId, changeType) {
        // check event
        if (typeof rowId === "undefined" &&
            typeof changeType === "undefined" &&
            typeof cell === "undefined" ) {
                return;
        }
        // HTML input
        var input = document.createElement("input");
        // handle change
        input.onkeyup = function (/*event*/) {
            var draw = app.getDrawList()[drawId];
            if (changeType === "color") {
                draw.color = this.value;
                app.updateDraw(draw);
            }
            else if (changeType === "text") {
                draw.text = this.value;
                app.updateDraw(draw);
            }
            else if (changeType === "longText") {
                draw.longText = this.value;
                app.updateDraw(draw);
            }
        };
        // set input value
        input.value = cell.firstChild.data;

        // HTML form
        var form = document.createElement("form");
        form.appendChild(input);
        // clean cell
        dwv.html.cleanNode(cell);
        // add form to cell
        cell.appendChild(form);
    }

    /**
     *
     */
    function createClickHandler(inputRow) {
        return function () {
            // slice
            var pos = app.getViewController().getCurrentPosition();
            pos.k = inputRow.cells[1].firstChild.data;
            app.getViewController().setCurrentPosition(pos);
            // frame
            var frame = inputRow.cells[2].firstChild.data;
            app.getViewController().setCurrentFrame(frame);

            // specific...
            $.mobile.changePage("#main");
        };
    }

    /**
     * Update the draw list html element
     * @param {Object} event A change event.
     */
    this.update = function (event)
    {
        var isEditable = false;
        if (typeof event.editable !== "undefined") {
            isEditable = event.editable;
        }

        // HTML node
        var node = app.getElement("draw-list");
        if( node === null ) {
            return;
        }
        // remove possible previous
        while (node.hasChildNodes()) {
            node.removeChild(node.firstChild);
        }
        // tags HTML table
        var table = dwv.html.toTable(app.getDrawList());
        //table.className = "drawsTable";

        table.className = "drawsTable ui-responsive table-stripe";

        // TODO jquery-mobile specific...
        table.setAttribute("data-role", "table");
        table.setAttribute("data-mode", "columntoggle");
        table.setAttribute("data-column-btn-text", dwv.i18n("basics.columns") + "...");


        // add priority on first row for columntoggle
        var addDataPriority = function (cell) {
            var text = cell.firstChild.data;
            if ( text !== "text" && text !== "longtext" ) {
                cell.setAttribute("data-priority", "1");
            }
        };
        var hCells = table.rows.item(0).cells;
        for (var hc = 0; hc < hCells.length; ++hc) {
            addDataPriority(hCells[hc]);
        }

        //table.style.width = "100%";
        //table.style["text-align"] = "left";

        var setCursorToPointer = function () {
            document.body.style.cursor = 'pointer';
        };
        var setCursorToDefault = function () {
            document.body.style.cursor = 'default';
        };

        for (var r = 0; r < table.rows.length; ++r) {
            var drawId = r - 1;
            var row = table.rows.item(r);
            var cells = row.cells;

            for (var c = 0; c < cells.length; ++c) {
                if (r !== 0) {
                    if (isEditable) {
                        // color
                        if (c === 4) {
                            makeCellEditable(cells[c], drawId, "color");
                        }
                        // text
                        else if (c === 5) {
                            makeCellEditable(cells[c], drawId, "text");
                        }
                        // long text
                        else if (c === 6) {
                            makeCellEditable(cells[c], drawId, "longText");
                        }
                    }
                    else {
                        row.onclick = createClickHandler(row);
                        row.onmouseover = setCursorToPointer;
                        row.onmouseout = setCursorToDefault;
                    }
                }
            }
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
        tickLabel.appendChild(document.createTextNode("Edit mode"));
        // checkbox div
        var tickDiv = document.createElement("div");
        tickDiv.appendChild(tickLabel);
        tickDiv.appendChild(tickBox);

        // search form
        node.appendChild(dwv.html.getHtmlSearchForm(table));
        // tick form
        node.appendChild(tickDiv);
        // tags table
        node.appendChild(table);
        // refresh
        dwv.gui.refreshElement(node);
    };

}; // class dwv.gui.base.DrawList
