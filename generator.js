function omitNonPublicMembers(key, value) {
    return (key.indexOf("_") === 0) ? undefined : value;
}

function omitPrivateMembers(key, value) {
    return (key.indexOf("__") === 0) ? undefined : value;
}

function newGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

//The order AMP itself writes GenericModule.kvp in - the field declaration order of each section in
//GenericModuleConfig.cs. Keys not listed here are written after the ones that are, in the order the
//view model declares them.
//Fields AMP has dropped (App.MonitorChildProcess, App.MonitorChildProcessWaitMs, Console.ActivateLogRegex)
//aren't listed, and the ones it still declares but has marked obsolete (App.SteamWorkshopDownloadLocation,
//App.RCONConnectRetrySeconds, App.SteamForceLoginPrompt) are listed for ordering but never written - see
//templateimport.js for how a configuration that still has them is brought forward.
const kvpKeyOrder = [
    "Meta.DisplayName",
    "Meta.Description",
    "Meta.OS",
    "Meta.AarchSupport",
    "Meta.Arch",
    "Meta.Author",
    "Meta.URL",
    "Meta.DisplayImageSource",
    "Meta.EndpointURIFormat",
    "Meta.ConfigManifest",
    "Meta.MetaConfigManifest",
    "Meta.ConfigRoot",
    "Meta.DeprecatedReason",
    "Meta.ResourceUsageInfo",
    "Meta.MinAMPVersion",
    "Meta.SpecificDockerImage",
    "Meta.DockerRequired",
    "Meta.DockerBaseReadOnly",
    "Meta.ContainerPolicy",
    "Meta.ContainerPolicyReason",
    "Meta.ExtraSetupStepsURI",
    "Meta.Prerequisites",
    "Meta.ExtraContainerPackages",
    "Meta.ConfigReleaseState",
    "Meta.NoCommercialUsage",
    "Meta.ConfigVersion",
    "Meta.ReleaseNotes",
    "Meta.BreakingReleaseNotes",
    "Meta.AppConfigId",
    "Meta.OriginalSource",
    "Meta.ImportableExtensions",
    "Meta.AppIsMultiIPAware",

    "App.DisplayName",
    "App.RootDir",
    "App.BaseDirectory",
    "App.StoresSupported",
    "App.SteamWorkshopDownloadLocation",
    "App.StoreSpecificSettings",
    "App.StoreDownloadLocations",
    "App.ExecutableWin",
    "App.ExecutableLinux",
    "App.WorkingDir",
    "App.LinuxCommandLineArgs",
    "App.WindowsCommandLineArgs",
    "App.CommandLineArgs",
    "App.UseLinuxIOREDIR",
    "App.AppSettings",
    "App.EnvironmentVariables",
    "App.CommandLineParameterFormat",
    "App.CommandLineParameterDelimiter",
    "App.ExitMethod",
    "App.ExitMethodWindows",
    "App.ExitTimeout",
    "App.ExitString",
    "App.ExitFile",
    "App.RestartDelaySeconds",
    "App.HasWriteableConsole",
    "App.HasReadableConsole",
    "App.UDPLogger",
    "App.SupportsLiveSettingsChanges",
    "App.LiveSettingChangeCommandFormat",
    "App.ForceIPBinding",
    "App.SupportsIPv6",
    "App.ApplicationIPBinding",
    "App.Ports",
    "App.AdminPortRef",
    "App.PrimaryApplicationPortRef",
    "App.UniversalSleepApplicationUDPPortRef",
    "App.UniversalSleepSteamQueryPortRef",
    "App.MaxUsers",
    "App.UseRandomAdminPassword",
    "App.PersistRandomPassword",
    "App.RemoteAdminPassword",
    "App.AdminMethod",
    "App.IgnoreSTDOUTAfterRCON",
    "App.AdminLoginTransform",
    "App.StripANSIControlCodes",
    "App.LoginTransformPrefix",
    "App.RCONConnectDelaySeconds",
    "App.RCONConnectRetrySeconds",
    "App.RCONHeartbeatMinutes",
    "App.RCONHeartbeatCommand",
    "App.RCONSelectIPMethod",
    "App.TelnetLoginFormat",
    "App.TelnetNewLineType",
    "App.TailLogFilePath",
    "App.UpdateSources",
    "App.PreStartStages",
    "App.CommandTriggers",
    "App.UserActions",
    "App.ForceUpdate",
    "App.ForceUpdateReason",
    "App.Compatibility",
    "App.SteamUpdateAnonymousLogin",
    "App.SteamForceLoginPrompt",
    "App.RapidStartup",
    "App.HasSuccessfullyUpdatedAtLeastOnce",
    "App.SmartExcludeExemptions",
    "App.SmartExcludeSupported",
    "App.DumpFullChildProcessTree",
    "App.MonitorChildProcessName",
    "App.MonitorDirectChildOnly",
    "App.SupportsUniversalSleep",
    "App.UseSteamQueryForStatus",
    "App.WakeupMode",
    "App.ApplicationReadyMode",
    "App.QuiesceCommand",
    "App.DequiesceCommand",
    "App.QuiesceSettleDelayMilliseconds",

    "Console.FilterMatchRegex",
    "Console.FilterMatchReplacement",
    "Console.ThrowawayMessageRegex",
    "Console.AppReadyRegex",
    "Console.UserJoinRegex",
    "Console.UserLeaveRegex",
    "Console.UserChatRegex",
    "Console.UpdateAvailableRegex",
    "Console.PreConnectRegex",
    "Console.ConnectIPRegex",
    "Console.MetricsRegex",
    "Console.ServerInfoRegex",
    "Console.ServerAuthURLPromptRegex",
    "Console.ServerAuthAckRegex",
    "Console.ConsoleFormatRegex",
    "Console.DownloadProgressRegex",
    "Console.HideFromConsoleRegex",
    "Console.SuppressLogAtStart",
    "Console.UserActions",

    "Limits.SleepMode",
    "Limits.SleepOnStart",
    "Limits.SleepDelayMinutes",
    "Limits.DozeDelay",
    "Limits.AutoRetryCount",
    "Limits.SleepStartThresholdSeconds",
];

//Stable sort - anything AMP doesn't write (or that was added since) keeps its relative order at the end.
function sortByKvpKeyOrder(keys) {
    return keys.slice().sort((a, b) => {
        var indexA = kvpKeyOrder.indexOf(a);
        var indexB = kvpKeyOrder.indexOf(b);
        if (indexA == indexB) { return 0; }
        if (indexA == -1) { return 1; }
        if (indexB == -1) { return -1; }
        return indexA - indexB;
    });
}

//AMP looks the main game, query and admin ports up by a fixed Ref, so a configuration can only have one
//of each. Everything else is a custom port and can appear as many times as the application needs.
const portTypes = ["Custom Port", "Main Game Port", "Steam Query Port", "RCON Port"];

//Every value of GenericModuleConfig.UpdateSteps, with the fields each one actually reads taken from the
//switch in GenericApp.PerformUpdateStage. "value" is the flag AMP gives the step in the enum - it's only
//needed to read back an instance's own kvp, which stores the number rather than the name.
//A step only shows the fields it uses, because anything else is written into the manifest for AMP to
//ignore and reads as though it does something.
const updateStepSpecs = [
    { name: "SteamCMD", value: 4, description: "Downloads an application by its Steam App ID.", fields: {
        UpdateSourceData: { label: "Server App ID", help: "The App ID of the dedicated server to download. Find it via SteamDB.", placeholder: "896660" },
        UpdateSourceArgs: { label: "Client App ID", help: "The App ID of the game client on the Steam store. AMP takes the applications image from it - the server App ID has no store page, so leaving this blank means no image. Also used for the SteamAppId variable, which falls back to the server App ID.", placeholder: "892970" },
        UpdateSourceVersion: { label: "Branch", help: "The beta branch to download. Can be a fixed value or the field name of a setting. Public branch if left blank.", placeholder: "{{ReleaseStream}}" },
        UpdateSourceExtra: { label: "Workshop Mod Name", help: "Only used when downloading a Steam Workshop item rather than an application.", placeholder: "" },
        UpdateSourceTarget: { label: "Install Directory", help: "Where SteamCMD installs to. Defaults to the applications base directory.", placeholder: "" },
    }, flags: ["ForcePlatform"] },

    { name: "FetchURL", value: 1, description: "Downloads a file from a fixed URL.", fields: {
        UpdateSourceData: { label: "URL", help: "The URL of the file to download.", placeholder: "https://example.com/server.zip" },
        UpdateSourceArgs: { label: "Save As", help: "The filename to save it under. Taken from the URL if left blank.", placeholder: "server.zip" },
        UpdateSourceTarget: { label: "Target Directory", help: "Where to save it, relative to the root directory.", placeholder: "serverfiles" },
    }, flags: ["Unzip", "Overwrite", "DeleteAfterExtract"] },

    { name: "GithubRelease", value: 16, description: "Downloads a file attached to a GitHub release.", fields: {
        UpdateSourceArgs: { label: "Repository", help: "The repository the release is published from, as owner/name.", placeholder: "tModLoader/tModLoader" },
        UpdateSourceData: { label: "Asset Filename", help: "The file to take from the release.", placeholder: "tModLoader.zip" },
        UpdateSourceVersion: { label: "Release Tag", help: "The release to download. The latest release is used if left blank.", placeholder: "v2024.1" },
        UpdateSourceTarget: { label: "Target Directory", help: "Where to save it, relative to the root directory.", placeholder: "serverfiles" },
    }, flags: ["Unzip", "Overwrite", "DeleteAfterExtract"] },

    { name: "FetchURLfromJQ", value: 256, description: "Reads a download URL out of a JSON API, then downloads it.", fields: {
        UpdateSourceData: { label: "API URL", help: "The URL returning the JSON document.", placeholder: "https://example.com/api/latest" },
        UpdateSourceArgs: { label: "JSONPath", help: "The path within the response holding the download URL. The last match is used.", placeholder: "$.downloads.server.url" },
        UpdateSourceTarget: { label: "Target Directory", help: "Where to save the downloaded file, relative to the root directory.", placeholder: "serverfiles" },
    }, flags: ["Unzip", "Overwrite", "DeleteAfterExtract"] },

    { name: "GitRepo", value: 128, description: "Clones a git repository, or pulls it if it is already there. Requires git on the host.", fields: {
        UpdateSourceData: { label: "Repository URL", help: "The repository to clone.", placeholder: "https://github.com/owner/name.git" },
        UpdateSourceTarget: { label: "Target Directory", help: "Where to clone it, relative to the base directory. Required.", placeholder: "serverfiles" },
    }, flags: [] },

    { name: "ExtractArchive", value: 32768, description: "Extracts an archive that is already on disk.", fields: {
        UpdateSourceData: { label: "Archive File", help: "The archive to extract, including the root directory.", placeholder: "./myapp/374040/dedicated_server.zip" },
        UpdateSourceTarget: { label: "Extract To", help: "Where to extract it, relative to the root directory. Defaults to the base directory.", placeholder: "serverfiles" },
    }, flags: ["Overwrite", "DeleteAfterExtract"] },

    { name: "CopyFilePath", value: 2, description: "Copies a file from one place to another.", fields: {
        UpdateSourceArgs: { label: "Source File", help: "The file to copy, including the root directory.", placeholder: "./myapp/1829350/default.cfg" },
        UpdateSourceData: { label: "Destination File", help: "Where to copy it to, including the root directory.", placeholder: "./myapp/1829350/save/config.cfg" },
        UpdateSourceTarget: { label: "Extract To", help: "Only used when the copied file is unzipped - where to extract it, relative to the root directory.", placeholder: "serverfiles" },
    }, flags: ["Unzip", "Overwrite", "DeleteAfterExtract"] },

    { name: "MoveFile", value: 2048, description: "Moves or renames a file.", fields: {
        UpdateSourceArgs: { label: "Source File", help: "The file to move, including the root directory.", placeholder: "./myapp/serverfiles/old.cfg" },
        UpdateSourceData: { label: "Destination File", help: "Where to move it to, including the root directory.", placeholder: "./myapp/serverfiles/new.cfg" },
    }, flags: ["Overwrite"] },

    { name: "CreateFile", value: 512, description: "Writes a file with fixed contents.", fields: {
        UpdateSourceArgs: { label: "File Path", help: "The file to write, including the root directory.", placeholder: "./myapp/serverfiles/eula.txt" },
        UpdateSourceData: { label: "Contents", help: "What to write into it.", placeholder: "eula=true" },
    }, flags: ["Overwrite"] },

    { name: "CreateDirectory", value: 1024, description: "Creates a directory.", fields: {
        UpdateSourceArgs: { label: "Directory Path", help: "The directory to create, including the root directory.", placeholder: "./myapp/serverfiles/logs" },
    }, flags: [] },

    { name: "CreateSymlink", value: 64, description: "Creates a symlink. Linux only.", platform: "Linux", fields: {
        UpdateSourceArgs: { label: "Existing Path", help: "The file or directory the link points at.", placeholder: "./myapp/1829350/save" },
        UpdateSourceData: { label: "Link Path", help: "Where to create the link, relative to the root directory.", placeholder: "save" },
    }, flags: [] },

    { name: "SetExecutableFlag", value: 32, description: "Marks a file as executable. Linux only.", platform: "Linux", fields: {
        UpdateSourceArgs: { label: "File", help: "The file to mark executable, relative to the root directory.", placeholder: "serverfiles/dedicated_server.x86_64" },
    }, flags: [] },

    { name: "Executable", value: 8, description: "Runs an executable. Not a shell script or a batch file - use Bash, PowerShell or CMD for those.", fields: {
        UpdateSourceData: { label: "Executable", help: "The executable to run, including the root directory.", placeholder: "./myapp/serverfiles/setup" },
        UpdateSourceArgs: { label: "Arguments", help: "The arguments to pass to it.", placeholder: "-config -force" },
    }, flags: ["RunInBackground", "ProcessToolOutput"] },

    { name: "Bash", value: 524288, description: "Runs a shell command through bash. Linux only.", platform: "Linux", fields: {
        UpdateSourceArgs: { label: "Command", help: "The command to run, from the root directory.", placeholder: "chmod -R +x ./serverfiles" },
    }, flags: [] },

    { name: "PowerShell", value: 1048576, description: "Runs a command through PowerShell. Windows only.", platform: "Windows", fields: {
        UpdateSourceArgs: { label: "Command", help: "The command to run, from the root directory.", placeholder: "Expand-Archive server.zip" },
    }, flags: [] },

    { name: "CMD", value: 2097152, description: "Runs a command through cmd.exe. Windows only.", platform: "Windows", fields: {
        UpdateSourceArgs: { label: "Command", help: "The command to run, from the root directory.", placeholder: "mklink /D save serverfiles\\save" },
    }, flags: [] },

    { name: "RunConsoleCommand", value: 262144, description: "Sends a line to the running application's console.", fields: {
        UpdateSourceArgs: { label: "Command", help: "The line to send.", placeholder: "save-all" },
    }, flags: [] },

    { name: "Pause", value: 131072, description: "Waits before moving on to the next stage.", fields: {
        UpdateSourceArgs: { label: "Seconds", help: "How long to wait.", placeholder: "10" },
    }, flags: [] },

    { name: "StartApplication", value: 4096, description: "Starts the application once. Useful when it generates its config files on first run.", fields: {}, flags: [] },
    { name: "WaitForStartupComplete", value: 8192, description: "Waits for the application to report itself ready before moving on.", fields: {}, flags: [] },
    { name: "ShutdownApplication", value: 16384, description: "Stops the application and waits for it to exit.", fields: {}, flags: [] },
    { name: "DelegateToPlugin", value: 65536, description: "Hands the update over to a plugin that provides one. Fails if no plugin has registered.", fields: {}, flags: [] },
    //Not offered for new stages - these three aren't ready to be used yet. They're still recognised on
    //import so a template that already uses one keeps working and comes back out unchanged.
    { name: "Wine32", value: 4194304, description: "Initialises a 32-bit Wine prefix. Linux only.", platform: "Linux", fields: {}, flags: [], hidden: true },
    { name: "Wine64", value: 8388608, description: "Initialises a 64-bit Wine prefix. Linux only.", platform: "Linux", fields: {}, flags: [], hidden: true },
    { name: "Proton", value: 16777216, description: "Downloads and initialises Proton-GE. Linux only.", platform: "Linux", fields: {}, flags: [], hidden: true },
    { name: "None", value: 0, description: "Does nothing. Useful as a placeholder.", fields: {}, flags: [] },
];

