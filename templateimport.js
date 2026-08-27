/// Reads a finished set of AMP template files - a <name>.kvp plus its ports/updates/settings/metaconfig
/// manifests, or an instances own GenericModule.kvp with the JSON inline - and turns them back into the
/// shape the generator view model uses. The output uses the same field names as an exported
/// configuration, so importing a template and importing an export follow the same path.

const templateAuthorSuffix = " - Made with AMP Config Generator";

const templateConfigTypeIndexes = {
    "json": "0",
    "ini": "1",
    "xml": "2",
    "kvp": "3",
};

//The generators own port dropdown, keyed on the Ref the generator would have produced.
const templatePortTypes = {
    "steamqueryport": "Steam Query Port",
    "remoteadminport": "RCON Port",
    "maingameport": "Main Game Port",
};

//Values AMP works out for itself, or that the generator rebuilds from other answers. Importing them
//would only fight with the computed that owns them.
//Values AMP works out for itself, or that the generator rebuilds from other answers. Meta.EndpointURIFormat,
//Meta.SpecificDockerImage and App.EnvironmentVariables used to be here, but the generator's own versions
//of those threw away what a real template had - they're read onto backing fields instead, see below.
const templateDerivedKeys = [
    "Meta.DisplayImageSource", "Meta.ConfigManifest", "Meta.MetaConfigManifest",
    "Meta.ConfigRoot", "Meta.OS", "Meta.Author",
    "App.DisplayName", "App.RootDir", "App.BaseDirectory", "App.WorkingDir", "App.ExecutableWin",
    "App.ExecutableLinux", "App.LinuxCommandLineArgs", "App.SteamWorkshopDownloadLocation",
    "App.StoresSupported", "App.StoreDownloadLocations",
    "App.Ports", "App.UpdateSources", "App.PreStartStages", "App.AppSettings",
    //Built from a sample console line when there is one - imported onto the raw expressions instead, see below.
    "Console.AppReadyRegex", "Console.UserJoinRegex", "Console.UserLeaveRegex", "Console.UserChatRegex",
];

//Keys the generator would otherwise compute for itself, where a real template's own value has to win.
//They're read onto the backing field the computed falls back to when it's empty.
const templateBackingKeys = {
    "Meta.EndpointURIFormat": "_Meta_EndpointURIFormatRaw",
    "Meta.SpecificDockerImage": "_Meta_SpecificDockerImageRaw",
    "App.EnvironmentVariables": "_App_EnvironmentVariablesImported",
};

//The event expressions the generator can build from a sample line. There's no way back from a finished
//expression to the line it came from, so an imported one is kept verbatim as the expression itself.
const templateConsoleEventKeys = {
    "Console.AppReadyRegex": "_Console_AppReadyRegexRaw",
    "Console.UserJoinRegex": "_Console_UserJoinRegexRaw",
    "Console.UserLeaveRegex": "_Console_UserLeaveRegexRaw",
    "Console.UserChatRegex": "_Console_UserChatRegexRaw",
};

//Keys AMP itself no longer has. They're kept out of the imported values so they can't be written back
//out, and anything with a modern equivalent is migrated by migrateRetiredKeys below.
const templateRetiredKeys = [
    //Child process monitoring is now driven by App.MonitorChildProcessName being set at all.
    "App.MonitorChildProcess", "App.MonitorChildProcessWaitMs",
    //Removed with no replacement.
    "Console.ActivateLogRegex",
    //Still declared by AMP, but marked obsolete and no longer read.
    "App.SteamWorkshopDownloadLocation", "App.RCONConnectRetrySeconds", "App.SteamForceLoginPrompt",
];

//Bound to checkboxes in the UI, so they need real booleans rather than the "True"/"False" text.
const templateBooleanKeys = [
    "App_HasReadableConsole", "App_HasWriteableConsole", "App_ForceIPBinding", "App_SupportsIPv6",
    "App_MonitorDirectChildOnly", "Meta_NoCommercialUsage", "App_UseRandomAdminPassword",
    "App_PersistRandomPassword",
];

function templateParseBool(value) {
    return String(value).trim().toLowerCase() == "true" || String(value).trim() == "1";
}

function parseKvpText(text) {
    var result = {};
    for (const line of text.split(/\r?\n/)) {
        if (line.trim() == "" || line.trim().startsWith("#") || line.trim().startsWith("//")) { continue; }
        var separator = line.indexOf("=");
        if (separator == -1) { continue; }
        //The value is kept verbatim - a trailing space is meaningful for things like the parameter delimiter.
        result[line.substring(0, separator).trim()] = line.substring(separator + 1);
    }
    return result;
}

