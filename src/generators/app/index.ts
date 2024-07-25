import chalk from "chalk";
import Generator from "yeoman-generator";
import yosay from "yosay";
import { Format } from "../../lib/Format";
import { GeneratorArgs } from "../../lib/types/Args";
import { GeneratorOptions } from "../../lib/types/Options";

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
	private projectName: string;
	private projectDescription: string = `A TypeScript project`;
	private projectType: ProjectTypes = ProjectTypes.SSG;

	private hasDotGit: boolean = false;
	private initGit: boolean = false;

	constructor(args: GeneratorArgs, opts: GeneratorOptions) {
		super(args, opts);
		this.projectName = this.destinationRoot().split(`/`).pop() || "ts-project";
	}

	initializing() {
		this.log(
			yosay(
				`${chalk.green(`Welcome`)} to ${chalk.red(`Nico's`)} ${chalk.blue(
					`TypeScript`,
				)} project ${chalk.yellow(`generator`)}!`,
			),
		);

		this.hasDotGit = this.fs.exists(this.destinationPath(`.git`));
	}

	async prompting() {
		if (this.hasDotGit) {
			this.initGit = (
				await this.prompt([
					{
						type: `confirm`,
						name: `initGit`,
						message: `Initialize a new Git repository?`,
						default: true,
					},
				])
			).initGit;
		}
		this.projectAuthorName = (
			await this.prompt([
				{
					type: `input`,
					name: OptionNames.PROJECT_AUTHOR_NAME,
					message: `What is your name?`,
					default: this.projectAuthorName,
				},
			])
		)[OptionNames.PROJECT_AUTHOR_NAME];
		this.projectName = (
			await this.prompt([
				{
					type: `input`,
					name: OptionNames.PROJECT_NAME,
					message: `What is the name of this project?`,
					default: this.projectName,
				},
			])
		)[OptionNames.PROJECT_NAME];
		this.projectDescription = (
			await this.prompt([
				{
					type: `input`,
					name: OptionNames.PROJECT_DESCRIPTION,
					message: `Write a brief description of your app`,
					default: this.projectDescription,
				},
			])
		)[OptionNames.PROJECT_DESCRIPTION];
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
	}

	writing() {
		if (this.initGit) {
			this.spawnCommandSync(`git`, [`init`]);
		}

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
