import * as vscode from 'vscode';

import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

import { registerProjectCreatorCommand } from './commands/projectCreator';
import { MarsSidePanelProvider } from './views/side';
import { registerSettingsCommand } from './commands/settings';
import { registerUpdaterCommand } from './commands/gcs/updateGCS';
import { registerAlloyUpdaterCommand } from './commands/alloy/updateAlloy';
import { registerLogToolUpdaterCommand } from './commands/logtool/updateLogTool';
import { registerGenerateModuleCommand } from './commands/codegeneration/generateModule';
import { registerShortcutCommand } from './commands/gcs/createShortCutGCS';
import { registerShortcutAlloyCommand } from './commands/alloy/createShortCutAlloy';
import { registerShortcutLogToolCommand } from './commands/logtool/createShortCutLogTool';
import { registerDownloadFeatureCommand } from './commands/marketplace/downloadFeature';
import { registerLaunchToolCommand } from './commands/launchTool';
import { registerDiagnosticCommand } from './commands/codegeneration/createDiagnostic';
import { registerMarketplaceCommand } from './commands/marketplace/marketplace';

export function activate(context: vscode.ExtensionContext) {
    console.log('MARS Framework extension is now active!');

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            'mars-actions', 
            new MarsSidePanelProvider(context.extensionUri)
        )
    );

    //PANELES
    registerProjectCreatorCommand(context);
    registerSettingsCommand(context);
    registerLaunchToolCommand(context);
    registerMarketplaceCommand(context);

    //UPDATERS
    registerUpdaterCommand(context); //GCS
    registerAlloyUpdaterCommand(context); //ALLOY
    registerLogToolUpdaterCommand(context); //LOGTOOL

    //GRENERACION DE CODIGO
    registerGenerateModuleCommand(context);

    //SHORTCUTS DE PC
    registerShortcutCommand(context);
    registerShortcutAlloyCommand(context);
    registerShortcutLogToolCommand(context);

    //DESCARGAR LIBRERIAS
    registerDownloadFeatureCommand(context);

    registerDiagnosticCommand(context);

    const config = vscode.workspace.getConfiguration('marsFramework');
    let currentToolsPath = config.get<string>('toolsPath', '');

    if (!currentToolsPath) {

        currentToolsPath = path.join(os.homedir(), 'MARSTools');
        
        config.update('toolsPath', currentToolsPath, vscode.ConfigurationTarget.Global);
    }

    if (!fs.existsSync(currentToolsPath)) {
        try {

            fs.mkdirSync(currentToolsPath, { recursive: true });
            vscode.window.showInformationMessage(`MARS Tools directory automatically created at: ${currentToolsPath}`);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to create MARS Tools directory: ${error}`);
        }
    }
}

export function deactivate() {}