function classifyTemplateFile(name, text) {
    var lowerName = name.toLowerCase().split(/[\\\/]/).pop();

    if (lowerName.endsWith(".kvp")) { return { kind: "kvp", name: name, values: parseKvpText(text) }; }
    if (!lowerName.endsWith(".json")) { return { kind: "unknown", name: name }; }

    var data;
    try {
        data = JSON.parse(text);
    }
    catch (e) {
        return { kind: "unreadable", name: name, error: e.message };
    }

    //The filename is how the templates are laid out, so it wins - metaconfig has to be checked before
    //config, since it also ends in "config.json".
    if (lowerName.endsWith("metaconfig.json")) { return { kind: "metaconfig", name: name, data: data }; }
    if (lowerName.endsWith("ports.json")) { return { kind: "ports", name: name, data: data }; }
    if (lowerName.endsWith("updates.json")) { return { kind: "stages", name: name, data: data }; }
    if (lowerName.endsWith("prestart.json") || lowerName.endsWith("prestartstages.json")) { return { kind: "prestart", name: name, data: data }; }
    if (lowerName.endsWith("config.json")) { return { kind: "settings", name: name, data: data }; }
    if (lowerName == "manifest.json") { return { kind: "manifest", name: name, data: data }; }

    //Renamed or unpacked somewhere else - work it out from what's inside instead.
    if (Array.isArray(data) && data.length > 0) {
        var first = data[0] || {};
        if ("UpdateSource" in first || "UpdateStageName" in first) { return { kind: "stages", name: name, data: data }; }
        if ("ConfigFile" in first) { return { kind: "metaconfig", name: name, data: data }; }
        if ("FieldName" in first || "InputType" in first) { return { kind: "settings", name: name, data: data }; }
        if ("Ref" in first || "Port" in first) { return { kind: "ports", name: name, data: data }; }
    }

    //Still carries its data - an "@IncludeJson[...]" can point at a file whose name says nothing about
    //what's in it, and that has to resolve whatever it was called.
    return { kind: "unknown", name: name, data: data };
}

//"@IncludeJson[thingports.json]" points at one of the other files in the set, otherwise the value is the
//JSON itself the way AMP writes it into an instances own kvp.
function resolveIncludedJson(value, files) {
    if (value == null) { return null; }

    var include = value.match(/^@IncludeJson\[(.+?)\]$/i);
    if (include) {
        var includedName = include[1].toLowerCase();
        var match = files.find(f => f.name.toLowerCase().split(/[\\\/]/).pop() == includedName);
        return match && match.data ? match.data : null;
    }

    if (value.trim().startsWith("[")) {
        try {
            return JSON.parse(value);
        }
        catch (e) {
            return null;
        }
    }

    return null;
}

function detectCompatibility(kvp) {
    var linuxExecutable = (kvp["App.ExecutableLinux"] || "").trim();
    var linuxArgs = kvp["App.LinuxCommandLineArgs"] || "";

    if (linuxExecutable == "/usr/bin/xvfb-run") { return linuxArgs.trim().startsWith("-a wine") ? "WineXvfb" : "ProtonXvfb"; }
    if (linuxExecutable == "/usr/bin/wine") { return "Wine"; }
    if (linuxExecutable.endsWith("/proton") || linuxExecutable.endsWith("proton")) { return "Proton"; }
    return "None";
}

//The executables are written relative to the working directory, which the generator rebuilds itself.
function stripWorkingDirectory(executable, workingDirectory) {
    if (executable == "" || workingDirectory == "") { return executable; }
    var prefixes = [workingDirectory + "\\", workingDirectory + "/"];
    for (const prefix of prefixes) {
        if (executable.startsWith(prefix)) { return executable.substring(prefix.length); }
    }
    return executable;
}

function windowsExecutableFromArgs(linuxArgs) {
    var quoted = linuxArgs.match(/"\.\/(.+?)"/);
    return quoted ? quoted[1] : "";
}

//The generator prepends its own wine/proton wrapper to whatever the author typed, so only the tail of
//the arguments belongs back in the input field. Matched by shape rather than by the executable name,
//since a template may spell the path differently to App.ExecutableWin.
const templateCompatibilityArgPrefixes = [
    /^-a\s+wine\s+"\.\/[^"]*"\s*/,
    /^-a\s+"\{\{\$FullRootDir\}\}1580130\/proton"\s+run\s+"\.\/[^"]*"\s*/,
    /^run\s+"\.\/[^"]*"\s*/,
    /^"\.\/[^"]*"\s*/,
];

function stripCompatibilityArgs(linuxArgs, compatibility) {
    if (compatibility == "None") { return linuxArgs; }

    for (const prefix of templateCompatibilityArgPrefixes) {
        if (prefix.test(linuxArgs)) { return linuxArgs.replace(prefix, "").trim(); }
    }

    return linuxArgs;
}

