// src/views/marketplaceWebview.ts

export function getMarketplaceHtml(logoUri: string): string {
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
                    padding: 0; margin: 0; min-height: 100vh;
                }

                body::before {
                    content: ''; position: fixed; top: -50%; left: -50%; width: 200%; height: 200%;
                    background: radial-gradient(circle at 50% 10%, rgba(29, 78, 216, 0.05), transparent 60%);
                    z-index: -1; pointer-events: none;
                }

                .dashboard-container { max-width: 1000px; margin: 0 auto; padding: 40px 30px; }
                
                .header-section { display: flex; flex-direction: column; align-items: center; margin-bottom: 20px; }
                .main-banner { width: 100%; max-width: 200px; height: auto; object-fit: contain; margin-bottom: 15px; }
                .top-bar { display: flex; justify-content: center; width: 100%; border-bottom: 1px solid var(--glass-border); padding-bottom: 15px; }
                h1 { font-size: 1.2rem; margin: 0; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: var(--text-gris); }

                /* --- Search y Filtros --- */
                .tools-container {
                    display: none; /* Se muestra cuando cargan los datos */
                    flex-direction: column; gap: 15px; margin-bottom: 30px; align-items: center;
                }
                
                .search-bar {
                    width: 100%; max-width: 500px;
                    padding: 12px 20px;
                    border-radius: 30px;
                    border: 1px solid var(--glass-border);
                    background-color: var(--input-bg);
                    color: var(--text-blanco);
                    font-family: 'Inter', sans-serif;
                    font-size: 0.95rem;
                    backdrop-filter: blur(10px);
                    transition: border-color 0.3s ease;
                }
                .search-bar:focus { outline: none; border-color: var(--color-primario); }
                .search-bar::placeholder { color: #555555; }

                .filters-row {
                    display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;
                }
                .filter-btn {
                    background: transparent; border: 1px solid var(--glass-border);
                    color: var(--text-gris); padding: 6px 14px; border-radius: 20px;
                    font-size: 0.8rem; font-weight: 500; cursor: pointer; transition: all 0.3s ease;
                }
                .filter-btn:hover { background: rgba(255,255,255,0.05); color: var(--text-blanco); }
                .filter-btn.active { background: var(--color-primario); color: white; border-color: var(--color-primario); }
                /* ---------------------- */

                /* Loader de Carga */
                #loader { text-align: center; padding: 50px; color: var(--color-primario); font-weight: 600; letter-spacing: 2px; }
                .spinner { width: 40px; height: 40px; border: 4px solid var(--glass-border); border-top: 4px solid var(--color-primario); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px auto; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

                /* Grid de la tienda */
                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 20px;
                    display: none; 
                }

                /* Tarjeta de la Feature */
                .feature-card { 
                    background-color: var(--glass-bg); border: 1px solid var(--glass-border); 
                    border-radius: 12px; padding: 20px; display: flex; flex-direction: column;
                    backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
                    transition: transform 0.3s ease, border-color 0.3s ease;
                }
                .feature-card:hover { transform: translateY(-5px); border-color: rgba(29, 78, 216, 0.5); }

                .card-header { display: flex; align-items: center; gap: 15px; margin-bottom: 15px; }
                .feature-icon { width: 48px; height: 48px; border-radius: 8px; object-fit: cover; background: rgba(255,255,255,0.05); }
                .feature-title-wrapper { flex: 1; }
                .feature-title { font-size: 1.1rem; font-weight: 600; margin: 0 0 4px 0; color: var(--text-blanco); }
                
                /* Estilos para el Autor y Verified Badge */
                .feature-author-row { display: flex; align-items: center; gap: 4px; }
                .feature-author { font-size: 0.75rem; color: var(--color-primario); text-transform: uppercase; letter-spacing: 1px; margin: 0; }
                .verified-icon { width: 14px; height: 14px; color: #3b82f6; } /* Azul tipo Twitter/FIRST */

                .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 600; background: rgba(255,255,255,0.1); color: var(--text-gris); margin-bottom: 10px; }
                .feature-desc { font-size: 0.85rem; color: #a0a0a0; line-height: 1.5; margin-bottom: 20px; flex-grow: 1; }

                /* Botones Dinámicos */
                .card-actions { display: flex; gap: 10px; }
                .btn { padding: 10px; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer; text-align: center; transition: all 0.3s ease; flex: 1; border: none; }
                
                .btn-install { background-color: var(--color-primario); color: white; }
                .btn-install:hover { background-color: var(--color-primario-hover); }
                
                .btn-update { background-color: #F59E0B; color: white; } /* Naranja vibrante */
                .btn-update:hover { background-color: #D97706; }
                
                .btn-installed { background-color: rgba(255,255,255,0.05); color: var(--text-gris); cursor: default; border: 1px solid var(--glass-border); }
                
                .btn-docs { background-color: transparent; border: 1px solid var(--glass-border); color: white; }
                .btn-docs:hover { background: rgba(255,255,255,0.1); }
            </style>
        </head>
        <body>
            <div class="dashboard-container">
                <div class="header-section">
                    <img src="${logoUri}" class="main-banner" alt="MARS Logo">
                    <header class="top-bar"><h1>WORKSPACE MARKETPLACE</h1></header>
                </div>

                <div id="loader">
                    <div class="spinner"></div>
                    <div>CONNECTING TO REGISTRY...</div>
                </div>

                <div id="error-msg" style="display: none; color: #ff4444; text-align: center; padding: 20px; background: rgba(255,0,0,0.1); border-radius: 8px; border: 1px solid rgba(255,0,0,0.3);"></div>

                <div class="tools-container" id="toolsContainer">
                    <input type="text" id="searchInput" class="search-bar" placeholder="Search extensions (e.g., Vision, Swerve)..." oninput="filterGrid()">
                    <div class="filters-row" id="filtersRow">
                        </div>
                </div>

                <div class="features-grid" id="featuresGrid">
                    </div>
            </div>
            
            <script>
                const vscode = acquireVsCodeApi();
                
                let allFeatures = []; 
                let currentCategory = 'All';

                window.addEventListener('message', event => {
                    const message = event.data;

                    if (message.command === 'loadFeatures') {
                        document.getElementById('loader').style.display = 'none';
                        document.getElementById('toolsContainer').style.display = 'flex';
                        const grid = document.getElementById('featuresGrid');
                        grid.style.display = 'grid';
                        
                        allFeatures = message.features;
                        
                        if (allFeatures.length === 0) {
                            grid.innerHTML = '<div style="color: var(--text-gris); grid-column: 1/-1; text-align: center;">No features available in the registry at this moment.</div>';
                            return;
                        }

                        generateFilters();
                        renderGrid();
                    } 
                    else if (message.command === 'error') {
                        document.getElementById('loader').style.display = 'none';
                        const errorDiv = document.getElementById('error-msg');
                        errorDiv.style.display = 'block';
                        errorDiv.innerText = message.text;
                    }
                });

                function generateFilters() {
                    const filtersRow = document.getElementById('filtersRow');
                    // Extraer categorías únicas de las features instaladas
                    const categories = new Set();
                    allFeatures.forEach(f => { if(f.category) categories.add(f.category); });
                    
                    let html = \`<button class="filter-btn active" onclick="setCategory('All', this)">All</button>\`;
                    categories.forEach(cat => {
                        html += \`<button class="filter-btn" onclick="setCategory('\${cat}', this)">\${cat}</button>\`;
                    });
                    
                    filtersRow.innerHTML = html;
                }

                function setCategory(category, btnElement) {
                    currentCategory = category;
                    // Quitar clase active a todos
                    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    // Ponersela al seleccionado
                    btnElement.classList.add('active');
                    filterGrid();
                }

                function filterGrid() {
                    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
                    const grid = document.getElementById('featuresGrid');
                    grid.innerHTML = ''; // Limpiar grid

                    const filteredFeatures = allFeatures.filter(feat => {
                        const matchSearch = feat.name.toLowerCase().includes(searchTerm) || 
                                            feat.description.toLowerCase().includes(searchTerm) ||
                                            feat.author.toLowerCase().includes(searchTerm);
                        
                        const matchCategory = currentCategory === 'All' || feat.category === currentCategory;

                        return matchSearch && matchCategory;
                    });

                    if (filteredFeatures.length === 0) {
                        grid.innerHTML = '<div style="color: var(--text-gris); grid-column: 1/-1; text-align: center; margin-top: 20px;">No results found.</div>';
                        return;
                    }

                    filteredFeatures.forEach(feat => {
                        const iconHtml = feat.iconUrl && feat.iconUrl !== "" 
                            ? \`<img src="\${feat.iconUrl}" class="feature-icon" alt="icon" onerror="this.style.display='none'">\` 
                            : \`<div class="feature-icon"></div>\`;

                        const docsBtn = feat.docsUrl && feat.docsUrl !== "" 
                            ? \`<button class="btn btn-docs" onclick="openDocs('\${feat.docsUrl}')">Docs</button>\` 
                            : '';

                        const isVerified = feat.author && feat.author.toUpperCase() === 'STZ-ROBOTICS';
                        const verifiedBadge = isVerified ? 
                            \`<svg class="verified-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" title="Verified Official Feature">
                                <path fill-rule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" />
                            </svg>\` : '';

                        let btnClass = 'btn-install';
                        let btnText = 'INSTALL';
                        let btnAction = \`onclick="installFeature('\${feat.featureId}')"\`;

                        if (feat.installedVersion) {
                            if (feat.installedVersion === feat.version) {
                                btnClass = 'btn-installed';
                                btnText = 'INSTALLED';
                                btnAction = 'disabled'; 
                            } else {
                                btnClass = 'btn-update';
                                btnText = 'UPDATE';
                            }
                        }

                        // ¡AQUÍ ESTÁ LA CORRECCIÓN DE LA CLASE "btn"!
                        const cardHtml = \`
                            <div class="feature-card">
                                <div class="card-header">
                                    \${iconHtml}
                                    <div class="feature-title-wrapper">
                                        <h3 class="feature-title">\${feat.name}</h3>
                                        <div class="feature-author-row">
                                            <p class="feature-author">\${feat.author} • v\${feat.version}</p>
                                            \${verifiedBadge}
                                        </div>
                                    </div>
                                </div>
                                <div><span class="badge">\${feat.category}</span></div>
                                <p class="feature-desc">\${feat.description}</p>
                                <div class="card-actions">
                                    <button class="btn \${btnClass}" \${btnAction}>\${btnText}</button>
                                    \${docsBtn}
                                </div>
                            </div>
                        \`;
                        grid.insertAdjacentHTML('beforeend', cardHtml);
                    });
                }

                function renderGrid() {
                    filterGrid(); // El render inicial es simplemente aplicar el filtro default
                }

                function installFeature(featureId) {
                    vscode.postMessage({ command: 'install', featureId: featureId });
                }

                function openDocs(url) {
                    vscode.postMessage({ command: 'openDocs', url: url });
                }
            </script>
        </body>
        </html>
    `;
}