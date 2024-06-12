"use-strict";
const Generator = require("yeoman-generator");
const { Format } = require("../../lib/Format");

module.exports = class extends Generator {
	writing() {
		const tsConfigPath = this.destinationPath("tsconfig.json");
		if (this.fs.exists(tsConfigPath)) {
			this.log(Format.step("Extending tsconfig.json with @nico-i/ts-config"));
			this.fs.extendJSON(tsConfigPath, {
				extends: "@nico-i/ts-config"
			});
		} else {
			this.log(Format.step("Adding tsconfig.json to project directory"));
			this.fs.copy(this.templatePath(), this.destinationPath(), {
				globOptions: { dot: true }
			});
		}
		this.log(Format.success("tsconfig.json updated!"));
	}

	install() {
		this.spawnCommand("bun", ["add", "typescript", "@nico-i/ts-config"]);
	}
};
