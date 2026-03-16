// src/commands/launchTool.ts

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

import { ALLOY } from './alloy/alloyConstants';
import { GCS } from './gcs/gcsConstants';
import { LOGTOOL } from './logtool/logToolConstants';

export function registerLaunchToolCommand(context: vscode.ExtensionContext) {
    let launchCmd = vscode.commands.registerCommand('mars.launchTool', async () => {
        
        const config = vscode.workspace.getConfiguration('marsFramework');
        const toolsPath = config.get<string>('toolsPath', '');

        if (!toolsPath || !fs.existsSync(toolsPath)) {
            vscode.window.showErrorMessage('FAULT: MARS Tools directory not found. Please set it in Framework Settings.');
            return;
        }

        const knownTools = [
            { 
                label: '$(dashboard) MARS Alloy', 
                exe: path.join(toolsPath, ALLOY.FOLDER, ALLOY.EXE),
                cwd: path.join(toolsPath, ALLOY.FOLDER)
            },
            { 
                label: '$(terminal) MARS GCS', 
                exe: path.join(toolsPath, GCS.FOLDER, GCS.EXE),
                cwd: path.join(toolsPath, GCS.FOLDER)
            },
            { 
                label: '$(output) MARS LogTool', 
                exe: path.join(toolsPath, LOGTOOL.FOLDER, LOGTOOL.EXE),
                cwd: path.join(toolsPath, LOGTOOL.FOLDER)
            }
        ];

        const availableTools = knownTools.filter(tool => fs.existsSync(tool.exe));

        if (availableTools.length === 0) {
            vscode.window.showWarningMessage('No MARS tools installed yet. Go to Settings > Updates to download them.');
            return;
        }

        const selected = await vscode.window.showQuickPick(availableTools, {
            placeHolder: 'Select a MARS Tool to launch'
        });

        if (selected) {
            let toolTerminal = vscode.window.terminals.find(t => t.name === selected.label);
            
            if (!toolTerminal) {
                toolTerminal = vscode.window.createTerminal({
                    name: selected.label,
                    cwd: selected.cwd
                });
            }

            toolTerminal.show();

            toolTerminal.sendText(`.\\${path.basename(selected.exe)}`); 
            vscode.window.showInformationMessage(`Initializing ${selected.label}...`);
        }
    });

    context.subscriptions.push(launchCmd);
}