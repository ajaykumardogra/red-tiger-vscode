"use strict";
const vscode = require("vscode");
const request = require("request");
const path = require("path");

class WorldTreeDataProvider {
    constructor(model) {
        this.servicePath = 'http://services.groupkt.com/';
        this.model = model;
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
        if (!this.servicePath) {
            vscode.window.showInformationMessage('No data found');
            return Promise.resolve([]);
        }
        return this.getCountryStructure(`${this.servicePath}country/get/all`);
    }
    getCountryStructure(servicePath) {
        let list = [];
        return new Promise(resolve => {
            request.get(servicePath, { json: true }, (err, res, body) => {
                if (!err) {
                    body.RestResponse.result.forEach(function (country) {
                        let  res = vscode.Uri.parse(`foobar://country/${country.alpha3_code}/${country.name}`);
                        list.push(new Item(country.name, res, vscode.TreeItemCollapsibleState.None, {
                            command: 'worldExplorer.loadStates',
                            title: 'Load States',
                            arguments: [res,country.alpha3_code]
                        }));
                    });
                    return resolve(list);
                }
            });
        });

    }
    getParent(element) {
        const parent = vscode.Uri.parse(path.dirname(element.resource.fsPath));
        return parent.fsPath !== this.model.host ? { resource: parent, isDirectory: true } : null;
    }
    provideTextDocumentContent(resource) {
        let countryCode  = resource.path.split('/')[1];
        let uri = `${this.servicePath}state/get/${countryCode}/all`
         return new Promise(resolve => {
            request.get(uri, { json: false }, (err, res, body) => {
                if (!err) {
                    return resolve(body);
                }
            });
        });
    }
}

class Item extends vscode.TreeItem {
    constructor(label, res, collapsibleState, command) {
        super(label, collapsibleState);
        this.label = label;
        this.resourceUri = res;
        this.collapsibleState = collapsibleState;
        this.command = command;
        this.iconPath = {
            light: path.join(__filename, '..', 'resources', 'light', 'document.svg'),
            dark: path.join(__filename, '..', 'resources', 'dark', 'document.svg')
        };
    }
    get tooltip() {
        return `${this.label}`;
    }
}

exports.WorldTreeDataProvider = WorldTreeDataProvider;

class WorldExplorer {
    constructor(context) {
        const treeDataProvider = new WorldTreeDataProvider();
        context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider('foobar', treeDataProvider));
        vscode.window.createTreeView('worldExplorer', { treeDataProvider });
        vscode.commands.registerCommand('worldExplorer.loadStates', (resource, countryCode) => this.loadStates(resource, countryCode));
    }
    loadStates(resource, countryCode) {
        vscode.window.showTextDocument(resource, countryCode);
    }
}
exports.WorldExplorer = WorldExplorer;