function supportedOSFromValue(value) {
    var text = String(value || "").trim();
    if (text == "") { return { windows: true, linux: true }; }

    if (/^\d+$/.test(text)) {
        var flags = parseInt(text, 10);
        return { windows: (flags & 1) != 0, linux: (flags & 2) != 0 };
    }

    var lower = text.toLowerCase();
    return { windows: lower.includes("windows") || lower.includes("all"), linux: lower.includes("linux") || lower.includes("all") };
}

//AMP looks a store up by its plugin name minus the "Store" suffix, so "SteamWorkshopStore" is keyed as
//"SteamWorkshop" in App.StoreDownloadLocations.
function storeDownloadLocation(kvp, storeName) {
    var raw = kvp["App.StoreDownloadLocations"];
    if (!raw || raw.trim() == "") { return ""; }

    try {
        var locations = JSON.parse(raw);
        return locations && typeof locations[storeName] === "string" ? locations[storeName] : "";
    }
    catch (e) {
        return "";
    }
}

//Brings a configuration written against an older AMP forward. The retired keys themselves are dropped, so
//anything that still matters has to be moved onto the key AMP reads now.
function migrateRetiredKeys(kvp, values, warnings) {
    var childProcessName = (kvp["App.MonitorChildProcessName"] || "").trim();

    if (templateParseBool(kvp["App.MonitorChildProcess"]) && childProcessName == "") {
        warnings.push("App.MonitorChildProcess was set, but AMP now works child process monitoring out from App.MonitorChildProcessName alone - set the process name under 'Startup and Shutdown' or monitoring won't happen.");
    }

    if (typeof kvp["App.MonitorChildProcessWaitMs"] !== "undefined") {
        warnings.push("App.MonitorChildProcessWaitMs no longer exists in AMP - the wait before it looks for the child process is fixed now, so the value was dropped.");
    }

    if ((kvp["Console.ActivateLogRegex"] || "").trim() != "") {
        warnings.push("Console.ActivateLogRegex no longer exists in AMP and has no direct replacement - 'Suppress log at start' is the nearest equivalent.");
    }
}

function templateValuesFromKvp(kvp, warnings) {
    var values = {};

    for (const key of Object.keys(kvp)) {
        if (templateDerivedKeys.includes(key)) { continue; }
        if (templateRetiredKeys.includes(key)) { continue; }
        if (key.indexOf(".") == -1) { continue; }

        var field = key.replace(".", "_");
        values[field] = templateBooleanKeys.includes(field) ? templateParseBool(kvp[key]) : kvp[key];
    }

    for (const [key, field] of Object.entries(templateConsoleEventKeys)) {
        if (typeof kvp[key] !== "undefined") { values[field] = kvp[key]; }
    }

    for (const [key, field] of Object.entries(templateBackingKeys)) {
        if (typeof kvp[key] !== "undefined") { values[field] = kvp[key]; }
        //The computed that owns the key can't be written to, so the plain form is dropped.
        delete values[key.replace(".", "_")];
    }

    var os = supportedOSFromValue(kvp["Meta.OS"]);
    values._SupportsWindows = os.windows;
    values._SupportsLinux = os.linux;

    if (typeof kvp["Meta.Author"] !== "undefined") {
        values._Meta_Author = kvp["Meta.Author"].endsWith(templateAuthorSuffix)
            ? kvp["Meta.Author"].substring(0, kvp["Meta.Author"].length - templateAuthorSuffix.length)
            : kvp["Meta.Author"];
    }

    //A "url:" source goes into the field that owns it. Anything else is kept as it was written - the
    //generator rebuilds a "steam:" source from the update stage's client App ID, and a template whose
    //stage doesn't name one (or that ships an "internal:" image) would otherwise lose its image.
    //Both are written either way - an import is meant to replace what was entered, and leaving whichever
    //one doesn't apply alone would have it win over the image the template actually shipped.
    var imageSource = (kvp["Meta.DisplayImageSource"] || "").trim();
    var imageIsURL = imageSource.toLowerCase().startsWith("url:");
    values._DisplayImageSource = imageIsURL ? imageSource.substring(4) : "";
    values._Meta_DisplayImageSourceRaw = imageIsURL ? "" : imageSource;

    var compatibility = detectCompatibility(kvp);
    values._compatibility = compatibility;

    var workingDirectory = (kvp["App.WorkingDir"] || "").trim();
    var linuxArgs = kvp["App.LinuxCommandLineArgs"] || "";
    var windowsExecutable = stripWorkingDirectory((kvp["App.ExecutableWin"] || "").trim(), workingDirectory);

    if (windowsExecutable == "" && compatibility != "None") { windowsExecutable = windowsExecutableFromArgs(linuxArgs); }

    values._WinExecutableName = windowsExecutable;
    values._LinuxExecutableName = compatibility == "None" ? stripWorkingDirectory((kvp["App.ExecutableLinux"] || "").trim(), workingDirectory) : "";
    values._App_LinuxCommandLineArgsInput = stripCompatibilityArgs(linuxArgs, compatibility);

    //App.SteamWorkshopDownloadLocation is the obsolete spelling - a template written against a current AMP
    //only has the store dictionary, so that's read first.
    var workshopLocation = storeDownloadLocation(kvp, "SteamWorkshop") || kvp["App.SteamWorkshopDownloadLocation"] || "";
    values._App_SteamWorkshopDownloadLocation = workshopLocation.replace("{{$FullBaseDir}}", "");

    if (compatibility != "None" && windowsExecutable == "") {
        warnings.push("A compatibility layer was detected but no Windows executable could be worked out - set it under 'Startup and Shutdown'.");
    }

    migrateRetiredKeys(kvp, values, warnings);

    return values;
}