//The fields AMP can't run the step without - it either fails outright or quietly does nothing.
const updateStepRequiredFields = {
    SteamCMD: ["UpdateSourceData"],
    FetchURL: ["UpdateSourceData"],
    GithubRelease: ["UpdateSourceArgs"],
    FetchURLfromJQ: ["UpdateSourceData", "UpdateSourceArgs"],
    GitRepo: ["UpdateSourceData", "UpdateSourceTarget"],
    ExtractArchive: ["UpdateSourceData"],
    CopyFilePath: ["UpdateSourceArgs", "UpdateSourceData"],
    MoveFile: ["UpdateSourceArgs", "UpdateSourceData"],
    CreateFile: ["UpdateSourceArgs"],
    CreateDirectory: ["UpdateSourceArgs"],
    CreateSymlink: ["UpdateSourceArgs", "UpdateSourceData"],
    SetExecutableFlag: ["UpdateSourceArgs"],
    Executable: ["UpdateSourceData"],
    Bash: ["UpdateSourceArgs"],
    PowerShell: ["UpdateSourceArgs"],
    CMD: ["UpdateSourceArgs"],
    RunConsoleCommand: ["UpdateSourceArgs"],
    Pause: ["UpdateSourceArgs"],
};

const updateStepSpecsByName = {};
const updateStepNamesByValue = {};
for (const spec of updateStepSpecs) {
    updateStepSpecsByName[spec.name] = spec;
    updateStepNamesByValue[String(spec.value)] = spec.name;
}

//The generator used to store its own index for the step type rather than the name AMP uses. These are
//what those indexes meant, so a configuration exported before the change still opens.
const legacyUpdateSourceIndexes = {
    "0": "CopyFilePath",
    "1": "CreateSymlink",
    "2": "Executable",
    "3": "ExtractArchive",
    "4": "FetchURL",
    "5": "GithubRelease",
    "6": "SetExecutableFlag",
    "7": "StartApplication",
    "8": "SteamCMD",
};

function normalizeUpdateSource(updateSource) {
    var text = String(updateSource == null ? "" : updateSource).trim();
    if (text == "") { return "None"; }
    if (updateStepSpecsByName[text]) { return text; }

    //Case only, for a template that spells it differently to the enum.
    for (const name of Object.keys(updateStepSpecsByName)) {
        if (name.toLowerCase() == text.toLowerCase()) { return name; }
    }

    return legacyUpdateSourceIndexes[text] || null;
}

function downloadString(data, filename) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

ko.validation.init();

