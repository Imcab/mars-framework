import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import axios from 'axios';
import * as cp from 'child_process';

const marsOutput = vscode.window.createOutputChannel("MARS Feature Installer");

export function registerDownloadFeatureCommand(context: vscode.ExtensionContext) {
    let cmd = vscode.commands.registerCommand('mars.downloadFeature', async () => {
        
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('MARS: Please open mars workspace first.');
            return;
        }

        const featureUrl = await vscode.window.showInputBox({
            prompt: 'Paste JSON Feature URL here',
            placeHolder: 'Ej. https://imcab.github.io/MARS-LimelightFeature/MarsFeature.json',
            ignoreFocusOut: true
        });

        if (!featureUrl) return;

        marsOutput.clear();
        marsOutput.show();
        marsOutput.appendLine(`[MARS] Starting download of feature: ${featureUrl}`);

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "MARS Framework",
            cancellable: false
        }, async (progress) => {
            
            try {
                // FASE 1: Descarga
                progress.report({ message: 'Downloading...' });
                const response = await axios.get(featureUrl);
                const featureData = response.data;

                if (!featureData.featureId || !featureData.mavenUrls) {
                    throw new Error('Invalid JSON Format.');
                }

                const rootPath = workspaceFolders[0].uri.fsPath;
                const featuresPath = path.join(rootPath, 'workspace/features');
                if (!fs.existsSync(featuresPath)) fs.mkdirSync(featuresPath, { recursive: true });

                const filePath = path.join(featuresPath, `${featureData.featureId}.json`);
                fs.writeFileSync(filePath, JSON.stringify(featureData, null, 2), 'utf-8');
                
                marsOutput.appendLine(`[MARS] File saved on: ${filePath}`);

                progress.report({ message: `Cleaning cache and compiling...` });
                marsOutput.appendLine(`[MARS] Building Gradle to install ${featureData.name}...`);

                await new Promise<void>((resolve, reject) => {
                    const isWindows = process.platform === 'win32';
                    const gradlewCmd = isWindows ? 'gradlew.bat' : './gradlew';
                    
                    const buildProcess = cp.spawn(gradlewCmd, ['clean', 'build', '-x', 'test', '--refresh-dependencies'], { cwd: rootPath, shell: true });

                    buildProcess.stdout.on('data', (data) => {
                        marsOutput.append(data.toString());
                    });

                    buildProcess.stderr.on('data', (data) => {
                        marsOutput.append(data.toString());
                    });

                    buildProcess.on('close', async (code) => {
                        if (code !== 0) {
                            marsOutput.appendLine(`[ERROR] Gradle fault ${code}`);
                            vscode.window.showErrorMessage(`MARS: Code has errors.`);
                            return reject(new Error(`Gradle fault. Code: ${code}`));
                        }
                        
                        progress.report({ message: 'Reloading Java Workspace...' });
                        marsOutput.appendLine(`[MARS] Compiled with success. Running Java extensions...`);
                        
                        try {
                            const projectUri = workspaceFolders[0].uri;
                            
                            await vscode.commands.executeCommand('java.projectConfiguration.update', projectUri);
                            
                            await vscode.commands.executeCommand('java.clean.workspace');
                            
                            marsOutput.appendLine(`[MARS] All set!`);
                            vscode.window.showInformationMessage(`MARS: Feature '${featureData.name}' installed`);
                            resolve();
                        } catch (javaError: any) {
                            marsOutput.appendLine(`[WARNING] Java error detail: ${javaError.message}`);
                            vscode.window.showInformationMessage(`MARS: Feature installed. (Note: Run java clean workspace if you don't se the imports)`);
                            resolve(); 
                        }
                    });
                });

            } catch (error: any) {
                marsOutput.appendLine(`[ERROR FATAL] ${error.message}`);
                vscode.window.showErrorMessage(`MARS Falló: ${error.message}`);
            }
        });
    });

    context.subscriptions.push(cmd);
}