//Every part of a port the generator has an editor for. The rest - hidden ports, anything AMP has added
//since - rides along on _Passthrough.
const templateKnownPortKeys = ["Protocol", "Port", "Range", "MinListening", "Ref", "Name", "Description", "IsDelayedOpen", "Required", "ChildPorts"];
//A child has no port of its own - AMP works it out from the parent and the offset every time it reads it.
const templateKnownChildPortKeys = templateKnownPortKeys.concat(["Offset"]);

function templatePortsFromJson(ports, warnings) {
    if (!Array.isArray(ports)) { return []; }

    var protocolIndexes = { "both": "0", "tcp": "1", "udp": "2" };
    //PortProtocol in AMP is TCP=0, UDP=1, Both=2 - the generators own dropdown is ordered differently.
    var numericProtocolIndexes = { "0": "1", "1": "2", "2": "0" };
    var usedTypes = [];
    var result = [];

    var protocolIndex = value => {
        var protocol = String(value == null ? "Both" : value).toLowerCase();
        return protocolIndexes[protocol] || numericProtocolIndexes[protocol] || "0";
    };

    var passthroughFor = (port, knownKeys) => {
        var passthrough = {};
        for (const key of Object.keys(port)) {
            if (knownKeys.includes(key)) { continue; }
            passthrough[key] = port[key];
        }
        return passthrough;
    };

    //AMP's own defaults - one port, all of them listening - so a template that leaves them out comes back
    //out of the generator without having gained them.
    var rangeFrom = port => ({
        Range: String(port.Range == null ? 1 : port.Range),
        MinListening: String(port.MinListening == null ? 0 : port.MinListening),
        IsDelayedOpen: port.IsDelayedOpen === true || String(port.IsDelayedOpen).toLowerCase() == "true",
        Required: port.Required === true || String(port.Required).toLowerCase() == "true",
    });

    for (const port of ports) {
        if (port == null) { continue; }

        var portType = templatePortTypes[String(port.Ref || "").toLowerCase()] || "Custom Port";

        if (portType != "Custom Port" && usedTypes.includes(portType)) {
            warnings.push(`More than one ${portType} was found - '${port.Name || port.Ref}' has been imported as a custom port.`);
            portType = "Custom Port";
        }

        if (portType != "Custom Port") { usedTypes.push(portType); }

        var childPorts = [];
        for (const child of port.ChildPorts || []) {
            if (child == null) { continue; }
            //An older template can carry a stored port on a child. AMP ignores it and derives the number
            //from the offset, so the offset is what's kept - worked back out of the port when it's missing.
            var offset = child.Offset != null ? child.Offset
                : (child.Port != null && port.Port != null ? child.Port - port.Port : 0);

            childPorts.push(Object.assign({
                _Protocol: protocolIndex(child.Protocol),
                Offset: String(offset),
                _Name: child.Name || child.Ref || "",
                _Description: child.Description || "",
                _Ref: child.Ref == null ? "" : String(child.Ref),
                _Passthrough: passthroughFor(child, templateKnownChildPortKeys),
            }, rangeFrom(child)));

            if ((child.ChildPorts || []).length > 0) {
                warnings.push(`Ports derived from '${child.Name || child.Ref}' were dropped - AMP only reads one level of derived ports.`);
            }
        }

        result.push(Object.assign({
            _Protocol: protocolIndex(port.Protocol),
            Port: String(port.Port == null ? "" : port.Port),
            _PortType: portType,
            _Name: port.Name || port.Ref || "",
            _Description: port.Description || "",
            //Kept as-is. Rebuilding it from the name would rename the port, and every {{$Ref}} in the
            //command line and the config files points at the name it had.
            _Ref: port.Ref == null ? "" : String(port.Ref),
            _ChildPorts: childPorts,
            _Passthrough: passthroughFor(port, templateKnownPortKeys),
        }, rangeFrom(port)));
    }

    return result;
}

