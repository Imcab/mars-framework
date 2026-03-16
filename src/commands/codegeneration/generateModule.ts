// src/commands/generateModule.ts

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function registerGenerateModuleCommand(context: vscode.ExtensionContext) {
    let generateModule = vscode.commands.registerCommand('mars.createModule', async (uri: vscode.Uri) => {
        
        if (!uri) {
            vscode.window.showErrorMessage('FAULT: Please right-click on a folder to create a MARS Module.');
            return;
        }

        const moduleName = await vscode.window.showInputBox({
            prompt: 'Enter the Module Name (e.g. Shooter, Climber)',
            placeHolder: 'Shooter'
        });

        if (!moduleName) return; 

        // Nombres formateados
        const Name = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
        const upperName = Name.toUpperCase();
        const lowerName = Name.toLowerCase();

        const normalizedPath = uri.fsPath.replace(/\\/g, '/');
        const match = normalizedPath.match(/(.*\/src\/main\/java\/frc\/robot)/);
        
        if (!match) {
            vscode.window.showErrorMessage('FAULT: Could not find "frc/robot" base path. Are you inside an FRC project?');
            return;
        }

        const basePath = match[1];

        // --- RUTA 1: FORZAR CREACIÓN EN core/modules/<lowernamemodule> ---
        const folderName = `${lowerName}module`; 
        const targetDir = path.join(basePath, 'core', 'modules', folderName);

        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        const ioPath = path.join(targetDir, `${Name}IO.java`);
        const subPath = path.join(targetDir, `${Name}.java`);

        // Como ahora forzamos la ruta, el package name siempre será este:
        const targetPackage = `frc.robot.core.modules.${folderName}`;

        // --- RUTA 2: Requests ---
        const requestDir = path.join(basePath, 'core', 'requests', 'moduleRequests');
        const requestPath = path.join(requestDir, `${Name}Request.java`);

        // --- RUTA 3: Diagnostics ---
        const diagDir = path.join(basePath, 'diagnostics');
        const diagPath = path.join(diagDir, `${Name}Code.java`);

        // --- RUTA 4: Factories ---
        const factoryDir = path.join(basePath, 'configuration', 'factories');
        const factoryPath = path.join(factoryDir, `${Name}RequestFactory.java`);

        const ensureDir = (dir: string) => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); };
        ensureDir(requestDir);
        ensureDir(diagDir);
        ensureDir(factoryDir);

        const ioContent = `package ${targetPackage};

import mars.source.models.singlemodule.Data;
import mars.source.models.singlemodule.IO;
import mars.src.processor.Fallback;

@Fallback
public interface ${Name}IO extends IO<${Name}IO.${Name}Inputs> {

    public static class ${Name}Inputs extends Data<${Name}Inputs> {
        // TODO: Define your hardware inputs here
    }

    //TODO: Define your IO actions here
}
`;

        const requestContent = `package frc.robot.core.requests.moduleRequests;

import frc.robot.diagnostics.${Name}Code;
import ${targetPackage}.${Name}IO;
import ${targetPackage}.${Name}IO.${Name}Inputs;
import mars.source.diagnostics.ActionStatus;
import mars.source.requests.Request;

public interface ${Name}Request extends Request<${Name}Inputs, ${Name}IO> {

    public static class Idle implements ${Name}Request {
        @Override
        public ActionStatus apply(${Name}Inputs data, ${Name}IO actor) {
            //TODO: Define your IDLE Action Here
            return ActionStatus.of(${Name}Code.IDLE, "Idle");
        }
    }
}
`;

        const diagContent = `package frc.robot.diagnostics;

import edu.wpi.first.wpilibj.util.Color;
import mars.source.diagnostics.DiagnosticPattern;
import mars.source.diagnostics.StatusCode;

public enum ${Name}Code implements StatusCode {

    IDLE(Severity.OK, DiagnosticPattern.breathing(Color.kDarkGreen)),
    MANUAL_OVERRIDE(Severity.WARNING, DiagnosticPattern.blinkSlow(Color.kPurple));

    //TODO: Define your states here

    private final Severity severity;
    private final DiagnosticPattern pattern;

    ${Name}Code(Severity severity, DiagnosticPattern pattern) {
        this.severity = severity;
        this.pattern = pattern;
    }

    @Override public Severity getSeverity() { return this.severity; }
    @Override public String getName() { return this.name(); }
    @Override public DiagnosticPattern getVisualPattern() { return this.pattern; }
}
`;

        const subContent = `package ${targetPackage};

import java.util.function.Supplier;
import edu.wpi.first.wpilibj2.command.Command;
import frc.robot.configuration.KeyManager;
import frc.robot.configuration.factories.${Name}RequestFactory;
import ${targetPackage}.${Name}IO.${Name}Inputs;
import frc.robot.core.requests.moduleRequests.${Name}Request;
import mars.source.diagnostics.ActionStatus;
import mars.source.models.SubsystemBuilder;
import mars.source.models.Telemetry;
import mars.source.models.singlemodule.ModularSubsystem;
import frc.robot.configuration.KeyManager.CommonTables;

import com.stzteam.forgemini.io.NetworkIO;

public class ${Name} extends ModularSubsystem<${Name}Inputs, ${Name}IO> {

    public ${Name}(${Name}IO io) {
        super(SubsystemBuilder.<${Name}Inputs, ${Name}IO>setup()
            .key(KeyManager.${upperName}_KEY) //TODO: Add your constant to your KeyManager
            .hardware(io, new ${Name}Inputs())
            .request(${Name}RequestFactory.idle)
            .telemetry(new ${Name}Telemetry())
        );

        registerTelemetry(new ${Name}Telemetry());
        this.setDefaultCommand(runRequest(() -> ${Name}RequestFactory.idle));
    }

    @Override
    public ${Name}Inputs getState() { return inputs; }

    @Override
    public void absolutePeriodic(${Name}Inputs inputs) {}

    public Command setControl(Supplier<${Name}Request> request) {
        return runRequest(request);
    }

    public static class ${Name}Telemetry extends Telemetry<${Name}Inputs> {
        @Override
        public void telemeterize(${Name}Inputs data, ActionStatus lastStatus) {
            // TODO: Add NetworkTables or telemetry here

            if(lastStatus != null && lastStatus.code != null){
                NetworkIO.set(KeyManager.${upperName}_KEY, CommonTables.PAYLOAD_NAME_KEY, lastStatus.getPayload().name());
                NetworkIO.set(KeyManager.${upperName}_KEY, CommonTables.PAYLOAD_HEX_KEY, lastStatus.getPayload().colorHex());
                NetworkIO.set(KeyManager.${upperName}_KEY, CommonTables.PAYLOAD_MESSAGE_KEY, lastStatus.getPayload().message());
            }
        }
    }
}
`;

        const factoryContent = `package frc.robot.configuration.factories;

import frc.robot.core.requests.moduleRequests.${Name}Request;
import frc.robot.core.requests.moduleRequests.${Name}Request.Idle;

public class ${Name}RequestFactory {

    public static final ${Name}Request.Idle idle = new Idle();

}
`;

        fs.writeFileSync(ioPath, ioContent);
        fs.writeFileSync(requestPath, requestContent);
        fs.writeFileSync(diagPath, diagContent);
        fs.writeFileSync(subPath, subContent);
        fs.writeFileSync(factoryPath, factoryContent);

        const keyString = `public static final String ${upperName}_KEY = "${Name}";`;
        vscode.env.clipboard.writeText(keyString);

        vscode.window.showInformationMessage(`MARS Module '${Name}' skeleton generated! KeyManager string copied to clipboard.`);
        
        const document = await vscode.workspace.openTextDocument(subPath);
        vscode.window.showTextDocument(document);
    });

    context.subscriptions.push(generateModule);
}