# Terminal Opener

Open an external terminal from vscode with the actual working path.

## Features

* Open an external terminal having the path of the active workspace
* Open an external terminal having the path of the active editor
* Choose the path for the editor when a workspace contains more than one folder

## Available Commands

* `Terminal Opener: Open Terminal` Open an external terminal
* `Terminal Opener: Open Terminal From Workspace` Open an external workspace with the workspace path
* `Terminal Opener: Open Terminal From Editor` Open an external workspace with the active editor
  
## Available Settings

* Should the path of the opened editor or workspace be preferred as terminal root? (`Workspace` by default)
```json
    "terminal-opener.preferredTerminalPath": [
        "Workspace", 
        "Editor"
    ],
```
