# MARS Framework Extension for VS Code

Welcome to the **Official STZ Robotics MARS Framework Extension**. This tool is designed to supercharge the workflow of FRC software teams by integrating project scaffolding, over-the-air (OTA) updates, and telemetry management directly into Visual Studio Code.

## Key Features

### Project Builder
Forget about manual cloning and configuring. The **Project Builder** automatically fetches the latest `MarsTemplate`, clears the git history for a fresh start, and automatically injects your FRC Team Number directly into the WPILib preferences.

### Advanced Module Scaffolding
Stop writing boilerplate code. Right-click any folder inside your project to generate a complete MARS Module architecture in seconds. It automatically creates and routes:
- Hardware I/O Interfaces (`IO.java`)
- Module Requests & Actions (`Request.java`)
- Diagnostic Status Codes (`Code.java`)
- Request Factories (`RequestFactory.java`)
- Modular Subsystem & Telemetry (`Subsystem.java`)

### Over-The-Air (OTA) Ecosystem Updates
Keep your team on the same page without passing ZIP files around. With a single click from the Side Panel, the extension checks GitHub Releases to download, extract, and install the latest versions of:
- **MARS GCS** (Ground Control Station)
- **Alloy Dashboard** (Telemetry & Diagnostics)
- **MARS LogTool** (Log requests)

### Persistent Framework Settings
Configure your default Team Number, workspace paths. The extension saves your preferences globally in VS Code, ready to be injected into any new project you create.

---

## Installation (VSIX)

1. Download the latest `mars-framework-x.x.x.vsix` file provided by the software lead.
2. Open Visual Studio Code.
3. Navigate to the **Extensions** view (`Ctrl+Shift+X`).
4. Click the `...` (Views and More Actions) menu on the top right of the Extensions panel.
5. Select **Install from VSIX...** and choose the downloaded file.
6. Reload VS Code.

---

## Usage Guide

### Mission Control Panel
Once installed, you will see the **MARS Framework** logo on your VS Code Activity Bar (left side). Click it to open the **Mission Control Panel**, where you can:
- Launch the **Project Builder**.
- Boot up the **MARS GCS** or **Alloy Dashboard** directly from your project's release folders.
- Deploy code or run local simulations.
- Access the **Framework Settings**.

### Creating a New Module
1. Open your FRC Project in VS Code.
2. Navigate to your `core/modules` folder (or wherever you want the module to live).
3. **Right-click** the folder and select **`Mars: Create Module`**.
4. Enter the name of your subsystem (e.g., `Intake`, `Climber`, `Shooter`).
5. The extension will generate the folder, the 5 required architectural files, and copy the `KeyManager` constant to your clipboard automatically.

---

*Built with by STZ Robotics Software Team.*