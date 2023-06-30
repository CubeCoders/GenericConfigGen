String.prototype.contains = function (contains) { return this.indexOf(contains) > -1; };
Array.prototype.contains = function (contains) { return this.indexOf(contains) > -1; };
String.prototype.isEmptyOrWhitespace = function () { return this.match(/^\s*$/); };
String.prototype.pad = function (size) {
    var s = String(this);
    if (typeof (size) !== "number") { size = 2; }

    while (s.length < size) { s = "0" + s; }
    return s;
};
Number.prototype.pad = String.prototype.pad;
if (!String.prototype.format) {
    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
                ;
        });
    };
}
if (!String.prototype.template) {
    String.prototype.template = function (obj) {
        return this.replace(/{{\$(.+?)}}/g, function (match, field) {
            return typeof obj[field] != 'undefined'
                ? obj[field]
                : match
                ;
        });
    };
}

function WildcardToRegex(pattern) {
    if (pattern == null) { return null; }

    var escapeReplace = function (data, original, replacement) {
        var searchRegex = new RegExp("\\\\+\\" + original);
        var newRegex = data.replace(searchRegex, function (match) {
            var count = match.length - 1;
            var halfCount = Math.floor(count / 2);
            var newSlashes = Array(halfCount).join("\\");
            var result = newSlashes + ((halfCount % 2 === 0) ? replacement : original);
            return result;
        });
        return newRegex;
    };
    
    var toRegex = function (pattern, starMatchesEmpty) {
        var reg = "^" + pattern.replace(/([.*+?^${}()|[\]/\\])/g, "\\$1") + "$";
        reg = reg.replace(/\d+/g, "\\d+"); // replace all numbers with \d+
        reg = reg.replace(/\s+/g, "\\s+"); // replace all numbers with \d+
        reg = reg.replace(/\\\*\\\{(\w+)\\\}/g, "(?<$1>.+)"); // replace *{} with named capture group
        reg = reg.replace(/\(\?<misc>\.\+\)/g, ".*"); // replace *{} with named capture group
        return reg;
    };
    
    return toRegex(pattern, false);
}