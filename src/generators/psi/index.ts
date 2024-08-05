import Generator from "yeoman-generator";
import { Format } from "../../lib/Format.js";
import { GeneratorArgs } from "../../lib/types/Args.js";
import { GeneratorOptions } from "../../lib/types/Options.js";

enum OptionNames {
	DEPLOY_WORKFLOW_NAME = `deployWorkflowName`,
	OUTPUT_DIR = `outputDir`,
	DEPLOYED_PAGE_URL = `deployedPageUrl`,
}

type Options = {
	[OptionNames.DEPLOY_WORKFLOW_NAME]: string;
	[OptionNames.OUTPUT_DIR]: string;
	[OptionNames.DEPLOYED_PAGE_URL]: string;
};

export default class extends Generator<Options> {
	private deployWorkflowName: string = ``;
	private outputDir: string = ``;
	private deployedPageUrl: string = ``;

	constructor(args: GeneratorArgs<Options>, opts: GeneratorOptions<Options>) {
		super(args, opts);

		this.argument(OptionNames.DEPLOY_WORKFLOW_NAME, {
			type: String,
			required: false,
			description: `The name of the deploy workflow`,
		});

		this.argument(OptionNames.OUTPUT_DIR, {
			type: String,
			required: false,
			description: `The output directory`,
		});

		this.argument(OptionNames.DEPLOYED_PAGE_URL, {
			type: String,
			required: false,
			description: `The URL of the deployed page`,
		});
	}

	async prompting() {
		const answers = await this.prompt([
			{
				type: `input`,
				name: OptionNames.DEPLOY_WORKFLOW_NAME,
				message: `What is the name of the deploy workflow?`,
				default: `Deploy to GitHub Pages`,
			},
			{
				type: `input`,
				name: OptionNames.OUTPUT_DIR,
				message: `What is the output directory?`,
				default: `docs/img`,
			},
			{
				type: `input`,
				name: OptionNames.DEPLOYED_PAGE_URL,
				message: `What is the URL of the deployed page?`,
				validate: (input: string) => {
					if (input.length === 0) {
						return `URL is required`;
					}
					try {
						new URL(input);
						return true;
						// eslint-disable-next-line @typescript-eslint/no-unused-vars
					} catch (error) {
						return `Invalid URL`;
					}
				},
			},
		]);

		this.deployWorkflowName = answers[OptionNames.DEPLOY_WORKFLOW_NAME];
		this.outputDir = answers[OptionNames.OUTPUT_DIR];
		this.deployedPageUrl = answers[OptionNames.DEPLOYED_PAGE_URL];
	}

	writing() {
		this.log(
			Format.step(`Adding PSI SVG generation workflow to project directory`),
		);
		this.fs.copyTpl(
			this.templatePath(`.github/workflows/gen-psi-svg.yml`),
			this.destinationPath(`.github/workflows/gen-psi-svg.yml`),
			{
				deployWorkflowName: this.deployWorkflowName,
				outputDir: this.outputDir,
				deployedPageUrl: this.deployedPageUrl,
			},
		);
		this.log(Format.success(`Workflow added successfully`));
	}
}
