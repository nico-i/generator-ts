"use-strict";
const Generator = require(`yeoman-generator`);

module.exports = class extends Generator {
	installPlaywright() {
		this.spawnCommand(`bun`, [`create`, `playwright@latest`]);
	}
};