class generatorViewModel {
    constructor() {
        var self = this;
        this._compatibility = ko.observable("None");
        this.Meta_DisplayName = ko.observable("").extend({ required: "Please enter an application name" });
        this.Meta_Description = ko.observable("");
        this.Meta_Arch = ko.observable("x86_64");
        this._Meta_Author = ko.observable("");
        this.Meta_Author = ko.computed(() => self._Meta_Author() + ' - Made with AMP Config Generator');
        this._Meta_GithubOrigin = ko.computed(() => 'https://github.com/' + self._Meta_Author() + '/AMPTemplates.git');
        this._Meta_GithubURL = ko.computed(() => 'https://github.com/' + self._Meta_Author() + '/AMPTemplates');
        this.Meta_URL = ko.observable("");
        //2.8.0.4 is the first build with App.StoreDownloadLocations/App.StoresSupported, which is where the
        //Steam Workshop path lives now that App.SteamWorkshopDownloadLocation is obsolete.
        this.Meta_MinAMPVersion = ko.observable("2.8.0.4");
        //An imported template may name a more specific image than the generator would pick - AMP takes it
        //literally, so it's kept rather than being rewritten to the generic wine/xvfb one.
        this._Meta_SpecificDockerImageRaw = ko.observable("");
        this.__Meta_SpecificDockerImageForCompatibility = ko.computed(() => self._compatibility() != "None" ? (self._compatibility().substring(self._compatibility().length - 4) == "Xvfb" ? `cubecoders/ampbase:xvfb` : `cubecoders/ampbase:wine`) : ``);
        this.Meta_SpecificDockerImage = ko.computed(() => self._Meta_SpecificDockerImageRaw() != "" ? self._Meta_SpecificDockerImageRaw() : self.__Meta_SpecificDockerImageForCompatibility());
        this.Meta_DockerRequired = ko.observable("False");
        this.Meta_ContainerPolicy = ko.observable("Supported");
        this.Meta_ContainerPolicyReason = ko.observable("");
        this.Meta_Prerequisites = ko.observable("[]");
        this.Meta_ExtraContainerPackages = ko.observable("[]");
        this.Meta_ConfigReleaseState = ko.observable("NotSpecified");
        this.Meta_NoCommercialUsage = ko.observable(false);
        this.Meta_AppConfigId = ko.observable(newGuid());
        //Written by AMP itself, so they're carried here too - otherwise a template that sets them loses
        //them the moment it's imported and downloaded again. Values match the defaults in
        //GenericModuleConfig.cs unless the generator has a reason to differ.
        this.Meta_AarchSupport = ko.observable("Unknown");
        this.Meta_DockerBaseReadOnly = ko.observable("False");
        this.Meta_ExtraSetupStepsURI = ko.observable("");
        this.Meta_ConfigVersion = ko.observable("1");
        this.Meta_ReleaseNotes = ko.observable("");
        this.Meta_BreakingReleaseNotes = ko.observable("");
        this.Meta_ImportableExtensions = ko.observable("[]");
        this.Meta_AppIsMultiIPAware = ko.observable("False");

        this._SupportsWindows = ko.observable(true);
        this._SupportsLinux = ko.observable(true);

        this.App_AdminMethod = ko.observable("STDIO");
        this.App_HasReadableConsole = ko.observable(true);
        this.App_HasWriteableConsole = ko.observable(true);
        this.App_DisplayName = ko.computed(() => this.Meta_DisplayName());
        this.App_CommandLineArgs = ko.observable("{{$PlatformArgs}} {{$FormattedArgs}}")
        this.App_WindowsCommandLineArgs = ko.observable("");
        this.App_CommandLineParameterFormat = ko.observable("+{0} {1}");
        this.App_CommandLineParameterDelimiter = ko.observable(" ");
        this.App_RapidStartup = ko.observable("False");
        this.App_ApplicationReadyMode = ko.observable("RegexMatch");
        //Deliberately not AMP's default (String) - most applications the generator is used for can't be
        //asked to stop over their console.
        this.App_ExitMethod = ko.observable("OS_CLOSE");
        this.App_ExitString = ko.observable("stop");
        this.App_UseLinuxIOREDIR = ko.observable("False");
        this.App_ExitTimeout = ko.observable("30");
        this.App_ExitFile = ko.observable("app_exit.lck");
        this.App_SupportsLiveSettingsChanges = ko.observable("False");
        this.App_LiveSettingChangeCommandFormat = ko.observable("set {0} \"{1}\"");
        this.App_ApplicationIPBinding = ko.observable("0.0.0.0");
        //The port Refs follow the generators own naming rather than AMP's ApplicationPort1/2.
        this.App_AdminPortRef = ko.observable("RemoteAdminPort");
        this.App_UniversalSleepApplicationUDPPortRef = ko.observable("MainGamePort");
        this.App_PrimaryApplicationPortRef = ko.observable("MainGamePort");
        this.App_UniversalSleepSteamQueryPortRef = ko.observable("SteamQueryPort");
        this.App_MaxUsers = ko.observable("20");
        this.App_UseRandomAdminPassword = ko.observable(false);
        this.App_RemoteAdminPassword = ko.observable("");
        this.App_AdminLoginTransform = ko.observable("None");
        this.App_RCONConnectDelaySeconds = ko.observable("5");
        this.App_RCONHeartbeatCommand = ko.observable("ping");
        this.App_RCONHeartbeatMinutes = ko.observable("0");
        this.App_TelnetLoginFormat = ko.observable("{0}");
        this.App_SteamUpdateAnonymousLogin = ko.observable("True");
        this.App_SupportsUniversalSleep = ko.observable("False");
        this.App_WakeupMode = ko.observable("Any");
        //AMP dropped App.MonitorChildProcess/App.MonitorChildProcessWaitMs - child monitoring is now driven
        //by this name being set at all, and it only applies on Linux.
        this.App_MonitorChildProcessName = ko.observable("");
        this.App_Compatibility = ko.observable("None");
        //AMP fills this in with the live value of every setting once the instance runs - a template ships it empty.
        this.App_AppSettings = ko.observable("{}");
        //Whatever an imported template had, so its own variables survive being downloaded again.
        this._App_EnvironmentVariablesImported = ko.observable("{}");

        //Exit handling and process supervision.
        this.App_ExitMethodWindows = ko.observable("None"); //None means "use App.ExitMethod on Windows too".
        this.App_RestartDelaySeconds = ko.observable("0");
        this.App_DumpFullChildProcessTree = ko.observable("False");
        this.App_MonitorDirectChildOnly = ko.observable(false);

        //Networking and logging.
        this.App_UDPLogger = ko.observable("False");
        this.App_ForceIPBinding = ko.observable(false);
        this.App_SupportsIPv6 = ko.observable(false);
        this.App_TailLogFilePath = ko.observable("server.log");

        //RCON and admin login.
        this.App_PersistRandomPassword = ko.observable(false);
        this.App_IgnoreSTDOUTAfterRCON = ko.observable("False");
        this.App_StripANSIControlCodes = ko.observable("True");
        this.App_LoginTransformPrefix = ko.observable(""); //Only used when App.AdminLoginTransform is Prefix.
        this.App_RCONSelectIPMethod = ko.observable("Default");
        this.App_TelnetNewLineType = ko.observable("Default");

        //Triggers the generator has no editor for - shipped empty so they survive a round trip.
        this.App_CommandTriggers = ko.observable("{}");
        this.App_UserActions = ko.observable("[]");

        //Updates and backups.
        this.App_ForceUpdate = ko.observable("False");
        this.App_ForceUpdateReason = ko.observable("");
        this.App_SmartExcludeSupported = ko.observable("True");
        this.App_SmartExcludeExemptions = ko.observable(JSON.stringify(["*.cfg", "*.conf", "*.config", "*.ini", "*.json", "*.xml", "*.properties", "*.kvp", "*.yml", "*.yaml", "*.toml", "*.lua"]));

        //Sleep mode and quiescing.
        this.App_UseSteamQueryForStatus = ko.observable("False");
        this.App_QuiesceCommand = ko.observable("");
        this.App_DequiesceCommand = ko.observable("");
        this.App_QuiesceSettleDelayMilliseconds = ko.observable("5000");

        //App.SteamWorkshopDownloadLocation is obsolete in AMP and nothing reads it any more, so it isn't
        //written. AMP takes the path out of App.StoreDownloadLocations (keyed on the store name minus its
        //"Store" suffix), and a store only offers itself if App.StoresSupported has its flag.
        this._App_SteamWorkshopDownloadLocation = ko.observable("");
        this._App_WorkshopDownloadPath = ko.computed(() => self._App_SteamWorkshopDownloadLocation() != '' ? "{{$FullBaseDir}}" + self._App_SteamWorkshopDownloadLocation() : '');
        this.App_StoresSupported = ko.computed(() => self._App_WorkshopDownloadPath() != '' ? "SteamWorkshop" : "None");
        this.App_StoreSpecificSettings = ko.observable("{}");
        this.App_StoreDownloadLocations = ko.computed(() => JSON.stringify(self._App_WorkshopDownloadPath() != '' ? { "SteamWorkshop": self._App_WorkshopDownloadPath() } : {}));

        this.Console_FilterMatchRegex = ko.observable("");
        this.Console_FilterMatchReplacement = ko.observable("");
        this.Console_ThrowawayMessageRegex = ko.observable("");
        //The sample console lines the generator builds the event expressions from...
        this._Console_AppReadyRegex = ko.observable("");
        this._Console_UserJoinRegex = ko.observable("");
        this._Console_UserLeaveRegex = ko.observable("");
        this._Console_UserChatRegex = ko.observable("");
        //...and the expressions themselves, for anything written by hand or brought in from a template.
        //WildcardToRegex escapes what it's given, so an existing expression can't go back through it - it's
        //held here instead and used as-is whenever there's no sample line to build one from.
        this._Console_AppReadyRegexRaw = ko.observable("");
        this._Console_UserJoinRegexRaw = ko.observable("");
        this._Console_UserLeaveRegexRaw = ko.observable("");
        this._Console_UserChatRegexRaw = ko.observable("");
        this.Console_UpdateAvailableRegex = ko.observable("");
        this.Console_MetricsRegex = ko.observable("");
        //No editor for these yet, but AMP writes them and templates use them - carried so an imported
        //template keeps whatever it had.
        this.Console_PreConnectRegex = ko.observable("");
        this.Console_ConnectIPRegex = ko.observable("");
        this.Console_ServerInfoRegex = ko.observable("");
        this.Console_ServerAuthURLPromptRegex = ko.observable("");
        this.Console_ServerAuthAckRegex = ko.observable("");
        this.Console_ConsoleFormatRegex = ko.observable("");
        this.Console_DownloadProgressRegex = ko.observable("");
        this.Console_HideFromConsoleRegex = ko.observable("");
        this.Console_SuppressLogAtStart = ko.observable("False");
        this.Console_UserActions = ko.observable("{}");

        this.Limits_SleepMode = ko.observable("True");
        this.Limits_SleepOnStart = ko.observable("False");
        this.Limits_SleepDelayMinutes = ko.observable("5");
        this.Limits_DozeDelay = ko.observable("2");
        this.Limits_AutoRetryCount = ko.observable("5");
        this.Limits_SleepStartThresholdSeconds = ko.observable("25");

        this._PortMappings = ko.observableArray(); //of portMappingViewModel
        this.__NewPort = ko.observable("7777");
        this.__NewName = ko.observable("");
        this.__NewDescription = ko.observable("");
        this.__NewPortType = ko.observable("Custom Port");
        this.__NewProtocol = ko.observable("0");

        //Worked out from the ports themselves rather than tracked by hand as they are added and removed,
        //so changing a port's type after it has been added keeps the list right.
        this.__TakenPortTypes = ko.computed(() => self._PortMappings().map(port => port._PortType()).filter(portType => portType != "Custom Port"));
        this.__AvailablePortOptions = ko.computed(() => portTypes.filter(portType => portType == "Custom Port" || !self.__TakenPortTypes().contains(portType)));

        //What the four port role settings can be pointed at. Whatever they already hold stays on offer even
        //when no port answers to it - a template can name a port the generator has no row for, and dropping
        //the value from the list would have the dropdown quietly rewrite it to something else on load.
        //Parents and their children both, the way AMP flattens the list before looking a ref up.
        this.__AllPortRefs = ko.computed(() => {
            var refs = [];
            for (const port of self._PortMappings()) {
                refs.push(port.Ref());
                for (const child of port._ChildPorts()) { refs.push(child.Ref()); }
            }
            return refs;
        });

        this.__PortRefOptions = ko.computed(() => {
            var refs = self.__AllPortRefs().filter(ref => ref != "");
            for (const ref of [self.App_PrimaryApplicationPortRef(), self.App_AdminPortRef(), self.App_UniversalSleepApplicationUDPPortRef(), self.App_UniversalSleepSteamQueryPortRef()]) {
                if (ref != "") { refs.push(ref); }
            }
            return [""].concat(refs.filter((ref, index) => refs.indexOf(ref) == index));
        });
        //AMP resolves a role to a port by exact Ref and falls back to port 0 when it misses, so a ref with
        //no port behind it is called out in the list rather than looking like any other choice.
        this.__PortRefText = ref => ref == "" ? "None" : (self.__AllPortRefs().contains(ref) ? ref : `${ref} (no such port)`);

        //AMP writes these as "True"/"False" text, so the checkboxes go through a computed rather than
        //binding to the value that gets written.
        var trueFalseChecked = observable => ko.computed({
            read: () => observable() == "True",
            write: value => observable(value ? "True" : "False"),
        });
        this.__SupportsUniversalSleepChecked = trueFalseChecked(self.App_SupportsUniversalSleep);
        this.__UseSteamQueryForStatusChecked = trueFalseChecked(self.App_UseSteamQueryForStatus);

        this._ConfigFileMappings = ko.observableArray(); //of configFileMappingViewModel
        //Files an imported template shipped that the generator has no concept of. They go back into the
        //download untouched - see parseTemplateFiles.
        this._ExtraFiles = ko.observableArray(); //of { name, text }
        this.__NewConfigFile = ko.observable("");
        this.__NewAutoMap = ko.observable(true);
        this.__NewConfigType = ko.observable("0");

        this._UpdateSourceURL = ko.observable("");
        this._UpdateSourceGitRepo = ko.observable("");
        this._UpdateSourceUnzip = ko.observable(false);
        this._DisplayImageSource = ko.observable("");
        //Whatever an imported template already had, for the sources the generator can't work out for itself
        //- an "internal:" image, or a "steam:" one on a template whose stage doesn't name a client App ID.
        this._Meta_DisplayImageSourceRaw = ko.observable("");

        this._SteamServerAppID = ko.observable("");

        this._WinExecutableName = ko.observable("");
        this._LinuxExecutableName = ko.observable("");

        this._AppSettings = ko.observableArray(); //of appSettingViewModel
        this.__AddEditSetting = ko.observable(null); //of appSettingViewModel
        this.__IsEditingSetting = ko.observable(false);

        this._UpdateStages = ko.observableArray(); //of updateStageViewModel
        //AMP runs these before every start rather than only when updating, using the same stage type.
        this._PreStartStages = ko.observableArray(); //of updateStageViewModel
        this.__AddEditStage = ko.observable(null); //of updateStageViewModel
        this.__IsEditingStage = ko.observable(false);
        this.__NewStageList = ko.observable(null);

        //Computed values
        //A sample line wins when there is one, otherwise whatever expression was typed or imported is kept.
        var consoleEventRegex = (sample, raw) => ko.computed(() => sample() != "" ? WildcardToRegex(sample()) : raw());
        this.Console_AppReadyRegex = consoleEventRegex(self._Console_AppReadyRegex, self._Console_AppReadyRegexRaw);
        this.Console_UserJoinRegex = consoleEventRegex(self._Console_UserJoinRegex, self._Console_UserJoinRegexRaw);
        this.Console_UserLeaveRegex = consoleEventRegex(self._Console_UserLeaveRegex, self._Console_UserLeaveRegexRaw);
        this.Console_UserChatRegex = consoleEventRegex(self._Console_UserChatRegex, self._Console_UserChatRegexRaw);
        this.__QueryPortName = ko.computed(() => {
            var queryPort = self._PortMappings().find(p => p._PortType() == "Steam Query Port");
            return queryPort ? queryPort.Ref() : "";
        });
        //Built from the query port when there is one, but an imported template's own format wins - most
        //of them name a port the generator has no concept of, and blanking it takes the connect button
        //off the instance.
        this._Meta_EndpointURIFormatRaw = ko.observable("");
        this.Meta_EndpointURIFormat = ko.computed(() => self._Meta_EndpointURIFormatRaw() != "" ? self._Meta_EndpointURIFormatRaw() : (self.__QueryPortName() != "" ? `steam://connect/{ip}:{GenericModule.App.Ports.$${self.__QueryPortName()}}` : ""));

        this.__SanitizedName = ko.computed(() => self.Meta_DisplayName().replace(/\s+/g, "-").replace(/[^a-z\d-_]/ig, "").toLowerCase());
        //AMP reads either the flag value or the names, and the templates are all written with names.
        this.Meta_OS = ko.computed(() => [self._SupportsWindows() ? "Windows" : null, self._SupportsLinux() ? "Linux" : null].filter(name => name != null).join(", ") || "None");
        this.Meta_ConfigManifest = ko.computed(() => self.__SanitizedName() + "config.json");
        this.Meta_MetaConfigManifest = ko.computed(() => self.__SanitizedName() + "metaconfig.json");
        this._Meta_PortsManifest = ko.computed(() => self.__SanitizedName() + "ports.json");
        this._Meta_StagesManifest = ko.computed(() => self.__SanitizedName() + "updates.json");
        this._Meta_PreStartManifest = ko.computed(() => self.__SanitizedName() + "prestart.json");
        this.Meta_ConfigRoot = ko.computed(() => self.__SanitizedName() + ".kvp");
        this.App_RootDir = ko.computed(() => `./${self.__SanitizedName()}/`);

        this._SteamAppID = ko.computed(() => {
            for (const stage of self._UpdateStages()) {
                if (stage._UpdateSource() == "SteamCMD" && stage.UpdateSourceData() != "") {
                    return stage.UpdateSourceData();
                }
            }
            return '0';
        });

        //Only the client App ID names something with a store page. It falls back to the server App ID for
        //the SteamAppId environment variable, where the two are usually interchangeable - the store image
        //below deliberately doesn't take that fallback.
        this._SteamClientAppID = ko.computed(() => {
            for (const stage of self._UpdateStages()) {
                if (stage._UpdateSource() == "SteamCMD") {
                    var clientAppID = stage.UpdateSourceArgs() != "" ? stage.UpdateSourceArgs() : stage.UpdateSourceData();
                    if (clientAppID != "") { return clientAppID; }
                }
            }
            return '';
        });

        //AMP builds the image URL as store_item_assets/steam/apps/<id>/header.jpg, which only exists for
        //the game on the store - a dedicated server App ID has no store page, so pointing this at one
        //leaves every instance of the application with a broken image.
        this._SteamStoreAppID = ko.computed(() => {
            for (const stage of self._UpdateStages()) {
                if (stage._UpdateSource() == "SteamCMD" && stage.UpdateSourceArgs() != "") { return stage.UpdateSourceArgs(); }
            }
            return '';
        });

        //AMP's own default when a template has nothing better - it resolves to an image that exists,
        //where an empty "url:" leaves the instance with a blank one.
        this.Meta_DisplayImageSource = ko.computed(() => {
            if (self._SteamStoreAppID() != '') { return 'steam:' + self._SteamStoreAppID(); }
            if (self._DisplayImageSource() != '') { return 'url:' + self._DisplayImageSource(); }
            if (self._Meta_DisplayImageSourceRaw() != '') { return self._Meta_DisplayImageSourceRaw(); }
            return 'internal:UnknownApp';
        });
        this.App_BaseDirectory = ko.computed(() => self._SteamAppID() == 0 ? self.App_RootDir() + 'serverfiles/' : self.App_RootDir() + self._SteamAppID() + '/');
        this.App_WorkingDir = ko.computed(() => self._SteamAppID() == 0 ? 'serverfiles' : self._SteamAppID());
        this.App_ExecutableWin = ko.computed(() => self.App_WorkingDir() == "" ? self._WinExecutableName() : `${self.App_WorkingDir()}\\${self._WinExecutableName()}`);
        this.App_ExecutableLinux = ko.computed(() => self._compatibility() == "None" ? (self.App_WorkingDir() == "" ? self._LinuxExecutableName() : `${self.App_WorkingDir()}/${self._LinuxExecutableName()}`) : (self._compatibility().substring(self._compatibility().length - 4) == "Xvfb" ? '/usr/bin/xvfb-run' : (self._compatibility() == "Wine" ? '/usr/bin/wine' : '1580130/proton')));
        this._WinExecutableLinuxPath = ko.computed(() => self._WinExecutableName().replace(/\\/g, "/"));
        this._App_LinuxCommandLineArgsCompat = ko.computed(() => self._compatibility() == "None" ? '' : (self._compatibility() == "WineXvfb" ? '-a wine \"./' + self._WinExecutableLinuxPath() + '\"' : (self._compatibility() == "ProtonXvfb" ? '-a \"{{$FullRootDir}}1580130/proton\" run \"./' + self._WinExecutableLinuxPath() + '\"' : (self._compatibility() == "Proton" ? 'run \"./' + self._WinExecutableLinuxPath() + '\"' : '\"./' + self._WinExecutableLinuxPath() + '\"'))));
        this._App_LinuxCommandLineArgsInput = ko.observable("");
        this.App_LinuxCommandLineArgs = ko.computed(() => (self._App_LinuxCommandLineArgsCompat() != '' ? self._App_LinuxCommandLineArgsCompat() + ' ' + self._App_LinuxCommandLineArgsInput() : self._App_LinuxCommandLineArgsInput()).trim());

        this.App_Ports = ko.computed(() => `@IncludeJson[` + self._Meta_PortsManifest() + `]`);
        this.App_UpdateSources = ko.computed(() => `@IncludeJson[` + self._Meta_StagesManifest() + `]`);
        //Written inline while there are none, so a template without pre-start stages doesn't ship an
        //extra file that only ever holds an empty list.
        this.App_PreStartStages = ko.computed(() => self._PreStartStages().length > 0 ? `@IncludeJson[` + self._Meta_PreStartManifest() + `]` : `[]`);
/*
        this.__BuildPortMappings = ko.computed(() => {
            var data = {};
            var allPorts = self._PortMappings();
            var appPortNum = 1;
            self.__QueryPortName("");
            for (var i = 0; i < allPorts.length; i++) {
                var portEntry = allPorts[i];
                if (portEntry.PortType() == "2") //RCON
                {
                    data["RemoteAdminPort"] = portEntry.Port();
                }
                else {
                    if (appPortNum > 3) { continue; }
                    var portName = "ApplicationPort" + appPortNum;
                    data[portName] = portEntry.Port();
                    appPortNum++;
                    if (portEntry.PortType() == "1") //QueryPort
                    {
                        self.__QueryPortName(portName);
                    }
                }
            }
            return data;
        });
*/        
        this.__SampleFormattedArgs = ko.computed(function () {
            return self._AppSettings().filter(s => s.IncludeInCommandLine()).map(s => s.IsFlagArgument() ? s._CheckedValue() : self.App_CommandLineParameterFormat().format(s.ParamFieldName(), s.DefaultValue())).join(self.App_CommandLineParameterDelimiter());
        });
/*
        this.__SampleCommandLineFlags = ko.computed(function () {
            var replacements = ko.toJS(self.__BuildPortMappings());
            replacements["ApplicationIPBinding"] = "0.0.0.0";
            replacements["FormattedArgs"] = self.__SampleFormattedArgs();
            replacements["MaxUsers"] = "10";
            replacements["RemoteAdminPassword"] = "r4nd0m-pa55w0rd-g0e5_h3r3";
            return self.App_CommandLineArgs().template(replacements);
        });
*/
        this.__GenData = ko.computed(function () {
            var data = [
                {
                    "key": "Generated Name",
                    "value": self.__SanitizedName()
                },
                {
                    "key": "Config Root",
                    "value": self.Meta_ConfigRoot()
                },
                {
                    "key": "Settings Manifest",
                    "value": self.Meta_ConfigManifest()
                },
                {
                    "key": "Ports Manifest",
                    "value": self._Meta_PortsManifest()
                },
                {
                    "key": "Config Files Manifest",
                    "value": self.Meta_MetaConfigManifest()
                },
                {
                    "key": "Image Source",
                    "value": self.Meta_DisplayImageSource(),
                    "longValue": true
                },
                {
                    "key": "Root Directory",
                    "value": self.App_RootDir()
                },
                {
                    "key": "Base Directory",
                    "value": self.App_BaseDirectory()
                },
                {
                    "key": "Working Directory",
                    "value": self.App_WorkingDir()
                },
                {
                    "key": "Docker Image",
                    "value": self.Meta_SpecificDockerImage(),
                    "longValue": true
                },
                {
                    "key": "Compatibility",
                    "value": self._compatibility()
                }
            ];

            if (self._SupportsWindows()) {
                data.push({
                    "key": "Windows Executable",
                    "value": self.App_ExecutableWin()
                });
            }

            if (self._SupportsLinux()) {
                data.push({
                    "key": "Linux Executable",
                    "value": self.App_ExecutableLinux()
                });
            }

            return data;
        });

        //Action methods (add/remove/update)
        this.__RemovePort = function (toRemove) {
            self._PortMappings.remove(toRemove);
        };

        this.__AddPort = function () {
            self._PortMappings.push(new portMappingViewModel(self.__NewPort(), self.__NewName(), self.__NewDescription(), self.__NewPortType(), self.__NewProtocol(), self));
            //The type that was just used is no longer on offer, so the new-port row goes back to a custom
            //one rather than being left pointing at something that has gone from the list.
            self.__NewPortType("Custom Port");
            self.__NewName("");
            self.__NewDescription("");
        };

        this.__RemoveConfigFile = function (toRemove) {
            self._ConfigFileMappings.remove(toRemove);
        };

        this.__AddConfigFile = function () {
            self._ConfigFileMappings.push(new configFileMappingViewModel(self.__NewConfigFile(), self.__NewAutoMap(), self.__NewConfigType(), self));
        };

        this.__RemoveSetting = function (toRemove) {
            self._AppSettings.remove(toRemove);
        };

        this.__EditSetting = function (toEdit) {
            self.__IsEditingSetting(true);
            self.__AddEditSetting(toEdit);
            $("#addEditSettingModal").modal('show');
        };

        this.__AddSetting = function () {
            self.__IsEditingSetting(false);
            self.__AddEditSetting(new appSettingViewModel(self));
            $("#addEditSettingModal").modal('show');
        };

        this.__DoAddSetting = function () {
            self._AppSettings.push(self.__AddEditSetting());
            $("#addEditSettingModal").modal('hide');
        };

        this.__CloseSetting = function () {
            $("#addEditSettingModal").modal('hide');
        };

        //A stage only ever lives in one of the two lists, so removing it from the other is a no-op.
        this.__RemoveStage = function (toRemove) {
            self._UpdateStages.remove(toRemove);
            self._PreStartStages.remove(toRemove);
        };

        this.__EditStage = function (toEdit) {
            self.__IsEditingStage(true);
            self.__AddEditStage(toEdit);
            $("#addEditStageModal").modal('show');
        };

        this.__AddStageTo = function (list) {
            self.__IsEditingStage(false);
            self.__NewStageList(list);
            self.__AddEditStage(new updateStageViewModel(self));
            $("#addEditStageModal").modal('show');
        };

        this.__AddStage = () => self.__AddStageTo(self._UpdateStages);
        this.__AddPreStartStage = () => self.__AddStageTo(self._PreStartStages);
        this.__Errors = ko.validation.group(self);
        this.__isValid = ko.computed(function () {
            return self.__Errors().length == 0;
        });
        
        this.__DoAddStage = function () {
            (self.__NewStageList() || self._UpdateStages).push(self.__AddEditStage());
            $("#addEditStageModal").modal('hide');
        };

        this.__CloseStage = function () {
            $("#addEditStageModal").modal('hide');
        };

        this.__Serialize = function () {
            var asJS = ko.toJS(self);
            var result = JSON.stringify(asJS, omitPrivateMembers);
            return result;
        };

        //Keys that were renamed once it turned out they didn't match the module config - configurations
        //exported before the rename are migrated on import so their values aren't silently dropped.
        this.__RenamedKeys = {
            "App_HasWritableConsole": "App_HasWriteableConsole",
            "Meta_Prerequsites": "Meta_Prerequisites",
            "Console_SleepMode": "Limits_SleepMode",
            "Console_SleepOnStart": "Limits_SleepOnStart",
            "Console_SleepDelayMinutes": "Limits_SleepDelayMinutes",
            "Console_DozeDelay": "Limits_DozeDelay",
            "Console_AutoRetryCount": "Limits_AutoRetryCount",
            "Console_SleepStartThresholdSeconds": "Limits_SleepStartThresholdSeconds"
        };

        this.__Deserialize = function (inputData) {
            var asJS = JSON.parse(inputData);

            for (const [oldKey, newKey] of Object.entries(self.__RenamedKeys)) {
                if (typeof asJS[oldKey] !== "undefined") {
                    if (typeof asJS[newKey] === "undefined") { asJS[newKey] = asJS[oldKey]; }
                    delete asJS[oldKey];
                }
            }

            var ports = asJS._PortMappings || [];
            var configFiles = asJS._ConfigFileMappings || [];
            var settings = asJS._AppSettings || [];
            var stages = asJS._UpdateStages || [];
            var preStartStages = asJS._PreStartStages || [];

            delete asJS._PortMappings;
            delete asJS._ConfigFileMappings;
            delete asJS._AppSettings;
            delete asJS._UpdateStages;
            delete asJS._PreStartStages;

            self.__ApplyImportedData({ values: asJS, ports: ports, configFiles: configFiles, settings: settings, stages: stages, preStartStages: preStartStages });
        };

        //Fills the whole view model in from plain data using the same field names an export uses - shared
        //by importing an exported configuration and importing a finished set of template files.
        this.__ApplyImportedData = function (data) {
            var ports = data.ports || [];
            var configFiles = data.configFiles || [];
            var settings = data.settings || [];
            var stages = data.stages || [];
            var preStartStages = data.preStartStages || [];

            ko.quickmap.map(self, data.values || {});

            self._PortMappings.removeAll();
            //quickmap only maps one level deep, so each port rebuilds its own child ports - see
            //portMappingViewModel.__ApplyImportedData.
            var mappedPorts = [];
            for (const portData of ports) {
                var mappedPort = new portMappingViewModel("", "", "", "Custom Port", "0", self);
                mappedPort.__ApplyImportedData(portData || {});
                mappedPorts.push(mappedPort);
            }
            self._PortMappings.push.apply(self._PortMappings, mappedPorts);

            self._ConfigFileMappings.removeAll();
            var mappedConfigFiles = ko.quickmap.to(configFileMappingViewModel, configFiles, false, { __vm: self });
            self._ConfigFileMappings.push.apply(self._ConfigFileMappings, mappedConfigFiles);

            self._AppSettings.removeAll();
            //quickmap only maps one level deep, so each setting rebuilds its own nested parts - see
            //appSettingViewModel.__ApplyImportedData.
            var mappedSettings = [];
            for (const settingData of settings) {
                var mappedSetting = new appSettingViewModel(self);
                mappedSetting.__ApplyImportedData(settingData || {});
                mappedSettings.push(mappedSetting);
            }
            self._AppSettings.push.apply(self._AppSettings, mappedSettings);

            //The step type used to be stored as the generators own index rather than the name AMP reads,
            //so an older configuration is brought onto the names before it's mapped.
            var mapStages = stageData => ko.quickmap.to(updateStageViewModel, stageData.filter(stage => stage != null).map(stage => {
                var mapped = Object.assign({}, stage);
                if (typeof mapped._UpdateSource !== "undefined") { mapped._UpdateSource = normalizeUpdateSource(mapped._UpdateSource) || "None"; }
                if (mapped._Passthrough == null || typeof mapped._Passthrough !== "object") { mapped._Passthrough = {}; }
                return mapped;
            }), false, { __vm: self });

            self._UpdateStages.removeAll();
            self._UpdateStages.push.apply(self._UpdateStages, mapStages(stages));

            self._PreStartStages.removeAll();
            self._PreStartStages.push.apply(self._PreStartStages, mapStages(preStartStages));

            self.__NewPortType("Custom Port");

            self._ExtraFiles.removeAll();
            self._ExtraFiles.push.apply(self._ExtraFiles, data.extraFiles || []);
        };

        this.__IsExporting = ko.observable(false);

        this.__Export = function () {
            self.__IsExporting(true);
            $("#importexporttextarea").val(self.__Serialize());
            $("#importexporttextarea").attr("readonly", true);
            $("#importExportDialog").modal("show");
            autoSave();
        };

        this.__CopyExportToClipboard = function (data, element) {
            navigator.clipboard.writeText($("#importexporttextarea").val());
            setTimeout(() => $(element.target).tooltip('hide'), 2000);
        };

        this.__CloseImportExport = function () {
            $("#importExportDialog").modal("hide");
        };

        this.__Import = function () {
            self.__IsExporting(false);
            $("#importexporttextarea").val("");
            $("#importexporttextarea").prop("readonly", false);
            $("#importExportDialog").modal("show");
        };

        this.__DoImport = function () {
            self.__Deserialize($("#importexporttextarea").val());
            $("#importExportDialog").modal("hide");
            autoSave();
        };

        this.__ImportedFiles = ko.observableArray();
        this.__ImportWarnings = ko.observableArray();

        this.__ImportFiles = function () {
            $("#importfilesinput").val("");
            self.__ImportedFiles.removeAll();
            self.__ImportWarnings.removeAll();
            $("#importFilesDialog").modal("show");
        };

        this.__CloseImportFiles = function () {
            $("#importFilesDialog").modal("hide");
        };

        //A finished template is a .kvp plus its manifests - either picked as loose files, or as the zip
        //the generator produces.
        this.__ReadTemplateFiles = async function (fileList) {
            var files = [];

            for (const file of fileList) {
                if (file.name.toLowerCase().endsWith(".zip")) {
                    var zip = await JSZip.loadAsync(file);
                    var entries = Object.keys(zip.files).filter(name => !zip.files[name].dir);
                    for (const entry of entries) {
                        files.push({ name: entry, text: await zip.files[entry].async("string") });
                    }
                }
                else {
                    files.push({ name: file.name, text: await file.text() });
                }
            }

            return files;
        };

        this.__DoImportFiles = async function (fileList) {
            self.__ImportedFiles.removeAll();
            self.__ImportWarnings.removeAll();

            try {
                var files = await self.__ReadTemplateFiles(fileList);
                var parsed = parseTemplateFiles(files);

                if (!parsed.ok) {
                    self.__ImportWarnings.push.apply(self.__ImportWarnings, parsed.warnings);
                    return;
                }

                self.__ApplyImportedData(parsed);
                self.__ImportedFiles.push.apply(self.__ImportedFiles, parsed.imported);
                self.__ImportWarnings.push.apply(self.__ImportWarnings, parsed.warnings);
                autoSave();
            }
            catch (e) {
                console.error("Could not import the selected files.", e);
                self.__ImportWarnings.push(`Could not read the selected files - ${e.message}`);
            }
        };

        this.__Share = function (data, element) {
            var data = encodeURIComponent(self.__Serialize());
            var url = `${document.location.protocol}//${document.location.hostname}${document.location.pathname}#cdata=${data}`;
            navigator.clipboard.writeText(url);
            setTimeout(() => $(element.target).tooltip('hide'), 2000);
        };

        this.__Clear = function () {
            localStorage.configgenautosave = "";
            document.location.reload();
        }

        this.__GithubManifest = function () {
            var githubManifest = JSON.stringify({ id: newGuid(), authors: [self.Meta_Author()], origin: self._Meta_GithubOrigin(), url: self._Meta_GithubURL(), imagefile: "", prefix: self._Meta_Author() }, null, 4);
            return githubManifest;
        }

        this.__DownloadConfig = function () {
            if (this.__ValidationResult() < 2) { return; }

            var values = {};
            for (const key of Object.keys(self).filter(k => !k.startsWith("_"))) {
                var value = self[key]();
                //Checkbox-bound fields hold real booleans - AMP writes them as True/False, so match that.
                values[key.replace("_", ".")] = typeof value === "boolean" ? (value ? "True" : "False") : value;
            }

            var environmentVariables = { "LD_LIBRARY_PATH": "{{$FullBaseDir}}linux64:{{$FullRootDir}}linux64:%LD_LIBRARY_PATH%" };

            if (self._SteamClientAppID() != '') {
                environmentVariables["SteamAppId"] = self._SteamClientAppID();
            }

            if (self._compatibility() == "Proton" || self._compatibility() == "ProtonXvfb") {
                environmentVariables["STEAM_COMPAT_DATA_PATH"] = "{{$FullRootDir}}1580130";
                environmentVariables["STEAM_COMPAT_CLIENT_INSTALL_PATH"] = "{{$FullRootDir}}1580130";
            } else if (self._compatibility() == "Wine" || self._compatibility() == "WineXvfb") {
                environmentVariables["WINEPREFIX"] = "{{$FullRootDir}}.wine";
                environmentVariables["WINEARCH"] = "win64";
                environmentVariables["WINEDEBUG"] = "-all";
            }

            //An imported template can carry variables the generator knows nothing about - a wine DLL
            //override that loads a mod loader, for instance. The ones the generator works out for itself
            //still win, so changing the compatibility layer takes effect, but everything else is kept.
            var importedVariables = manifestJsonObject(self._App_EnvironmentVariablesImported()) || {};
            for (const key of Object.keys(importedVariables)) {
                if (!(key in environmentVariables)) { environmentVariables[key] = importedVariables[key]; }
            }

            values["App.EnvironmentVariables"] = JSON.stringify(environmentVariables);

            var output = sortByKvpKeyOrder(Object.keys(values)).map(key => `${key}=${values[key]}`).join("\n");
            var asJSAppSettings = self._AppSettings().map(setting => setting.__ToManifestEntry());
            var asJSUpdateStages = self._UpdateStages().map(stage => stage.__ToManifestEntry());
            var asJSPreStartStages = self._PreStartStages().map(stage => stage.__ToManifestEntry());
            var asJSPortMappings = self._PortMappings().map(port => port.__ToManifestEntry());
            var asJSConfigFileMappings = self._ConfigFileMappings().map(configFile => configFile.__ToManifestEntry());
            var zip = new JSZip();
            zip.file(self.Meta_ConfigRoot(), output);
            zip.file(self.Meta_ConfigManifest(), JSON.stringify(asJSAppSettings, null, 4));
            zip.file(self._Meta_StagesManifest(), JSON.stringify(asJSUpdateStages, null, 4));
            if (asJSPreStartStages.length > 0) { zip.file(self._Meta_PreStartManifest(), JSON.stringify(asJSPreStartStages, null, 4)); }
            zip.file(self._Meta_PortsManifest(), JSON.stringify(asJSPortMappings, null, 4));
            zip.file(self.Meta_MetaConfigManifest(), JSON.stringify(asJSConfigFileMappings, null, 4));
            zip.file("manifest.json", self.__GithubManifest());
            //Whatever the imported template shipped alongside its manifests, put back untouched.
            for (const extra of ko.toJS(self._ExtraFiles())) { zip.file(extra.name, extra.text); }
            zip.generateAsync({ type: "blob" })
                .then(function (content) {
                    saveAs(content, "configs.zip");
                });
        };

        this.__Invalidate = function (newValue) {
            self.__ValidationResult(0);
        };

        for (const k of Object.keys(self)) {
            if (ko.isObservable(self[k])) {
                self[k].subscribe(self.__Invalidate);
            }
        }

        this.__ValidationResult = ko.observable(0);

        this.__ValidationResults = ko.observableArray();

        this.__ValidateConfig = function () {
            autoSave();
            if (!self.__isValid()) {
                self.__Errors.showAllMessages();
                return;
            }
            self.__ValidationResults.removeAll();

            var failure = (issue, recommendation) => self.__ValidationResults.push(new validationResult("Failure", issue, recommendation));
            var warning = (issue, recommendation, impact) => self.__ValidationResults.push(new validationResult("Warning", issue, recommendation, impact));
            var info = (issue, recommendation, impact) => self.__ValidationResults.push(new validationResult("Info", issue, recommendation, impact));

            //Validation Begins
            if (self.Meta_DisplayName() == "") {
                failure("Missing application name", "Specify an application name under 'Basic Configuration'");
            }

            if (!self._SupportsWindows() && !self._SupportsLinux()) {
                failure("No platforms have been specified as supported.", "Specify at least one supported platform under 'Basic Information'");
            }

            if (self._SupportsWindows()) {
                if (self._WinExecutableName() == "") { failure("Windows is listed as a supported platform, but no executable for this platform was specified.", "Specify an executable for this platform under 'Startup and Shutdown'"); }
                else if (!self._WinExecutableName().toLowerCase().endsWith(".exe")) { failure("You can only start executables (.exe) files on Windows from AMP. Do not attempt to use batch files or other file types.", "Change your Windows Executable under Startup and Shutdown to be a .exe file."); }
            }

            if (self._SupportsLinux()) {
                if (self._LinuxExecutableName() == "" && self._compatibility() == "None") { failure("Linux is listed as a supported platform, but no executable for this platform was specified.", "Specify an executable for this platform under 'Startup and Shutdown'"); }
                else if (self._LinuxExecutableName().toLowerCase().endsWith(".sh")) { failure("You can only start executables files from AMP. Do not attempt to use shell scripts or other file types.", "Change your Linux Executable under Startup and Shutdown to be an actual executable rather than a script."); }
            }

            switch (self.App_AdminMethod()) {
                case "PinballWizard":
                case "AMP_GSIO":
                    break;
                case "STDIO":
                    if (!self.App_HasReadableConsole() && !self.App_HasWriteableConsole()) {
                        failure("Standard IO was selected as the management type, but the console was set as neither readable nor writable - so AMP won't be able to do anything useful.", "Either enable Reading or Writing for the console (if the application supports it) - or change the management mode to 'None'");
                    }
                    break;
                default:
                    if (!self.App_CommandLineArgs().contains("{{$RemoteAdminPassword}}")) {
                        warning("A server management mode is specified that requires AMP to know the password, but {{$RemoteAdminPassword}} is not found within the command line arguments.", "If the application can have it's RCON password specified via the command line then you should add the {{$RemoteAdminPassword}} template item to your command line arguments", "Without the ability to control the RCON password, AMP will not be able to use the servers RCON to provide a console or run commands.");
                    }
/*
                    if (!self.App_CommandLineArgs().contains(this.__QueryPortName())) {
                        warning("A server management mode that uses the network was specified, but the port being used is not found within the command line arguments.", "If the application can have it's RCON port specified via the command line then you should add the {{$" + this.__QueryPortName() + "}} template item to your command line arguments");
                    }

                    if (self._PortMappings().filter(p => p.PortType() == "2").length == 0) {
                        warning("A server management mode that uses the network was specified, but no RCON port has been added.", "Add the port used by this applications RCON under Networking.");
                    }
*/                    break;
            }

            //Checked against the expression that gets written, not the sample line - it can also be typed
            //in directly or come from an imported template.
            if (self.App_ApplicationReadyMode() == "RegexMatch" && self.Console_AppReadyRegex() == "") {
                warning("The startup confirmation mode waits for a message, but no server ready expression was given.", "Either add a 'Server ready expression' under 'Server Events', or change the Startup Confirmation Mode under 'Startup and Shutdown'.", "AMP will never see the application become ready and will treat starting it as a failure.");
            }

            if (self.App_AdminMethod() != "STDIO" && self.App_AdminMethod() != "PinballWizard" && !self.App_UseRandomAdminPassword()) {
                warning("A management mode that needs a password is in use, but AMP isn't generating one.", "Enable 'Generate the password automatically' under 'Management and Console' unless the user is expected to set the password themselves.", "The application starts with an empty admin password until someone fills one in.");
            }

            if (self._compatibility() != "None" && !self._SupportsLinux()) { failure("A Linux compatibility layer was chosen, but Linux support is not checked.", "Please check both."); }

            if (self._compatibility() != "None" && self._WinExecutableName() == "") { failure("A Linux compatibility layer was chosen, but no Windows executable was specified to run under it.", "Specify the Windows executable under 'Startup and Shutdown'."); }

            //Nothing here is fatal - AMP has an image of its own for this - but every instance of the
            //application ends up with the generic one, which is rarely what the author wanted.
            if (self.Meta_DisplayImageSource() == "internal:UnknownApp") {
                if (self._SteamAppID() != '0') {
                    warning("No image was given for the application.", "Fill in the 'Client App ID' on the SteamCMD stage under 'Update Sources' - that's the App ID of the game on the Steam store, not the one of the dedicated server.", "AMP shows the generic unknown-application image for every instance.");
                }
                else {
                    warning("No image was given for the application.", "Enter a 'Display Image Source' URL under 'Configuration and Settings'.", "AMP shows the generic unknown-application image for every instance.");
                }
            }

            //A custom port is identified by the Ref built from its name, so an unnamed or repeated one
            //leaves AMP with nothing to key the port on.
            var seenRefs = [];
            //Every block of port numbers a port takes up, so two of them can be checked for landing on top
            //of each other. AMP would move one of them out of the way when it assigns ports to an instance,
            //which quietly breaks an application that expects them a fixed distance apart.
            var portBlocks = [];
            var checkRange = (port, label, firstPort) => {
                var range = manifestInteger(port.Range());
                if (range === null || range < 1) {
                    failure(`The range for '${label}' is ${port.Range() == "" ? "missing" : `'${port.Range()}'`}.`, "Enter how many ports in a row it takes up - 1 for a single port.");
                }
                else if (firstPort !== null && firstPort + range - 1 > 65535) {
                    failure(`'${label}' takes up ports ${firstPort} to ${firstPort + range - 1}.`, "Lower the port number or shorten the range so the whole block ends at 65535 or below.");
                }

                var minListening = manifestInteger(port.MinListening());
                if (minListening === null || minListening < 0) {
                    failure(`The number of ports that have to be listening for '${label}' is ${port.MinListening() == "" ? "missing" : `'${port.MinListening()}'`}.`, "Enter how many of them have to be listening, or 0 for all of them.");
                }
                else if (range !== null && range >= 1 && minListening > range) {
                    warning(`'${label}' only takes up ${range} port${range == 1 ? "" : "s"}, but ${minListening} of them ${minListening == 1 ? "is" : "are"} expected to be listening.`, "Lower it to the size of the range, or to 0 for all of them.", "AMP treats it as all of them.");
                }

                if (firstPort !== null && range !== null && range >= 1) {
                    portBlocks.push({ label: label, first: firstPort, last: firstPort + range - 1, protocol: port.Protocol() });
                }
            };

            for (const port of self._PortMappings()) {
                if (port._PortType() == "Custom Port" && port.Ref() == "") {
                    failure(`A custom port on ${port.Port()} has no name.`, "Name the port under 'Networking' - the name is what AMP and the command line refer to it by.");
                }
                else if (seenRefs.contains(port.Ref())) {
                    failure(`More than one port is called '${port.Name()}'.`, "Give each port its own name under 'Networking'.", "AMP keys ports on that name, so only one of them survives.");
                }

                if (port.Ref() != "") { seenRefs.push(port.Ref()); }

                var portNumber = manifestInteger(port.Port());
                if (portNumber === null || portNumber < 1025 || portNumber > 65535) {
                    failure(`The port number for '${port.Name() || "an unnamed port"}' is ${port.Port() == "" ? "missing" : `'${port.Port()}'`}.`, "Enter a port number between 1025 and 65535.", "AMP refuses port numbers of 1024 and below.");
                }

                checkRange(port, port.Name() || port.Ref() || "an unnamed port", portNumber);

                //A child is keyed on its ref the same way, and AMP works its number out from the offset -
                //so the offset has to be a whole number and can't land the child outside the port range.
                for (const child of port._ChildPorts()) {
                    if (child.Ref() == "") {
                        failure(`A port derived from '${port.Name() || port.Ref()}' has no name.`, "Name it under 'Networking' - the name is what AMP and the command line refer to it by.");
                    }
                    else if (seenRefs.contains(child.Ref())) {
                        failure(`More than one port is called '${child.Ref()}'.`, "Give each port its own name under 'Networking'.", "AMP keys ports on that name, so only one of them survives.");
                    }

                    if (child.Ref() != "") { seenRefs.push(child.Ref()); }

                    var offset = manifestInteger(child.Offset());
                    if (offset === null) {
                        failure(`The offset for '${child.Ref() || "an unnamed port"}' is ${child.Offset() == "" ? "missing" : `'${child.Offset()}'`}.`, "Enter how far above the port it is derived from this one sits - 1 for the next port up.");
                    }
                    else if (portNumber !== null && (portNumber + offset < 1025 || portNumber + offset > 65535)) {
                        failure(`'${child.Ref() || "An unnamed port"}' works out as port ${portNumber + offset}.`, "Change the offset so the port lands between 1025 and 65535.", "AMP refuses port numbers of 1024 and below.");
                    }

                    checkRange(child, child.Ref() || "an unnamed port", portNumber === null || offset === null ? null : portNumber + offset);
                }
            }

            //Two ports on the same number only clash when they can be on the same protocol - a TCP port and
            //a UDP port on 27015 are two different sockets, and applications do use both.
            for (var i = 0; i < portBlocks.length; i++) {
                for (var j = i + 1; j < portBlocks.length; j++) {
                    var left = portBlocks[i];
                    var right = portBlocks[j];
                    if (left.first > right.last || right.first > left.last) { continue; }
                    if (left.protocol != right.protocol && left.protocol != "Both" && right.protocol != "Both") { continue; }

                    var overlap = `${Math.max(left.first, right.first)}`;
                    if (Math.min(left.last, right.last) > Math.max(left.first, right.first)) { overlap += ` to ${Math.min(left.last, right.last)}`; }
                    warning(`'${left.label}' and '${right.label}' both take up port ${overlap}.`, "Move one of them, or shorten the range that reaches into the other.", "AMP moves one of them somewhere else when it assigns ports to an instance, so they don't end up where the application expects.");
                }
            }

            //AMP looks each of these up by exact Ref and uses port 0 when nothing matches, without saying so
            //anywhere - so a role pointing at a port that isn't in the list only shows up as the feature not
            //working on a real instance.
            var portRefs = self.__AllPortRefs();
            var checkPortRef = (ref, label, fix, impact) => {
                if (ref == "") { warning(`No port is set as the ${label}.`, fix, impact); return false; }
                if (!portRefs.contains(ref)) { failure(`The ${label} is set to '${ref}', which isn't one of the ports.`, fix, impact); return false; }
                return true;
            };

            checkPortRef(self.App_PrimaryApplicationPortRef(), "main application port", "Choose the port players connect to under 'Networking'.", "AMP has no address for the instance, so the connect button and the endpoint on the instance list stay blank.");

            switch (self.App_AdminMethod()) {
                case "None": case "STDIO": case "PinballWizard": case "AMP_GSIO": case "FIFO": case "TailLogFile":
                    break;
                default:
                    checkPortRef(self.App_AdminPortRef(), "RCON port", "Add the port the application listens for RCON on under 'Networking', then choose it as the RCON port.", "AMP tries to reach RCON on port 0, so the console and anything that runs commands never work.");
                    break;
            }

            if (self.App_SupportsUniversalSleep() == "True") {
                var sleepUDPRef = self.App_UniversalSleepApplicationUDPPortRef();
                var sleepQueryRef = self.App_UniversalSleepSteamQueryPortRef();
                var sleepUDPOK = sleepUDPRef != "" && portRefs.contains(sleepUDPRef);
                var sleepQueryOK = sleepQueryRef != "" && portRefs.contains(sleepQueryRef);

                if (sleepUDPRef != "" && !sleepUDPOK) { failure(`The sleep mode UDP port is set to '${sleepUDPRef}', which isn't one of the ports.`, "Choose one of the applications ports under 'Universal Sleep', or clear it.", "AMP listens on port 0, so packets to the application never wake it."); }
                if (sleepQueryRef != "" && !sleepQueryOK) { failure(`The sleep mode Steam query port is set to '${sleepQueryRef}', which isn't one of the ports.`, "Choose one of the applications ports under 'Universal Sleep', or clear it.", "AMP answers queries on port 0, so the server never appears in the server list while asleep."); }

                if (!sleepUDPOK && !sleepQueryOK) {
                    failure("Sleep mode is enabled, but neither of its ports is set to a port that exists.", "Set the UDP port, the Steam query port, or both under 'Universal Sleep'.", "AMP has nothing to listen on, so a sleeping instance can never be woken by a player.");
                }
                else {
                    //Everything except OnUDPPacket needs the Steam query port to be listening - that's the
                    //socket the query and query-packet wakeups come in on.
                    if (self.App_WakeupMode() != "OnUDPPacket" && self.App_WakeupMode() != "ManualWake" && !sleepQueryOK) {
                        warning("The wake-up mode listens for Steam queries, but no Steam query port is set for sleep mode.", "Either set the Steam query port under 'Universal Sleep', or change the wake-up mode to 'Any UDP packet'.", "Only packets to the UDP port wake the instance.");
                    }
                    if (self.App_WakeupMode() == "OnUDPPacket" && !sleepUDPOK) {
                        warning("The wake-up mode listens for UDP packets, but no UDP port is set for sleep mode.", "Either set the UDP port under 'Universal Sleep', or change the wake-up mode.", "Nothing wakes the instance automatically.");
                    }
                }
            }

            //Stages fail at update time rather than at import, so the fields each step actually reads are
            //checked here instead of leaving the user to find out from the instance log.
            var validateStages = (stages, listName) => {
                for (const stage of stages) {
                    var spec = stage.__Spec();
                    var stageName = stage.UpdateStageName() || spec.name;
                    var where = `${listName} stage '${stageName}'`;

                    if (stage.__IsUnknown()) {
                        info(`${where} uses the '${stage._Unknown().UpdateSource}' step type, which this generator doesn't know about.`, "Nothing to do - it is written back out exactly as it was imported.", "The generator can't check or edit it.");
                        continue;
                    }

                    if (stage.UpdateStageName() == "") {
                        warning(`A ${listName} stage using ${spec.name} has no name.`, "Give the stage a name under 'Update Sources'.", "AMP shows the stage name while it runs, so an unnamed stage is hard to follow.");
                    }

                    for (const field of updateStepRequiredFields[spec.name] || []) {
                        if (stage[field]() == "") {
                            failure(`${where} is missing its '${spec.fields[field].label}'.`, `Fill in '${spec.fields[field].label}' for the stage, or remove it.`, `${spec.name} cannot run without it and the update fails at that stage.`);
                        }
                    }

                    if (spec.name == "Pause" && stage.UpdateSourceArgs() != "" && manifestInteger(stage.UpdateSourceArgs()) === null) {
                        failure(`${where} waits for '${stage.UpdateSourceArgs()}', which isn't a number of seconds.`, "Enter the number of seconds to wait.", "AMP can't read the value, so the stage doesn't wait at all.");
                    }

                    if (spec.name == "SteamCMD" && stage.UpdateSourceData() != "" && manifestInteger(stage.UpdateSourceData()) === null) {
                        failure(`${where} has a Steam App ID of '${stage.UpdateSourceData()}', which isn't a number.`, "Enter the numeric App ID, which you can find via SteamDB.", "The stage fails immediately.");
                    }

                    //A step AMP only implements on one platform silently succeeds as a failure on the other.
                    if (spec.platform && stage.UpdateSourcePlatform() != spec.platform) {
                        failure(`${where} uses ${spec.name}, which AMP only supports on ${spec.platform}, but the stage is set to run on ${stage.UpdateSourcePlatform()}.`, `Set the stage platform to ${spec.platform}.`, `The stage fails on every other platform, which stops the update unless 'Continue on failure' is enabled.`);
                    }

                    if (spec.platform == "Linux" && !self._SupportsLinux()) {
                        warning(`${where} uses ${spec.name}, which is Linux only, but Linux isn't a supported platform.`, "Either add Linux support under 'Basic Information' or remove the stage.");
                    }

                    if (spec.platform == "Windows" && !self._SupportsWindows()) {
                        warning(`${where} uses ${spec.name}, which is Windows only, but Windows isn't a supported platform.`, "Either add Windows support under 'Basic Information' or remove the stage.");
                    }

                    if ((stage.UpdateSourceConditionValue() || "") != "" && (stage.UpdateSourceConditionSetting() || "") == "") {
                        warning(`${where} has a condition value but no condition setting.`, "Name the setting the condition is checked against, or clear the value.", "The condition is ignored and the stage always runs.");
                    }
                }
            };

            validateStages(self._UpdateStages(), "update");
            validateStages(self._PreStartStages(), "pre-start");

            if (self._UpdateStages().length == 0) {
                warning("No update stages have been added.", "Add at least one under 'Update Sources'.", "AMP has no way to install the application.");
            }

            //The settings manifest is read in one go - a single value AMP can't parse takes every setting
            //in the file down with it, so the numeric fields are checked before anything gets written.
            for (const setting of self._AppSettings()) {
                var settingName = setting.DisplayName() || setting.FieldName() || "(unnamed setting)";

                if (setting.FieldName() == "") {
                    failure(`The setting '${settingName}' has no field name.`, "Give every setting a field name under 'Configuration and Settings' - it's the key AMP stores the value against.");
                }

                if (setting.__UsesRange()) {
                    var minValue = manifestNumber(setting.MinValue());
                    var maxValue = manifestNumber(setting.MaxValue());

                    if (String(setting.MinValue()).trim() != "" && minValue === null) { failure(`The minimum value for '${settingName}' isn't a number.`, "Enter a number for the minimum value, or leave it blank.", "AMP can't read the settings manifest at all, so every setting for this application disappears."); }
                    if (String(setting.MaxValue()).trim() != "" && maxValue === null) { failure(`The maximum value for '${settingName}' isn't a number.`, "Enter a number for the maximum value, or leave it blank.", "AMP can't read the settings manifest at all, so every setting for this application disappears."); }
                    if (String(setting.MultipleOf()).trim() != "" && manifestNumber(setting.MultipleOf()) === null) { failure(`The 'multiple of' value for '${settingName}' isn't a number.`, "Enter a number for 'multiple of', or leave it blank.", "AMP can't read the settings manifest at all, so every setting for this application disappears."); }
                    if (String(setting.Multiplier()).trim() != "" && manifestNumber(setting.Multiplier()) === null) { failure(`The multiplier for '${settingName}' isn't a number.`, "Enter a number for the multiplier, or leave it blank.", "AMP can't read the settings manifest at all, so every setting for this application disappears."); }

                    if (minValue !== null && maxValue !== null && minValue > maxValue) {
                        failure(`The minimum value for '${settingName}' is higher than its maximum.`, "Swap the two values so the minimum is the lower of the pair.", "AMP rejects every value the user enters, since no number can satisfy both limits.");
                    }

                    if (setting.InputType() == "range" && (minValue === null || maxValue === null)) {
                        warning(`'${settingName}' is a slider, but it doesn't have both a minimum and a maximum value.`, "Give the setting both a minimum and a maximum value.", "The slider has nothing to scale against and the user can't pick a sensible value with it.");
                    }
                }

                if (String(setting.MaxLength()).trim() != "" && manifestInteger(setting.MaxLength()) === null) {
                    failure(`The maximum length for '${settingName}' isn't a number.`, "Enter a whole number for the maximum length, or leave it blank.", "AMP can't read the settings manifest at all, so every setting for this application disappears.");
                }

                if (setting.__UsesEnumValues() && setting._EnumMappings().length == 0 && !setting.UseToolDiscovery() && !setting.UseRemoteOptionSource()) {
                    warning(`'${settingName}' presents a list of options, but no options were added.`, "Add the options under 'Configuration and Settings', or fill the list in from tool discovery or a remote option source.", "AMP treats the setting as free text instead of a list.");
                }

                if (setting.UseToolDiscovery() && setting._ToolDiscovery.ExecutableName() == "") {
                    failure(`'${settingName}' uses tool discovery, but no executable name was given.`, "Specify the executable to look for, such as 'java' or 'dotnet'.");
                }

                if (setting.UseRemoteOptionSource() && setting._RemoteOptionSource.Url() == "") {
                    failure(`'${settingName}' fills its options from a remote source, but no URL was given.`, "Specify the URL the options are fetched from.");
                }

                if (setting.UseRemoteOptionSource() && setting._RemoteOptionSource.ResponseFormat() == "regex" && setting._RemoteOptionSource.RegexPattern() == "") {
                    failure(`'${settingName}' reads its remote options with an expression, but no expression was given.`, "Specify the pattern applied to the response, with named groups for the value and label.");
                }

                if (setting.Required() && setting.Hidden()) {
                    warning(`'${settingName}' is required but is also marked read-only.`, "Turn off one of the two.", "AMP refuses to start the application until the setting has a value, and the user can't give it one.");
                }
            }

            //Validation Summary

            var failures = self.__ValidationResults().filter(r => r.grade == "Failure").length;
            var warnings = self.__ValidationResults().filter(r => r.grade == "Warning").length;

            if (failures > 0) {
                self.__ValidationResult(1);
            }
            else if (warnings > 0) {
                self.__ValidationResult(2);
            }
            else {
                self.__ValidationResult(3);
            }
        };
    }
}
class validationResult {
    constructor(grade, issue, recommendation, impact) {
        this.grade = grade;
        this.issue = issue;
        this.recommendation = recommendation;
        this.impact = impact || "";
        this.gradeClass = "";
        switch (grade) {
            case "Failure": this.gradeClass = "table-danger"; break;
            case "Warning": this.gradeClass = "table-warning"; break;
            case "Info": this.gradeClass = "table-info"; break;
        }
    }
}

