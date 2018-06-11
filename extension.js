const vscode = require('vscode');
const folderStructureExplorer = require("./folderStructureExplorer");
const worldExplorer_textDocumentContentProvider = require("./worldExplorer.textDocumentContentProvider");

// this method is called when your extension is activated
function activate(context) {

    const rootPath = vscode.workspace.rootPath;
    const folderStructureProvider = new folderStructureExplorer.FolderStructureProvider(rootPath);
    vscode.window.registerTreeDataProvider('folderStructureExplorer', folderStructureProvider);
    vscode.commands.registerCommand('folderStructureExplorer.refresh', node => vscode.window.showInformationMessage('Successfully called refresh'));
    vscode.commands.registerCommand('folderStructureExplorer.openFile', filePath => vscode.commands.executeCommand('vscode.open', vscode.Uri.file(`${filePath}`)));

    new worldExplorer_textDocumentContentProvider.WorldExplorer(context);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;