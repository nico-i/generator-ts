"use-strict";
const Generator = require(`yeoman-generator`);

module.exports = class extends Generator {
	constructor(args, opts) {
		super(args, opts);
	}

	installPlaywright() {
		this.spawnCommand(`bun`, [`create`, `playwright@latest`]);
	}
};