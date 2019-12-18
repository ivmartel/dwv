// namespaces
var dwv = dwv || {};
/** @namespace */
dwv.html = dwv.html || {};

/**
 * Remove all children of a HTML node.
 * @param {Object} node The node to remove kids.
 */
dwv.html.cleanNode = function (node) {
    // check node
    if ( !node ) {
        return;
    }
    // remove its children
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
