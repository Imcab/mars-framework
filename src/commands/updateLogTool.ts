
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import axios from 'axios';
// @ts-ignore
import AdmZip = require('adm-zip');

export function registerLogToolUpdaterCommand(context: vscode.ExtensionContext) {
    let updateLogToolCmd = vscode.commands.registerCommand('mars.updateLogTool', async () => {
        
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('FAULT: Open a MARS project first to update LogTool.');
            return;
        }
        const projectPath = workspaceFolders[0].uri.fsPath;

        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Connecting to MARS Servers...",
            cancellable: false
        }, async (progress) => {
            
            try {
                progress.report({ message: "Checking for LogTool updates..." });
                // APUNTANDO AL NUEVO REPOSITORIO DE ALLOY
                const ghUrl = 'https://api.github.com/repos/Imcab/MarsLogTool/releases/latest';
                const response = await axios.get(ghUrl);
                
                const latestVersion = response.data.tag_name;
                const assets = response.data.assets;
                
                // BUSCANDO EL ZIP DE ALLOY
                const zipAsset = assets.find((a: any) => a.name === 'mars-logtool.zip');
                if (!zipAsset) {
                    throw new Error("mars-logtool.zip not found in the latest release.");
                }

                const userChoice = await vscode.window.showInformationMessage(
                    `MARS LogTool ${latestVersion} is available! Do you want to update the dashboard for this project?`,
                    "Yes, Update Now", "Cancel"
                );

                if (userChoice !== "Yes, Update Now") {
                    return; 
                }

                progress.report({ message: `Downloading MARS LogTool ${latestVersion}...` });
                
                const zipPath = path.join(os.tmpdir(), 'mars-logtool.zip');
                const writer = fs.createWriteStream(zipPath);
                
                const downloadResponse = await axios({
                    url: zipAsset.browser_download_url,
                    method: 'GET',
                    responseType: 'stream'
                });

                downloadResponse.data.pipe(writer);

                await new Promise<void>((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });

                progress.report({ message: "Extracting and installing..." });
                
                // LA RUTA EXACTA DE ALLOY EN TU PROYECTO
                const targetDir = path.join(projectPath, 'mars-logtool', 'Release');
                
                if (fs.existsSync(targetDir)) {
                    fs.rmSync(targetDir, { recursive: true, force: true });
                }
                fs.mkdirSync(targetDir, { recursive: true });

                const zip = new AdmZip(zipPath);
                zip.extractAllTo(targetDir, true);

                fs.unlinkSync(zipPath);

                vscode.window.showInformationMessage(`SYSTEM UPDATE: MARS LogTool successfully updated to ${latestVersion}!`);

            } catch (error: any) {
                console.error(error);
                vscode.window.showErrorMessage(`Update Failed: ${error.message}`);
            }
        });
    });

    context.subscriptions.push(updateLogToolCmd);
}