//Range and MinListening are written the same way for a port and for one derived from it. Both are left
//out at their defaults - AMP reads a missing Range as a single port, and a missing MinListening as "every
//port in the range has to be listening". A value that isn't a number goes out as typed so the validation
//failure is visible in the file rather than being quietly dropped.
function portRangeToManifestEntry(port, entry) {
    var range = manifestInteger(port.Range());
    if (range === null) { if (port.Range() != "") { entry.Range = port.Range(); } }
    else if (range != 1) { entry.Range = range; }

    var minListening = manifestInteger(port.MinListening());
    if (minListening === null) { if (port.MinListening() != "") { entry.MinListening = port.MinListening(); } }
    else if (minListening != 0) { entry.MinListening = minListening; }
}

class portMappingViewModel {
    constructor(port = "", portName = "", portDescription = "", portType = "Custom Port", protocol = "0", vm = null) {
        var self = this;
        this.__vm = vm;
        this._Protocol = ko.observable(protocol);
        this.Protocol = ko.computed(() => self._Protocol() == "0" ? `Both` : (self._Protocol() == "1" ? `TCP` : `UDP`));
        this.Port = ko.observable(port);
        this._PortType = ko.observable(portType);
        this._Name = ko.observable(portName);
        this.Name = ko.computed(() => self._PortType() == "Custom Port" ? self._Name() : (self._PortType() == "Steam Query Port" ? `Steam Query Port` : (self._PortType() == "RCON Port" ? `Remote Admin Port` : `Main Game Port`)));
        this._Description = ko.observable(portDescription);
        this.Description = ko.computed(() => self._PortType() == "Custom Port" ? self._Description() : (self._PortType() == "Steam Query Port" ? `Port used for Steam queries and server list` : (self._PortType() == "RCON Port" ? `Port used for RCON administration` : `Port used for main game traffic`)));
        //What AMP keys the port on, and what {{$Ref}} in the command line and config files resolves
        //against. An imported port keeps the ref it came with - deriving it from the name again would
        //quietly rename it and break every reference to it. A port added here has no ref of its own, so
        //it follows the name.
        this._Ref = ko.observable("");
        this.__DerivedRef = ko.computed(() => self._PortType() == "Custom Port" ? self._Name().replace(/\s+/g, "").replace(/[^a-z\d-_]/ig, "") : (self._PortType() == "Steam Query Port" ? `SteamQueryPort` : (self._PortType() == "RCON Port" ? `RemoteAdminPort` : `MainGamePort`)));
        this.Ref = ko.computed(() => self._Ref() != "" ? self._Ref() : self.__DerivedRef());
        //How many ports this one reserves, starting at the number above. AMP hands out the whole block to
        //the instance and keeps every other instance out of it.
        this.Range = ko.observable("1");
        //How many of them have to be listening before AMP calls the port working. Zero means all of them.
        this.MinListening = ko.observable("0");
        //A port the application only opens later on - AMP says so on the status page rather than showing it
        //as a port that should be listening and isn't.
        this.IsDelayedOpen = ko.observable(false);
        this.Required = ko.observable(false);
        //Anything on the port AMP knows about that the generator has no editor for - hidden ports and
        //anything added since.
        this._Passthrough = {};
        this.__UsesRange = ko.computed(() => {
            var range = manifestInteger(self.Range());
            return range === null || range > 1;
        });
        //Whatever is still free, plus whatever this port is already set to. Pure, so it isn't evaluated
        //until the row is rendered - __vm is attached after the object is built when a saved
        //configuration is mapped onto it. globalThis, because the constructor parameter shadows it.
        this.__PortTypeOptions = ko.pureComputed(() => {
            var owner = self.__vm || globalThis.vm;
            if (!owner) { return portTypes; }
            var takenElsewhere = owner._PortMappings().filter(port => port !== self).map(port => port._PortType());
            return portTypes.filter(portType => portType == "Custom Port" || portType == self._PortType() || !takenElsewhere.contains(portType));
        });
        this.__RemovePort = () => self.__vm.__RemovePort(self);

        //Ports AMP places relative to this one - their number is always this port plus their offset, and
        //AMP keeps the whole group together when it assigns ports to an instance.
        this._ChildPorts = ko.observableArray(); //of childPortViewModel

        //Offset one past whatever the last child sits at, so adding several in a row doesn't stack them
        //all on the same port.
        this.__AddChildPort = function () {
            var offsets = self._ChildPorts().map(child => manifestInteger(child.Offset())).filter(offset => offset !== null);
            self._ChildPorts.push(new childPortViewModel(String(offsets.length > 0 ? Math.max.apply(null, offsets) + 1 : 1), "", "", self._Protocol(), self));
        };

        this.__RemoveChildPort = function (toRemove) {
            self._ChildPorts.remove(toRemove);
        };

        //quickmap only maps one level deep, so the child ports are rebuilt here - see
        //appSettingViewModel.__ApplyImportedData for the same pattern.
        this.__ApplyImportedData = function (portData) {
            var withoutNested = Object.assign({}, portData);
            var childPorts = withoutNested._ChildPorts || [];
            delete withoutNested._ChildPorts;

            ko.quickmap.map(self, withoutNested);

            if (self._Passthrough == null || typeof self._Passthrough !== "object") { self._Passthrough = {}; }

            self._ChildPorts.removeAll();
            self._ChildPorts.push.apply(self._ChildPorts, ko.quickmap.to(childPortViewModel, childPorts, false, { __parent: self }));
        };

        //Field order follows PortRequirement, and the port number goes out as a number because that's
        //what AMP reads it into.
        this.__ToManifestEntry = function () {
            var portNumber = manifestInteger(self.Port());
            var entry = {
                Protocol: self.Protocol(),
                Port: portNumber === null ? self.Port() : portNumber,
            };

            //Left out at their defaults, the way AMP reads them when a template doesn't mention them - a
            //single port that always has to be listening, and no delayed opening.
            portRangeToManifestEntry(self, entry);

            entry.Ref = self.Ref();
            entry.Name = self.Name();
            entry.Description = self.Description();

            if (self.IsDelayedOpen()) { entry.IsDelayedOpen = true; }
            if (self._ChildPorts().length > 0) { entry.ChildPorts = self._ChildPorts().map(child => child.__ToManifestEntry()); }
            if (self.Required()) { entry.Required = true; }

            for (const key of Object.keys(self._Passthrough)) {
                if (!(key in entry)) { entry[key] = self._Passthrough[key]; }
            }

            return entry;
        };
    }
}

