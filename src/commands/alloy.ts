// src/commands/alloy.ts

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function registerAlloyCommand(context: vscode.ExtensionContext) {
    let launchAlloy = vscode.commands.registerCommand('mars.launchAlloy', () => {
        
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('FAULT: Please open a MARS Project first to launch Alloy.');
            return;
        }

        const projectPath = workspaceFolders[0].uri.fsPath;
        
        const alloyFolder = path.join(projectPath, 'mars-alloy', 'Release');
        const alloyExe = path.join(alloyFolder, 'alloy_launcher.exe');

        if (!fs.existsSync(alloyExe)) {
            vscode.window.showErrorMessage(`FAULT: Alloy executable not found at ${alloyExe}`);
            return;
        }

        let alloyTerminal = vscode.window.terminals.find(t => t.name === 'MARS Alloy');
        
        if (!alloyTerminal) {
            alloyTerminal = vscode.window.createTerminal({
                name: 'MARS Alloy',
                cwd: alloyFolder
            });
        }

        alloyTerminal.show();
        
        alloyTerminal.sendText('.\\alloy_launcher.exe'); 

        vscode.window.showInformationMessage('Initializing Alloy Dashboard...');
    });

    context.subscriptions.push(launchAlloy);
}