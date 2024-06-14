"use-strict";
const Generator = require(`yeoman-generator`);
const { Format } = require(`../../lib/Format`);

const Args = {
	DEPLOY_WORKFLOW_NAME: `deployWorkflowName`,
	OUTPUT_DIR: `outputDir`,
	DEPLOYED_PAGE_URL: `deployedPageUrl`,
};

module.exports = class extends Generator {
	constructor(args, opts) {
		super(args, opts);

		this.argument(Args.DEPLOY_WORKFLOW_NAME, {
			type: String,
			required: false,
			description: `The name of the deploy workflow`,
		});

		this.argument(Args.OUTPUT_DIR, {
			type: String,
			required: false,
			description: `The output directory`,
		});

		this.argument(Args.DEPLOYED_PAGE_URL, {
			type: String,
			required: false,
			description: `The URL of the deployed page`,
		});
	}

	async prompting() {
		const prompts = [
			{
				type: `input`,
				name: Args.DEPLOY_WORKFLOW_NAME,
				message: `What is the name of the deploy workflow?`,
				default: `Deploy to GitHub Pages`,
			},
			{
				type: `input`,
				name: Args.OUTPUT_DIR,
				message: `What is the output directory?`,
				default: `docs/img`,
			},
			{
				type: `input`,
				name: Args.DEPLOYED_PAGE_URL,
				message: `What is the URL of the deployed page?`,
				validate: (input) => {
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

		this.answers = await this.prompt(prompts);

		this.deployWorkflowName = this.answers[Args.DEPLOY_WORKFLOW_NAME];
		this.outputDir = this.answers[Args.OUTPUT_DIR];
		this.deployedPageUrl = this.answers[Args.DEPLOYED_PAGE_URL];
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
