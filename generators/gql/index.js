"use-strict";
const Generator = require(`yeoman-generator`);
const { Format } = require(`../../lib/Format`);

const Args = {
	SCHEMA_PATH: `schemaPath`,
	HEADERS: `headers`,
	DOCUMENTS: `documentPaths`,
	OUTPUT_PATH: `outputPath`,
};

module.exports = class extends Generator {
	constructor(args, opts) {
		super(args, opts);

		this.parseDocumentsConfigStr = (documentsConfigStr) => {
			const cleanedStr = documentsConfigStr.replace(/'/g, `"`);
			return JSON.parse(cleanedStr);
		};

		this.argument(Args.SCHEMA_PATH, {
			type: String,
			required: false,
			description: `Path or URL to the schema file`,
		});

		this.argument(Args.HEADERS, {
			type: String,
			required: false,
			description: `Custom headers as an object in JSON`,
		});

		this.argument(Args.DOCUMENTS, {
			type: String,
			required: false,
			description: `Graphql generator "documents" config option as an array JSON string`,
		});

		this.argument(Args.OUTPUT_PATH, {
			type: String,
			required: false,
			description: `Path to the output file`,
		});
	}

	async prompting() {
		this.schemaPath =
			this.options[Args.SCHEMA_PATH] ||
			(
				await this.prompt({
					type: `input`,
					name: Args.SCHEMA_PATH,
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
			)[Args.SCHEMA_PATH];

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
				this.options[Args.HEADERS] ||
				(
					await this.prompt({
						type: `input`,
						name: Args.HEADERS,
						message: `Please provide the custom headers as an object in JSON`,
					})
				)[Args.HEADERS];
		} else {
			this.headers = undefined;
		}
		const documentsAnswer =
			this.options[Args.DOCUMENTS] ||
			(
				await this.prompt({
					type: `input`,
					name: Args.DOCUMENTS,
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
			)[Args.DOCUMENTS];

		this.documents = this.parseDocumentsConfigStr(documentsAnswer);

		this.outputPath =
			this.options[Args.OUTPUT_PATH] ||
			(
				await this.prompt({
					type: `input`,
					name: Args.OUTPUT_PATH,
					message: `Where would you like to save the generated output?`,
					validate: (input) => {
						if (!input) {
							return `Output path is required`;
						}
						return true;
					},
				})
			)[Args.OUTPUT_PATH];

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
				[Args.SCHEMA_PATH]: this.schemaPath,
				[Args.HEADERS]: this.headers,
				[Args.DOCUMENTS]: this.documents,
				[Args.OUTPUT_PATH]: this.outputPath,
			},
		);
		this.log(Format.success(`codegen config file generated successfully`));

		this.log(Format.step(`Adding codegens script to package.json`));
		this.fs.extendJSON(this.packageJson.path, {
			scripts: {
				"gen:gql": `bunx graphql-codegen`,
				"gen:gql:watch": `bunx graphql-codegen --watch`,
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
};
