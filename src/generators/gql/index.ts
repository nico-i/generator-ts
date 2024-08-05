import Generator from "yeoman-generator";
import { Format } from "../../lib/Format.js";
import { GeneratorArgs } from "../../lib/types/Args.js";
import { GeneratorOptions } from "../../lib/types/Options.js";

enum OptionNames {
	API_URL = `apiUrl`,
	HEADERS = `headers`,
	DOCUMENTS = `documentPaths`,
	OUTPUT_PATH = `outputPath`,
}

type Options = {
	[OptionNames.API_URL]: string;
	[OptionNames.HEADERS]: string;
	[OptionNames.DOCUMENTS]: string;
	[OptionNames.OUTPUT_PATH]: string;
};

export default class extends Generator<Options> {
	private apiUrl: string = ``;
	private headers: string | undefined;
	private documents: string = `[]`;
	private outputPath: string = ``;
	private setupWatcher: boolean = true;

	constructor(args: GeneratorArgs, opts: GeneratorOptions<Options>) {
		super(args, opts);

		this.argument(OptionNames.API_URL, {
			type: String,
			required: false,
			description: `URL to the GraphQL API`,
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
		this.apiUrl =
			this.options[OptionNames.API_URL] ||
			(
				await this.prompt({
					type: `input`,
					name: OptionNames.API_URL,
					message: `What is the URL of your GraphQL API?`,
					validate: (input) => {
						if (!input) {
							return `API URL is required`;
						}
						try {
							const url = new URL(input);
							if (url.protocol === `http:` || url.protocol === `https:`) {
								return true;
							}
							// eslint-disable-next-line @typescript-eslint/no-unused-vars
						} catch (e) {
							return `Invalid URL`;
						}

						return true;
					},
				})
			)[OptionNames.API_URL];

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
					default: `[ "./src/**/*.graphql" ]`,
					validate: (input) => {
						if (!input) {
							return `At least one pattern is required`;
						}
						try {
							const patternList = JSON.parse(input);
							if (patternList.lenght === 0) {
								return `At least one pattern is required`;
							}
							// eslint-disable-next-line @typescript-eslint/no-unused-vars
						} catch (e) {
							return `Patterns must be provided as a JSON array of strings. "${input}" is not parsable to JSON.`;
						}
						return true;
					},
				})
			)[OptionNames.DOCUMENTS];

		this.documents = JSON.parse(documentsAnswer);

		this.outputPath =
			this.options[OptionNames.OUTPUT_PATH] ||
			(
				await this.prompt({
					type: `input`,
					name: OptionNames.OUTPUT_PATH,
					default: `./infrastructure/graphql/sdk.ts`,
					message: `Where would you like to put the generated sdk?`,
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

	async writing() {
		this.log(Format.step("Fetching schema from the API"));
		try {
			const res = await fetch(this.apiUrl, {
				method: `POST`,
				headers: {
					"Content-Type": `application/json`,
					...(this.headers ? JSON.parse(this.headers) : {}),
				},
				body: JSON.stringify({
					query: `
	fragment FullType on __Type {
		kind
		name
		fields(includeDeprecated: true) {
			name
			args {
				...InputValue
			}
			type {
				...TypeRef
			}
			isDeprecated
			deprecationReason
		}
		inputFields {
			...InputValue
		}
		interfaces {
			...TypeRef
		}
		enumValues(includeDeprecated: true) {
			name
			isDeprecated
			deprecationReason
		}
		possibleTypes {
			...TypeRef
		}
	}
	fragment InputValue on __InputValue {
		name
		type {
			...TypeRef
		}
		defaultValue
	}
	fragment TypeRef on __Type {
		kind
		name
		ofType {
			kind
			name
			ofType {
				kind
				name
				ofType {
					kind
					name
					ofType {
						kind
						name
						ofType {
							kind
							name
							ofType {
								kind
								name
								ofType {
									kind
									name
								}
							}
						}
					}
				}
			}
		}
	}
	query IntrospectionQuery {
		__schema {
			queryType {
				name
			}
			mutationType {
				name
			}
			types {
				...FullType
			}
			directives {
				name
				locations
				args {
					...InputValue
				}
			}
		}
	}
`,
				}),
			}).then((res) => res.json());

			if (typeof res !== "object" || res === null || "data" in res === false) {
				throw new Error(`Failed to fetch schema`);
			}

			const data = res.data;
			this.log(Format.success("Schema fetched successfully"));
			this.log(Format.step("Writing schema to file"));
			this.fs.write(this.destinationPath(`schema.json`), JSON.stringify(data));
			this.log(Format.success("Schema written to file"));
		} catch (error: unknown) {
			throw new Error(`Failed to fetch schema: ${error}`);
		}

		this.log(Format.step(`Generating codegen config file`));
		this.fs.copyTpl(
			this.templatePath(`codegen.ts`),
			this.destinationPath(`codegen.ts`),
			{
				schemaPath: `./schema.json`,
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
