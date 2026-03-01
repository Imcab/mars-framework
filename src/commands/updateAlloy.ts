// src/commands/updateAlloy.ts

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import axios from 'axios';
// @ts-ignore
import AdmZip = require('adm-zip');

export function registerAlloyUpdaterCommand(context: vscode.ExtensionContext) {
    let updateAlloyCmd = vscode.commands.registerCommand('mars.updateAlloy', async () => {
        
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('FAULT: Open a MARS project first to update Alloy.');
            return;
        }
        const projectPath = workspaceFolders[0].uri.fsPath;

        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Connecting to MARS Servers...",
            cancellable: false
        }, async (progress) => {
            
            try {
                progress.report({ message: "Checking for Alloy updates..." });
                // APUNTANDO AL NUEVO REPOSITORIO DE ALLOY
                const ghUrl = 'https://api.github.com/repos/Imcab/MarsAlloy/releases/latest';
                const response = await axios.get(ghUrl);
                
                const latestVersion = response.data.tag_name;
                const assets = response.data.assets;
                
                // BUSCANDO EL ZIP DE ALLOY
                const zipAsset = assets.find((a: any) => a.name === 'mars-alloy.zip');
                if (!zipAsset) {
                    throw new Error("mars-alloy.zip not found in the latest release.");
                }

                const userChoice = await vscode.window.showInformationMessage(
                    `MARS Alloy ${latestVersion} is available! Do you want to update the dashboard for this project?`,
                    "Yes, Update Now", "Cancel"
                );

                if (userChoice !== "Yes, Update Now") {
                    return; 
                }

                progress.report({ message: `Downloading MARS Alloy ${latestVersion}...` });
                
                const zipPath = path.join(os.tmpdir(), 'mars-alloy.zip');
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
                const targetDir = path.join(projectPath, 'mars-alloy', 'Release');
                
                if (fs.existsSync(targetDir)) {
                    fs.rmSync(targetDir, { recursive: true, force: true });
                }
                fs.mkdirSync(targetDir, { recursive: true });

                const zip = new AdmZip(zipPath);
                zip.extractAllTo(targetDir, true);

                fs.unlinkSync(zipPath);

                vscode.window.showInformationMessage(`SYSTEM UPDATE: MARS Alloy successfully updated to ${latestVersion}!`);

            } catch (error: any) {
                console.error(error);
                vscode.window.showErrorMessage(`Update Failed: ${error.message}`);
            }
        });
    });

    context.subscriptions.push(updateAlloyCmd);
}