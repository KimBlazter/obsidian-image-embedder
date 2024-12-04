import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';
import * as fs from 'fs';
import * as path from 'path';
import { arrayBuffer } from 'stream/consumers';

interface PluginSettings {
	exportPath: string;
}

const DEFAULT_SETTINGS: PluginSettings = {
	exportPath: '/Documents'
}

export default class MyPlugin extends Plugin {
	settings: PluginSettings;

	registerCommands() {
		this.addCommand({
			id: "export-current-note",
			name: "Export file with pictures",
			callback: async () => {
				const activeNote = this.app.workspace.getActiveFile();
				if(activeNote) {
					const newContent = await this.replaceImagesWithBase64(activeNote);
					await this.saveFile(newContent, activeNote.basename + ".md");
					new Notice(`Note \"${activeNote.basename}\" has been exported to ${this.settings.exportPath}`)
				} else {
					new Notice('No note is currently open');
				}
			}
		})

		this.addCommand({
			id: "flatten-current-note",
			name: "Flatten Embedded Images",
			callback: async () => {
				const activeNote = this.app.workspace.getActiveFile();
				if(activeNote) {
					const newContent = await this.replaceImagesWithBase64(activeNote);
					
					// Replacing content
					this.app.vault.modify(activeNote, newContent);

					new Notice(`Note \"${activeNote.basename}\" has been flattened`)
				} else {
					new Notice('No note is currently open');
				}
			}
		})
	}

	
	async onload() {
		await this.loadSettings();

		this.registerCommands();

		// This adds an editor command that can perform some operation on the current editor instance
		// this.addCommand({
		// 	id: 'sample-editor-command',
		// 	name: 'Sample editor command',
		// 	editorCallback: (editor: Editor, view: MarkdownView) => {
		// 		console.log(editor.getSelection());
		// 		editor.replaceSelection('Sample Editor Command');
		// 	}
		// });
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		// this.addCommand({
		// 	id: 'open-sample-modal-complex',
		// 	name: 'Open sample modal (complex)',
		// 	checkCallback: (checking: boolean) => {
		// 		// Conditions to check
		// 		const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
		// 		if (markdownView) {
		// 			// If checking is true, we're simply "checking" if the command can be run.
		// 			// If checking is false, then we want to actually perform the operation.
		// 			if (!checking) {
		// 				new SampleModal(this.app).open();
		// 			}

		// 			// This command will only show up in Command Palette when the check function returns true
		// 			return true;
		// 		}
		// 	}
		// });

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {
		// Nothing
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async replaceImagesWithBase64(note: TFile) {
		let content = await this.app.vault.read(note);
		const imageRegex = /!\[\[([^\]]+)\]\]/g;
		
		const replacements = [];
		
		for (const match of content.matchAll(imageRegex)) {
			const imageName = match[1];
			const imageFile = this.app.vault.getFiles().find(file => file.name === imageName);
			
			if (imageFile) {
				try {
					const arrayBuffer = await this.app.vault.readBinary(imageFile);

					const base64Image = Buffer.from(arrayBuffer).toString('base64');
					
					const mimeType = this.getMimeType(imageFile.extension);
					const base64Src = `data:${mimeType};base64,${base64Image}`;
					
					replacements.push({
						original: match[0],
						base64: `![${imageName}](${base64Src})`
					});
				} catch(error) {
					console.error(`Failed to process image ${imageName}:`, error);
					new Notice("Failed to process image")
				}
				
			}
		}
		
		for (const replacement of replacements) {
			content = content.replace(replacement.original, replacement.base64);
		}
		
		return content;
	}

	getMimeType(extension: string): string {
		const mimeTypes: Record<string, string> = {
			'jpg': 'image/jpeg',
			'jpeg': 'image/jpeg',
			'png': 'image/png',
			'gif': 'image/gif',
			'svg': 'image/svg+xml',
			'webp': 'image/webp'
		};
		return mimeTypes[extension.toLowerCase()] ?? 'application/octet-stream';
	}

	async saveFile(content: string, fileName: string) {
		const exportPath = this.settings.exportPath || path.join(
			require('os').homedir(), 
			'ObsidianExports'
		);
	
		// Ensure directory exists
		if (!fs.existsSync(exportPath)) {
			fs.mkdirSync(exportPath, { recursive: true });
		}
	
		const fullPath = path.join(exportPath, fileName);
		fs.writeFileSync(fullPath, content, 'utf-8');
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Export path')
			.addText(text => text
				.setPlaceholder('')
				.setValue(this.plugin.settings.exportPath)
				.onChange(async (value) => {
					this.plugin.settings.exportPath = value;
					await this.plugin.saveSettings();
				}));
	}
}
