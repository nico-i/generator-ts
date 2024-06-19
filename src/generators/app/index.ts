import chalk from "chalk";
import Generator from "yeoman-generator";
import yosay from "yosay";
import { Format } from "../../lib/Format";

enum ProjectTypes {
	SSG = `SSG-based Web App`,
	PACKAGE = `NPM package`,
	SCRIPT = `Node.js script`,
}

enum OptionNames {
	PROJECT_AUTHOR_NAME = `projectAuthorName`,
	PROJECT_NAME = `projectName`,
	PROJECT_DESCRIPTION = `projectDescription`,
}

export default class extends Generator {
	private projectAuthorName: string = `Nico Ismaili`;
	private projectName: string = `ts-project`;
	private projectDescription: string = `A TypeScript project`;
	private projectType: ProjectTypes = ProjectTypes.SSG;

	initializing() {
		this.log(
			yosay(
				`${chalk.green(`Welcome`)} to ${chalk.red(`Nico's`)} ${chalk.blue(
					`TypeScript`,
				)} project ${chalk.yellow(`generator`)}!`,
			),
		);
	}

	async prompting() {
		this.projectAuthorName = await this.prompt([
			{
				type: `input`,
				name: OptionNames.PROJECT_AUTHOR_NAME,
				message: `What is your name?`,
				default: this.projectAuthorName,
			},
		]);
		this.projectName = await this.prompt([
			{
				type: `input`,
				name: OptionNames.PROJECT_NAME,
				message: `What is the name of this project?`,
				default: this.projectName,
			},
		]);
		this.projectDescription = await this.prompt([
			{
				type: `input`,
				name: OptionNames.PROJECT_DESCRIPTION,
				message: `Write a brief description of your app`,
				default: this.projectDescription,
			},
		]);
		this.projectType = (
			await this.prompt([
				{
					type: `list`,
					name: `type`,
					message: `What type of project is this?`,
					choices: Object.values(ProjectTypes),
					default: this.projectType,
				},
			])
		).type;

		switch (this.projectType) {
			case ProjectTypes.SSG:
				this.composeWith(require.resolve(`../astro`), {
					[OptionNames.PROJECT_AUTHOR_NAME]: this.projectAuthorName,
					[OptionNames.PROJECT_NAME]: this.projectName,
					[OptionNames.PROJECT_DESCRIPTION]: this.projectDescription,
				});
				break;
			case ProjectTypes.PACKAGE:
				throw new Error(chalk.red(`Package project type not yet implemented.`));
			case ProjectTypes.SCRIPT:
				throw new Error(chalk.red(`Script project type not yet implemented.`));
		}
	}

	end() {
		this.log(Format.success(`All done!`));
	}
}
