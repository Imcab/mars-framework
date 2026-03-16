// src/views/projectCreatorWebview.ts

export function getProjectCreatorHtml(logoUri: string, styleUri: string, defaultFolder: string, defaultTeam: string): string {
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
                        <h1>PROJECT BUILDER</h1>
                    </header>
                </div>

                <div class="card-grid">
                    <div class="card full-width" style="grid-column: 1 / -1; margin-bottom: 24px;">
                        <div class="card-header">Target Directory</div>
                        <div class="form-group">
                            <label for="bFolder">Base Folder Path</label>
                            <div class="input-with-button">
                                <input type="text" id="bFolder" value="${defaultFolder.replace(/\\/g, '\\\\')}" readonly placeholder="No directory selected...">
                                <button class="btn btn-outline" onclick="selectFolder()">Browse</button>
                            </div>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                        <div class="card">
                            <div class="card-header">System Configuration</div>
                            <div class="form-group">
                                <label for="pName">Project Name</label>
                                <input type="text" id="pName" placeholder="e.g. Atlas_2026">
                            </div>
                            <div class="checkbox-wrapper">
                                <input type="checkbox" id="cFolder" checked>
                                <label for="cFolder">Create isolated sub-folder</label>
                            </div>
                        </div>

                        <div class="card">
                            <div class="card-header">Team Details</div>
                            <div class="form-group">
                                <label for="tNumber">Team Number</label>
                                <input type="number" id="tNumber" value="${defaultTeam}" placeholder="e.g. 3472">
                            </div>
                        </div>
                    </div>
                </div>

                <button class="btn btn-primary-action" onclick="generate()" style="margin-top: 30px;">INITIALIZE PROJECT</button>
            </div>
            
            <script>
                const vscode = acquireVsCodeApi();
                
                function selectFolder() { 
                    vscode.postMessage({ command: 'selectFolder' }); 
                }
                
                window.addEventListener('message', event => {
                    const message = event.data;
                    if (message.command === 'updateFolder') { 
                        document.getElementById('bFolder').value = message.path; 
                    }
                });
                
                function generate() {
                    const base = document.getElementById('bFolder').value;
                    const name = document.getElementById('pName').value;
                    const team = document.getElementById('tNumber').value;
                    
                    if(!base) { 
                        vscode.postMessage({ command: 'error', text: 'FAULT: Target directory is missing.' }); 
                        return; 
                    }
                    if(!name) { 
                        vscode.postMessage({ command: 'error', text: 'FAULT: Project Name is required.' }); 
                        return; 
                    }
                    
                    const btn = document.querySelector('.btn-primary-action');
                    btn.innerText = 'INITIALIZING...';
                    btn.style.opacity = '0.7';
                    
                    vscode.postMessage({ command: 'generate', baseFolder: base, projectName: name, teamNumber: team });
                }
            </script>
        </body>
        </html>
    `;
}