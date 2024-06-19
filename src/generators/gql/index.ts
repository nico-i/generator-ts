import Generator from "yeoman-generator";
import { Format } from "../../lib/Format";
import { GeneratorArgs } from "../../lib/types/Args";
import { GeneratorOptions } from "../../lib/types/Options";

enum OptionNames {
	SCHEMA_PATH = `schemaPath`,
	HEADERS = `headers`,
	DOCUMENTS = `documentPaths`,
	OUTPUT_PATH = `outputPath`,
}

interface Options {
	[OptionNames.SCHEMA_PATH]: string;
	[OptionNames.HEADERS]: string;
	[OptionNames.DOCUMENTS]: string;
	[OptionNames.OUTPUT_PATH]: string;
}

export default class extends Generator<Options> {
	private schemaPath: string = ``;
	private headers: string | undefined;
	private documents: string = `[]`;
	private outputPath: string = ``;
	private setupWatcher: boolean = true;

	private parseDocumentsConfigStr(documentsValue: string) {
		const cleanedStr = documentsValue.replace(/'/g, `"`);
		return JSON.parse(cleanedStr);
	}

	constructor(args: GeneratorArgs, opts: GeneratorOptions<Options>) {
		super(args, opts);

		this.argument(OptionNames.SCHEMA_PATH, {
			type: String,
			required: false,
			description: `Path or URL to the schema file`,
		});

		this.argument(OptionNames.HEADERS, {
			type: String,
			required: false,
			description: `Custom headers as an object in JSON`,
		});

		this.argument(OptionNames.DOCUMENTS, {
			type: String,
			required: false,
			description: `Graphql generator "documents" config option as an array JSON string`,
		});

		this.argument(OptionNames.OUTPUT_PATH, {
			type: String,
			required: false,
			description: `Path to the output file`,
		});
	}

	async prompting() {
		this.schemaPath =
			this.options[OptionNames.SCHEMA_PATH] ||
			(
				await this.prompt({
					type: `input`,
					name: OptionNames.SCHEMA_PATH,
					message: `What is the path / URL to your schema file?`,
					validate: (input) => {
						if (!input) {
							return `Schema path is required`;
						}
						if (!this.fs.exists(input)) {
							try {
								const url = new URL(input);
								if (url.protocol === `http:` || url.protocol === `https:`) {
									return true;
								}
							} catch (e) {
								return `Schema file does not exist`;
							}
						}

						return true;
					},
				})
			)[OptionNames.SCHEMA_PATH];

		const hasCustomHeaders = (
			await this.prompt({
				type: `confirm`,
				name: `hasCustomHeaders`,
				message: `Are custom headers required to access the schema?`,
				default: false,
			})
		).hasCustomHeaders;

		if (hasCustomHeaders) {
			this.headers =
				this.options[OptionNames.HEADERS] ||
				(
					await this.prompt({
						type: `input`,
						name: OptionNames.HEADERS,
						message: `Please provide the custom headers as an object in JSON`,
					})
				)[OptionNames.HEADERS];
		} else {
			this.headers = undefined;
		}
		const documentsAnswer =
			this.options[OptionNames.DOCUMENTS] ||
			(
				await this.prompt({
					type: `input`,
					name: OptionNames.DOCUMENTS,
					message: `What are the patterns to find the GraphQL definitions in your project?`,
					validate: (input) => {
						if (!input) {
							return `At least one pattern is required`;
						}
						try {
							const patternList = this.parseDocumentsConfigStr(input);
							if (patternList.lenght === 0) {
								return `At least one pattern is required`;
							}
						} catch (e) {
							return `Patterns must be provided as a JSON array of strings. "${input}" is not parsable to JSON.`;
						}
						return true;
					},
				})
			)[OptionNames.DOCUMENTS];

		this.documents = this.parseDocumentsConfigStr(documentsAnswer);

		this.outputPath =
			this.options[OptionNames.OUTPUT_PATH] ||
			(
				await this.prompt({
					type: `input`,
					name: OptionNames.OUTPUT_PATH,
					message: `Where would you like to save the generated output?`,
					validate: (input) => {
						if (!input) {
							return `Output path is required`;
						}
						return true;
					},
				})
			)[OptionNames.OUTPUT_PATH];

		this.setupWatcher = (
			await this.prompt({
				type: `confirm`,
				name: `setupWatcher`,
				message: `Would you like to setup a watcher for the codegen script?`,
				default: true,
			})
		).setupWatcher;
	}

	writing() {
		this.log(Format.step(`Generating codegen config file`));
		this.fs.copyTpl(
			this.templatePath(`codegen.ts`),
			this.destinationPath(`codegen.ts`),
			{
				[OptionNames.SCHEMA_PATH]: this.schemaPath,
				[OptionNames.HEADERS]: this.headers,
				[OptionNames.DOCUMENTS]: this.documents,
				[OptionNames.OUTPUT_PATH]: this.outputPath,
			},
		);
		this.log(Format.success(`codegen config file generated successfully`));

		this.log(Format.step(`Adding codegens script to package.json`));
		this.fs.extendJSON(this.destinationPath(`package.json`), {
			scripts: {
				"gen:gql": `bunx graphql-codegen`,
				...(this.setupWatcher
					? { "gen:gql:watch": `bunx graphql-codegen --watch` }
					: {}),
			},
		});
		this.log(Format.success(`scripts added successfully`));
	}

	install() {
		this.spawnCommand(`bun`, [
			`add`,
			`-D`,
			`@graphql-codegen/cli`,
			`@graphql-codegen/typescript`,
			`@graphql-codegen/typescript-generic-sdk`,
			`@graphql-codegen/typescript-operations`,
			`@parcel/watcher`,
		]);
	}
}
