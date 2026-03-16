// src/commands/gcs/updater.ts

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import axios from 'axios';
import * as cp from 'child_process';
// @ts-ignore
import AdmZip = require('adm-zip'); 

// 1. Importamos las constantes de GCS
import { GCS } from './gcsConstants';

export function registerUpdaterCommand(context: vscode.ExtensionContext) {
    let updateCmd = vscode.commands.registerCommand('mars.updateGCS', async () => {
        
        // 2. Leemos la ruta global (ya no buscamos proyectos abiertos)
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
                progress.report({ message: "Checking for updates..." });
                
                // 3. Usamos la URL de nuestras constantes
                const response = await axios.get(GCS.REPO_URL);
                
                const latestVersion = response.data.tag_name;
                const assets = response.data.assets;
                
                // Usamos el nombre del ZIP de nuestras constantes
                const zipAsset = assets.find((a: any) => a.name === GCS.ZIP_FILE);
                if (!zipAsset) {
                    throw new Error(`${GCS.ZIP_FILE} not found in the latest release.`);
                }

                const userChoice = await vscode.window.showInformationMessage(
                    `MARS GCS ${latestVersion} is available! Do you want to download or update the global terminal?`,
                    "Yes, Update Now", "Cancel"
                );

                if (userChoice !== "Yes, Update Now") {
                    return; 
                }

                progress.report({ message: `Downloading MARS GCS ${latestVersion}...` });
                
                const zipPath = path.join(os.tmpdir(), GCS.ZIP_FILE);
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
                
                // 4. Armamos el directorio destino usando la ruta global + constantes
                const targetDir = path.join(toolsPath, GCS.FOLDER);
                
                // ✨ LA MAGIA: ASESINAR EL PROCESO DE LA GCS
                try {
                    if (os.platform() === 'win32') {
                        // Usamos el ejecutable de nuestras constantes
                        cp.execSync(`taskkill /f /im ${GCS.EXE}`, { stdio: 'ignore' });
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }
                } catch (e) {
                    // Ignorar si no estaba corriendo
                }

                if (fs.existsSync(targetDir)) {
                    fs.rmSync(targetDir, { recursive: true, force: true });
                }
                fs.mkdirSync(targetDir, { recursive: true });

                const zip = new AdmZip(zipPath);
                zip.extractAllTo(targetDir, true);

                fs.unlinkSync(zipPath);

                vscode.window.showInformationMessage(`SYSTEM UPDATE: MARS GCS successfully installed to ${latestVersion}!`);

            } catch (error: any) {
                console.error(error);
                vscode.window.showErrorMessage(`Update Failed: ${error.message}`);
            }
        });
    });

    context.subscriptions.push(updateCmd);
}