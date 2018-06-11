"use strict";
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

class FolderStructureProvider {
    constructor(workspaceRoot) {
        this.workspaceRoot = workspaceRoot;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!this.workspaceRoot) {
            vscode.window.showInformationMessage('No folder');
            return Promise.resolve([]);
        }
        return new Promise(resolve => {
            resolve(this.getFolderStructure(element ? element.contextValue : this.workspaceRoot))
        });
    }

    getFolderStructure(dir) {
    let files = fs.readdirSync(dir);
    let filelist = [];
    files.forEach(function(file) {
      let item;
      let filePath = path.join(dir,file);

      if (fs.statSync(filePath).isDirectory()) {
        item = new Item(filePath, file, true, vscode.TreeItemCollapsibleState.Collapsed);
      }
      else {
        item = new Item(filePath, file, false, vscode.TreeItemCollapsibleState.None,  {
            command: 'folderStructureExplorer.openFile',
            title: '',
            arguments: [filePath]
        });
      }
      filelist.push(item);
    });
    return filelist;
  };
}

exports.FolderStructureProvider = FolderStructureProvider;

class Item extends vscode.TreeItem {
    constructor(filePath, label, isFolder, collapsibleState, command) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.command = command;
        this.iconPath = {
            light: path.join(__filename, '..', 'resources', 'light', isFolder ? 'folder.svg': 'document.svg'),
            dark: path.join(__filename, '..', 'resources', 'dark', isFolder ? 'folder.svg': 'document.svg')
        };
        this.contextValue = filePath
    }
    get tooltip() {
        return `${this.label}`;
    }
}
