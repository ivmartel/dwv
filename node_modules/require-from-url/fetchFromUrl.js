var crypto= require("crypto");
var proto = {
    http  : require("http"),
    https : require("https")
};

function md5(str) {
    return crypto.createHash('md5').update(str).digest('hex');
}

function fetchFromUrl(url, callback) {
    proto[url.protocol.slice(0, -1)].get(url, function(res) {
        var buf = [];
        res.on("data", function(data) {
            buf.push(data);
        }).on("end", function() {
            switch(res.statusCode) {
            case 200:
                callback(null, Buffer.concat(buf).toString(),
                       __dirname+'/'+md5(url.href)+url.path);
                break;
            default:
                callback(new Error("href="+url.href+"; statusCode="+res.statusCode));
            }
        });
    }).on('error', callback);
}

module.exports = fetchFromUrl;
