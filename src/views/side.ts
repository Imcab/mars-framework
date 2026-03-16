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
        
        const stylePath = vscode.Uri.joinPath(this._extensionUri, 'media', 'sidebar.css');
        const styleUri = webview.asWebviewUri(stylePath);

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource} 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'unsafe-inline';">
                
                <link rel="stylesheet" href="${styleUri}">
            </head>
            <body>
                <div class="header-container">
                    <img src="${logoUri}" class="header-img" alt="MARS Banner" />
                    <span class="welcome-text">Powered by STZ Robotics.</span>
                </div>

                <hr class="separator" />

                <button class="btn-primary" onclick="sendCommand('mars.createProject')">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M14 4.5V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h6.5L14 4.5zm-1.5.5H9V2H3v12h10V5zM7 7h2v2h2v1H9v2H7v-2H5V9h2V7z"/>
                    </svg>
                    Create New Project
                </button>

                <button class="btn-primary" onclick="sendCommand('mars.downloadFeature')">
                    Install Feature from URL
                </button>

                <button class="btn-primary" onclick="sendCommand('mars.openMarketplace')">
                    Marketplace
                </button>

                <div class="section-title">System</div>

                <button class="btn-secondary" onclick="sendCommand('mars.settings')">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill-rule="evenodd" clip-rule="evenodd" d="M15.5 8a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0zm-1 0a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0zm-5.698-3.693l-.403.402.66.66.402-.403.966.259.444.444-1.353 3.612-2.112-2.112-.444-.444-.26-.966.403-.402-.66-.66-.402.403-.966-.26-.444-.443 1.354-3.612 2.111 2.112.444.444.26.965z"/></svg>
                    Framework Settings
                </button>

                <button class="btn-secondary" onclick="sendCommand('mars.launchTool')">
                    Launch Tool
                </button>

                <div class="section-title">Actions</div>

                <button class="btn-secondary" onclick="sendCommand('mars.createDiagnostic')">
                    Create Diagnostic Enum
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