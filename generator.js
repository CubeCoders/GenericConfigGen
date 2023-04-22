function omitNonPublicMembers(key, value) {
    return key.startsWith("_") ? undefined : value;
}

function omitPrivateMembers(key, value) {
    return key.startsWith("__") ? undefined : value;
}

function downloadString(data, filename) {
    const element = document.createElement('a');
    element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(data)}`);
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

class GeneratorViewModel {
    constructor() {
        var self = this;
        this.availablePortOptions = ko.observableArray(['Custom Port', 'Main Game Port', 'Steam Query Port', 'RCON Port']);

        this._compatibility = ko.observable("None");
        this.Meta_DisplayName = ko.observable("");
        this.Meta_Description = ko.observable("");
        this.Meta_Arch = ko.observable("x86_64");
        this.Meta_Author = ko.observable("");
        this._Meta_GithubOrigin = ko.computed(() => 'https://github.com/' + self.Meta_Author() + '/AMPTemplates.git');
        this._Meta_GithubURL = ko.computed(() => 'https://github.com/' + self.Meta_Author() + '/AMPTemplates');
        this.Meta_URL = ko.observable("");
        this.Meta_MinAMPVersion = ko.observable("2.4.2.0");
        this.Meta_SpecificDockerImage = ko.computed(() => self._compatibility() != "None" ? (self._compatibility().substring(self._compatibility().length - 4) == "Xvfb" ? `cubecoders/ampbase:xvfb` : `cubecoders/ampbase:wine`) : ``);
        this.Meta_DockerRequired = ko.observable("False");
        this.Meta_ContainerPolicy = ko.observable("Supported");
        this.Meta_ContainerPolicyReason = ko.observable("");
        this.Meta_Prerequsites = ko.observable("[]");
        this.Meta_ExtraContainerPackages = ko.observable("");
        this.Meta_ConfigReleaseState = ko.observable("NotSpecified");
        this.Meta_NoCommercialUsage = ko.observable("False");
        this.Meta_EndpointURIFormat = ko.observable(`steam://connect/{ip}:{GenericModule.App.Ports.$SteamQueryPort}`);

        this._SupportsWindows = ko.observable(true);
        this._SupportsLinux = ko.observable(true);

        this.App_AdminMethod = ko.observable("STDIO");
        this.App_HasReadableConsole = ko.observable(true);
        this.App_HasWritableConsole = ko.observable(true);
        this.App_DisplayName = ko.computed(() => this.Meta_DisplayName());
        this.App_CommandLineArgs = ko.observable("{{$PlatformArgs}} {{$FormattedArgs}}")
        this.App_WindowsCommandLineArgs = ko.observable("");
        this.App_CommandLineParameterFormat = ko.observable("-{0} \"{1}\"");
        this.App_CommandLineParameterDelimiter = ko.observable(" ");
        this.App_RapidStartup = ko.observable("false");
        this.App_ApplicationReadyMode = ko.observable("Immediate");
        this.App_ExitMethod = ko.observable("OS_CLOSE");
        this.App_ExitString = ko.observable("stop");
        this.App_UseLinuxIOREDIR = ko.observable("False");
        this.App_ExitTimeout = ko.observable("30");
        this.App_ExitFile = ko.observable("app_exit.lck");
        this.App_SupportsLiveSettingsChanges = ko.observable("False");
        this.App_LiveSettingChangeCommandFormat = ko.observable("set {0} \"{1}\"");
        this.App_ApplicationIPBinding = ko.observable("0.0.0.0");
        this.App_AdminPortRef = ko.observable("RemoteAdminPort");
        this.App_UniversalSleepApplicationUDPPortRef = ko.observable("GamePort1");
        this.App_PrimaryApplicationPortRef = ko.observable("GamePort1");
        this.App_UniversalSleepSteamQueryPortRef = ko.observable("SteamQueryPort");
        this.App_MaxUsers = ko.observable("8");
        this.App_UseRandomAdminPassword = ko.observable("True");
        this.App_RemoteAdminPassword = ko.observable("");
        this.App_AdminLoginTransform = ko.observable("None");
        this.App_RCONConnectDelaySeconds = ko.observable("30");
        this.App_RCONConnectRetrySeconds = ko.observable("15");
        this.App_RCONHeartbeatCommand = ko.observable("ping");
        this.App_RCONHeartbeatMinutes = ko.observable("0");
        this.App_TelnetLoginFormat = ko.observable("{0}");
        this.App_SteamUpdateAnonymousLogin = ko.observable("True");
        this.App_SteamForceLoginProm = ko.observable("False");
        this.App_SupportsUniversalSleep = ko.observable("False");
        this.App_WakeupMode = ko.observable("Any");
        this.App_TemplateMatchRegex = ko.observable("{{(\\$?[\\w]+)}}");
        this.App_MonitorChildProcess = ko.observable("False");
        this.App_MonitorChildProcessWaitMs = ko.observable("1000");
        this.App_MonitorChildProcessName = ko.observable("");
        this.App_Compatibility = ko.observable("None");
        this.App_AppSettings = ko.observableArray();
        this._App_SteamWorkshopDownloadLocation = ko.observable();
        this.App_SteamWorkshopDownloadLocation = ko.computed(() => this._App_SteamWorkshopDownloadLocation() != '' ? "{{$FullBaseDir}}" + this._App_SteamWorkshopDownloadLocation() : '');

        this.Console_FilterMatchRegex = ko.observable("");
        this.Console_FilterMatchReplacement = ko.observable("");
        this.Console_ThrowawayMessageRegex = ko.observable("(WARNING|ERROR): Shader.+");
        this._Console_AppReadyRegex = ko.observable("");
        this._Console_UserJoinRegex = ko.observable("");
        this._Console_UserLeaveRegex = ko.observable("");
        this._Console_UserChatRegex = ko.observable("");
        this.Console_UpdateAvailableRegex = ko.observable("^\\[\\d\\d:\\d\\d:\\d\\d\\] \\[INFO\\] A new server update is available! v[\\d\\.]+.$");
        this.Console_MetricsRegex = ko.observable("");
        this.Console_SuppressLogAtStart = ko.observable("False");
        this.Console_ActivateLogRegex = ko.observable("");
        this.Console_UserActions = ko.observable("{}");
        this.Console_SleepMode = ko.observable("False");
        this.Console_SleepOnStart = ko.observable("False");
        this.Console_SleepDelayMinutes = ko.observable("5");
        this.Console_DozeDelay = ko.observable("2");
        this.Console_AutoRetryCount = ko.observable("5");
        this.Console_SleepStartThresholdSeconds = ko.observable("25");

        this._PortMappings = ko.observableArray(); //of portMappingViewModel
        this.__NewPort = ko.observable("7777");
        this.__NewName = ko.observable("");
        this.__NewDescription = ko.observable("");
        this.__NewPortType = ko.observable("0");
        this.__NewProtocol = ko.observable("0");

        this._ConfigFileMappings = ko.observableArray(); //of configFileMappingViewModel
        this.__NewConfigFile = ko.observable("");
        this.__NewAutoMap = ko.observable(true);
        this.__NewConfigType = ko.observable("");

        this._UpdateSourceType = ko.observable("4");
        this._UpdateSourceURL = ko.observable("");
        this._UpdateSourceGitRepo = ko.observable("");
        this._UpdateSourceUnzip = ko.observable(false);
        this._DisplayImageSource = ko.observable("");

        this._SteamServerAppID = ko.observable("");
        this._SteamClientAppID = ko.observable("");

        this._WinExecutableName = ko.observable("");
        this._LinuxExecutableName = ko.observable("");

        this._AppSettings = ko.observableArray(); //of appSettingViewModel
        this.__AddEditSetting = ko.observable(null); //of appSettingViewModel
        this.__IsEditingSetting = ko.observable(false);

        this._UpdateStages = ko.observableArray(); //of updateStageViewModel
        this.__AddEditStage = ko.observable(null); //of updateStageViewModel
        this.__IsEditingStage = ko.observable(false);

        //Computed values
        this.Console_AppReadyRegex = ko.computed(() => WildcardToRegex(self._Console_AppReadyRegex()));
        this.Console_UserJoinRegex = ko.computed(() => WildcardToRegex(self._Console_UserJoinRegex()));
        this.Console_UserLeaveRegex = ko.computed(() => WildcardToRegex(self._Console_UserLeaveRegex()));
        this.Console_UserChatRegex = ko.computed(() => WildcardToRegex(self._Console_UserChatRegex()));
        this.__SanitizedName = ko.computed(() => self.Meta_DisplayName().replace(/\s+/g, "-").replace(/[^a-z\d-_]/ig, "").toLowerCase());
        this.Meta_OS = ko.computed(() => (self._SupportsWindows() ? 1 : 0) | (self._SupportsLinux() ? 2 : 0));
        this.Meta_ConfigManifest = ko.computed(() => self.__SanitizedName() + "config.json");
        this.Meta_MetaConfigManifest = ko.computed(() => self.__SanitizedName() + "metaconfig.json");
        this._Meta_PortsManifest = ko.computed(() => self.__SanitizedName() + "ports.json");
        this._Meta_StagesManifest = ko.computed(() => self.__SanitizedName() + "updates.json");
        this.Meta_ConfigRoot = ko.computed(() => self.__SanitizedName() + ".kvp");