//A port AMP derives from another one. It has no number of its own - AMP computes it as the parent's port
//plus the offset every time it's read, so nothing here is ever written into the Port field.
class childPortViewModel {
    constructor(offset = "1", portName = "", portDescription = "", protocol = "0", parent = null) {
        var self = this;
        this.__parent = parent;
        this._Protocol = ko.observable(protocol);
        this.Protocol = ko.computed(() => self._Protocol() == "0" ? `Both` : (self._Protocol() == "1" ? `TCP` : `UDP`));
        this.Offset = ko.observable(offset);
        this._Name = ko.observable(portName);
        this._Description = ko.observable(portDescription);
        //Same as the parent - an imported child keeps the ref it came with, a new one follows its name.
        this._Ref = ko.observable("");
        this.__DerivedRef = ko.computed(() => self._Name().replace(/\s+/g, "").replace(/[^a-z\d-_]/ig, ""));
        this.Ref = ko.computed(() => self._Ref() != "" ? self._Ref() : self.__DerivedRef());
        //A derived port reserves a block of its own too - AMP sizes the group it hands the instance from
        //the furthest a child reaches, so a range here widens the whole thing.
        this.Range = ko.observable("1");
        this.MinListening = ko.observable("0");
        this.IsDelayedOpen = ko.observable(false);
        this.Required = ko.observable(false);
        this._Passthrough = {};
        this.__UsesRange = ko.computed(() => {
            var range = manifestInteger(self.Range());
            return range === null || range > 1;
        });

        //Shown next to the offset so it's clear what the child actually lands on. Pure, so it isn't
        //evaluated before __parent is attached when a saved configuration is mapped onto it.
        this.__EffectivePort = ko.pureComputed(() => {
            var parentPort = manifestInteger(self.__parent ? self.__parent.Port() : "");
            var offset = manifestInteger(self.Offset());
            return parentPort === null || offset === null ? "" : String(parentPort + offset);
        });

        this.__ParentRef = ko.pureComputed(() => self.__parent ? self.__parent.Ref() : "");

        this.__RemoveChildPort = () => self.__parent.__RemoveChildPort(self);

        //No Port - AMP refuses to serialize a child's port for exactly this reason, a stored copy goes
        //stale the moment the parent moves.
        this.__ToManifestEntry = function () {
            var offset = manifestInteger(self.Offset());
            var entry = {
                Protocol: self.Protocol(),
                Offset: offset === null ? self.Offset() : offset,
            };

            portRangeToManifestEntry(self, entry);

            entry.Ref = self.Ref();
            entry.Name = self._Name();
            entry.Description = self._Description();

            if (self.IsDelayedOpen()) { entry.IsDelayedOpen = true; }
            if (self.Required()) { entry.Required = true; }

            for (const key of Object.keys(self._Passthrough)) {
                if (!(key in entry)) { entry[key] = self._Passthrough[key]; }
            }

            return entry;
        };
    }
}

