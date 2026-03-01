import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';

export function registerTerminalCommand(context: vscode.ExtensionContext) {
    let cmd = vscode.commands.registerCommand('mars.launchTerminal', () => {
        vscode.window.showInformationMessage('Starting MARS GCS...');
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) return;
        
        const rootPath = workspaceFolders[0].uri.fsPath;
        const terminalPath = path.join(rootPath, 'mars_terminal', 'Release', 'mars_gcs.exe');
        
        cp.exec(`"${terminalPath}"`, (error) => {
            if (error) vscode.window.showErrorMessage(`MARS FAILED AT LAUNCHING: ${error.message}`);
        });
    });
    context.subscriptions.push(cmd);
}