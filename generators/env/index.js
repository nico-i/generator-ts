"use-strict";
const Generator = require("yeoman-generator");
const { Format } = require("../../lib/Format");

module.exports = class extends Generator {
	initializing() {
		const packageJson = this.fs.readJSON(this.packageJson.path);
		this.scripts = packageJson.scripts;
	}

	async prompting() {
		this.scriptNamesToUpdate = (
			await this.prompt([
				{
					type: "checkbox",
					name: "scriptNamesToUpdate",
					message: "Which scripts should be updated to use the created .env file?",
					choices: Object.keys(this.scripts),
				},
			])
		).scriptNamesToUpdate;
	}

	writing() {
		this.log(Format.step("Creating .env file"));
		this.fs.write(this.destinationPath(".env"), "");
		this.log(Format.success(".env file created successfully"));

		if (this.scriptNamesToUpdate.length == 0) {
			return;
		}

		const updatedScripts = this.scriptNamesToUpdate.reduce((acc, scriptName) => {
			const script = this.scripts[scriptName];
			const updatedScript = `dotenvx run -f=.env -- ${script}`;
			acc[scriptName] = updatedScript;
			return acc;
		}, {});
		this.fs.extendJSON(this.packageJson.path, {
			scripts: {
				...this.scripts,
				...updatedScripts,
			},
		});
		this.log(Format.success("Scripts updated successfully"));
	}

	install() {
		this.spawnCommand("bun", ["add", "@dotenvx/dotenvx"]);
	}
};
