
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function registerLogToolCommand(context: vscode.ExtensionContext) {
    let launchLog = vscode.commands.registerCommand('mars.launchLogTool', () => {
        
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('FAULT: Please open a MARS Project first to launch LogTool.');
            return;
        }

        const projectPath = workspaceFolders[0].uri.fsPath;
        
        const logFolder = path.join(projectPath, 'mars-logtool', 'Release');
        const logExe = path.join(logFolder, 'mars_log_tool.exe');

        if (!fs.existsSync(logExe)) {
            vscode.window.showErrorMessage(`FAULT: LogTool executable not found at ${logExe}`);
            return;
        }

        let logTerminal = vscode.window.terminals.find(t => t.name === 'MARS LogTool');
        
        if (!logTerminal) {
            logTerminal = vscode.window.createTerminal({
                name: 'MARS LogTool',
                cwd: logFolder
            });
        }

        logTerminal.show();
        
        logTerminal.sendText('.\\mars_log_tool.exe'); 

        vscode.window.showInformationMessage('Initializing LogTool...');
    });

    context.subscriptions.push(launchLog);
}