class configFileMappingViewModel {
    constructor(configFile = "", autoMap = true, configType = "0", vm = null) {
        var self = this;
        this.__vm = vm;
        this.ConfigFile = ko.observable(configFile);
        this._ConfigType = ko.observable(configType);
        this.ConfigType = ko.computed(() => self._ConfigType() == "0" ? `json` : (self._ConfigType() == "1" ? `ini` : (self._ConfigType() == "2" ? `xml` : (self._ConfigType() == "3" ? `kvp` : `auto`))));
        this._AutoMap = ko.observable(autoMap);
        this.AutoMap = ko.computed(() => self._ConfigType() == "4" ? false : self._AutoMap());
        //Lets the user import their existing file over the settings.
        this.Importable = ko.observable(false);
        //Everything else on MetaConfigFile - the key/value format and its expression, the section header
        //format, the encoding, subsections. Dropping these makes AMP fall back to its own defaults and
        //rewrite the file in a different shape to the one the application wrote.
        this._Passthrough = {};
        this.__RemoveConfigFile = () => self.__vm.__RemoveConfigFile(self);

        this.__ToManifestEntry = function () {
            var entry = {
                ConfigFile: self.ConfigFile(),
                ConfigType: self.ConfigType(),
                AutoMap: self.AutoMap(),
            };

            if (self.Importable()) { entry.Importable = true; }

            for (const key of Object.keys(self._Passthrough)) {
                if (!(key in entry)) { entry[key] = self._Passthrough[key]; }
            }

            return entry;
        };
    }
}

