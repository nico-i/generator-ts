"use-strict";
const Generator = require(`yeoman-generator`);
const { PromptItems } = require(`../../lib/PromptItems`);

const AdditionalFeatures = {
	I18N: `i18n`,
	E2E_TESTS: `Playwright`,
	GQL: `GraphQL TS SDK generation`,
	DOT_ENV: `dotenvx`,
	FAVICON_GEN: `Favicon generation`,
};

module.exports = class extends Generator {
	constructor(args, opts) {
		super(args, opts);
		this.argument(PromptItems.PROJECT_AUTHOR_NAME, {
			type: String,
			required: false,
		});
		this.argument(PromptItems.PROJECT_NAME, {
			type: String,
			required: false,
		});
		this.argument(PromptItems.PROJECT_DESCRIPTION, {
			type: String,
			required: false,
		});
	}

	async prompting() {
		this.projectAuthorName =
			this.options[PromptItems.PROJECT_AUTHOR_NAME] ||
			(await this.prompt([
				{
					type: `input`,
					name: PromptItems.PROJECT_AUTHOR_NAME,
					message: `What is your name?`,
					default: `Nico Ismaili`,
				},
			]));

		this.projectName =
			this.options[PromptItems.PROJECT_NAME] ||
			(await this.prompt([
				{
					type: `input`,
					name: PromptItems.PROJECT_NAME,
					message: `What is the name of this project?`,
					default: `ssg-project`,
				},
			]));

		this.projectDescription =
			this.options[PromptItems.PROJECT_DESCRIPTION] ||
			(
				await this.prompt([
					{
						type: `input`,
						name: PromptItems.PROJECT_DESCRIPTION,
						message: `Write a brief description of your app`,
						default: `A static site generator project`,
					},
				])
			)[PromptItems.PROJECT_DESCRIPTION];

		this.appTitle = (
			await this.prompt([
				{
					type: `input`,
					name: `site`,
					message: `What is the title of your website?`,
					default: `Astro App`,
				},
			])
		).site;

		this.additionalFeatures = (
			await this.prompt([
				{
					type: `checkbox`,
					name: `features`,
					message: `Select additional features to include in your project`,
					choices: Object.values(AdditionalFeatures),
				},
			])
		).features;
	}

	writing() {
		this.fs.copy(this.templatePath(), this.destinationPath(), {
			globOptions: { dot: true },
		});

		// package.json
		this.fs.copyTpl(
			this.templatePath(`package.json`),
			this.destinationPath(`package.json`),
			{
				name: this.projectName,
				description: this.projectDescription,
				author: this.projectAuthorName,
			},
		);
		// index.astro
		this.fs.copyTpl(
			this.templatePath(`src/pages/index.astro`),
			this.destinationPath(`src/pages/index.astro`),
			{
				title: this.appTitle,
			},
		);
		// README.md
		this.fs.copyTpl(
			this.templatePath(`README.md`),
			this.destinationPath(`README.md`),
			{
				title: this.appTitle,
				description: this.projectDescription,
			},
		);

		this.composeWith(require.resolve(`../ts`));
		this.composeWith(require.resolve(`../husky`));
		this.composeWith(require.resolve(`../lint`));
		this.composeWith(require.resolve(`../renovate`));

		this.additionalFeatures.forEach((feature) => {
			switch (feature) {
				case AdditionalFeatures.I18N:
					this.composeWith(require.resolve(`../astro-i18n`));
					break;
				case AdditionalFeatures.E2E_TESTS:
					this.composeWith(require.resolve(`../playwright`));
					break;
				case AdditionalFeatures.GQL:
					this.composeWith(require.resolve(`../gql`));
					break;
				case AdditionalFeatures.DOT_ENV:
					this.composeWith(require.resolve(`../env`));
					break;
				case AdditionalFeatures.FAVICON_GEN:
					this.composeWith(require.resolve(`../favicon`));
					break;
			}
		});
	}

	install() {
		this.spawnCommand(`bun`, [`install`]);
	}
};
