import Generator from "yeoman-generator";
import { Format } from "../../utils/Format";
import { GeneratorArgs } from "../../utils/types/Args";
import { GeneratorOptions } from "../../utils/types/Options";

enum OptionNames {
	DEPLOY_WORKFLOW_NAME = `deployWorkflowName`,
	OUTPUT_DIR = `outputDir`,
	DEPLOYED_PAGE_URL = `deployedPageUrl`,
}

interface Options {
	[OptionNames.DEPLOY_WORKFLOW_NAME]: string;
	[OptionNames.OUTPUT_DIR]: string;
	[OptionNames.DEPLOYED_PAGE_URL]: string;
}

module.exports = class extends Generator<Options> {
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
		const prompts = [
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
					} catch (error) {
						return `Invalid URL`;
					}
				},
			},
		];

		const answers = await this.prompt(prompts);

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
};
