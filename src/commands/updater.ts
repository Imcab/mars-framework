// src/commands/updater.ts

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import axios from 'axios';
// @ts-ignore (En caso de que el linter se ponga especial con adm-zip)
import AdmZip = require('adm-zip'); 

export function registerUpdaterCommand(context: vscode.ExtensionContext) {
    let updateCmd = vscode.commands.registerCommand('mars.updateGCS', async () => {
        
        // 1. Verificar que estamos dentro de un proyecto
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('FAULT: Open a MARS project first to update its GCS.');
            return;
        }
        const projectPath = workspaceFolders[0].uri.fsPath;

        // 2. Iniciar el proceso con una barra de carga elegante
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Connecting to MARS Servers...",
            cancellable: false
        }, async (progress) => {
            
            try {
                // 3. Checar la API de GitHub para ver el último release
                progress.report({ message: "Checking for updates..." });
                const ghUrl = 'https://api.github.com/repos/Imcab/MarsGCS/releases/latest';
                const response = await axios.get(ghUrl);
                
                const latestVersion = response.data.tag_name; // ej. "v1.0.0"
                const assets = response.data.assets;
                
                // Buscar el zip en los assets
                const zipAsset = assets.find((a: any) => a.name === 'mars_terminal.zip');
                if (!zipAsset) {
                    throw new Error("mars_terminal.zip not found in the latest release.");
                }

                // 4. Preguntar al usuario si quiere actualizar
                const userChoice = await vscode.window.showInformationMessage(
                    `MARS GCS ${latestVersion} is available! Do you want to update the terminal for this project?`,
                    "Yes, Update Now", "Cancel"
                );

                if (userChoice !== "Yes, Update Now") {
                    return; // El usuario canceló
                }

                // 5. Descargar el .zip a la carpeta temporal de la compu
                progress.report({ message: `Downloading MARS GCS ${latestVersion}...` });
                
                const zipPath = path.join(os.tmpdir(), 'mars_terminal.zip');
                const writer = fs.createWriteStream(zipPath);
                
                const downloadResponse = await axios({
                    url: zipAsset.browser_download_url,
                    method: 'GET',
                    responseType: 'stream'
                });

                downloadResponse.data.pipe(writer);

                // Esperar a que termine de descargar
                await new Promise<void>((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });

                // 6. Preparar la carpeta del proyecto y extraer
                progress.report({ message: "Extracting and installing..." });
                
                const targetDir = path.join(projectPath, 'mars_terminal', 'Release');
                
                // Borrar la carpeta vieja si existe
                if (fs.existsSync(targetDir)) {
                    fs.rmSync(targetDir, { recursive: true, force: true });
                }
                // Crear la carpeta de nuevo
                fs.mkdirSync(targetDir, { recursive: true });

                // Descomprimir
                const zip = new AdmZip(zipPath);
                zip.extractAllTo(targetDir, true);

                // Limpiar el .zip temporal para no dejar basura
                fs.unlinkSync(zipPath);

                vscode.window.showInformationMessage(`SYSTEM UPDATE: MARS GCS successfully updated to ${latestVersion}!`);

            } catch (error: any) {
                console.error(error);
                vscode.window.showErrorMessage(`Update Failed: ${error.message}`);
            }
        });
    });

    context.subscriptions.push(updateCmd);
}