// src/commands/marketplace.ts

import * as vscode from 'vscode';
import axios from 'axios';
import * as path from 'path';
import * as fs from 'fs';
import * as cp from 'child_process';
import { getMarketplaceHtml } from '../../views/marketplaceWebview';

const marsOutput = vscode.window.createOutputChannel("MARS Marketplace Installer");

export function registerMarketplaceCommand(context: vscode.ExtensionContext) {
    let cmd = vscode.commands.registerCommand('mars.openMarketplace', async () => {
        
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('MARS: Please open a MARS workspace first.');
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'marsMarketplace', 'MARS Marketplace', vscode.ViewColumn.One, 
            { enableScripts: true, localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')] }
        );

        const imageUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'media', 'mars-banner.png'));
        panel.webview.html = getMarketplaceHtml(imageUri.toString());

        let loadedFeatures: any[] = [];

        try {
            const registryUrl = 'https://raw.githubusercontent.com/STZ-Robotics/Mars-marketplace/main/registry.json';
            const registryResponse = await axios.get(registryUrl);
            const featureUrls: string[] = registryResponse.data.verifiedFeatures;

            for (const url of featureUrls) {
                try {
                    const featureResponse = await axios.get(url);
                    loadedFeatures.push(featureResponse.data);
                } catch (err) {
                    console.warn(`[MARS] Failed to fetch feature from: ${url}`);
                }
            }

            const rootPath = workspaceFolders[0].uri.fsPath;
            const featuresPath = path.join(rootPath, 'workspace', 'features');
            
            for (let feat of loadedFeatures) {
                const localJsonPath = path.join(featuresPath, `${feat.featureId}.json`);
                if (fs.existsSync(localJsonPath)) {
                    try {
                        const localData = JSON.parse(fs.readFileSync(localJsonPath, 'utf8'));
                        feat.installedVersion = localData.version;
                    } catch (e) {
                        console.warn(`[MARS] Could not read local feature data for ${feat.featureId}`);
                    }
                } else {
                    feat.installedVersion = null;
                }
            }
            
            panel.webview.postMessage({ command: 'loadFeatures', features: loadedFeatures });

        } catch (error: any) {
            panel.webview.postMessage({ command: 'error', text: 'FAULT: Cannot connect to MARS Registry.' });
        }

        // --- LA MAGIA DE INSTALACIÓN ---
        panel.webview.onDidReceiveMessage(async message => {
            if (message.command === 'install') {
                const featureData = loadedFeatures.find(f => f.featureId === message.featureId);
                
                if (featureData) {
                    marsOutput.clear();
                    marsOutput.show();
                    marsOutput.appendLine(`[MARS] Starting installation of: ${featureData.name} from Marketplace`);

                    await vscode.window.withProgress({
                        location: vscode.ProgressLocation.Notification,
                        title: `Installing ${featureData.name}...`,
                        cancellable: false
                    }, async (progress) => {
                        try {
                            // 1. Inyección (Guardar el JSON)
                            progress.report({ message: 'Saving feature data...' });
                            const rootPath = workspaceFolders[0].uri.fsPath;
                            const featuresPath = path.join(rootPath, 'workspace/features');
                            
                            if (!fs.existsSync(featuresPath)) {
                                fs.mkdirSync(featuresPath, { recursive: true });
                            }

                            const filePath = path.join(featuresPath, `${featureData.featureId}.json`);
                            fs.writeFileSync(filePath, JSON.stringify(featureData, null, 2), 'utf-8');
                            marsOutput.appendLine(`[MARS] File saved on: ${filePath}`);

                            // 2. Compilación de Gradle
                            progress.report({ message: 'Compiling Gradle dependencies...' });
                            marsOutput.appendLine(`[MARS] Building Gradle to install ${featureData.name}...`);

                            await new Promise<void>((resolve, reject) => {
                                const isWindows = process.platform === 'win32';
                                const gradlewCmd = isWindows ? 'gradlew.bat' : './gradlew';
                                
                                const buildProcess = cp.spawn(gradlewCmd, ['clean', 'build', '-x', 'test', '--refresh-dependencies'], { cwd: rootPath, shell: true });

                                buildProcess.stdout.on('data', (data) => marsOutput.append(data.toString()));
                                buildProcess.stderr.on('data', (data) => marsOutput.append(data.toString()));

                                buildProcess.on('close', async (code) => {
                                    if (code !== 0) {
                                        marsOutput.appendLine(`[ERROR] Gradle fault ${code}`);
                                        vscode.window.showErrorMessage(`MARS: Installation failed during Gradle build.`);
                                        return reject(new Error(`Gradle fault. Code: ${code}`));
                                    }
                                    
                                    // 3. Refrescar Java
                                    progress.report({ message: 'Reloading Java Workspace...' });
                                    marsOutput.appendLine(`[MARS] Compiled with success. Refreshing Java extensions...`);
                                    
                                    try {
                                        const projectUri = workspaceFolders[0].uri;
                                        await vscode.commands.executeCommand('java.projectConfiguration.update', projectUri);
                                        await vscode.commands.executeCommand('java.clean.workspace');
                                        
                                        marsOutput.appendLine(`[MARS] ${featureData.name} successfully installed!`);
                                        vscode.window.showInformationMessage(`MARS: Feature '${featureData.name}' installed successfully!`);
                                        
                                        // Refrescar la vista del Marketplace después de instalar
                                        vscode.commands.executeCommand('mars.openMarketplace');
                                        
                                        resolve();
                                    } catch (javaError: any) {
                                        marsOutput.appendLine(`[WARNING] Java error detail: ${javaError.message}`);
                                        vscode.window.showInformationMessage(`MARS: Feature installed. (Note: Run "Clean Workspace" if you don't see the new imports)`);
                                        
                                        // Refrescar la vista del Marketplace después de instalar
                                        vscode.commands.executeCommand('mars.openMarketplace');
                                        
                                        resolve(); 
                                    }
                                });
                            });

                        } catch (error: any) {
                            marsOutput.appendLine(`[ERROR FATAL] ${error.message}`);
                            vscode.window.showErrorMessage(`MARS Installation Failed: ${error.message}`);
                        }
                    });
                }
            } 
            else if (message.command === 'openDocs') {
                vscode.env.openExternal(vscode.Uri.parse(message.url));
            }
        });
    });

    context.subscriptions.push(cmd);
}