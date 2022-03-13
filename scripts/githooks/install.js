#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const magentaColor = '\x1b[1;35m';
const redColor = '\x1b[1;31m';
const noColor = '\x1b[0m';

function fixPath(p) {
	return p.replace(/\\/g, '/');
}

function getGitRoot() {
	let directory = fs.realpathSync(__dirname);

	// eslint-disable-next-line no-constant-condition
	while (true) {
		const gitDir = path.join(directory, '.git');
		if (fs.existsSync(gitDir) && fs.statSync(gitDir).isDirectory()) {
			return fixPath(directory);
		}

		const prevDirectory = directory;
		directory = path.join(directory, '..');

		if (prevDirectory === directory) {
			break;
		}
	}

	return null;
}

function getHookScript(pathToFolder) {
	return `\
#!/bin/bash

# This file is autogenerated

# Run all the matching hooks
if [ -d "${pathToFolder}" ]; then
	for file in \`ls ${pathToFolder}/*\`; do
		$file $@ || exit $?
	done
fi`;
}

function main() {
	const gitRoot = getGitRoot();
	if (gitRoot === null) {
		console.error(`${redColor}It seems that it isn't a git repo. Did you use git to clone the repo? Skip installing git-hooks${noColor}`);
		return;
	}

	return;

	/**console.log(`${magentaColor}Installing githooks...${noColor}`);

	const targetDir = fs.realpathSync(__dirname);
	const hooksDir = path.join(gitRoot, '.git', 'hooks');
	if (!fs.existsSync(hooksDir)) {
		fs.mkdirSync(hooksDir, { recursive: true });
	}

	for (const hookName of ['pre-commit']) {
		const hookEntry = fixPath(path.join(hooksDir, hookName));

		try {
			// try to unlink first: avoid writing thru a symlink
			fs.unlinkSync(hookEntry);
		} catch (e) {
			// do nothing
		}

		const relativePath = fixPath(path.join(targetDir, hookName));
		fs.writeFileSync(hookEntry, getHookScript(relativePath), { encoding: 'utf-8' });

		fs.chmodSync(hookEntry, '0755');
	}

	console.log(`${magentaColor}Installed to ${gitRoot}${noColor}`);
	 **/
}

if (require.main === module) {
	main();
}
