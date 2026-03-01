import * as vscode from 'vscode';

export class MarsSidePanelProvider implements vscode.WebviewViewProvider {
    constructor(private readonly _extensionUri: vscode.Uri) {}

    resolveWebviewView(webviewView: vscode.WebviewView) {
        webviewView.webview.options = { 
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        
        webviewView.webview.html = this.getHtmlContent(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(message => {
            vscode.commands.executeCommand(message.command);
        });
    }

    private getHtmlContent(webview: vscode.Webview): string {
        const logoPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'mars-banner.png');
        const logoUri = webview.asWebviewUri(logoPath);

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'unsafe-inline';">
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
                <style>
                    body {
                        font-family: 'Poppins', sans-serif;
                        padding: 10px; 
                        color: var(--vscode-foreground);
                    }
                    
                    .header-container {
                        display: flex;
                        flex-direction: column; 
                        align-items: center;
                        gap: 8px;
                        margin-bottom: 12px; 
                    }
                    .header-img {
                        width: 100%; 
                        max-width: 220px; 
                        height: auto;
                        object-fit: contain;
                        filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.2)); 
                    }
                    .welcome-text { 
                        font-size: 11px; 
                        font-weight: 500; 
                        color: var(--vscode-descriptionForeground); 
                        letter-spacing: 0.5px;
                        margin: 0; 
                        text-align: center;
                    }

                    .separator {
                        border: none;
                        border-top: 1px solid rgba(255, 255, 255, 0.15); 
                        margin: 12px 0 20px 0;
                        width: 100%;
                    }
                    
                    svg { width: 16px; height: 16px; fill: currentColor; }

                    .btn-primary { 
                        width: 100%; 
                        padding: 10px; 
                        background: var(--vscode-button-background); 
                        color: var(--vscode-button-foreground); 
                        border: none; 
                        cursor: pointer; 
                        font-size: 13px; 
                        font-weight: 600; 
                        margin-bottom: 22px; 
                        border-radius: 4px; 
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        gap: 8px; 
                    }
                    .btn-primary:hover { background: var(--vscode-button-hoverBackground); }
                    
                    .section-title { 
                        font-size: 10px; 
                        text-transform: uppercase; 
                        margin-bottom: 10px; 
                        opacity: 0.7; 
                        font-weight: 700; 
                        border-left: 3px solid #888888; 
                        padding-left: 8px;
                        margin-top: 15px; 
                    }
                    
                    .btn-secondary { 
                        width: 100%; 
                        padding: 8px 10px; 
                        background: var(--vscode-button-secondaryBackground); 
                        color: var(--vscode-button-secondaryForeground); 
                        border: none; 
                        cursor: pointer; 
                        margin-bottom: 6px; 
                        border-radius: 3px; 
                        text-align: left; 
                        font-size: 12px; 
                        font-weight: 500; 
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    .btn-secondary:hover { background: var(--vscode-button-secondaryHoverBackground); }
                    .btn-secondary svg { width: 14px; height: 14px; }
                </style>
            </head>
            <body>
                <div class="header-container">
                    <img src="${logoUri}" class="header-img" alt="MARS Banner" />
                    <span class="welcome-text">Welcome to MARS Framework</span>
                </div>

                <hr class="separator" />

                <button class="btn-primary" onclick="sendCommand('mars.createProject')">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M14 4.5V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h6.5L14 4.5zm-1.5.5H9V2H3v12h10V5zM7 7h2v2h2v1H9v2H7v-2H5V9h2V7z"/>
                    </svg>
                    Create New Project
                </button>

                <div class="section-title">Robot Controls</div>
                
                <button class="btn-secondary" onclick="sendCommand('mars.launchTerminal')">
                    Launch MARS GCS
                </button>

                <button class="btn-secondary" onclick="sendCommand('mars.launchLogTool')">
                    Launch MARS LogTool
                </button>

                <button class="btn-secondary" onclick="sendCommand('mars.launchAlloy')">
                    Launch Alloy Dashboard
                </button>

                <button class="btn-secondary" onclick="sendCommand('mars.deploy')">
                    Deploy to RoboRIO
                </button>
                
                <button class="btn-secondary" onclick="sendCommand('mars.simulate')">
                    Local Simulation
                </button>

                <div class="section-title">System</div>

                <button class="btn-secondary" onclick="sendCommand('mars.updateGCS')">
                    Check for GCS Updates
                </button>

                <button class="btn-secondary" onclick="sendCommand('mars.updateAlloy')">
                    Check for Alloy Updates
                </button>

                <button class="btn-secondary" onclick="sendCommand('mars.updateLogTool')">
                    Check for LogTool Updates
                </button>

                <button class="btn-secondary" onclick="sendCommand('mars.settings')">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill-rule="evenodd" clip-rule="evenodd" d="M15.5 8a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0zm-1 0a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0zm-5.698-3.693l-.403.402.66.66.402-.403.966.259.444.444-1.353 3.612-2.112-2.112-.444-.444-.26-.966.403-.402-.66-.66-.402.403-.966-.26-.444-.443 1.354-3.612 2.111 2.112.444.444.26.965z"/></svg>
                    Framework Settings
                </button>

                <script>
                    const vscode = acquireVsCodeApi();
                    function sendCommand(cmd) { vscode.postMessage({ command: cmd }); }
                </script>
            </body>
            </html>
        `;
    }
}