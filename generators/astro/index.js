"use-strict";
const Generator = require("yeoman-generator");
const { ConfigKeys } = require("../../lib/ConfigKeys");

const AdditionalFeatures = {
	I18N: `i18n`,
	E2E_TESTS: `Playwright`,
	GQL: `GraphQL TS SDK generation`,
	DOT_ENV: `dotenvx`
};

module.exports = class extends Generator {
	initializing() {
		this.destinationRoot(this.destinationPath("./test"));
	}

	async prompting() {
		this.projectAuthorName =
			this.config.get(ConfigKeys.PROJECT_AUTHOR_NAME) ||
			(await this.prompt([
				{
					type: "input",
					name: "name",
					message: "What is your name?",
					default: "Nico Ismaili"
				}
			]));
		this.projectName =
			this.config.get(ConfigKeys.PROJECT_NAME) ||
			(await this.prompt([
				{
					type: "input",
					name: "name",
					message: "What is the name of this project?",
					default: "ssg-project"
				}
			]));
		this.projectDescription =
			this.config.get(ConfigKeys.PROJECT_DESCRIPTION) ||
			(await this.prompt([
				{
					type: "input",
					name: "description",
					message: "Write a brief description of your app",
					default: "A static site generator project"
				}
			]));

		this.appTitle = await this.prompt([
			{
				type: "input",
				name: "site",
				message: "What is the title of your website?",
				default: "Astro App"
			}
		]);

		this.additionalFeatures = await this.prompt([
			{
				type: "checkbox",
				name: "features",
				message: "Select additional features to include in your project",
				choices: Object.values(AdditionalFeatures)
			}
		]);
	}

	writing() {
		this.fs.copy(this.templatePath(), this.destinationPath(), {
			globOptions: { dot: true }
		});

		// package.json
		this.fs.copyTpl(
			this.templatePath("package.json"),
			this.destinationPath("package.json"),
			{
				name: this.projectName,
				description: this.projectDescription,
				author: this.projectAuthorName
			}
		);
		// index.astro
		this.fs.copyTpl(
			this.templatePath("src/pages/index.astro"),
			this.destinationPath("src/pages/index.astro"),
			{
				title: this.appTitle
			}
		);
		// README.md
		this.fs.copyTpl(
			this.templatePath("README.md"),
			this.destinationPath("README.md"),
			{
				title: this.appTitle,
				description: this.projectDescription
			}
		);

		this.composeWith(require.resolve("../ts"));
		this.composeWith(require.resolve("../husky"));
		this.composeWith(require.resolve("../lint"));
		this.composeWith(require.resolve("../renovate"));
	}

	install() {
		this.spawnCommand("bun", ["install"]);
	}
};
