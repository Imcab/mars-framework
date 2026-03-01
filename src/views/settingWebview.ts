// src/views/settingsWebview.ts
import { COMMON_HEAD, COMMON_CSS } from './htmlConstants';

export function getSettingsHtml(logoUri: string, team: string, workPath: string, aSave: boolean): string {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            ${COMMON_HEAD}
            <style>
                ${COMMON_CSS}
                /* CSS específico para Settings */
                .card-grid { display: flex; flex-direction: column; gap: 20px; margin-bottom: 25px; }
            </style>
        </head>
        <body>
            <div class="dashboard-container">
                <div class="header-section">
                    <img src="${logoUri}" class="main-banner" alt="MARS Banner Alt">
                    <header class="top-bar">
                        <h1>FRAMEWORK SETTINGS</h1>
                    </header>
                </div>

                <div class="card-grid">
                    <div class="card">
                        <div class="card-header">Core Configuration</div>
                        <div class="form-group">
                            <label>Default Team Number</label>
                            <input type="number" id="tNumber" value="${team}" placeholder="e.g. 3472">
                        </div>
                        <div class="checkbox-wrapper">
                            <input type="checkbox" id="aSave" ${aSave ? 'checked' : ''}>
                            <label>Auto-Save all files before deploying to RoboRIO</label>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">System Paths</div>
                        <div class="form-group">
                            <label>Default Workspace Base Folder</label>
                            <div class="input-with-button">
                                <input type="text" id="workPath" value="${workPath.replace(/\\/g, '\\\\')}" readonly placeholder="Select default projects folder...">
                                <button class="btn btn-outline" onclick="browseFolder('workPath')">Browse</button>
                            </div>
                        </div>
                    </div>
                </div>
                <button id="saveBtn" class="btn btn-danger" onclick="save()">SAVE CONFIGURATION</button>
            </div>
            
            <script>
                const vscode = acquireVsCodeApi();
                function browseFile(targetId) { vscode.postMessage({ command: 'selectFile', targetId: targetId }); }
                function browseFolder(targetId) { vscode.postMessage({ command: 'selectFolder', targetId: targetId }); }
                window.addEventListener('message', event => {
                    const message = event.data;
                    if (message.command === 'updateInput') { document.getElementById(message.targetId).value = message.path; }
                    if (message.command === 'saveFailed') {
                        const btn = document.getElementById('saveBtn');
                        btn.innerText = 'SAVE CONFIGURATION';
                        btn.style.opacity = '1';
                    }
                });
                function save() {
                    const btn = document.getElementById('saveBtn');
                    btn.innerText = 'SAVING...';
                    btn.style.opacity = '0.5';

                    const data = {
                        teamNumber: document.getElementById('tNumber').value,
                        terminalPath: document.getElementById('termPath').value,
                        workspacePath: document.getElementById('workPath').value,
                        logVaultPath: document.getElementById('logPath').value,
                        autoSave: document.getElementById('aSave').checked
                    };
                    vscode.postMessage({ command: 'save', data: data });
                }
            </script>
        </body>
        </html>
    `;
}