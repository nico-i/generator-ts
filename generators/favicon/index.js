"use-strict";
const Generator = require(`yeoman-generator`);
const { Format } = require(`../../lib/Format`);

const Args = {
	FAVICON_PATH: `faviconPath`,
	OUTPUT_DIR_PATH: `outputDirPath`,
};

module.exports = class extends Generator {
	constructor(args, opts) {
		super(args, opts);
		this.argument(Args.FAVICON_PATH, {
			type: String,
			required: false,
		});
		this.argument(Args.OUTPUT_DIR_PATH, {
			type: String,
			required: false,
		});
	}

	async prompting() {
		this.faviconPath =
			this.options[Args.FAVICON_PATH] ||
			(
				await this.prompt([
					{
						type: `input`,
						name: Args.FAVICON_PATH,
						message: `What is the path to the favicon?`,
						default: `favicon.png`,
					},
				])
			)[Args.FAVICON_PATH];
		this.outputDirPath =
			this.options[Args.OUTPUT_DIR_PATH] ||
			(
				await this.prompt([
					{
						type: `input`,
						name: Args.OUTPUT_DIR_PATH,
						message: `Where should the generated favicon files be saved?`,
						default: `public`,
					},
				])
			)[Args.OUTPUT_DIR_PATH];
	}

	writing() {
		if (!this.fs.exists(this.destinationPath(`faviconDescription.json`))) {
			this.log(Format.step(`Creating faviconDescription.json template`));
			this.fs.copyTpl(
				this.templatePath(`faviconDescription.json`),
				this.destinationPath(`faviconDescription.json`),
				{
					faviconPath: this.faviconPath,
				},
			);
			this.log(Format.success(`faviconDescription.json template created`));
		} else {
			this.log(
				Format.warning(
					`faviconDescription.json already exists. Using existing file for generation config.`,
				),
			);
		}
	}

	install() {
		this.log(Format.step(`Generating favicon files`));
		this.spawnCommandSync(`bunx`, [
			`cli-real-favicon`,
			`generate`,
			this.destinationPath(`faviconDescription.json`),
			this.destinationPath(`tmp.json`),
			this.outputDirPath,
		]);
		this.log(Format.success(`Favicon files generated`));

		this.log(Format.step(`Generating pastable HTML code`));
		this.htmlCode = this.fs.readJSON(
			this.destinationPath(`tmp.json`),
		).favicon.html_code;
		this.log(Format.success(`Pastable HTML code generated`));
	}

	end() {
		this.log(
			[
				Format.instruction(
					`\nPlease add the following code to the head of your HTML file:\n`,
				),
				this.htmlCode,
			].join(`\n`),
		);

		this.log(Format.step(`Deleting temporary files`));
		this.spawnCommandSync(`rm`, [this.destinationPath(`tmp.json`)]);
		this.log(Format.success(`Temporary files deleted`));
	}
};
