// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

// Set to store recently opened files
const recentlyOpenedFiles = new Set<string>();
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('c/c++ Header Companion is now active!');
	let disposable = vscode.window.onDidChangeActiveTextEditor(
        async (editor: vscode.TextEditor | undefined) => {
            if (editor) {
                const document = editor.document;
                if (document.languageId === 'c' || document.languageId === 'cpp') {
                    const fileName = document.fileName;
                    // Check if this file was recently opened
                    console.log("recentlyOpenedFiles: " + recentlyOpenedFiles);
                    if (recentlyOpenedFiles.has(fileName)) {
                        return;
                    }
                    recentlyOpenedFiles.add(fileName);
                    
                    // Remove the file from the set after a delay
                    setTimeout(() => {
                        recentlyOpenedFiles.delete(fileName);
                    }, 1000); // Adjust this delay as needed
                    
                    const headerPath = getCorrespondingHeaderPath(document.fileName);
                    if (headerPath) {
                        const headerUri = vscode.Uri.file(headerPath);
                        // await vscode.commands.executeCommand('vscode.open', headerUri, vscode.ViewColumn.Beside);
                        await vscode.window.showTextDocument(headerUri, {
                            viewColumn: vscode.ViewColumn.Beside,
                            preserveFocus: true,
                            preview: false
                        });
                        console.log('Opened header file: ' + headerPath);
                    }
                }
            }
        });
        // (async (document: vscode.TextDocument) => {
        // if (document.languageId === 'c' || document.languageId === 'cpp') {
        //     const fileName = document.fileName;
        //      // Check if this file was recently opened
        //     console.log("recentlyOpenedFiles: " + recentlyOpenedFiles);
        //      if (recentlyOpenedFiles.has(fileName)) {
        //         return;
        //     }
        //     recentlyOpenedFiles.add(fileName);
            
        //     // Remove the file from the set after a delay
        //     setTimeout(() => {
        //         recentlyOpenedFiles.delete(fileName);
        //     }, 1000); // Adjust this delay as needed
            
        //     const headerPath = getCorrespondingHeaderPath(document.fileName);
        //     if (headerPath) {
        //         const headerUri = vscode.Uri.file(headerPath);
        //         // await vscode.commands.executeCommand('vscode.open', headerUri, vscode.ViewColumn.Beside);
        //         await vscode.window.showTextDocument(headerUri, {
        //             viewColumn: vscode.ViewColumn.Beside,
        //             preserveFocus: true,
        //             preview: false
        //         });
		// 		console.log('Opened header file: ' + headerPath);
        //     }
        // }
    // });

	// // The command has been defined in the package.json file
	// // Now provide the implementation of the command with registerCommand
	// // The commandId parameter must match the command field in package.json
	// const disposable = vscode.commands.registerCommand('hello.helloWorld', () => {
	// 	// The code you place here will be executed every time your command is executed
	// 	// Display a message box to the user
	// 	vscode.window.showInformationMessage('Hello World from hello!');
	// });

	context.subscriptions.push(disposable);
}

function getCorrespondingHeaderPath(sourceFilePath: string): string | null {
    const sourceExt = path.extname(sourceFilePath);
    const baseName = path.basename(sourceFilePath, sourceExt);
    const dirName = path.dirname(sourceFilePath);
	const parentDirName = path.dirname(dirName);
    
    const headerExtensions = ['.h', '.hpp', '.hxx', '.hh'];
    
    for (const ext of headerExtensions) {
        const headerPath = path.join(dirName, baseName + ext);
        if (fs.existsSync(headerPath)) {
            return headerPath;
        }
    }
	
	// If not found, check in sibling directories
    if (fs.existsSync(parentDirName)) {
        const siblingDirs = fs.readdirSync(parentDirName, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);
        
        for (const siblingDir of siblingDirs) {
            for (const ext of headerExtensions) {
                const headerPath = path.join(parentDirName, siblingDir, baseName + ext);
                if (fs.existsSync(headerPath)) {
                    return headerPath;
                }
            }
        }
    }
    
    return null;
}

// This method is called when your extension is deactivated
export function deactivate() {}