//Every part of a stage the generator has an editor for. Anything else is carried on the stages
//_Passthrough and written back out untouched.
const templateKnownStageKeys = [
    "UpdateStageName", "UpdateStageDescription", "UpdateSourcePlatform", "UpdateSource", "UpdateSourceArch",
    "UpdateSourceData", "UpdateSourceArgs", "UpdateSourceVersion", "UpdateSourceExtra", "UpdateSourceTarget",
    "UnzipUpdateSource", "OverwriteExistingFiles", "ForceDownloadPlatform", "UpdateSourceConditionSetting",
    "UpdateSourceConditionValue", "DeleteAfterExtract", "RunInBackground", "SkipOnFailure",
    "ProcessToolOutput", "OneShot",
];

//An instance's own kvp holds the UpdateSteps flag value rather than the name, and SupportedOS/Architecture
//are written the same way.
function templateUpdateSourceName(updateSource) {
    var text = String(updateSource == null ? "" : updateSource).trim();
    if (text == "") { return null; }
    return normalizeUpdateSource(updateStepNamesByValue[text] || text);
}

function templateStagesFromJson(stages, warnings, listName) {
    if (!Array.isArray(stages)) { return []; }

    var platformIndexes = { "all": "0", "linux": "1", "windows": "2", "31": "0", "2": "1", "1": "2" };
    var forcePlatformIndexes = { "linux": "1", "windows": "2", "2": "1", "1": "2" };
    var archNames = { "all": "All", "x86_64": "x86_64", "aarch64": "aarch64", "3": "All", "1": "x86_64", "2": "aarch64" };
    var result = [];

    for (const stage of stages) {
        if (stage == null) { continue; }

        var sourceName = templateUpdateSourceName(stage.UpdateSource);

        if (sourceName == null) {
            //Kept rather than dropped - the stage still has to run, it just can't be edited here. The
            //whole entry is held verbatim and written straight back out.
            warnings.push(`${listName} stage '${stage.UpdateStageName || stage.UpdateSource}' uses the '${stage.UpdateSource}' source type, which this version of the generator does not know about. It was imported as-is and will be written back out unchanged.`);
        }

        var platform = String(stage.UpdateSourcePlatform == null ? "All" : stage.UpdateSourcePlatform).toLowerCase();
        var forcePlatform = String(stage.ForceDownloadPlatform == null ? "" : stage.ForceDownloadPlatform).toLowerCase();
        var arch = String(stage.UpdateSourceArch == null ? "All" : stage.UpdateSourceArch).toLowerCase();
        var sourceData = stage.UpdateSourceData || "";
        var sourceArgs = stage.UpdateSourceArgs || "";

        //AMP takes the archive for an ExtractArchive stage from UpdateSourceData, but the generator used
        //to write it into UpdateSourceArgs where nothing reads it - so the stage never extracted anything.
        //Moving it puts the archive where AMP looks for it.
        if (sourceName == "ExtractArchive" && sourceData == "" && sourceArgs != "") {
            sourceData = sourceArgs;
            sourceArgs = "";
            warnings.push(`${listName} stage '${stage.UpdateStageName || "ExtractArchive"}' had its archive in the wrong field - AMP reads it from UpdateSourceData, so it has been moved there. The stage would not have extracted anything as it was.`);
        }

        var passthrough = {};
        for (const key of Object.keys(stage)) {
            if (templateKnownStageKeys.includes(key)) { continue; }
            passthrough[key] = stage[key];
        }

        result.push({
            //A step the generator can't edit is held whole, so it goes back out exactly as it came in.
            _Unknown: sourceName == null ? stage : null,
            UpdateStageName: stage.UpdateStageName || "",
            UpdateStageDescription: stage.UpdateStageDescription || "",
            _UpdateSourcePlatform: platformIndexes[platform] || "0",
            _UpdateSource: sourceName || "None",
            UpdateSourceArch: archNames[arch] || "All",
            UpdateSourceData: sourceData,
            UpdateSourceArgs: sourceArgs,
            UpdateSourceVersion: stage.UpdateSourceVersion || "",
            UpdateSourceExtra: stage.UpdateSourceExtra || "",
            UpdateSourceTarget: stage.UpdateSourceTarget || "",
            UnzipUpdateSource: stage.UnzipUpdateSource === true,
            OverwriteExistingFiles: stage.OverwriteExistingFiles === true,
            _ForceDownloadPlatform: forcePlatformIndexes[forcePlatform] || "0",
            UpdateSourceConditionSetting: stage.UpdateSourceConditionSetting || null,
            UpdateSourceConditionValue: stage.UpdateSourceConditionValue || null,
            //AMP defaults this to false - the generator only defaults it to true on a brand new stage.
            DeleteAfterExtract: stage.DeleteAfterExtract === true,
            RunInBackground: stage.RunInBackground === true,
            SkipOnFailure: stage.SkipOnFailure === true,
            ProcessToolOutput: stage.ProcessToolOutput === true,
            OneShot: stage.OneShot === true,
            _Passthrough: passthrough,
        });
    }

    return result;
}

