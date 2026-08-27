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

//AMP matches InputType against the string constants in CustomFieldTypes, and that comparison is case
//sensitive - a lowercase "password" misses the check that masks the value when AMP pushes a settings
//update, so the password goes out to every connected client in the clear. Anything the generator wrote
//with the wrong casing is brought onto AMPs spelling on the way in.
const settingInputTypeCasing = {
    "password": "Password",
    "userpassword": "UserPassword",
    "randompassword": "RandomPassword",
    "textarea": "Textarea",
    "radio": "Radio",
    "url": "URL",
    "hidden": "HIDDEN",
};

function normalizeInputType(inputType) {
    var text = String(inputType == null || inputType === "" ? "text" : inputType).trim();
    if (text == "") { return "text"; }
    return settingInputTypeCasing[text.toLowerCase()] || text;
}

//MinValue/MaxValue/MultipleOf/Multiplier are float? in AMP and MaxLength/Order are int, so they have to
//go into the manifest as JSON numbers. Writing them as text makes AMP throw while reading the manifest,
//and that failure drops every setting in the file rather than just the one that was wrong.
function manifestNumber(value) {
    var text = String(value == null ? "" : value).trim();
    if (text == "") { return null; }
    var parsed = Number(text);
    return isFinite(parsed) ? parsed : null;
}

function manifestInteger(value) {
    var parsed = manifestNumber(value);
    return parsed === null ? null : Math.trunc(parsed);
}

//The list-valued parts of a spec are edited as one entry per line.
function manifestLines(text) {
    return String(text == null ? "" : text).split(/\r?\n/).map(line => line.trim()).filter(line => line != "");
}

function manifestLinesText(list) {
    return Array.isArray(list) ? list.join("\n") : "";
}

//The dictionary-valued parts are edited as JSON. An unparseable or empty object is left out entirely
//rather than written as something AMP would choke on.
function manifestJsonObject(text) {
    var trimmed = String(text == null ? "" : text).trim();
    if (trimmed == "") { return null; }

    try {
        var parsed = JSON.parse(trimmed);
        if (parsed == null || typeof parsed !== "object" || Array.isArray(parsed)) { return null; }
        return Object.keys(parsed).length > 0 ? parsed : null;
    }
    catch (e) {
        return null;
    }
}

function manifestJsonObjectText(value) {
    return value != null && typeof value === "object" && !Array.isArray(value) ? JSON.stringify(value, null, 4) : "";
}

function WildcardToRegex(pattern) {
    if (pattern == null || pattern === "") { return ""; }

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