// src/views/projectCreatorWebview.ts
import { COMMON_HEAD, COMMON_CSS } from './htmlConstants';

export function getProjectCreatorHtml(logoUri: string, defaultFolder: string, defaultTeam: string): string {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            ${COMMON_HEAD}
            <style>
                ${COMMON_CSS}
                /* CSS específico para Project Creator */
                .card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
                .card.full-width { grid-column: 1 / -1; }
            </style>
        </head>
        <body>
            <div class="dashboard-container">
                <div class="header-section">
                    <img src="${logoUri}" class="main-banner" alt="MARS Banner Alt">
                    <header class="top-bar">
                        <h1>PROJECT BUILDER</h1>
                    </header>
                </div>

                <div class="card-grid">
                    <div class="card full-width">
                        <div class="card-header">Target Directory</div>
                        <div class="form-group">
                            <label>Base Folder Path</label>
                            <div class="input-with-button">
                                <input type="text" id="bFolder" value="${defaultFolder.replace(/\\/g, '\\\\')}" readonly placeholder="No directory selected...">
                                <button class="btn btn-outline" onclick="selectFolder()">Browse</button>
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">System Configuration</div>
                        <div class="form-group">
                            <label>Project Name</label>
                            <input type="text" id="pName" placeholder="e.g. Atlas_2026">
                        </div>
                        <div class="checkbox-wrapper">
                            <input type="checkbox" id="cFolder" checked>
                            <label>Create isolated sub-folder</label>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">Team Details</div>
                        <div class="form-group">
                            <label>Team Number</label>
                            <input type="number" id="tNumber" value="${defaultTeam}" placeholder="e.g. 3472">
                        </div>
                    </div>
                </div>

                <button class="btn btn-danger" onclick="generate()">INITIALIZE PROJECT</button>
            </div>
            <script>
                const vscode = acquireVsCodeApi();
                function selectFolder() { vscode.postMessage({ command: 'selectFolder' }); }
                window.addEventListener('message', event => {
                    const message = event.data;
                    if (message.command === 'updateFolder') { document.getElementById('bFolder').value = message.path; }
                });
                function generate() {
                    const base = document.getElementById('bFolder').value;
                    const name = document.getElementById('pName').value;
                    const team = document.getElementById('tNumber').value;
                    if(!base) { vscode.postMessage({ command: 'error', text: 'FAULT: Target directory is missing.' }); return; }
                    if(!name) { vscode.postMessage({ command: 'error', text: 'FAULT: Project Name is required.' }); return; }
                    vscode.postMessage({ command: 'generate', baseFolder: base, projectName: name, teamNumber: team });
                }
            </script>
        </body>
        </html>
    `;
}