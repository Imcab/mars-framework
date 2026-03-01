import * as vscode from 'vscode';

export function registerBuildCommands(context: vscode.ExtensionContext) {
    let deployCmd = vscode.commands.registerCommand('mars.deploy', () => {
        const terminal = vscode.window.createTerminal("MARS Deploy");
        terminal.show();
        terminal.sendText(".\\deploy_mars.bat");
    });

    let simCmd = vscode.commands.registerCommand('mars.simulate', () => {
        const terminal = vscode.window.createTerminal("MARS Sim");
        terminal.show();
        terminal.sendText(".\\simulate_mars.bat");
    });

    context.subscriptions.push(deployCmd, simCmd);
}