class appSettingViewModel {
    constructor(vm) {
        var self = this;
        this.__vm = vm;
        this.DisplayName = ko.observable("");
        //Categories and subcategories are "Name:icon" in the templates (subcategories usually carry a
        //":order" too), so an empty category falls back to the applications own name.
        this._Category = ko.observable("");
        this.Category = ko.computed(() => {
            if (self._Category() != "") { return self._Category(); }
            //__vm is attached after the data is mapped when a saved configuration is loaded, so fall back
            //to the generator view model itself rather than caching a category without the app name in it.
            //globalThis, because the constructors 'vm' parameter shadows the global one.
            var owner = self.__vm || globalThis.vm;
            return ((owner ? owner.Meta_DisplayName() : "") || "Server Settings") + ":stadia_controller";
        });
        this.Subcategory = ko.observable("Server:dns:1");
        this.Description = ko.observable("");
        this._Keywords = ko.observable("");
        this.Keywords = ko.computed(() => self._Keywords() != "" ? self._Keywords() : self.DisplayName().toLowerCase().replaceAll(" ", ","));
        this.FieldName = ko.observable("");
        this.InputType = ko.observable("text")
        this.MinValue = ko.observable("");
        this.MaxValue = ko.observable("");
        //AMP rounds the value to the nearest multiple of MultipleOf when it writes it into a config file,
        //and scales it by Multiplier when it reads it back out (for a setting shown in minutes that the
        //application wants in seconds, and so on).
        this.MultipleOf = ko.observable("");
        this.Multiplier = ko.observable("");
        this.MaxLength = ko.observable("");
        this.IsFlagArgument = ko.observable(false);
        //The value used for the flag when IsFlagArgument is set. AMP falls back to DefaultValue when it's
        //left empty.
        this.FlagValue = ko.observable("");
        //Where the value lands outside AMP - the key in the command line, "<Section>.<Key>" in an ini
        //file, the XPath in an XML one, the {{token}} in a template. It's often not spelled the same way
        //as the field AMP stores the value against, so it's only named after the field when left blank -
        //which is what AMP does with it too.
        this._ParamFieldName = ko.observable("");
        this.ParamFieldName = ko.computed(() => self._ParamFieldName() != "" ? self._ParamFieldName() : self.FieldName());
        this.IncludeInCommandLine = ko.observable(false);
        this.DefaultValue = ko.observable("");
        this.Placeholder = ko.observable("");
        this.Suffix = ko.observable("");
        this.Hidden = ko.observable(false);
        //AMP's settings search skips anything read-only or taken off the page, so a setting in either
        //state can never be found by its keywords - see SettingsSearchProvider, which reads Hidden as
        //ReadOnly for a template setting. Keywords on one are dead weight in the manifest.
        this.__Searchable = ko.computed(() => !self.Hidden() && normalizeInputType(self.InputType()) != "HIDDEN");
        //Blocks the application from starting while the setting is empty, naming it in the message.
        this.Required = ko.observable(false);
        this.SkipIfEmpty = ko.observable(false);
        //Leaves the setting alone when AMP imports an existing configuration file for the application.
        this.ExcludeFromImport = ko.observable(false);
        //Sort order within the subcategory. AMP defaults it to 10, so that value isn't written out.
        this.Order = ko.observable("10");
        //Drives the value from something other than the stored setting - "listfile:<path>",
        //"fileexists:<whenpresent>:<whenmissing>:<path>", "array:number" or "array:text".
        this.Special = ko.observable("");
        this._CheckedValue = ko.observable("true");
        this._UncheckedValue = ko.observable("false");
        this.__RemoveSetting = () => self.__vm.__RemoveSetting(self);
        this.__EditSetting = () => self.__vm.__EditSetting(self);

        //Anything in the manifest the generator has no editor for is held here and written back out
        //untouched, so importing a template and downloading it again doesn't quietly strip it.
        this._Passthrough = {};

        //Min/max are enforced by AMP for both of the numeric inputs, and only for those.
        this.__UsesRange = ko.computed(() => self.InputType() == "number" || self.InputType() == "range");
        this.__UsesEnumValues = ko.computed(() => self.InputType() == "enum" || self.InputType() == "Radio");
        this.__UsesMaxLength = ko.computed(() => !["checkbox", "enum", "Radio", "list", "RandomPassword"].contains(self.InputType()));
        this.__UsesText = ko.computed(() => !["checkbox", "enum", "Radio", "list"].contains(self.InputType()));
        //A random password has no field for the user to type into, so it has nothing to prompt with.
        this.__UsesPlaceholder = ko.computed(() => self.__UsesText() && self.InputType() != "RandomPassword");
        //AMP only renders the suffix next to the text and numeric inputs.
        this.__UsesSuffix = ko.computed(() => self.__UsesText() && !["Password", "UserPassword", "RandomPassword"].contains(self.InputType()));

        this._EnumMappings = ko.observableArray(); //of enumMappingViewModel
        this.__NewEnumKey = ko.observable("");
        this.__NewEnumValue = ko.observable("");

        this.__RemoveEnum = function (toRemove) {
            self._EnumMappings.remove(toRemove);
        };

        this.__AddEnum = function () {
            self._EnumMappings.push(new enumMappingViewModel(self.__NewEnumKey(), self.__NewEnumValue(), self));
        };

        //Buttons AMP shows alongside the setting, each one calling a method on a module.
        this._Actions = ko.observableArray(); //of settingActionViewModel
        this.__NewActionModule = ko.observable("");
        this.__NewActionMethod = ko.observable("");
        this.__NewActionCaption = ko.observable("");

        this.__RemoveAction = function (toRemove) {
            self._Actions.remove(toRemove);
        };

        this.__AddAction = function () {
            self._Actions.push(new settingActionViewModel(self.__NewActionModule(), self.__NewActionMethod(), self.__NewActionCaption(), "", false, self));
            self.__NewActionModule("");
            self.__NewActionMethod("");
            self.__NewActionCaption("");
        };

        //Both of these fill the settings drop-down in for the user rather than the author listing the
        //options by hand - one from executables found on the machine, the other from a web API.
        this.UseToolDiscovery = ko.observable(false);
        this._ToolDiscovery = new toolDiscoveryViewModel();
        this.UseRemoteOptionSource = ko.observable(false);
        this._RemoteOptionSource = new remoteOptionSourceViewModel();

        this.__Deserialize = function (inputData) {
            self.__ApplyImportedData(JSON.parse(inputData));
        };

        //quickmap only maps one level deep and overwrites whatever it finds, so the nested parts are held
        //back and rebuilt by hand rather than being replaced with plain data that nothing is bound to.
        this.__ApplyImportedData = function (settingData) {
            var withoutNested = Object.assign({}, settingData);
            var enumMappings = withoutNested._EnumMappings || [];
            var actions = withoutNested._Actions || [];
            var toolDiscovery = withoutNested._ToolDiscovery;
            var remoteOptionSource = withoutNested._RemoteOptionSource;

            delete withoutNested._EnumMappings;
            delete withoutNested._Actions;
            delete withoutNested._ToolDiscovery;
            delete withoutNested._RemoteOptionSource;

            //Category and Keywords were plain values before they gained a generated fallback, so an
            //older configuration keeps its text by moving it into the backing observable.
            if (typeof withoutNested.Category !== "undefined" && typeof withoutNested._Category === "undefined") { withoutNested._Category = withoutNested.Category; }
            if (typeof withoutNested.Keywords !== "undefined" && typeof withoutNested._Keywords === "undefined") { withoutNested._Keywords = withoutNested.Keywords; }
            if (typeof withoutNested.InputType !== "undefined") { withoutNested.InputType = normalizeInputType(withoutNested.InputType); }

            ko.quickmap.map(self, withoutNested);

            if (self._Passthrough == null || typeof self._Passthrough !== "object") { self._Passthrough = {}; }

            self._EnumMappings.removeAll();
            self._EnumMappings.push.apply(self._EnumMappings, ko.quickmap.to(enumMappingViewModel, enumMappings, false, { __vm: self }));

            self._Actions.removeAll();
            self._Actions.push.apply(self._Actions, ko.quickmap.to(settingActionViewModel, actions, false, { __vm: self }));

            self._ToolDiscovery = new toolDiscoveryViewModel();
            ko.quickmap.map(self._ToolDiscovery, toolDiscovery || {});

            self._RemoteOptionSource = new remoteOptionSourceViewModel();
            ko.quickmap.map(self._RemoteOptionSource, remoteOptionSource || {});
        };

        this.EnumValues = ko.computed(() => {
            if (self.InputType() == "checkbox") {
                //Checkboxes are keyed on the state ("False"/"True"), with the value being what gets written
                //out - the same way AMP fills these in itself and how the templates are written.
                var result = {};
                result["False"] = self._UncheckedValue();
                result["True"] = self._CheckedValue();
                return result;
            } else if (self.__UsesEnumValues()) {
                var result = {};
                for (const enumMapping of self._EnumMappings()) {
                    result[ko.unwrap(enumMapping._enumKey)] = ko.unwrap(enumMapping._enumValue);
                }
                return result;
            } else {
                return {};
            }
        });

        //Builds the entry as it appears in <name>config.json. Key order and which keys are present at all
        //follow what the existing templates do: the optional ones are only written when they actually say
        //something (AMP defaults them to false/empty anyway), and the numeric ones go out as JSON numbers
        //because AMP reads them into float?/int.
        this.__ToManifestEntry = function () {
            var entry = {
                DisplayName: self.DisplayName(),
                Category: self.Category(),
                Subcategory: self.Subcategory(),
                Description: self.Description(),
            };

            //Left out for a setting AMP's search never returns - see __Searchable.
            if (self.__Searchable()) { entry.Keywords = self.Keywords(); }

            entry.FieldName = self.FieldName();
            entry.InputType = self.InputType();

            if (self.__UsesRange()) {
                var minValue = manifestNumber(self.MinValue());
                var maxValue = manifestNumber(self.MaxValue());
                var multipleOf = manifestNumber(self.MultipleOf());
                var multiplier = manifestNumber(self.Multiplier());

                if (minValue !== null) { entry.MinValue = minValue; }
                if (maxValue !== null) { entry.MaxValue = maxValue; }
                if (multipleOf !== null) { entry.MultipleOf = multipleOf; }
                if (multiplier !== null) { entry.Multiplier = multiplier; }
            }

            if (self.__UsesMaxLength()) {
                var maxLength = manifestInteger(self.MaxLength());
                if (maxLength !== null && maxLength > 0) { entry.MaxLength = maxLength; }
            }

            if (self.IsFlagArgument()) { entry.IsFlagArgument = true; }
            if (self.IsFlagArgument() && self.FlagValue() != "") { entry.FlagValue = self.FlagValue(); }
            if (self.Hidden()) { entry.Hidden = true; }
            if (self.Required()) { entry.Required = true; }
            if (self.ExcludeFromImport()) { entry.ExcludeFromImport = true; }

            var order = manifestInteger(self.Order());
            if (order !== null && order != 10) { entry.Order = order; }

            entry.ParamFieldName = self.ParamFieldName();

            if (self.IncludeInCommandLine()) { entry.IncludeInCommandLine = true; }
            if (self.SkipIfEmpty()) { entry.SkipIfEmpty = true; }
            if (self.Special() != "") { entry.Special = self.Special(); }

            entry.DefaultValue = self.DefaultValue();

            if (self.Placeholder() != "") { entry.Placeholder = self.Placeholder(); }
            if (self.Suffix() != "") { entry.Suffix = self.Suffix(); }

            //Only the input types AMP builds a list for carry one - it fills a checkbox in itself if the
            //entry is missing, and an empty object on a text field is just noise.
            var enumValues = self.EnumValues();
            if (Object.keys(enumValues).length > 0) { entry.EnumValues = enumValues; }

            var actions = self._Actions().map(action => action.__ToManifestEntry()).filter(action => action != null);
            if (actions.length > 0) { entry.Actions = actions; }

            if (self.UseToolDiscovery()) { entry.ToolDiscovery = self._ToolDiscovery.__ToManifestEntry(); }
            if (self.UseRemoteOptionSource()) { entry.RemoteOptionSource = self._RemoteOptionSource.__ToManifestEntry(); }

            for (const key of Object.keys(self._Passthrough)) {
                if (!(key in entry)) { entry[key] = self._Passthrough[key]; }
            }

            return entry;
        };
    }
}