//Checkboxes are keyed on the state ("False"/"True"), but older generated configurations had it the other
//way around, with the written value as the key and the state as the label.
function checkboxValuesFromEnum(enumValues) {
    var keys = Object.keys(enumValues || {});
    var stateKeyed = keys.some(k => k.toLowerCase() == "true" || k.toLowerCase() == "false");

    if (stateKeyed) {
        var checked = "true";
        var unchecked = "false";
        for (const key of keys) {
            if (key.toLowerCase() == "true") { checked = enumValues[key]; }
            if (key.toLowerCase() == "false") { unchecked = enumValues[key]; }
        }
        return { checked: checked, unchecked: unchecked };
    }

    var result = { checked: "true", unchecked: "false" };
    for (const key of keys) {
        if (String(enumValues[key]).toLowerCase() == "true") { result.checked = key; }
        if (String(enumValues[key]).toLowerCase() == "false") { result.unchecked = key; }
    }
    return result;
}

//Every part of a setting the generator has an editor for. Anything else in the manifest is carried on
//the settings _Passthrough and written back out untouched, so a template that uses a newer part of the
//spec than the generator knows about survives a round trip.
const templateKnownSettingKeys = [
    "DisplayName", "Category", "Subcategory", "Description", "Keywords", "FieldName", "InputType",
    "MinValue", "MaxValue", "MultipleOf", "Multiplier", "MaxLength", "IsFlagArgument", "FlagValue",
    "ParamFieldName", "IncludeInCommandLine", "DefaultValue", "Placeholder", "Suffix", "Hidden",
    "Required", "SkipIfEmpty", "ExcludeFromImport", "Order", "Special", "EnumValues", "Actions",
    "ToolDiscovery", "RemoteOptionSource",
];

function templateText(value, fallback) {
    return value == null ? (fallback == null ? "" : fallback) : String(value);
}

function templateToolDiscoveryFromJson(toolDiscovery) {
    if (toolDiscovery == null || typeof toolDiscovery !== "object" || Array.isArray(toolDiscovery)) { return null; }

    return {
        ExecutableName: templateText(toolDiscovery.ExecutableName),
        WindowsExecutableName: templateText(toolDiscovery.WindowsExecutableName),
        LinuxExecutableName: templateText(toolDiscovery.LinuxExecutableName),
        _SearchPaths: manifestLinesText(toolDiscovery.SearchPaths),
        _WindowsSearchPaths: manifestLinesText(toolDiscovery.WindowsSearchPaths),
        _LinuxSearchPaths: manifestLinesText(toolDiscovery.LinuxSearchPaths),
        //An explicitly empty subdirectory puts the executable at the root of the install, so only a
        //missing key falls back to AMPs default.
        BinSubdirectory: templateText(toolDiscovery.BinSubdirectory, "bin"),
        VersionRegex: templateText(toolDiscovery.VersionRegex),
        DisplayFormat: templateText(toolDiscovery.DisplayFormat),
        FallbackToPathEnv: toolDiscovery.FallbackToPathEnv !== false,
        DefaultEntryDisplayName: templateText(toolDiscovery.DefaultEntryDisplayName, "System Default"),
        NotFoundValue: templateText(toolDiscovery.NotFoundValue),
        CustomPathSetting: templateText(toolDiscovery.CustomPathSetting),
        CustomPathDisplayName: templateText(toolDiscovery.CustomPathDisplayName, "Custom Installation"),
    };
}

function templateRemoteOptionSourceFromJson(remoteOptionSource) {
    if (remoteOptionSource == null || typeof remoteOptionSource !== "object" || Array.isArray(remoteOptionSource)) { return null; }

    return {
        Url: templateText(remoteOptionSource.Url),
        ResponseFormat: templateText(remoteOptionSource.ResponseFormat, "json"),
        ResultPath: templateText(remoteOptionSource.ResultPath),
        ValueField: templateText(remoteOptionSource.ValueField),
        LabelField: templateText(remoteOptionSource.LabelField),
        RegexPattern: templateText(remoteOptionSource.RegexPattern),
        SortOrder: templateText(remoteOptionSource.SortOrder),
        _PrependItems: manifestJsonObjectText(remoteOptionSource.PrependItems),
        _Headers: manifestJsonObjectText(remoteOptionSource.Headers),
        CacheSeconds: remoteOptionSource.CacheSeconds == null ? "3600" : String(remoteOptionSource.CacheSeconds),
        RefreshOnStartup: remoteOptionSource.RefreshOnStartup !== false,
        NotFoundValue: templateText(remoteOptionSource.NotFoundValue, "Not Available"),
        UserAgent: templateText(remoteOptionSource.UserAgent),
    };
}

