
export const COMMON_HEAD = `
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src *; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'unsafe-inline';">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
`;

export const COMMON_CSS = `
    :root {
        --bg-main: #000000ff;
        --bg-card: #171717ff;
        --bg-input: #171717ff;
        --border-color: #272727ff;
        --text-main: #ffffff;
        --text-muted: #4f4f4fff;
        --accent-red: #d62d2d;
        --accent-green: #2ea043;
    }

    body { 
        padding: 0; 
        margin: 0; 
        font-family: 'Poppins', sans-serif; 
        background-color: var(--bg-main); 
        color: var(--text-main); 
    }

    .dashboard-container { max-width: 900px; margin: 0 auto; padding: 40px 30px; }
    
    .header-section { display: flex; flex-direction: column; align-items: center; margin-bottom: 30px; }
    .main-banner { width: 100%; max-width: 600px; height: auto; object-fit: contain; margin-bottom: 15px; filter: drop-shadow(0px 4px 10px rgba(0,0,0,0.5)); }
    .top-bar { display: flex; justify-content: center; width: 100%; border-bottom: 1px solid var(--border-color); padding-bottom: 15px; }
    
    h1 { font-size: 1.6em; margin: 0; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: var(--text-muted); }
    
    .card { background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: 6px; padding: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .card-header { font-size: 0.75em; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; font-weight: 700; border-left: 3px solid var(--accent-red); padding-left: 8px; }
    .form-group { margin-bottom: 15px; }
    
    label { display: block; color: var(--text-muted); font-weight: 500; margin-bottom: 8px; font-size: 0.85em; }
    
    input[type="text"], input[type="number"] { width: 100%; padding: 10px; background: var(--bg-input); color: var(--text-main); border: 1px solid var(--border-color); font-size: 1em; font-family: 'Poppins', sans-serif; border-radius: 4px; box-sizing: border-box; transition: border 0.2s; }
    input:focus { outline: none; border-color: var(--accent-red); }
    
    .btn { padding: 10px 16px; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; font-family: 'Poppins', sans-serif; transition: all 0.2s; }
    .btn-outline { background: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-main); }
    .btn-outline:hover { background: #333; border-color: #555; }
    
    .btn-danger { background-color: var(--accent-red); color: white; width: 100%; padding: 15px; font-size: 1.1em; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-top: 10px; }
    .btn-danger:hover { background-color: #ff3333; }
    
    .input-with-button { display: flex; gap: 10px; }
    .checkbox-wrapper { display: flex; align-items: center; gap: 10px; margin-top: 15px; }
    .checkbox-wrapper label { margin: 0; color: var(--text-main); font-weight: 400; font-size: 0.9em; }
`;