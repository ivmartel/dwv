// namespaces
var dwv = dwv || {};
/** @namespace */
dwv.html = dwv.html || {};

/**
 * Remove all children of a HTML node.
 * @param {Object} node The node to remove kids.
 */
dwv.html.cleanNode = function (node) {
    // remove its children if node exists
    if ( !node ) {
        return;
    }
    while (node.hasChildNodes()) {
        node.removeChild(node.firstChild);
    }
};

/**
 * Remove a HTML node and all its children.
 * @param {String} nodeId The string id of the node to delete.
 */
dwv.html.removeNode = function (node) {
    // check node
    if ( !node ) {
        return;
    }
    // remove its children
    dwv.html.cleanNode(node);
    // remove it from its parent
    var top = node.parentNode;
    top.removeChild(node);
};

/**
 * Remove a list of HTML nodes and all their children.
 * @param {Array} nodes The list of nodes to delete.
 */
dwv.html.removeNodes = function (nodes) {
    for ( var i = 0; i < nodes.length; ++i ) {
        dwv.html.removeNode(nodes[i]);
    }
};

/**
 * Toggle the display of an element.
 * @param {Object} element The HTML element to display.
 */
dwv.html.toggleDisplay = function (element)
{
    if ( element.style.display === "none" ) {
        element.style.display = '';
    }
    else {
        element.style.display = "none";
    }
};