function templateSettingActionsFromJson(actions) {
    if (!Array.isArray(actions)) { return []; }

    return actions.filter(action => action != null).map(action => ({
        Module: templateText(action.Module),
        Method: templateText(action.Method),
        Caption: templateText(action.Caption),
        Argument: templateText(action.Argument),
        IsClientSide: action.IsClientSide === true,
    }));
}

function templateSettingsFromJson(settings, warnings) {
    if (!Array.isArray(settings)) { return []; }

    var result = [];

    for (const setting of settings) {
        if (setting == null) { continue; }

        var inputType = normalizeInputType(setting.InputType);
        var enumValues = setting.EnumValues || {};
        var checkboxValues = inputType == "checkbox" ? checkboxValuesFromEnum(enumValues) : { checked: "true", unchecked: "false" };

        var enumMappings = [];
        if (inputType == "enum" || inputType == "Radio") {
            for (const key of Object.keys(enumValues)) {
                enumMappings.push({ _enumKey: key, _enumValue: enumValues[key] });
            }
        }

        //Kept only when it says something the field name doesn't - a template that spells them the same
        //way carries on being named after the field.
        var paramFieldName = setting.ParamFieldName == null || setting.ParamFieldName == setting.FieldName ? "" : String(setting.ParamFieldName);

        var toolDiscovery = templateToolDiscoveryFromJson(setting.ToolDiscovery);
        var remoteOptionSource = templateRemoteOptionSourceFromJson(setting.RemoteOptionSource);

        var passthrough = {};
        for (const key of Object.keys(setting)) {
            if (templateKnownSettingKeys.includes(key)) { continue; }
            passthrough[key] = setting[key];
        }

        result.push({
            DisplayName: setting.DisplayName || "",
            _Category: setting.Category || "",
            Subcategory: setting.Subcategory || "Server:dns:1",
            Description: setting.Description || "",
            _Keywords: setting.Keywords || "",
            FieldName: setting.FieldName || "",
            _ParamFieldName: paramFieldName,
            InputType: inputType,
            MinValue: setting.MinValue == null ? "" : String(setting.MinValue),
            MaxValue: setting.MaxValue == null ? "" : String(setting.MaxValue),
            MultipleOf: setting.MultipleOf == null ? "" : String(setting.MultipleOf),
            Multiplier: setting.Multiplier == null ? "" : String(setting.Multiplier),
            //AMP uses -1 and 0 to mean "no limit" depending on where it's read, so neither is worth keeping.
            MaxLength: setting.MaxLength == null || Number(setting.MaxLength) <= 0 ? "" : String(setting.MaxLength),
            IsFlagArgument: setting.IsFlagArgument === true,
            FlagValue: setting.FlagValue == null ? "" : String(setting.FlagValue),
            IncludeInCommandLine: setting.IncludeInCommandLine === true,
            DefaultValue: setting.DefaultValue == null ? "" : String(setting.DefaultValue),
            Placeholder: setting.Placeholder == null ? "" : String(setting.Placeholder),
            Suffix: setting.Suffix || "",
            Hidden: setting.Hidden === true,
            Required: setting.Required === true,
            SkipIfEmpty: setting.SkipIfEmpty === true,
            ExcludeFromImport: setting.ExcludeFromImport === true,
            Order: setting.Order == null ? "10" : String(setting.Order),
            Special: setting.Special == null ? "" : String(setting.Special),
            _CheckedValue: checkboxValues.checked,
            _UncheckedValue: checkboxValues.unchecked,
            _EnumMappings: enumMappings,
            _Actions: templateSettingActionsFromJson(setting.Actions),
            UseToolDiscovery: toolDiscovery != null,
            _ToolDiscovery: toolDiscovery,
            UseRemoteOptionSource: remoteOptionSource != null,
            _RemoteOptionSource: remoteOptionSource,
            _Passthrough: passthrough,
        });
    }

    return result;
}

//Every part of a config file mapping the generator has an editor for. The rest of MetaConfigFile - the
//key/value format and its expression, the section header format, the encoding, subsections - is carried
//verbatim, because without it AMP falls back to its own defaults and rewrites the file in a different
//shape to the one the application produced.
const templateKnownConfigFileKeys = ["ConfigFile", "ConfigType", "AutoMap", "Importable"];

