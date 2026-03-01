// src/commands/projectCreator.ts

import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

import { getProjectCreatorHtml } from '../views/projectCreatorWebview';

export function registerProjectCreatorCommand(context: vscode.ExtensionContext) {
    let createCmd = vscode.commands.registerCommand('mars.createProject', () => {
        
        const panel = vscode.window.createWebviewPanel(
            'marsProjectCreator', 
            'MARS Project Creator', 
            vscode.ViewColumn.One, 
            { 
                enableScripts: true,
                localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')]
            } 
        );

        // 1. Buscamos el banner
        const imagePath = vscode.Uri.joinPath(context.extensionUri, 'media', 'mars-banner-alt.png');
        const imageUri = panel.webview.asWebviewUri(imagePath);

        // 2. LEEMOS LAS CONFIGURACIONES GUARDADAS
        const config = vscode.workspace.getConfiguration('marsFramework');
        const defaultTeam = config.get('teamNumber', '');
        const defaultFolder = config.get('workspacePath', '');

        // 3. Pasamos la imagen, la carpeta y el equipo a la vista HTML
        panel.webview.html = getProjectCreatorHtml(imageUri.toString(), defaultFolder as string, defaultTeam as string);

        panel.webview.onDidReceiveMessage(async message => {
            if (message.command === 'error') {
                vscode.window.showErrorMessage(message.text);
            } 
            else if (message.command === 'selectFolder') {
                const folderUri = await vscode.window.showOpenDialog({
                    canSelectFiles: false,
                    canSelectFolders: true,
                    openLabel: 'Select Base Folder'
                });
                
                if (folderUri && folderUri[0]) {
                    panel.webview.postMessage({ command: 'updateFolder', path: folderUri[0].fsPath });
                }
            }
            else if (message.command === 'generate') {
                const targetPath = path.join(message.baseFolder, message.projectName);

                vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    title: `Creating MARS Project: ${message.projectName}...`,
                    cancellable: false
                }, async (progress) => {
                    return new Promise<void>((resolve, reject) => {
                        
                        const REPO_URL = "https://github.com/STZ-Robotics/MarsTemplate.git"; 
                        
                        cp.exec(`git clone ${REPO_URL} "${targetPath}"`, (error) => {
                            if (error) {
                                vscode.window.showErrorMessage('Error cloning MARS Template: ' + error.message);
                                reject();
                                return;
                            }

                            try {
                                const gitFolder = path.join(targetPath, '.git');
                                if (fs.existsSync(gitFolder)) {
                                    fs.rmSync(gitFolder, { recursive: true, force: true });
                                }

                                if (message.teamNumber) {
                                    const wpilibPrefs = path.join(targetPath, '.wpilib', 'wpilib_preferences.json');
                                    
                                    if (fs.existsSync(wpilibPrefs)) {
                                        let prefsData = JSON.parse(fs.readFileSync(wpilibPrefs, 'utf8'));
                                        prefsData.teamNumber = parseInt(message.teamNumber, 10);
                                        fs.writeFileSync(wpilibPrefs, JSON.stringify(prefsData, null, 4));
                                    }
                                }
                            } catch (e) {
                                console.error('Warning: Could not configure team number automatically', e);
                            }

                            vscode.window.showInformationMessage(`Project ${message.projectName} created successfully for Team ${message.teamNumber}!`);
                            panel.dispose(); 
                            
                            vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(targetPath));
                            resolve();
                        });
                    });
                });
            }
        });
    });

    context.subscriptions.push(createCmd);
}