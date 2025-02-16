import * as vscode from 'vscode';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { json } from 'stream/consumers';

type TApp = {
	enabled: boolean;
	name: string;
	os: string;
	app: string;
	parameters: string;
	default: boolean;
}
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
	console.log('open called');
	let terminaApps: Array<TApp> | undefined;
	terminaApps = vscode.workspace.getConfiguration('terminal-opener').get('terminal-apps');
	console.log(terminaApps);
	switch (process.platform) {
		case 'win32': {
			terminaApps = terminaApps!.filter(item => item.os === 'windows');
			const enabledTerminalApps = terminaApps.filter(item => item.enabled);
			const defaultTerminalApps = terminaApps.filter(item => item.default);
			if (defaultTerminalApps.length > 1) {
				vscode.window.showInformationMessage('You have more than one default terminal app set in your settings.json!');
			} else if (defaultTerminalApps.length === 0) {
				vscode.window.showInformationMessage('You have no default terminal app set in your settings.json!');
			} else {

			}

			let items = [];
			if (enabledTerminalApps.length > 1) {
				for (let i = 0; i < enabledTerminalApps.length; i++) {
					items.push(enabledTerminalApps[i].name);
					vscode.window.showQuickPick(items)
						.then((selection) => {
							const term = terminaApps!.find(i => i.name === selection);
							if (term?.parameters === null) {
								childProcess.exec(`open -a "${term?.app}" ${p}`);
							} else {
								childProcess.exec(`open -a "${term?.app}" ${term?.parameters} ${p}`);
							}
						});
				};
			};
			break;
		}
		case 'darwin': {
			terminaApps = terminaApps!.filter(item => item.os === 'osx');
			const enabledTerminalApps = terminaApps.filter(item => item.enabled);
			if (enabledTerminalApps.length === 0) {
				vscode.window.showInformationMessage('You have no terminal app enabled in your settings.json!');
			} else {
				const defaultTerminalApps = enabledTerminalApps.filter(item => item.default);
				if (defaultTerminalApps.length === 1) {
					openTerminalApp(defaultTerminalApps[0], 'osx');
				} else {
					let items = [];
					if (enabledTerminalApps.length > 1) {
						for (let i = 0; i < enabledTerminalApps.length; i++) {
							items.push(enabledTerminalApps[i].name);
							vscode.window.showQuickPick(items)
								.then((selection) => {
									const term = enabledTerminalApps!.find(i => i.name === selection);
									openTerminalApp(term!, 'osx');
								});
						}
					}
				}
				break;
			}
		}
		case 'linux': {
			break;
		}
		default: {
			break;
		}
	}

	function openTerminalApp(term: TApp, os: string) {
		console.log('term: ', term);
		if (term !== undefined) {
			console.log('term !== undefined');
			switch (os) {
				// copilot generated code: review and test
				case 'windows': {
					if (term!.parameters === null) {
						console.log('term!.parameters === null');
						childProcess.exec(`start "" "${term!.app}" /K "cd /D "${p}""`);
					} else {
						childProcess.exec(`start "" "${term!.app}" ${term!.parameters} ${p}`);
					};
					break;
				}
				case 'osx': {
					if (term!.parameters === null) {
						console.log('term!.parameters === null');
						childProcess.exec(`open -a "${term!.app}" ${p}`);
					} else {
						childProcess.exec(`open -a "${term!.app}" ${term!.parameters} ${p}`);
					};
					break;
				}
				// copilot generated code: review and test
				case 'linux': {
					if (term!.parameters === null) {
						console.log('term!.parameters === null');
						childProcess.exec(`${term!.app} ${p}`);
					} else {
						childProcess.exec(`${term!.app} ${term!.parameters} ${p}`);
					};
					break;
				}
			}
		}
	}
}