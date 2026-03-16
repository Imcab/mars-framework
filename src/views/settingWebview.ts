export function getSettingsHtml(logoUri: string, styleUri: string, team: string, workPath: string, toolsPath: string, aSave: boolean): string {
    return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src *; style-src 'unsafe-inline' https://fonts.googleapis.com vscode-resource: https:; font-src https://fonts.gstatic.com; script-src 'unsafe-inline';">
            
            <link rel="stylesheet" href="${styleUri}">
        </head>
        <body>
            <div class="mars-mesh">
                <div class="mars-glow mars-rojo-1"></div>
                <div class="mars-glow mars-rojo-2"></div>
                <div class="mars-glow mars-rojo-3"></div>
                <div class="mars-glow mars-rojo-4"></div>
            </div>

            <div class="dashboard-container">
                <div class="header-section">
                    <img src="${logoUri}" class="main-banner" alt="MARS Logo">
                    <header class="top-bar">
                        <h1>FRAMEWORK SETTINGS</h1>
                    </header>
                </div>

                <div class="card-grid">
                    <div class="card">
                        <div class="card-header">Core Configuration</div>
                        <div class="form-group">
                            <label for="tNumber">Default Team Number</label>
                            <input type="number" id="tNumber" value="${team}" placeholder="e.g. 3472">
                        </div>
                        <div class="checkbox-wrapper">
                            <input type="checkbox" id="aSave" ${aSave ? 'checked' : ''}>
                            <label for="aSave">Auto-Save all files before deploying to RoboRIO</label>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">System Paths</div>
                        
                        <div class="form-group">
                            <label for="workPath">Default Workspace Base Folder</label>
                            <div class="input-with-button">
                                <input type="text" id="workPath" value="${workPath.replace(/\\/g, '\\\\')}" readonly placeholder="Select default projects folder...">
                                <button class="btn btn-outline" onclick="browseFolder('workPath')">Browse</button>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="toolsPath">MARS Tools Directory (Global)</label>
                            <div class="input-with-button">
                                <input type="text" id="toolsPath" value="${toolsPath.replace(/\\/g, '\\\\')}" readonly placeholder="Select tools directory...">
                                <button class="btn btn-outline" onclick="browseFolder('toolsPath')">Browse</button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">Updates & Maintenance</div>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                            <button class="btn btn-outline" onclick="sendCommand('mars.updateGCS')">Update (or install) GCS</button>
                            <button class="btn btn-outline" onclick="sendCommand('mars.updateAlloy')">Update (or install) Alloy</button>
                            <button class="btn btn-outline" onclick="sendCommand('mars.updateLogTool')">Update (or install) LogTool</button>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">Desktop Shortcuts</div>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                            <button class="btn btn-outline" onclick="sendCommand('mars.createShortcutGCS')">Create GCS Shortcut</button>
                            <button class="btn btn-outline" onclick="sendCommand('mars.createShortcutAlloy')">Create Alloy Shortcut</button>
                            <button class="btn btn-outline" onclick="sendCommand('mars.createShortcutLogTool')">Create LogTool Shortcut</button>
                        </div>
                    </div>
                </div>
                
                <button id="saveBtn" class="btn btn-primary-action" onclick="save()">SAVE CONFIGURATION</button>
            </div>
            
            <script>
                const vscode = acquireVsCodeApi();
                
                // Función para enviar los comandos de los nuevos botones a VS Code
                function sendCommand(cmd) { 
                    vscode.postMessage({ command: cmd }); 
                }
                
                function browseFile(targetId) { vscode.postMessage({ command: 'selectFile', targetId: targetId }); }
                function browseFolder(targetId) { vscode.postMessage({ command: 'selectFolder', targetId: targetId }); }
                
                window.addEventListener('message', event => {
                    const message = event.data;
                    if (message.command === 'updateInput') { 
                        document.getElementById(message.targetId).value = message.path; 
                    }
                    if (message.command === 'saveFailed') {
                        const btn = document.getElementById('saveBtn');
                        btn.innerText = 'SAVE CONFIGURATION';
                        btn.style.opacity = '1';
                        btn.style.transform = 'none';
                    }
                });
                
                function save() {
                    const btn = document.getElementById('saveBtn');
                    btn.innerText = 'SAVING...';
                    btn.style.opacity = '0.7';
                    btn.style.transform = 'scale(0.98)';

                    const data = {
                        teamNumber: document.getElementById('tNumber')?.value || '',
                        workspacePath: document.getElementById('workPath')?.value || '',
                        toolsPath: document.getElementById('toolsPath')?.value || '',
                        autoSave: document.getElementById('aSave')?.checked || false
                    };
                    
                    vscode.postMessage({ command: 'save', data: data });
                }
            </script>
        </body>
        </html>
    `;
}