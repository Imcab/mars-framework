// src/commands/settings.ts

import * as vscode from 'vscode';
import { getSettingsHtml } from '../views/settingWebview';

export function registerSettingsCommand(context: vscode.ExtensionContext) {
    let settingsCmd = vscode.commands.registerCommand('mars.settings', () => {
        
        const panel = vscode.window.createWebviewPanel(
            'marsSettings', 
            'MARS Settings', 
            vscode.ViewColumn.One, 
            { 
                enableScripts: true,
                localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')]
            } 
        );

        const config = vscode.workspace.getConfiguration('marsFramework');
        const teamNumber = config.get('teamNumber', '');
        const workspacePath = config.get('workspacePath', '');
        const toolsPath = config.get('toolsPath', '')
        const autoSave = config.get('autoSaveDeploy', true);

        const imagePath = vscode.Uri.joinPath(context.extensionUri, 'media', 'mars-banner.png');
        const imageUri = panel.webview.asWebviewUri(imagePath);

        const stylePath = vscode.Uri.joinPath(context.extensionUri, 'media', 'settings.css');
        const styleUri = panel.webview.asWebviewUri(stylePath);

        panel.webview.html = getSettingsHtml(
            imageUri.toString(), 
            styleUri.toString(),
            teamNumber as string,  
            workspacePath as string, 
            toolsPath as string,
            autoSave as boolean
        );

        panel.webview.onDidReceiveMessage(async message => {

            if (message.command && message.command.startsWith('mars.')) {
                vscode.commands.executeCommand(message.command);
            }

            if (message.command === 'selectFile') {
                const fileUri = await vscode.window.showOpenDialog({
                    canSelectFiles: true,
                    canSelectFolders: false,
                    openLabel: 'Select MARS GCS Executable',
                    filters: { 'Executables': ['exe', 'bat', 'sh'] }
                });
                if (fileUri && fileUri[0]) {
                    panel.webview.postMessage({ command: 'updateInput', targetId: message.targetId, path: fileUri[0].fsPath });
                }
            }
            else if (message.command === 'selectFolder') {
                const folderUri = await vscode.window.showOpenDialog({
                    canSelectFiles: false,
                    canSelectFolders: true,
                    openLabel: 'Select Folder'
                });
                if (folderUri && folderUri[0]) {
                    panel.webview.postMessage({ command: 'updateInput', targetId: message.targetId, path: folderUri[0].fsPath });
                }
            }
            else if (message.command === 'save') {
                try {
                    
                    await config.update('teamNumber', message.data.teamNumber, vscode.ConfigurationTarget.Global);
                    await config.update('workspacePath', message.data.workspacePath, vscode.ConfigurationTarget.Global);
                    
                    await config.update('toolsPath', message.data.toolsPath, vscode.ConfigurationTarget.Global);
                    
                    await config.update('autoSaveDeploy', message.data.autoSave, vscode.ConfigurationTarget.Global);

                    vscode.window.showInformationMessage('MARS Settings saved successfully!');
                    panel.dispose(); 
                } catch (error: any) {
                    vscode.window.showErrorMessage('Failed to save settings: ' + error.message);
                    panel.webview.postMessage({ command: 'saveFailed' });
                }
            }
        });
    });

    context.subscriptions.push(settingsCmd);
}