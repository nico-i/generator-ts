import Generator from "yeoman-generator";
import { Format } from "../../lib/Format";

export default class extends Generator {
	private locales: string[] = [];
	private defaultLocale: string = ``;

	initializing() {
		if (!this.fs.exists(this.destinationPath(`package.json`))) {
			throw new Error(
				`No package.json found in the project directory. Please run this generator in the root of your project.`,
			);
		}
	}

	async prompting() {
		this.locales = (
			await this.prompt([
				{
					type: `checkbox`,
					name: `locales`,
					message: `What languages would you like to support?`,
					required: true,
					choices: [
						{
							value: `en`,
							name: `English`,
							checked: true,
						},
						{
							value: `de`,
							name: `German`,
							checked: true,
						},
						{
							value: `fr`,
							name: `French`,
						},
						{
							value: `es`,
							name: `Spanish`,
						},

						{
							value: `no`,
							name: `Norwegian`,
						},
					],
				},
			])
		).locales;

		this.defaultLocale = this.locales.includes(`en`) ? `en` : this.locales[0];

		this.defaultLocale = (
			await this.prompt([
				{
					type: `list`,
					name: `defaultLocale`,
					message: `What is the default locale?`,
					choices: this.locales,
					default: this.defaultLocale,
				},
			])
		).defaultLocale;
	}

	writing() {
		this.log(Format.step(`Adding \`gen:i18n\` script to package.json`));
		this.fs.extendJSON(this.destinationPath(`package.json`), {
			scripts: {
				"gen:i18n": `bunx astro-i18next generate`,
			},
		});
		this.log(Format.success(`Scripts updated successfully`));

		this.log(
			Format.step(`Copying locales and corresponding translation messages`),
		);
		this.locales.forEach((locale) => {
			this.fs.copy(
				this.templatePath(`public/locales/${locale}/common.json`),
				this.destinationPath(`public/locales/${locale}/common.json`),
			);
		});
		this.log(Format.success(`Locales copied successfully`));

		this.log(Format.step(`Adding astro-i18next config`));
		this.fs.copyTpl(
			this.templatePath(`astro-i18next.config.mjs`),
			this.destinationPath(`astro-i18next.config.mjs`),
			{
				defaultLocale: this.defaultLocale,
				locales: this.locales,
			},
		);
		this.log(Format.success(`astro-i18next config added successfully`));

		this.log(Format.step(`Updating Astro config with astro-i18next`));
		if (!this.fs.exists(this.destinationPath(`astro.config.mjs`))) {
			throw new Error(
				`No astro.config.mjs found in the project directory. Please run this generator in the root of your project.`,
			);
		} else {
			const astroConfig = this.fs.read(this.destinationPath(`astro.config.mjs`));
			if (astroConfig.includes(`astroI18next`)) {
				throw new Error(
					`Your project already contains a astro-i18next integration in astro.config.mjs`,
				);
			}
			let newAstroConfig =
				`import astroI18next from "astro-i18next";` + astroConfig;
			if (astroConfig.includes(`integrations:`)) {
				newAstroConfig = newAstroConfig.replace(
					`integrations: [`,
					`integrations: [astroI18next()`,
				);
			} else {
				newAstroConfig = newAstroConfig.replace(
					`defineConfig({`,
					`defineConfig({
					integrations: [astroI18next()],`,
				);
			}
			this.log(newAstroConfig);
			this.fs.delete(this.destinationPath(`astro.config.mjs`));
			this.fs.write(this.destinationPath(`astro.config.mjs`), newAstroConfig);
		}
		this.log(Format.success(`Astro config update successful`));
	}

	install() {
		this.spawnCommand(`bun`, [`add`, `astro-i18next`]);
	}
}