class settingActionViewModel {
    constructor(module = "", method = "", caption = "", argument = "", isClientSide = false, vm = null) {
        var self = this;
        this.__vm = vm;
        this.Module = ko.observable(module);
        this.Method = ko.observable(method);
        this.Caption = ko.observable(caption);
        this.Argument = ko.observable(argument);
        this.IsClientSide = ko.observable(isClientSide);
        this.__RemoveAction = () => self.__vm.__RemoveAction(self);

        this.__ToManifestEntry = function () {
            //A button with nothing to call or nothing to say on it would only render as a dead control.
            if (self.Method() == "" || self.Caption() == "") { return null; }

            var entry = {
                Module: self.Module(),
                Method: self.Method(),
                Caption: self.Caption()
            };

            if (self.Argument() != "") { entry.Argument = self.Argument(); }
            if (self.IsClientSide()) { entry.IsClientSide = true; }

            return entry;
        };
    }
}

//Fills a settings drop-down in from executables found on the machine - the versioned install directories
//of a runtime like Java or .NET, plus whatever is on PATH.
class toolDiscoveryViewModel {
    constructor() {
        var self = this;
        this.ExecutableName = ko.observable("");
        this.WindowsExecutableName = ko.observable("");
        this.LinuxExecutableName = ko.observable("");
        //One path per line - AMP expands environment variables in them.
        this._SearchPaths = ko.observable("");
        this._WindowsSearchPaths = ko.observable("");
        this._LinuxSearchPaths = ko.observable("");
        this.BinSubdirectory = ko.observable("bin");
        this.VersionRegex = ko.observable("");
        this.DisplayFormat = ko.observable("");
        this.FallbackToPathEnv = ko.observable(true);
        this.DefaultEntryDisplayName = ko.observable("System Default");
        this.NotFoundValue = ko.observable("");
        this.CustomPathSetting = ko.observable("");
        this.CustomPathDisplayName = ko.observable("Custom Installation");

        //Only the parts that differ from AMPs own defaults are written, so a plain discovery spec stays
        //as short as the ones in the existing templates.
        this.__ToManifestEntry = function () {
            var entry = {};

            if (self.ExecutableName() != "") { entry.ExecutableName = self.ExecutableName(); }
            if (self.WindowsExecutableName() != "") { entry.WindowsExecutableName = self.WindowsExecutableName(); }
            if (self.LinuxExecutableName() != "") { entry.LinuxExecutableName = self.LinuxExecutableName(); }

            var searchPaths = manifestLines(self._SearchPaths());
            var windowsSearchPaths = manifestLines(self._WindowsSearchPaths());
            var linuxSearchPaths = manifestLines(self._LinuxSearchPaths());

            if (searchPaths.length > 0) { entry.SearchPaths = searchPaths; }
            if (windowsSearchPaths.length > 0) { entry.WindowsSearchPaths = windowsSearchPaths; }
            if (linuxSearchPaths.length > 0) { entry.LinuxSearchPaths = linuxSearchPaths; }

            //An empty subdirectory is meaningful - it puts the executable at the root of the install.
            if (self.BinSubdirectory() != "bin") { entry.BinSubdirectory = self.BinSubdirectory(); }
            if (self.VersionRegex() != "") { entry.VersionRegex = self.VersionRegex(); }
            if (self.DisplayFormat() != "") { entry.DisplayFormat = self.DisplayFormat(); }
            if (!self.FallbackToPathEnv()) { entry.FallbackToPathEnv = false; }
            if (self.DefaultEntryDisplayName() != "System Default") { entry.DefaultEntryDisplayName = self.DefaultEntryDisplayName(); }
            if (self.NotFoundValue() != "") { entry.NotFoundValue = self.NotFoundValue(); }
            if (self.CustomPathSetting() != "") { entry.CustomPathSetting = self.CustomPathSetting(); }
            if (self.CustomPathDisplayName() != "Custom Installation") { entry.CustomPathDisplayName = self.CustomPathDisplayName(); }

            return entry;
        };
    }
}

//Fills a settings drop-down in from a web API - a version list, a build index, and so on.
class remoteOptionSourceViewModel {
    constructor() {
        var self = this;
        this.Url = ko.observable("");
        this.ResponseFormat = ko.observable("json");
        this.ResultPath = ko.observable("");
        this.ValueField = ko.observable("");
        this.LabelField = ko.observable("");
        this.RegexPattern = ko.observable("");
        this.SortOrder = ko.observable("");
        this._PrependItems = ko.observable("");
        this._Headers = ko.observable("");
        this.CacheSeconds = ko.observable("3600");
        this.RefreshOnStartup = ko.observable(true);
        this.NotFoundValue = ko.observable("Not Available");
        this.UserAgent = ko.observable("");

        this.__ToManifestEntry = function () {
            var entry = { Url: self.Url() };

            if (self.ResponseFormat() != "json") { entry.ResponseFormat = self.ResponseFormat(); }
            if (self.ResultPath() != "") { entry.ResultPath = self.ResultPath(); }
            if (self.ValueField() != "") { entry.ValueField = self.ValueField(); }
            if (self.LabelField() != "") { entry.LabelField = self.LabelField(); }
            if (self.ResponseFormat() == "regex" && self.RegexPattern() != "") { entry.RegexPattern = self.RegexPattern(); }
            if (self.SortOrder() != "") { entry.SortOrder = self.SortOrder(); }

            var prependItems = manifestJsonObject(self._PrependItems());
            var headers = manifestJsonObject(self._Headers());

            if (prependItems != null) { entry.PrependItems = prependItems; }

            var cacheSeconds = manifestInteger(self.CacheSeconds());
            if (cacheSeconds !== null && cacheSeconds != 3600) { entry.CacheSeconds = cacheSeconds; }

            if (!self.RefreshOnStartup()) { entry.RefreshOnStartup = false; }
            if (self.NotFoundValue() != "Not Available") { entry.NotFoundValue = self.NotFoundValue(); }
            if (headers != null) { entry.Headers = headers; }
            if (self.UserAgent() != "") { entry.UserAgent = self.UserAgent(); }

            return entry;
        };
    }
}

class enumMappingViewModel {
    constructor(enumKey = "", enumValue = "", vm = null) {
        var self = this;
        this.__vm = vm;
        this._enumKey = ko.observable(enumKey);
        this._enumValue = ko.observable(enumValue);
        this.__RemoveEnum = () => self.__vm.__RemoveEnum(self);
    }
}

class updateStageViewModel {
    constructor(vm) {
        var self = this;
        this.__vm = vm;
        this.UpdateStageName = ko.observable("");
        //AMP shows this under the stage name on the task it raises for an Executable stage.
        this.UpdateStageDescription = ko.observable("");
        this._UpdateSourcePlatform = ko.observable("0");
        this.UpdateSourcePlatform = ko.computed(() => self._UpdateSourcePlatform() == "0" ? `All` : (self._UpdateSourcePlatform() == "1" ? `Linux` : `Windows`));
        //Stored as the name of the UpdateSteps value, which is what AMP reads.
        this._UpdateSource = ko.observable("SteamCMD");
        this.UpdateSource = ko.computed(() => self._UpdateSource());
        this.UpdateSourceArch = ko.observable("All");
        this.UpdateSourceData = ko.observable("");
        this.UpdateSourceArgs = ko.observable("");
        this.UpdateSourceVersion = ko.observable("");
        this.UpdateSourceExtra = ko.observable("");
        this.UpdateSourceTarget = ko.observable("");
        this.UnzipUpdateSource = ko.observable(false);
        this.OverwriteExistingFiles = ko.observable(false);
        this._ForceDownloadPlatform = ko.observable(null);
        this.ForceDownloadPlatform = ko.computed(() => self._ForceDownloadPlatform() == "1" ? `Linux` : (self._ForceDownloadPlatform() == "2" ? `Windows` : null));
        this.UpdateSourceConditionSetting = ko.observable(null);
        this.UpdateSourceConditionValue = ko.observable(null);
        this.DeleteAfterExtract = ko.observable(true);
        //Only meaningful for an Executable stage - AMP leaves it running and carries on.
        this.RunInBackground = ko.observable(false);
        //Runs the tools output through the applications console expressions rather than printing it raw.
        this.ProcessToolOutput = ko.observable(false);
        //Carries on to the next stage instead of failing the whole update.
        this.SkipOnFailure = ko.observable(false);
        this.OneShot = ko.observable(false);
        this.__RemoveStage = () => self.__vm.__RemoveStage(self);
        this.__EditStage = () => self.__vm.__EditStage(self);

        //Anything in the stage AMP knows about but the generator has no editor for.
        this._Passthrough = {};
        //A stage using a step type this version of the generator doesn't know about is held whole and
        //written straight back out, rather than being dropped or rewritten into something else.
        this._Unknown = ko.observable(null);
        this.__IsUnknown = ko.computed(() => self._Unknown() != null);

        this.__Spec = ko.computed(() => updateStepSpecsByName[self._UpdateSource()] || updateStepSpecsByName.None);
        this.__Description = ko.computed(() => self.__Spec().description);
        //A step that isn't offered any more still appears while a stage is set to it, so an imported
        //stage can be seen and edited rather than being silently switched to something else.
        this.__SourceTypeOptions = ko.computed(() => updateStepSpecs.filter(spec => !spec.hidden || spec.name == self._UpdateSource()));
        //Only the fields the chosen step reads, in the order the step wants them filled in.
        this.__Fields = ko.computed(() => Object.keys(self.__Spec().fields).map(key => Object.assign({ key: key }, self.__Spec().fields[key])));
        this.__HasFlag = flag => self.__Spec().flags.contains(flag);
        this.__ShowUnzip = ko.computed(() => self.__HasFlag("Unzip"));
        this.__ShowOverwrite = ko.computed(() => self.__HasFlag("Overwrite"));
        this.__ShowDeleteAfterExtract = ko.computed(() => self.__HasFlag("DeleteAfterExtract"));
        this.__ShowForcePlatform = ko.computed(() => self.__HasFlag("ForcePlatform"));
        this.__ShowRunInBackground = ko.computed(() => self.__HasFlag("RunInBackground"));
        this.__ShowProcessToolOutput = ko.computed(() => self.__HasFlag("ProcessToolOutput"));

        //Builds the entry as it appears in the stages manifest, in the field order of UpdateSourceInfo.
        //A field the step doesn't read is left out entirely rather than written as an empty string.
        this.__ToManifestEntry = function () {
            if (self.__IsUnknown()) { return Object.assign({}, self._Unknown()); }

            var spec = self.__Spec();
            var entry = { UpdateStageName: self.UpdateStageName() };

            if (self.UpdateStageDescription() != "") { entry.UpdateStageDescription = self.UpdateStageDescription(); }

            entry.UpdateSourcePlatform = self.UpdateSourcePlatform();
            entry.UpdateSource = self._UpdateSource();

            //AMP defaults this to All, and a stage is dropped entirely on an architecture it excludes.
            if (self.UpdateSourceArch() != "All") { entry.UpdateSourceArch = self.UpdateSourceArch(); }

            for (const key of ["UpdateSourceData", "UpdateSourceArgs", "UpdateSourceVersion", "UpdateSourceExtra", "UpdateSourceTarget"]) {
                if (spec.fields[key] && self[key]() != "") { entry[key] = self[key](); }
            }

            if (self.__ShowUnzip() && self.UnzipUpdateSource()) { entry.UnzipUpdateSource = true; }
            if (self.__ShowOverwrite() && self.OverwriteExistingFiles()) { entry.OverwriteExistingFiles = true; }
            if (self.__ShowForcePlatform() && self.ForceDownloadPlatform() != null) { entry.ForceDownloadPlatform = self.ForceDownloadPlatform(); }

            if (self.UpdateSourceConditionSetting() != null && self.UpdateSourceConditionSetting() != "") {
                entry.UpdateSourceConditionSetting = self.UpdateSourceConditionSetting();
                entry.UpdateSourceConditionValue = self.UpdateSourceConditionValue() == null ? "" : self.UpdateSourceConditionValue();
            }

            if (self.__ShowDeleteAfterExtract() && self.DeleteAfterExtract()) { entry.DeleteAfterExtract = true; }
            if (self.__ShowRunInBackground() && self.RunInBackground()) { entry.RunInBackground = true; }
            if (self.SkipOnFailure()) { entry.SkipOnFailure = true; }
            if (self.__ShowProcessToolOutput() && self.ProcessToolOutput()) { entry.ProcessToolOutput = true; }
            if (self.OneShot()) { entry.OneShot = true; }

            for (const key of Object.keys(self._Passthrough)) {
                if (!(key in entry)) { entry[key] = self._Passthrough[key]; }
            }

            return entry;
        };
    }
}

var vm = new generatorViewModel();

function autoSave() {
    localStorage.configgenautosave = vm.__Serialize();
}

function autoLoad() {
    if (!localStorage.configgenautosave) { return; }
    try {
        vm.__Deserialize(localStorage.configgenautosave);
    }
    catch (e) {
        console.error("Could not load the autosaved configuration - starting from a blank one.", e);
        localStorage.configgenautosave = "";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    ko.applyBindings(vm);

    document.getElementById("importfilesinput").addEventListener("change", (event) => {
        if (event.target.files.length > 0) { vm.__DoImportFiles(event.target.files); }
    });
    setInterval(autoSave, 30000);
    $('body').scrollspy({ target: '#navbar', offset: 90 });

    $('[data-toggle="tooltip"]').tooltip({
        container: 'body',
        trigger: 'click',
        placement: 'bottom'
    });
    //Check if there is anything after the # and if it starts cdata=, then import it if it does.
    if (document.location.hash.indexOf("#cdata=") == 0) {
        var data = decodeURIComponent(document.location.hash.substring(7));
        vm.__Deserialize(data);
        document.location.hash = "";
    }
    else {
        autoLoad();
    }
});
