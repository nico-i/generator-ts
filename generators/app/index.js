"use-strict";
const { default: chalk } = require("chalk");
const Generator = require("yeoman-generator");
const yosay = require("yosay");
const { ConfigKeys } = require("../../lib/ConfigKeys");
const { ProjectTypes } = require("../../lib/ProjectTypes");
const { Format } = require("../../lib/Format");

module.exports = class extends Generator {
	initializing() {
		this.log(
			yosay(
				`${chalk.green("Welcome")} to ${chalk.red("Nico's")} ${chalk.blue(
					"TypeScript"
				)} project ${chalk.yellow("generator")}!`
			)
		);
	}

	async prompting() {
		this.projectAuthorName = await this.prompt([
			{
				type: "input",
				name: "name",
				message: "What is your name?",
				default: "Nico Ismaili"
			}
		]);
		this.config.set(ConfigKeys.PROJECT_AUTHOR_NAME, this.projectAuthorName);

		this.projectName = await this.prompt([
			{
				type: "input",
				name: "name",
				message: "What is the name of this project?",
				default: "ts-project"
			}
		]);
		this.config.set(ConfigKeys.PROJECT_NAME, this.projectName);

		this.projectDescription = await this.prompt([
			{
				type: "input",
				name: "description",
				message: "Write a brief description of your app",
				default: "A TypeScript project"
			}
		]);
		this.config.set(ConfigKeys.PROJECT_DESCRIPTION, this.projectDescription);

		this.projectType = await this.prompt([
			{
				type: "list",
				name: "type",
				message: "What type of project is this?",
				choices: Object.values(ProjectTypes),
				default: ProjectTypes.SSG
			}
		]);

		switch (this.projectType.type) {
			case ProjectTypes.SSG:
				this.composeWith(require.resolve("../astro"));
				break;
			case ProjectTypes.PACKAGE:
				throw new Error(chalk.red("Package project type not yet implemented."));
			case ProjectTypes.SCRIPT:
				throw new Error(chalk.red("Script project type not yet implemented."));
		}
	}

	configuring() {
		this.config.save();
	}

	end() {
		this.log(Format.success("All done!"));
	}
};
