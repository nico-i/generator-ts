import Generator from "yeoman-generator";

enum Features {
	I18N = `i18n`,
	E2E_TESTS = `Playwright`,
	GQL = `GraphQL TS SDK generation`,
	DOT_ENV = `dotenvx`,
	FAVICON_GEN = `Favicon generation`,
}

enum OptionNames {
	PROJECT_AUTHOR_NAME = `projectAuthorName`,
	PROJECT_NAME = `projectName`,
	PROJECT_DESCRIPTION = `projectDescription`,
	FEATURES = `additionalFeatures`,
	APP_TITLE = `appTitle`,
}

interface Options {
	[OptionNames.PROJECT_AUTHOR_NAME]: string;
	[OptionNames.PROJECT_NAME]: string;
	[OptionNames.PROJECT_DESCRIPTION]: string;
	[OptionNames.APP_TITLE]: string;
	[OptionNames.FEATURES]: Features[];
}

type Answers = Generator.GeneratorOptions & Options;

export default class extends Generator<Options> {
	private projectAuthorName: Answers[OptionNames.PROJECT_AUTHOR_NAME] = `Nico Ismaili`;
	private projectName: Answers[OptionNames.PROJECT_NAME] = `ssg-project`;
	private projectDescription: Answers[OptionNames.PROJECT_DESCRIPTION] = `Astro App`;
	private appTitle: Answers[OptionNames.APP_TITLE] = `Astro App`;
	private additionalFeatures: Answers[OptionNames.FEATURES] = [];

	constructor(args: string | string[], opts: Options) {
		super(args, opts);
		Object.values(OptionNames).forEach((value) => {
			this.argument(value, {
				type: String,
				required: false,
			});
		});
	}

	async prompting() {
		this.projectAuthorName =
			this.options[OptionNames.PROJECT_AUTHOR_NAME] ||
			(
				await this.prompt([
					{
						type: `input`,
						name: OptionNames.PROJECT_AUTHOR_NAME,
						message: `What is your name?`,
						default: this.projectAuthorName,
					},
				])
			)[OptionNames.PROJECT_AUTHOR_NAME];
		this.projectName =
			this.options[OptionNames.PROJECT_NAME] ||
			(
				await this.prompt([
					{
						type: `input`,
						name: OptionNames.PROJECT_NAME,
						message: `What is the name of this project?`,
						default: this.projectName,
					},
				])
			)[OptionNames.PROJECT_NAME];

		this.projectDescription =
			this.options[OptionNames.PROJECT_DESCRIPTION] ||
			(
				await this.prompt([
					{
						type: `input`,
						name: OptionNames.PROJECT_DESCRIPTION,
						message: `Write a brief description of your app`,
						default: this.projectDescription,
					},
				])
			)[OptionNames.PROJECT_DESCRIPTION];

		this.appTitle = (
			await this.prompt([
				{
					type: `input`,
					name: OptionNames.APP_TITLE,
					message: `What is the title of your website?`,
					default: this.appTitle,
				},
			])
		)[OptionNames.APP_TITLE];

		this.additionalFeatures = (
			await this.prompt([
				{
					type: `checkbox`,
					name: OptionNames.FEATURES,
					message: `Select additional features to include in your project`,
					choices: Object.values(Features),
				},
			])
		)[OptionNames.FEATURES];
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
				case Features.I18N:
					this.composeWith(require.resolve(`../astro-i18n`));
					break;
				case Features.E2E_TESTS:
					this.composeWith(require.resolve(`../playwright`));
					break;
				case Features.GQL:
					this.composeWith(require.resolve(`../gql`));
					break;
				case Features.DOT_ENV:
					this.composeWith(require.resolve(`../env`));
					break;
				case Features.FAVICON_GEN:
					this.composeWith(require.resolve(`../favicon`));
					break;
			}
		});
	}

	install() {
		this.spawnCommand(`bun`, [`install`]);
	}
}
