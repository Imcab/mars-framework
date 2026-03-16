// src/commands/createDiagnostic.ts

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { getDiagnosticHtml } from '../../views/diagnosticWebview';

export function registerDiagnosticCommand(context: vscode.ExtensionContext) {
    let cmd = vscode.commands.registerCommand('mars.createDiagnostic', () => {
        
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('FAULT: Open a MARS project first to create a diagnostic enum.');
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'marsDiagnosticStudio', 'MARS Diagnostic Studio', vscode.ViewColumn.One, 
            { enableScripts: true, localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')] }
        );

        const imagePath = vscode.Uri.joinPath(context.extensionUri, 'media', 'mars-banner.png');
        const imageUri = panel.webview.asWebviewUri(imagePath);

        panel.webview.html = getDiagnosticHtml(imageUri.toString());

        panel.webview.onDidReceiveMessage(async message => {
            if (message.command === 'error') {
                vscode.window.showErrorMessage(message.text);
            } 
            else if (message.command === 'generate') {
                const subName = message.subName; // e.g., "Turret"
                const className = `${subName}Code`;
                
                // Construimos la lista de enums
                const statesMap = message.states.map((s: any) => 
                    `  ${s.name}(Severity.${s.severity}, DiagnosticPattern.solid(Color.k${s.color}))`
                ).join(',\n');

                // Plantilla de Java
                const javaCode = `// Copyright (c) 2026 STZ Robotics
// Open Source Software; you can modify and/or share it under the terms of
// the MIT license file in the root directory of this project.

package frc.robot.diagnostics;

import com.stzteam.mars.diagnostics.DiagnosticPattern;
import com.stzteam.mars.diagnostics.StatusCode;
import edu.wpi.first.wpilibj.util.Color;

public enum ${className} implements StatusCode {
${statesMap};

  private final Severity severity;
  private final DiagnosticPattern pattern;

  ${className}(Severity severity, DiagnosticPattern pattern) {
    this.severity = severity;
    this.pattern = pattern;
  }

  @Override
  public Severity getSeverity() {
    return this.severity;
  }

  @Override
  public String getName() {
    return this.name();
  }

  @Override
  public DiagnosticPattern getVisualPattern() {
    return this.pattern;
  }
}
`;

                // Asumimos estructura estándar de FRC
                const targetFolder = path.join(workspaceFolders[0].uri.fsPath, 'src', 'main', 'java', 'frc', 'robot', 'diagnostics');
                const targetFile = path.join(targetFolder, `${className}.java`);

                try {
                    // Si no existe la carpeta diagnostics, la creamos
                    if (!fs.existsSync(targetFolder)) {
                        fs.mkdirSync(targetFolder, { recursive: true });
                    }

                    fs.writeFileSync(targetFile, javaCode, 'utf8');
                    
                    vscode.window.showInformationMessage(`SYSTEM UPDATE: ${className}.java generated successfully!`);
                    
                    // Abrimos el archivo recién creado en el editor
                    const doc = await vscode.workspace.openTextDocument(targetFile);
                    await vscode.window.showTextDocument(doc);
                    
                    panel.dispose();
                } catch (error: any) {
                    vscode.window.showErrorMessage(`Failed to write file: ${error.message}`);
                }
            }
        });
    });

    context.subscriptions.push(cmd);
}