//        this.Meta_DisplayImageSource = ko.computed(() => self._UpdateSourceType() == "4" ? "steam:" + self._SteamClientAppID() : "url:" + self._DisplayImageSource());

        function findAppID() {
            const updateStages = self._UpdateStages();
            for (let i = 0; i < updateStages.length; i++) {
                if (updateStages[i]._UpdateSource() === 8) {
                    return updateStages[i].UpdateSourceArgs();
                }
            }
            return "0";
        }

        function findUpdateSourceData() {
            const updateStages = self._UpdateStages();
            for (let i = 0; i < updateStages.length; i++) {
                if (updateStages[i]._UpdateSource() === 8) {
                    return updateStages[i].UpdateSourceData();
                }
            }
            return "0";
        }

        this.Meta_DisplayImageSource = ko.computed(() => {
            const appID = findAppID();
            return appID !== "0" ? `steam:${appID}` : `url:${self._DisplayImageSource()}`;
        });

        this.App_RootDir = ko.computed(() => `./${self.__SanitizedName()}/`);

        this.App_BaseDirectory = ko.computed(() => {
            const updateSourceData = findUpdateSourceData();
            return updateSourceData !== "0"
                ? `${self.App_RootDir()}${updateSourceData}/`
                : `${self.App_RootDir()}serverfiles/`;
        });

        this.App_WorkingDir = ko.computed(() => {
            const updateSourceData = findUpdateSourceData();
            return updateSourceData !== "0" ? updateSourceData : "serverfiles";
        });

        function getLinuxCompatArgs(compatibility, winExecutableName) {
            switch (compatibility) {
                case "None":
                    return "";
                case "WineXvfb":
                    return `-a wine "./${winExecutableName}"`;
                case "ProtonXvfb":
                    return `-a "{{\$FullRootDir}}1580130/proton" run "./${winExecutableName}"`;
                case "Proton":
                    return `run "./${winExecutableName}"`;
                default:
                    return `./${winExecutableName}`;
            }
        }

        this.App_ExecutableWin = ko.computed(() => {
            const workingDir = self.App_WorkingDir();
            const winExecutableName = self._WinExecutableName();
            return workingDir === "" ? winExecutableName : `${workingDir}\\${winExecutableName}`;
        });

        this.App_ExecutableLinux = ko.computed(() => {
            const compatibility = self._compatibility();
            const workingDir = self.App_WorkingDir();
            const linuxExecutableName = self._LinuxExecutableName();

            if (compatibility === "None") {
                return workingDir === "" ? linuxExecutableName : `${workingDir}/${linuxExecutableName}`;
            }

            const suffix = compatibility.substring(compatibility.length - 4);
            return suffix === "Xvfb" ? "/usr/bin/xvfb-run" : (compatibility === "Wine" ? "/usr/bin/wine" : "1580130/proton");
        });

        this._App_LinuxCommandLineArgsCompat = ko.computed(() => {
            const compatibility = self._compatibility();
            const winExecutableName = self._WinExecutableName();
            return getLinuxCompatArgs(compatibility, winExecutableName);
        });

        this._App_LinuxCommandLineArgsInput = ko.observable("");
        this.App_LinuxCommandLineArgs = ko.computed(() => {
            const compatArgs = self._App_LinuxCommandLineArgsCompat();
            const inputArgs = self._App_LinuxCommandLineArgsInput();
            return compatArgs !== "" ? `${compatArgs} ${inputArgs}` : inputArgs;
        });

        this.App_Ports = ko.computed(() => `@IncludeJson[${self._Meta_PortsManifest()}]`);
        this.App_UpdateSources = ko.computed(() => `@IncludeJson[${self._Meta_StagesManifest()}]`);
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
        this.__SampleFormattedArgs = ko.computed(() => {
            return self._AppSettings()
                .filter(s => s.IncludeInCommandLine())
                .map(s => s.IsFlagArgument()
                    ? s._CheckedValue()
                    : self.App_CommandLineParameterFormat().format(s.ParamFieldName(), s.DefaultValue())
                )
                .join(self.App_CommandLineParameterDelimiter());
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
        this.__GenData = ko.computed(() => {
            var data = [
                { "key": "Generated Name", "value": self.__SanitizedName() },
                { "key": "Config Root", "value": self.Meta_ConfigRoot() },
                { "key": "Settings Manifest", "value": self.Meta_ConfigManifest() },
                { "key": "Ports Manifest", "value": self._Meta_PortsManifest() },
                { "key": "Config Files Manifest", "value": self.Meta_MetaConfigManifest() },
                { "key": "Image Source", "value": self.Meta_DisplayImageSource(), "longValue": true },
                { "key": "Root Directory", "value": self.App_RootDir() },
                { "key": "Base Directory", "value": self.App_BaseDirectory() },
                { "key": "Working Directory", "value": self.App_WorkingDir() },
                { "key": "Docker Image", "value": self.Meta_SpecificDockerImage(), "longValue": true },
                { "key": "Compatibility", "value": self._compatibility() }
            ];

            if (self._SupportsWindows()) {
                data.push({ "key": "Windows Executable", "value": self.App_ExecutableWin() });
            }

            if (self._SupportsLinux()) {
                data.push({ "key": "Linux Executable", "value": self.App_ExecutableLinux() });
            }

            return data;
        });

        //Action methods (add/remove/update)
        this.__RemovePort = toRemove => {
            if (toRemove._PortType() !== 'Custom Port') {
                this.availablePortOptions.push(toRemove._PortType());
            }
            self._PortMappings.remove(toRemove);
        };

        this.__AddPort = () => {
            self._PortMappings.push(new PortMappingViewModel(self.__NewPort(), self.__NewName(), self.__NewDescription(), self.__NewPortType(), self.__NewProtocol(), self));
            if (self.__NewPortType() !== 'Custom Port') {
                this.availablePortOptions.remove(self.__NewPortType());
            }
        };

        this.__RemoveConfigFile = toRemove => {
            self._ConfigFileMappings.remove(toRemove);
        };

        this.__AddConfigFile = () => {
            self._ConfigFileMappings.push(new ConfigFileMappingViewModel(self.__NewConfigFile(), self.__NewAutoMap(), self.__NewConfigType(), self));
        };

        this.__RemoveSetting = toRemove => {
            self._AppSettings.remove(toRemove);
        };

        this.__EditSetting = toEdit => {
            self.__IsEditingSetting(true);
            self.__AddEditSetting(toEdit);
            $("#addEditSettingModal").modal('show');
        };

        this.__AddSetting = () => {
            self.__IsEditingSetting(false);
            self.__AddEditSetting(new AppSettingViewModel(self));
            $("#addEditSettingModal").modal('show');
        };

        this.__DoAddSetting = () => {
            self._AppSettings.push(self.__AddEditSetting());
            $("#addEditSettingModal").modal('hide');
        };

        this.__CloseSetting = () => {
            $("#addEditSettingModal").modal('hide');
        };

        this.__RemoveStage = toRemove => {
            self._UpdateStages.remove(toRemove);
        };

        this.__EditStage = toEdit => {
            self.__IsEditingStage(true);
            self.__AddEditStage(toEdit);
            $("#addEditStageModal").modal('show');
        };

        this.__AddStage = () => {
            self.__IsEditingStage(false);
            self.__AddEditStage(new UpdateStageViewModel(self));
            $("#addEditStageModal").modal('show');
        };

        this.__DoAddStage = () => {
            self._UpdateStages.push(self.__AddEditStage());
            $("#addEditStageModal").modal('hide');
        };

        this.__CloseStage = () => {
            $("#addEditStageModal").modal('hide');
        };

        this.__Serialize = () => {
            const asJS = ko.toJS(self);
            const result = JSON.stringify(asJS, omitPrivateMembers);
            return result;
        };

        this.__Deserialize = inputData => {
            const asJS = JSON.parse(inputData);
            let { _PortMappings: ports, _ConfigFileMappings: configFiles, _AppSettings: settings, _UpdateStages: stages } = asJS;

            delete asJS._PortMappings;
            delete asJS._ConfigFileMappings;
            delete asJS._AppSettings;
            delete asJS._UpdateStages;

            ko.quickmap.map(self, asJS);

            self._PortMappings.removeAll();
            const mappedPorts = ko.quickmap.to(PortMappingViewModel, ports, false, { __vm: self });
            self._PortMappings.push.apply(self._PortMappings, mappedPorts);

            self._ConfigFileMappings.removeAll();
            const mappedConfigFiles = ko.quickmap.to(ConfigFileMappingViewModel, configFiles, false, { __vm: self });
            self._ConfigFileMappings.push.apply(self._ConfigFileMappings, mappedConfigFiles);

            self._AppSettings.removeAll();
            const mappedSettings = ko.quickmap.to(AppSettingViewModel, settings, false, { __vm: self });
            self._AppSettings.push.apply(self._AppSettings, mappedSettings);

            self._UpdateStages.removeAll();
            const mappedStages = ko.quickmap.to(UpdateStageViewModel, stages, false, { __vm: self });
            self._UpdateStages.push.apply(self._UpdateStages, mappedStages);
        };

        this.__IsExporting = ko.observable(false);

        this.__Export = () => {
            self.__IsExporting(true);
            $("#importexporttextarea").val(self.__Serialize()).attr("readonly", true);
            $("#importExportDialog").modal("show");
            autoSave();
        };

        this.__CopyExportToClipboard = (data, element) => {
            navigator.clipboard.writeText($("#importexporttextarea").val());
            setTimeout(() => $(element.target).tooltip('hide'), 2000);
        };

        this.__CloseImportExport = () => {
            $("#importExportDialog").modal("hide");
        };

        this.__Import = () => {
            self.__IsExporting(false);
            $("#importexporttextarea").val("").prop("readonly", false);
            $("#importExportDialog").modal("show");
        };

        this.__DoImport = () => {
            self.__Deserialize($("#importexporttextarea").val());
            $("#importExportDialog").modal("hide");
            autoSave();
        };

        this.__Share = (data, element) => {
            var data = encodeURIComponent(self.__Serialize());
            const url = `${document.location.protocol}//${document.location.hostname}${document.location.pathname}#cdata=${data}`;
            navigator.clipboard.writeText(url);
            setTimeout(() => $(element.target).tooltip('hide'), 2000);
        };

        this.__Clear = () => {
            localStorage.configGenAutoSave = "";
            document.location.reload();
        }

        this.__GithubManifest = () => {
            const guid = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
                const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
            const githubManifest = JSON.stringify({ id: guid(), authors: [self.Meta_Author()], origin: self._Meta_GithubOrigin(), url: self._Meta_GithubURL(), imagefile: "", prefix: self.Meta_Author() }, null, 4);
            return githubManifest;
        }

        this.__DownloadConfig = () => {
            if (this.__ValidationResult() < 2) { return; }

            const lines = Object.keys(self)
                .filter(k => !k.startsWith("_"))
                .map(key => `${key.replace("_", ".")}=${self[key]()}`);

            if (self._UpdateSourceType() === "4") { // SteamCMD
                const envVars = `App.EnvironmentVariables={\"LD_LIBRARY_PATH\": \"./linux64:%LD_LIBRARY_PATH%\", \"SteamAppId\": \"${self._SteamClientAppID()}\"}`;
                const protonVars = `, \"STEAM_COMPAT_DATA_PATH\": \"{{$FullRootDir}}1580130\", \"STEAM_COMPAT_CLIENT_INSTALL_PATH\": \"{{$FullRootDir}}1580130\"}`;
                lines.push(self._compatibility() === "Proton" || self._compatibility() === "ProtonXvfb" ? envVars + protonVars : envVars);
            }

            const output = lines.sort().join("\n");
            const zip = new JSZip();
            const zipFiles = [
                [self.Meta_ConfigRoot(), output],
                [self.Meta_ConfigManifest(), JSON.stringify(ko.toJS(self._AppSettings()), omitNonPublicMembers, 4)],
                [self._Meta_StagesManifest(), JSON.stringify(ko.toJS(self._UpdateStages()), omitNonPublicMembers, 4)],
                [self._Meta_PortsManifest(), JSON.stringify(ko.toJS(self._PortMappings()), omitNonPublicMembers, 4)],
                [self.Meta_MetaConfigManifest(), JSON.stringify(ko.toJS(self._ConfigFileMappings()), omitNonPublicMembers, 4)],
                ["manifest.json", self.__GithubManifest()]
            ];

            zipFiles.forEach(([name, content]) => zip.file(name, content));
            zip.generateAsync({ type: "blob" })
                .then(content => saveAs(content, "configs.zip"));
        };

        this.__Invalidate = newValue => {
            self.__ValidationResult(0);
        };

        Object.keys(self)
            .filter(k => ko.isObservable(self[k]))
            .forEach(k => self[k].subscribe(self.__Invalidate));

        this.__ValidationResult = ko.observable(0);
        this.__ValidationResults = ko.observableArray();

        this.__ValidateConfig = function () {
            autoSave();
            self.__ValidationResults.removeAll();

            var failure = (issue, recommendation) => self.__ValidationResults.push(new ValidationResult("Failure", issue, recommendation));
            var warning = (issue, recommendation, impact) => self.__ValidationResults.push(new ValidationResult("Warning", issue, recommendation, impact));
            var info = (issue, recommendation, impact) => self.__ValidationResults.push(new ValidationResult("Info", issue, recommendation, impact));

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
                if (self._LinuxExecutableName() == "") { failure("Linux is listed as a supported platform, but no executable for this platform was specified.", "Specify an executable for this platform under 'Startup and Shutdown'"); }
                else if (self._LinuxExecutableName().toLowerCase().endsWith(".sh")) { failure("You can only start executables files from AMP. Do not attempt to use shell scripts or other file types.", "Change your Linux Executable under Startup and Shutdown to be an actual executable rather than a script."); }
            }

            switch (self.App_AdminMethod()) {
                case "PinballWizard":
                case "AMP_GSIO":
                    break;
                case "STDIO":
                    if (!self.App_HasReadableConsole() && !self.App_HasWritableConsole()) {
                        failure("Standard IO was selected as the management type, but the console was set as neither readable nor writable - so AMP won't be able to do anything useful.", "Either enable Reading or Writing for the console (if the application supports it) - or change the management mode to 'None'");
                    }
                    break;
                default:
                    if (!self.App_CommandLineArgs().contains("{{$RemoteAdminPassword}}")) {
                        warning("A server management mode is specified that requires AMP to know the password, but {{$RemoteAdminPassword}} is not found within the command line arguments.", "If the application can have it's RCON password specified via the command line then you should add the {{$RemoteAdminPassword}} template item to your command line arguments", "Without the ability to control the RCON password, AMP will not be able to use the servers RCON to provide a console or run commands.");
                    }
                    break;
            }
            if ((self._compatibility() == "Wine" && !self._SupportsLinux()) || (self._compatibility() == "Proton" && !self._SupportsLinux())) { failure("A Linux compatibility layer was chosen, but Linux support is not checked.", "Please check both."); }

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

class ValidationResult {
    constructor(grade, issue, recommendation, impact = "") {
        this.grade = grade;
        this.issue = issue;
        this.recommendation = recommendation;
        this.impact = impact;
        this.gradeClass = "";

        switch (grade) {
            case "Failure":
                this.gradeClass = "table-danger";
                break;
            case "Warning":
                this.gradeClass = "table-warning";
                break;
            case "Info":
                this.gradeClass = "table-info";
                break;
        }
    }
}

class PortMappingViewModel {
    constructor(port, portName, portDescription, portType, protocol, vm) {
        this.__vm = vm;
        this._protocol = ko.observable(protocol);
        this.protocol = ko.computed(() => {
            switch (this._protocol()) {
                case "1":
                    return "TCP";
                case "2":
                    return "UDP";
                case "0":
                default:
                    return "Both";
            }
        });
        this.port = ko.observable(port);
        this._portType = ko.observable(portType);
        this._name = ko.observable(portName);
        this.name = ko.computed(() => {
            switch (this._portType()) {
                case "Steam Query Port":
                    return "Steam Query Port";
                case "RCON Port":
                    return "Remote Admin Port";
                case "Custom Port":
                default:
                    return this._name();
            }
        });
        this._description = ko.observable(portDescription);
        this.description = ko.computed(() => {
            switch (this._portType()) {
                case "1":
                    return "Port used for Steam queries and server list";
                case "2":
                    return "Port used for RCON administration";
                case "0":
                default:
                    return this._description();
            }
        });
        this.ref = ko.computed(() => {
            const cleanName = this._name().replace(/\s+/g, "").replace(/[^a-z\d-_]/ig, "");
            switch (this._portType()) {
                case "Steam Query Port":
                    return "SteamQueryPort";
                case "RCON Port":
                    return "RemoteAdminPort";
                case "0":
                default:
                    return cleanName;
            }
        });
        this.__removePort = () => this.__vm.__removePort(this);
    }
}


class ConfigFileMappingViewModel {
    constructor(configFile, autoMap, configType, vm) {
        this.__vm = vm;
        this.ConfigFile = ko.observable(configFile);
        this._ConfigType = ko.observable(configType);
        this.ConfigType = ko.computed(() => {
            switch (this._ConfigType()) {
                case "1":
                    return "ini";
                case "2":
                    return "xml";
                case "3":
                    return "kvp";
                case "0":
                default:
                    return "json";
            }
        });
        this._AutoMap = ko.observable(autoMap);
        this.AutoMap = ko.computed(() => this._ConfigType() === "4" ? false : this._AutoMap());
        this.__RemoveConfigFile = () => this.__vm.__RemoveConfigFile(this);
    }
}

class AppSettingViewModel {
    constructor(vm) {
        this.__vm = vm;
        this.DisplayName = ko.observable("");
        this.Category = ko.observable("Server Settings");
        this.Description = ko.observable("");
        this.Keywords = ko.computed(() => this.DisplayName().toLowerCase().replaceAll(" ", ","));
        this.FieldName = ko.observable("");
        this.InputType = ko.observable("text");
        this.IsFlagArgument = ko.observable(false);
        this.ParamFieldName = ko.computed(() => this.FieldName());
        this.IncludeInCommandLine = ko.observable(false);
        this.DefaultValue = ko.observable("");
        this.Placeholder = ko.computed(() => this.DefaultValue());
        this.Suffix = ko.observable("");
        this.Hidden = ko.observable(false);
        this.SkipIfEmpty = ko.observable(false);
        this._CheckedValue = ko.observable("true");
        this._UncheckedValue = ko.observable("false");
        this.__RemoveSetting = () => this.__vm.__RemoveSetting(this);
        this.__EditSetting = () => this.__vm.__EditSetting(this);

        this._EnumMappings = ko.observableArray(); // of EnumMappingViewModel
        this.__NewEnumKey = ko.observable("");
        this.__NewEnumValue = ko.observable("");

        this.__RemoveEnum = (toRemove) => {
            this._EnumMappings.remove(toRemove);
        };

        this.__AddEnum = () => {
            this._EnumMappings.push(new EnumMappingViewModel(this.__NewEnumKey(), this.__NewEnumValue(), this));
        };

        this.__deserialize = (inputData) => {
            const asJS = JSON.parse(inputData);
            const enumSettings = asJS._EnumMappings;

            delete asJS._EnumMappings;

            ko.quickmap.map(this, asJS);

            this._EnumMappings.removeAll();
            const MappedEnums = ko.quickmap.to(EnumMappingViewModel, enumSettings, false, { __vm: this });
            this._EnumMappings.push.apply(this._EnumMappings, MappedEnums);
        };

        this.EnumValues = ko.computed(() => {
            if (this.InputType() === "checkbox") {
                const result = {};
                result[this._CheckedValue()] = "True";
                result[this._UncheckedValue()] = "False";
                return result;
            } else if (this.InputType() === "enum") {
                const result = {};
                for (let i = 0; i < this._EnumMappings().length; i++) {
                    result[this._EnumMappings()[i]._EnumKey()] = this._EnumMappings()[i]._EnumValue();
                }
                return result;
            } else {
                return {};
            }
        });
    }
}

class EnumMappingViewModel {
    constructor(enumKey, enumValue, vm) {
        this.__vm = vm;
        this._EnumKey = ko.observable(EnumKey);
        this._EnumValue = ko.observable(EnumValue);
        this.__RemoveEnum = () => this.__vm.__RemoveEnum(this);
    }
}


class UpdateStageViewModel {
    constructor(vm) {
        this.__vm = vm;
        this.UpdateStageName = ko.observable("");
        this._UpdateSourcePlatform = ko.observable("0");
        this.UpdateSourcePlatform = ko.computed(() => {
            switch (this._UpdateSourcePlatform()) {
                case "1":
                    return "Linux";
                case "2":
                    return "Windows";
                default:
                    return "All";
            }
        });
        this._UpdateSource = ko.observable("8");
        this.UpdateSource = ko.computed(() => {
            switch (this._UpdateSource()) {
                case "0":
                    return "CopyFilePath";
                case "1":
                    return "CreateSymlink";
                case "2":
                    return "Executable";
                case "3":
                    return "ExtractArchive";
                case "4":
                    return "FetchURL";
                case "5":
                    return "GithubRelease";
                case "6":
                    return "SetExecutableFlag";
                case "7":
                    return "StartApplication";
                default:
                    return "SteamCMD";
            }
        });
        this.UpdateSourceData = ko.observable("");
        this.UpdateSourceArgs = ko.observable("");
        this.UpdateSourceVersion = ko.observable("");
        this.UpdateSourceTarget = ko.observable("");
        this.UnzipUpdateSource = ko.observable(false);
        this.OverwriteExistingFiles = ko.observable(false);
        this._ForceDownloadPlatform = ko.observable(null);
        this.ForceDownloadPlatform = ko.computed(() => {
            switch (this._ForceDownloadPlatform()) {
                case "1":
                    return "Linux";
                case "2":
                    return "Windows";
                default:
                    return null;
            }
        });
        this.UpdateSourceConditionSetting = ko.observable(null);
        this.UpdateSourceConditionValue = ko.observable(null);
        this.DeleteAfterExtract = ko.observable(true);
        this.OneShot = ko.observable(false);
        this.__RemoveStage = () => this.__vm.__RemoveStage(this);
        this.__EditStage = () => this.__vm.__EditStage(this);
    }
}

const vm = new GeneratorViewModel();

const autoSave = () => {
    localStorage.setItem('configGenAutoSave', vm.__Serialize());
};

const autoLoad = () => {
    const configGenAutoSave = localStorage.getItem('configGenAutoSave');

    if (configGenAutoSave !== "") {
        vm.__Deserialize(configGenAutoSave);
    }
};


document.addEventListener('DOMContentLoaded', () => {
    ko.applyBindings(vm);
    setInterval(autoSave, 30000);
    $('body').scrollspy({ target: '#navbar', offset: 90 });

    initTooltip();
    processLocationHash();
});

function initTooltip() {
    $('[data-toggle="tooltip"]').tooltip({
        container: 'body',
        trigger: 'click',
        placement: 'bottom'
    });
}

function processLocationHash() {
    const { hash } = document.location;

    if (hash.startsWith("#cdata=")) {
        var data = decodeURIComponent(hash.substring(7));
        vm.__Deserialize(data);
        document.location.hash = "";
    } else {
        autoLoad();
    }
}
