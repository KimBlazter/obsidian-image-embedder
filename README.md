# EmbedPhoto Exporter

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![NPM Version](https://img.shields.io/npm/v/npm.svg?style=flat)]()

## Overview

EmbedPhoto Exporter is an ![Obsidian](https://obsidian.md/) plugin that allows you to easily embed images in your Markdown notes as base64, making your notes fully portable and self-contained.

## Features

- Export notes with embedded images
- Flatten current note by converting image references to base64
- Configurable export path

## Installation

1. Open Obsidian
2. Go to `Settings > Community Plugins`
3. Enable Community Plugins if not already done
4. Click on "Browse" and search for "EmbedPhoto Exporter"
5. Install and enable the plugin

## Usage

### Commands

The plugin provides two main commands:

1. **Export file with pictures**
   - Shortcut: `Not set by default`
   - Exports the current note with all images converted to base64
   - Saves the file to the configured export path

2. **Flatten Embedded Images**
   - Shortcut: `Not set by default`
   - Converts all image references in the current note to base64 inline images
   - Modifies the current note directly

### Configuration

Go to `Settings > EmbedPhoto Exporter` to configure:
- Export path: Set the default directory for exported files

## Example

Original note with image reference:
```markdown
# My Note

Some text with an image.

![[my-image.png]]
```

After flattening:
```markdown
# My Note

Some text with an image.

![my-image.png](data:image/png;base64,...)
```

## Compatibility

- Obsidian `v0.15.0` and above
- Works on Windows, macOS, and Linux

## Support

If you encounter any issues or have suggestions, please [open an issue](https://github.com/KimBlazter/obsidian-image-embedder/issues) on GitHub.