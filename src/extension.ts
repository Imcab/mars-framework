import * as vscode from 'vscode';

import { registerTerminalCommand } from './commands/terminalCommand';
import { registerBuildCommands } from './commands/buildCommands';
import { registerProjectCreatorCommand } from './commands/projectCreator';
import { MarsSidePanelProvider } from './views/side';
import { registerSettingsCommand } from './commands/settings';
import { registerAlloyCommand } from './commands/alloy';
import { registerUpdaterCommand } from './commands/updater';
import { registerAlloyUpdaterCommand } from './commands/updateAlloy';
import { registerLogToolUpdaterCommand } from './commands/updateLogTool';
import { registerLogToolCommand } from './commands/logtool';
import { registerGenerateModuleCommand } from './commands/generateModule';

export function activate(context: vscode.ExtensionContext) {
    console.log('MARS Framework extension is now active!');

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            'mars-actions', 
            new MarsSidePanelProvider(context.extensionUri)
        )
    );

    registerTerminalCommand(context);
    registerBuildCommands(context);
    registerProjectCreatorCommand(context);
    registerSettingsCommand(context);
    registerAlloyCommand(context);
    registerLogToolCommand(context);
    registerUpdaterCommand(context);
    registerAlloyUpdaterCommand(context);
    registerLogToolUpdaterCommand(context);

    registerGenerateModuleCommand(context);
}

export function deactivate() {}