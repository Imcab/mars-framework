// src/commands/logtool/updateLogTool.ts

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import axios from 'axios';
import * as cp from 'child_process'; 
// @ts-ignore
import AdmZip = require('adm-zip');

// 1. Importamos las constantes
import { LOGTOOL } from './logToolConstants';

export function registerLogToolUpdaterCommand(context: vscode.ExtensionContext) {
    let updateLogToolCmd = vscode.commands.registerCommand('mars.updateLogTool', async () => {
        
        // 2. Leemos la ruta global
        const config = vscode.workspace.getConfiguration('marsFramework');
        const toolsPath = config.get<string>('toolsPath', '');

        if (!toolsPath) {
            vscode.window.showErrorMessage('FAULT: MARS Tools path is not configured in Settings.');
            return;
        }

        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Connecting to MARS Servers...",
            cancellable: false
        }, async (progress) => {
            
            try {
                progress.report({ message: "Checking for LogTool updates..." });
                
                // 3. Usamos la URL de las constantes
                const response = await axios.get(LOGTOOL.REPO_URL);
                
                const latestVersion = response.data.tag_name;
                const assets = response.data.assets;
                
                // Buscamos el ZIP usando el nombre en la constante
                const zipAsset = assets.find((a: any) => a.name === LOGTOOL.ZIP_FILE);
                if (!zipAsset) {
                    throw new Error(`${LOGTOOL.ZIP_FILE} not found in the latest release.`);
                }

                const userChoice = await vscode.window.showInformationMessage(
                    `MARS LogTool ${latestVersion} is available! Do you want to download or update the global LogTool?`,
                    "Yes, Update Now", "Cancel"
                );

                if (userChoice !== "Yes, Update Now") {
                    return; 
                }

                progress.report({ message: `Downloading MARS LogTool ${latestVersion}...` });
                
                const zipPath = path.join(os.tmpdir(), LOGTOOL.ZIP_FILE);
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
                
                // 4. Armamos el directorio destino global
                const targetDir = path.join(toolsPath, LOGTOOL.FOLDER);
                
                // ✨ LA MAGIA: ASESINAR EL PROCESO ZOMBIE USANDO LA CONSTANTE
                try {
                    if (os.platform() === 'win32') {
                        cp.execSync(`taskkill /f /im ${LOGTOOL.EXE}`, { stdio: 'ignore' });
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }
                } catch (e) {
                    // Ignorar
                }

                if (fs.existsSync(targetDir)) {
                    fs.rmSync(targetDir, { recursive: true, force: true });
                }
                fs.mkdirSync(targetDir, { recursive: true });

                const zip = new AdmZip(zipPath);
                zip.extractAllTo(targetDir, true);

                fs.unlinkSync(zipPath);

                vscode.window.showInformationMessage(`SYSTEM UPDATE: MARS LogTool successfully installed to ${latestVersion}!`);

            } catch (error: any) {
                console.error(error);
                vscode.window.showErrorMessage(`Update Failed: ${error.message}`);
            }
        });
    });

    context.subscriptions.push(updateLogToolCmd);
}