function templateConfigFilesFromJson(configFiles) {
    if (!Array.isArray(configFiles)) { return []; }

    var result = [];

    for (const configFile of configFiles) {
        if (configFile == null) { continue; }
        var configType = String(configFile.ConfigType || "auto").toLowerCase();

        var passthrough = {};
        for (const key of Object.keys(configFile)) {
            if (templateKnownConfigFileKeys.includes(key)) { continue; }
            passthrough[key] = configFile[key];
        }

        result.push({
            ConfigFile: configFile.ConfigFile || "",
            _ConfigType: templateConfigTypeIndexes[configType] || "4",
            _AutoMap: configFile.AutoMap === true,
            Importable: configFile.Importable === true,
            _Passthrough: passthrough,
        });
    }

    return result;
}

/// Takes [{ name, text }] and returns the data the view model can be filled in from, along with a note
/// of everything that was read and anything that could not be brought across.
function parseTemplateFiles(rawFiles) {
    var warnings = [];
    var imported = [];
    var files = rawFiles.map(f => classifyTemplateFile(f.name, f.text));

    //A template can ship files the generator has no concept of - a config file template it merges at
    //update time, a reference copy of an ini, an image. They're carried through untouched so downloading
    //the template again doesn't quietly leave them behind.
    var extraFiles = [];

    for (const file of files) {
        if (file.kind == "unreadable") { warnings.push(`${file.name} is not valid JSON and was skipped (${file.error}).`); }
        else if (file.kind == "unknown" || file.kind == "manifest") {
            var raw = rawFiles.find(f => f.name == file.name);
            if (raw && file.kind == "unknown") { extraFiles.push({ name: raw.name, text: raw.text }); }
        }
    }

    var kvpFile = files.find(f => f.kind == "kvp");
    if (!kvpFile) { return { ok: false, warnings: ["No .kvp file was found - the configuration file is what everything else is read from."], imported: imported }; }

    var kvp = kvpFile.values;
    var values = templateValuesFromKvp(kvp, warnings);
    imported.push(`${kvpFile.name} (${Object.keys(kvp).length} settings)`);

    var portsFile = files.find(f => f.kind == "ports");
    var stagesFile = files.find(f => f.kind == "stages");
    var preStartFile = files.find(f => f.kind == "prestart");
    var settingsFile = files.find(f => f.kind == "settings");
    var configFilesFile = files.find(f => f.kind == "metaconfig");

    var portsData = portsFile ? portsFile.data : resolveIncludedJson(kvp["App.Ports"], files);
    var stagesData = stagesFile ? stagesFile.data : resolveIncludedJson(kvp["App.UpdateSources"], files);
    var preStartData = preStartFile ? preStartFile.data : resolveIncludedJson(kvp["App.PreStartStages"], files);

    var ports = templatePortsFromJson(portsData, warnings);
    var stages = templateStagesFromJson(stagesData, warnings, "Update");
    var preStartStages = templateStagesFromJson(preStartData, warnings, "Pre-start");
    var settings = templateSettingsFromJson(settingsFile ? settingsFile.data : null, warnings);
    var configFiles = templateConfigFilesFromJson(configFilesFile ? configFilesFile.data : null);

    if (portsFile) { imported.push(`${portsFile.name} (${ports.length} ports)`); }
    else if (ports.length > 0) { imported.push(`${ports.length} ports from the configuration file`); }
    else { warnings.push("No ports were found - add them under 'Networking'."); }

    if (stagesFile) { imported.push(`${stagesFile.name} (${stages.length} update stages)`); }
    else if (stages.length > 0) { imported.push(`${stages.length} update stages from the configuration file`); }
    else { warnings.push("No update stages were found - add them under 'Update Sources'."); }

    if (preStartFile) { imported.push(`${preStartFile.name} (${preStartStages.length} pre-start stages)`); }
    else if (preStartStages.length > 0) { imported.push(`${preStartStages.length} pre-start stages from the configuration file`); }

    if (settingsFile) { imported.push(`${settingsFile.name} (${settings.length} settings)`); }
    else { warnings.push("No settings manifest was found - add any settings under 'Configuration and Settings'."); }

    if (configFilesFile) { imported.push(`${configFilesFile.name} (${configFiles.length} config files)`); }

    for (const extra of extraFiles) { imported.push(`${extra.name} (kept as-is)`); }

    return {
        ok: true,
        values: values,
        ports: ports,
        stages: stages,
        preStartStages: preStartStages,
        settings: settings,
        configFiles: configFiles,
        extraFiles: extraFiles,
        warnings: warnings,
        imported: imported,
    };
}
