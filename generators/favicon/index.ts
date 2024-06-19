import Generator from "yeoman-generator";
import { Format } from "../../utils/Format";

enum OptionNames {
	FAVICON_PATH = `faviconPath`,
	OUTPUT_DIR_PATH = `outputDirPath`,
}

interface Options {
	[OptionNames.FAVICON_PATH]: string;
	[OptionNames.OUTPUT_DIR_PATH]: string;
}

module.exports = class extends Generator<Options> {
	private faviconPath: string = ``;
	private outputDirPath: string = ``;
	private htmlCode: string = ``;

	constructor(args: string | string[], opts: Options) {
		super(args, opts);

		this.argument(OptionNames.FAVICON_PATH, {
			type: String,
			required: false,
		});
		this.argument(OptionNames.OUTPUT_DIR_PATH, {
			type: String,
			required: false,
		});
	}

	async prompting() {
		this.faviconPath =
			this.options[OptionNames.FAVICON_PATH] ||
			(
				await this.prompt([
					{
						type: `input`,
						name: OptionNames.FAVICON_PATH,
						message: `What is the path to the favicon?`,
						default: `favicon.png`,
					},
				])
			)[OptionNames.FAVICON_PATH];
		this.outputDirPath =
			this.options[OptionNames.OUTPUT_DIR_PATH] ||
			(
				await this.prompt([
					{
						type: `input`,
						name: OptionNames.OUTPUT_DIR_PATH,
						message: `Where should the generated favicon files be saved?`,
						default: `public`,
					},
				])
			)[OptionNames.OUTPUT_DIR_PATH];
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
