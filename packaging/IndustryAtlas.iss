#ifndef MyAppVersion
  #define MyAppVersion "0.1.0"
#endif

[Setup]
AppId={{47DC8243-4FBC-45B4-A510-2100AD98AB52}
AppName=Industry Atlas 产业研究工作台
AppVersion={#MyAppVersion}
AppPublisher=gan-ziyi
AppPublisherURL=https://github.com/gan-ziyi/industry-atlas
DefaultDirName={localappdata}\Programs\IndustryAtlas
DefaultGroupName=Industry Atlas
DisableProgramGroupPage=yes
PrivilegesRequired=lowest
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
OutputDir=output
OutputBaseFilename=IndustryAtlas-Setup-v{#MyAppVersion}-x64
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
SetupLogging=yes
CloseApplications=yes
RestartApplications=no
UninstallDisplayIcon={app}\IndustryAtlas.exe

[Files]
Source: "..\dist\IndustryAtlas\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{autoprograms}\Industry Atlas 产业研究工作台"; Filename: "{app}\IndustryAtlas.exe"
Name: "{autodesktop}\产业研究工作台"; Filename: "{app}\IndustryAtlas.exe"; Tasks: desktopicon

[Tasks]
Name: "desktopicon"; Description: "创建桌面快捷方式"; GroupDescription: "快捷方式："; Flags: checkedonce

[Run]
Filename: "{app}\IndustryAtlas.exe"; Description: "启动产业研究工作台"; Flags: nowait postinstall skipifsilent

[UninstallDelete]
Type: filesandordirs; Name: "{app}"

[Code]
function InitializeUninstall(): Boolean;
begin
  Result := True;
  if DirExists(ExpandConstant('{localappdata}\IndustryAtlas')) then
    MsgBox('研究数据保存在本机 IndustryAtlas 数据目录中，卸载程序不会自动删除这些数据。', mbInformation, MB_OK);
end;
