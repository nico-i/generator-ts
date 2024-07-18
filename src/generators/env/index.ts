import { JSONSchema7Object } from "json-schema";
import Generator from "yeoman-generator";
import { Format } from "../../lib/Format";

module.exports = class extends Generator {
	private scripts?: JSONSchema7Object;
	private scriptNamesToUpdate: string[] = [];

	initializing() {
		const packageJson = this.fs.readJSON(this.destinationPath("package.json"));

		if (
			!packageJson ||
			typeof packageJson !== `object` ||
			Array.isArray(packageJson)
		) {
			throw new Error(`No package.json found in the project directory`);
		}

		if (
			typeof packageJson.scripts === `object` &&
			packageJson.scripts !== null &&
			!Array.isArray(packageJson.scripts)
		) {
			this.scripts = packageJson.scripts;
		}
	}

	async prompting() {
		if (!this.scripts) {
			this.log(`No scripts found in package.json. Skipping script updates.`);
			return;
		}
		this.scriptNamesToUpdate = (
			await this.prompt([
				{
					type: `checkbox`,
					name: `scriptNamesToUpdate`,
					message: `Which scripts should be updated to use the created .env file?`,
					choices: Object.keys(this.scripts),
				},
			])
		).scriptNamesToUpdate;
	}

	writing() {
		this.log(Format.step(`Creating .env file`));
		this.fs.write(this.destinationPath(`.env`), ``);
		this.log(Format.success(`.env file created successfully`));

		if (this.scriptNamesToUpdate.length > 0) {
			return;
		}

		const updatedScripts = this.scriptNamesToUpdate.reduce<JSONSchema7Object>(
			(acc, scriptName) => {
				if (!this.scripts) {
					return acc;
				}
				const script = this.scripts[scriptName];
				const updatedScript = `dotenvx run -f=.env -- ${script}`;
				acc[scriptName] = updatedScript;
				return acc;
			},
			{},
		);
		this.fs.extendJSON(this.destinationPath("package.json"), {
			scripts: {
				...this.scripts,
				...updatedScripts,
			},
		});
		this.log(Format.success(`Scripts updated successfully`));
	}

	install() {
		this.spawnCommand(`bun`, [`add`, `@dotenvx/dotenvx`]);
	}
};
