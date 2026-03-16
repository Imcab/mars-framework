// src/commands/gcs/createShortcut.ts

import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
import * as cp from 'child_process';
import * as fs from 'fs';

// 1. Importamos tus constantes de GCS
import { GCS } from './gcsConstants';

export function registerShortcutCommand(context: vscode.ExtensionContext) {
    let shortcutCmd = vscode.commands.registerCommand('mars.createShortcutGCS', async () => {
        
        // 2. Leemos la ruta global de los Settings
        const config = vscode.workspace.getConfiguration('marsFramework');
        const toolsPath = config.get<string>('toolsPath', '');

        if (!toolsPath) {
            vscode.window.showErrorMessage('FAULT: MARS Tools path is not configured in Settings.');
            return;
        }

        // 3. Armamos la ruta usando las constantes y el path global
        const exePath = path.join(toolsPath, GCS.FOLDER, GCS.EXE);

        if (!fs.existsSync(exePath)) {
            vscode.window.showErrorMessage(`FAULT: Executable not found. Please download or update MARS GCS first.`);
            return;
        }

        const desktopPath = path.join(os.homedir(), 'Desktop', 'MARS GCS.lnk');
        const workingDir = path.dirname(exePath);

        const psScript = `
            $WshShell = New-Object -comObject WScript.Shell
            $Shortcut = $WshShell.CreateShortcut('${desktopPath}')
            $Shortcut.TargetPath = '${exePath}'
            $Shortcut.WorkingDirectory = '${workingDir}'
            $Shortcut.IconLocation = '${exePath}, 0' 
            $Shortcut.Description = 'STZ Robotics - MARS Ground Control'
            $Shortcut.Save()
        `;

        const command = `powershell.exe -NoProfile -Command "${psScript.replace(/\n/g, ';')}"`;

        cp.exec(command, (error) => {
            if (error) {
                vscode.window.showErrorMessage(`Shortcut Creation Failed: ${error.message}`);
                return;
            }
            vscode.window.showInformationMessage('SYSTEM UPDATE: MARS GCS shortcut successfully created on Desktop!');
        });
    });

    context.subscriptions.push(shortcutCmd);
}