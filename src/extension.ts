import * as vscode from 'vscode';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {

	const openTerminal = vscode.commands.registerCommand('terminal-opener.open-terminal', async () => {
		const workspace = vscode.workspace.workspaceFolders;
		const editor = vscode.window.activeTextEditor;
		if (!workspace && !editor) {
			vscode.window.showInformationMessage('Terminal can only started from an active editor or workspace!');
			return;
		} else {
			switch (vscode.workspace.getConfiguration('terminal-opener').get('preferredTerminalPath')) {
				case 'Workspace': {
					if (workspace!.length > 1) {
						let items = [];
						for (let i = 0; i < workspace!.length; i++) {
							items.push(workspace![i].uri.fsPath);
						};

						vscode.window.showQuickPick(items)
							.then((selection) => {
								if (selection) {
									open(selection);
								}
							});
					}
					else {
						open(vscode.workspace.workspaceFolders![0].uri.fsPath);
					}
					break;
				}
				case 'Editor': {
					open(vscode.window.activeTextEditor!.document.uri.fsPath);
					break;
				}
				default: {
					open(vscode.workspace.workspaceFolders![0].uri.fsPath);
				}
			}
		}
	});

	context.subscriptions.push(openTerminal);

	const openTerminalFromWorkspace = vscode.commands.registerCommand('terminal-opener.open-terminal-from-workspace', e => {
		const workspace = vscode.workspace.workspaceFolders;
		if (!workspace) {
			vscode.window.showInformationMessage('Terminal can only started from an active workspace!');
			return;
		} else {
			if (workspace!.length > 1) {
				let items = [];
				for (let i = 0; i < workspace!.length; i++) {
					items.push(workspace![i].uri.fsPath);
				};

				vscode.window.showQuickPick(items)
					.then((selection) => {
						if (selection) {
							open(selection);
						}
					});
			}
			else {
				open(vscode.workspace.workspaceFolders![0].uri.fsPath);
			}
		}
	});
	context.subscriptions.push(openTerminalFromWorkspace);

	const openTerminalFromEditor = vscode.commands.registerCommand('terminal-opener.open-terminal-from-editor', e => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showInformationMessage('Terminal can only started from an active editor!');
			return;
		} else {
			open(vscode.window.activeTextEditor!.document.uri.fsPath);
		}
	});
	context.subscriptions.push(openTerminalFromEditor);
}

// This method is called when your extension is deactivated
export function deactivate() { }

function open(p: string) {
	const cmd = vscode.workspace.getConfiguration('terminal').external;
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