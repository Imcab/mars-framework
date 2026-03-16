// src/views/diagnosticWebview.ts

export function getDiagnosticHtml(logoUri: string): string {
    return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

                :root {
                    --color-primario: #1D4ED8;       
                    --color-primario-hover: #1E3A8A; 
                    --bg-oscuro: #050505;
                    --glass-bg: rgba(255, 255, 255, 0.03);
                    --glass-border: rgba(255, 255, 255, 0.08);
                    --input-bg: rgba(0, 0, 0, 0.4);
                    --text-blanco: #ffffff;
                    --text-gris: #888888;
                }

                body {
                    font-family: 'Inter', sans-serif;
                    background-color: var(--bg-oscuro);
                    color: var(--text-blanco);
                    padding: 0; 
                    margin: 0;
                    min-height: 100vh;
                }

                body::before {
                    content: '';
                    position: fixed;
                    top: -50%; left: -50%;
                    width: 200%; height: 200%;
                    background: radial-gradient(circle at 50% 10%, rgba(29, 78, 216, 0.05), transparent 60%);
                    z-index: -1;
                    pointer-events: none;
                }

                .dashboard-container { max-width: 800px; margin: 0 auto; padding: 40px 30px; }
                
                .header-section { display: flex; flex-direction: column; align-items: center; margin-bottom: 40px; }
                .main-banner { width: 100%; max-width: 200px; height: auto; object-fit: contain; margin-bottom: 15px; }
                .top-bar { display: flex; justify-content: center; width: 100%; border-bottom: 1px solid var(--glass-border); padding-bottom: 15px; }
                
                h1 { font-size: 1rem; margin: 0; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: var(--text-gris); }

                .card { 
                    background-color: var(--glass-bg); 
                    border: 1px solid var(--glass-border); 
                    border-radius: 12px; 
                    padding: 24px; 
                    margin-bottom: 20px;
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                }

                .card-header { font-size: 0.75rem; color: var(--text-gris); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 15px; font-weight: 600; border-left: 3px solid var(--color-primario); padding-left: 10px; }
                
                .form-group { margin-bottom: 15px; }
                label { display: block; color: var(--text-gris); font-weight: 500; margin-bottom: 8px; font-size: 0.85rem; }
                
                input[type="text"], select { 
                    width: 100%; padding: 10px 14px; 
                    background: var(--input-bg); color: var(--text-blanco); 
                    border: 1px solid var(--glass-border); 
                    font-size: 0.9rem; font-family: 'Inter', sans-serif; 
                    border-radius: 8px; box-sizing: border-box; 
                    transition: all 0.3s ease; 
                }
                
                input[type="text"]:focus, select:focus { outline: none; border-color: var(--color-primario); }

                .btn-outline { 
                    background: transparent; color: var(--text-blanco); 
                    border: 1px solid var(--glass-border); 
                    padding: 8px 12px; border-radius: 6px; cursor: pointer; 
                    font-size: 0.8rem; transition: all 0.3s ease; 
                }
                .btn-outline:hover { background: rgba(255,255,255,0.1); }

                .btn-primary-action { 
                    width: 100%; padding: 14px; 
                    background-color: var(--color-primario); 
                    color: var(--text-blanco); border: none; cursor: pointer; 
                    font-size: 0.9rem; font-weight: 600; letter-spacing: 1px;
                    border-radius: 8px; margin-top: 20px; transition: all 0.3s ease; 
                }
                .btn-primary-action:hover { background-color: var(--color-primario-hover); transform: translateY(-2px); }

                .state-row {
                    display: grid; 
                    grid-template-columns: 2fr 1fr 1fr auto auto; 
                    gap: 12px; align-items: center; 
                    background: rgba(0,0,0,0.2); 
                    padding: 12px; border-radius: 8px; 
                    border: 1px solid var(--glass-border);
                }

                .color-preview {
                    width: 24px; height: 24px;
                    border-radius: 50%;
                    border: 2px solid rgba(255,255,255,0.2);
                    box-shadow: 0 0 10px rgba(0,0,0,0.5);
                    transition: background-color 0.3s ease;
                }
            </style>
        </head>
        <body>
            <div class="dashboard-container">
                <div class="header-section">
                    <img src="${logoUri}" class="main-banner" alt="MARS Logo">
                    <header class="top-bar"><h1>DIAGNOSTIC STUDIO</h1></header>
                </div>

                <div class="card">
                    <div class="card-header">Subsystem Target</div>
                    <div class="form-group" style="margin-bottom: 0;">
                        <label for="subName">Subsystem Name (e.g. Turret, Intake)</label>
                        <input type="text" id="subName" placeholder="e.g. Turret">
                    </div>
                </div>

                <div class="card">
                    <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
                        <span>Diagnostic States</span>
                        <button class="btn-outline" onclick="addStateRow()">+ Add State</button>
                    </div>
                    
                    <div id="statesContainer" style="display: flex; flex-direction: column; gap: 12px;">
                        </div>
                </div>
                
                <button class="btn-primary-action" onclick="generate()">GENERATE ENUM CLASS</button>
            </div>
            
            <script>
                const vscode = acquireVsCodeApi();
                const container = document.getElementById('statesContainer');
                let rowCount = 0;

                // 🎨 EL ARSENAL COMPLETO DE WPILIB
                const colorMap = {
                    'Denim': '#1560BD', 'FirstBlue': '#0066B3', 'FirstRed': '#ED1C24',
                    'AliceBlue': '#F0F8FF', 'AntiqueWhite': '#FAEBD7', 'Aqua': '#00FFFF',
                    'Aquamarine': '#7FFFD4', 'Azure': '#F0FFFF', 'Beige': '#F5F5DC',
                    'Bisque': '#FFE4C4', 'Black': '#000000', 'BlanchedAlmond': '#FFEBCD',
                    'Blue': '#0000FF', 'BlueViolet': '#8A2BE2', 'Brown': '#A52A2A',
                    'Burlywood': '#DEB887', 'CadetBlue': '#5F9EA0', 'Chartreuse': '#7FFF00',
                    'Chocolate': '#D2691E', 'Coral': '#FF7F50', 'CornflowerBlue': '#6495ED',
                    'Cornsilk': '#FFF8DC', 'Crimson': '#DC143C', 'Cyan': '#00FFFF',
                    'DarkBlue': '#00008B', 'DarkCyan': '#008B8B', 'DarkGoldenrod': '#B8860B',
                    'DarkGray': '#A9A9A9', 'DarkGreen': '#006400', 'DarkKhaki': '#BDB76B',
                    'DarkMagenta': '#8B008B', 'DarkOliveGreen': '#556B2F', 'DarkOrange': '#FF8C00',
                    'DarkOrchid': '#9932CC', 'DarkRed': '#8B0000', 'DarkSalmon': '#E9967A',
                    'DarkSeaGreen': '#8FBC8F', 'DarkSlateBlue': '#483D8B', 'DarkSlateGray': '#2F4F4F',
                    'DarkTurquoise': '#00CED1', 'DarkViolet': '#9400D3', 'DeepPink': '#FF1493',
                    'DeepSkyBlue': '#00BFFF', 'DimGray': '#696969', 'DodgerBlue': '#1E90FF',
                    'Firebrick': '#B22222', 'FloralWhite': '#FFFAF0', 'ForestGreen': '#228B22',
                    'Fuchsia': '#FF00FF', 'Gainsboro': '#DCDCDC', 'GhostWhite': '#F8F8FF',
                    'Gold': '#FFD700', 'Goldenrod': '#DAA520', 'Gray': '#808080',
                    'Green': '#008000', 'GreenYellow': '#ADFF2F', 'Honeydew': '#F0FFF0',
                    'HotPink': '#FF69B4', 'IndianRed': '#CD5C5C', 'Indigo': '#4B0082',
                    'Ivory': '#FFFFF0', 'Khaki': '#F0E68C', 'Lavender': '#E6E6FA',
                    'LavenderBlush': '#FFF0F5', 'LawnGreen': '#7CFC00', 'LemonChiffon': '#FFFACD',
                    'LightBlue': '#ADD8E6', 'LightCoral': '#F08080', 'LightCyan': '#E0FFFF',
                    'LightGoldenrodYellow': '#FAFAD2', 'LightGray': '#D3D3D3', 'LightGreen': '#90EE90',
                    'LightPink': '#FFB6C1', 'LightSalmon': '#FFA07A', 'LightSeaGreen': '#20B2AA',
                    'LightSkyBlue': '#87CEFA', 'LightSlateGray': '#778899', 'LightSteelBlue': '#B0C4DE',
                    'LightYellow': '#FFFFE0', 'Lime': '#00FF00', 'LimeGreen': '#32CD32',
                    'Linen': '#FAF0E6', 'Magenta': '#FF00FF', 'Maroon': '#800000',
                    'MediumAquamarine': '#66CDAA', 'MediumBlue': '#0000CD', 'MediumOrchid': '#BA55D3',
                    'MediumPurple': '#9370DB', 'MediumSeaGreen': '#3CB371', 'MediumSlateBlue': '#7B68EE',
                    'MediumSpringGreen': '#00FA9A', 'MediumTurquoise': '#48D1CC', 'MediumVioletRed': '#C71585',
                    'MidnightBlue': '#191970', 'Mintcream': '#F5FFFA', 'MistyRose': '#FFE4E1',
                    'Moccasin': '#FFE4B5', 'NavajoWhite': '#FFDEAD', 'Navy': '#000080',
                    'OldLace': '#FDF5E6', 'Olive': '#808000', 'OliveDrab': '#6B8E23',
                    'Orange': '#FFA500', 'OrangeRed': '#FF4500', 'Orchid': '#DA70D6',
                    'PaleGoldenrod': '#EEE8AA', 'PaleGreen': '#98FB98', 'PaleTurquoise': '#AFEEEE',
                    'PaleVioletRed': '#DB7093', 'PapayaWhip': '#FFEFD5', 'PeachPuff': '#FFDAB9',
                    'Peru': '#CD853F', 'Pink': '#FFC0CB', 'Plum': '#DDA0DD',
                    'PowderBlue': '#B0E0E6', 'Purple': '#800080', 'Red': '#FF0000',
                    'RosyBrown': '#BC8F8F', 'RoyalBlue': '#4169E1', 'SaddleBrown': '#8B4513',
                    'Salmon': '#FA8072', 'SandyBrown': '#F4A460', 'SeaGreen': '#2E8B57',
                    'Seashell': '#FFF5EE', 'Sienna': '#A0522D', 'Silver': '#C0C0C0',
                    'SkyBlue': '#87CEEB', 'SlateBlue': '#6A5ACD', 'SlateGray': '#708090',
                    'Snow': '#FFFAFA', 'SpringGreen': '#00FF7F', 'SteelBlue': '#4682B4',
                    'Tan': '#D2B48C', 'Teal': '#008080', 'Thistle': '#D8BFD8',
                    'Tomato': '#FF6347', 'Turquoise': '#40E0D0', 'Violet': '#EE82EE',
                    'Wheat': '#F5DEB3', 'White': '#FFFFFF', 'WhiteSmoke': '#F5F5F5',
                    'Yellow': '#FFFF00', 'YellowGreen': '#9ACD32'
                };
                
                const severities = ['OK', 'WARNING', 'ERROR', 'CRITICAL'];

                function updateColorPreview(selectElement, previewId) {
                    const colorName = selectElement.value;
                    const hexCode = colorMap[colorName] || '#FFFFFF';
                    const previewCircle = document.getElementById(previewId);
                    previewCircle.style.backgroundColor = hexCode;
                    previewCircle.style.boxShadow = \`0 0 12px \${hexCode}90\`; 
                }

                function addStateRow() {
                    rowCount++;
                    const rowId = 'row-' + rowCount;
                    const previewId = 'preview-' + rowCount;
                    
                    let colorOptions = Object.keys(colorMap).map(c => \`<option value="\${c}">\${c}</option>\`).join('');
                    let sevOptions = severities.map(s => \`<option value="\${s}">\${s}</option>\`).join('');

                    const html = \`
                        <div id="\${rowId}" class="state-row">
                            <input type="text" class="state-name" placeholder="STATE_NAME (e.g. LOCKED)" style="margin: 0;">
                            <select class="state-sev" style="margin: 0;">\${sevOptions}</select>
                            
                            <select class="state-color" style="margin: 0;" onchange="updateColorPreview(this, '\${previewId}')">\${colorOptions}</select>
                            
                            <div id="\${previewId}" class="color-preview" style="background-color: \${colorMap['Denim']}; box-shadow: 0 0 12px \${colorMap['Denim']}90;"></div>
                            
                            <button onclick="document.getElementById('\${rowId}').remove()" style="background: transparent; border: none; color: #ff4444; cursor: pointer; font-size: 1.2rem; padding: 0 5px;">✖</button>
                        </div>
                    \`;
                    container.insertAdjacentHTML('beforeend', html);
                }

                // Fila inicial
                addStateRow();

                function generate() {
                    const subName = document.getElementById('subName').value.trim();
                    if (!subName) {
                        vscode.postMessage({ command: 'error', text: 'FAULT: Subsystem Name is required.' });
                        return;
                    }

                    const rows = document.querySelectorAll('.state-row');
                    if (rows.length === 0) {
                        vscode.postMessage({ command: 'error', text: 'FAULT: Add at least one diagnostic state.' });
                        return;
                    }

                    const states = [];
                    rows.forEach(row => {
                        const name = row.querySelector('.state-name').value.trim().toUpperCase().replace(/ /g, '_');
                        const severity = row.querySelector('.state-sev').value;
                        const color = row.querySelector('.state-color').value;
                        if (name) states.push({ name, severity, color });
                    });

                    vscode.postMessage({ command: 'generate', subName: subName, states: states });
                }
            </script>
        </body>
        </html>
    `;
}