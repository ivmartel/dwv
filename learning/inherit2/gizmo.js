// taken from crockford: parasitic inheritance

function gizmo(id) {
    return {
        getId : function() {
            return id;
        },
        setId: function(id2) {
            id = id2;
        },
        toString: function() {
            return "gizmo " + id;
        }
    };
}

function hoozit(id) {
    var that = gizmo(id);
    that.test = function(testId) {
        return testId === id;
    };
    return that;
}
