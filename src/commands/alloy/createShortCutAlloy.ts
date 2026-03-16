// src/commands/createShortcutAlloy.ts

import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
import * as cp from 'child_process';
import * as fs from 'fs';
import { ALLOY } from './alloyConstants';

export function registerShortcutAlloyCommand(context: vscode.ExtensionContext) {
    let shortcutCmd = vscode.commands.registerCommand('mars.createShortcutAlloy', async () => {
        
        const config = vscode.workspace.getConfiguration('marsFramework');
        const toolsPath = config.get<string>('toolsPath', '');

        if (!toolsPath) {
            vscode.window.showErrorMessage('FAULT: MARS Tools path is not configured in Settings.');
            return;
        }

        const exePath = path.join(toolsPath, ALLOY.FOLDER, ALLOY.EXE);

        if (!fs.existsSync(exePath)) {
            vscode.window.showErrorMessage('FAULT: Executable not found. Please download or update MARS Alloy first.');
            return;
        }

        const desktopPath = path.join(os.homedir(), 'Desktop', 'MARS Alloy.lnk');
        const workingDir = path.dirname(exePath);

        const psScript = `
            $WshShell = New-Object -comObject WScript.Shell
            $Shortcut = $WshShell.CreateShortcut('${desktopPath}')
            $Shortcut.TargetPath = '${exePath}'
            $Shortcut.WorkingDirectory = '${workingDir}'
            $Shortcut.IconLocation = '${exePath}, 0' 
            $Shortcut.Description = 'STZ Robotics - MARS Alloy Dashboard'
            $Shortcut.Save()
        `;

        const command = `powershell.exe -NoProfile -Command "${psScript.replace(/\n/g, ';')}"`;

        cp.exec(command, (error) => {
            if (error) {
                vscode.window.showErrorMessage(`Shortcut Creation Failed: ${error.message}`);
                return;
            }
            vscode.window.showInformationMessage('SYSTEM UPDATE: MARS Alloy shortcut successfully created on Desktop!');
        });
    });

    context.subscriptions.push(shortcutCmd);
}