import * as vscode from 'vscode';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {

	const openTerminal = vscode.commands.registerCommand('terminal-opener.openterminal', e => {
		const cmd = vscode.workspace.getConfiguration('terminal').external;
		console.log(cmd);
		let p: string = '';
		const editor = vscode.window.activeTextEditor;
		
		if(!editor) {
			vscode.window.showInformationMessage('Terminal can only started from an active File or Workspace!');
		} else {
			p = vscode.window.activeTextEditor!.document.uri.fsPath;	
			if (!fs.lstatSync(p).isDirectory()) {
				p = path.dirname(p);
			}

			switch (process.platform) {
				case 'win32': {
					childProcess.exec(`start "" "${cmd.windowsExec || "cmd"}" /K "cd /D "${p}""`);
					break;
				}
				case 'darwin': {
					childProcess.exec(`open -a "${cmd.osxExec || 'Terminal.app'}" "${p}"`);
					break;
				}
				case 'linux': {
					if (!cmd.linuxExec) {
						vscode.window.showErrorMessage('You have not set a linux terminal under "terminal.external.linuxExec in your settings.json!');
					}
					break;
				}
				default: {
					break;
				}
			}
		}
	});
	context.subscriptions.push(openTerminal);
}

// This method is called when your extension is deactivated
export function deactivate() { }


