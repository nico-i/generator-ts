import Generator from "yeoman-generator";
import { Format } from "../../lib/Format.js";

type Options = {
	setupReleasePlease: boolean;
};

export default class extends Generator<Options> {
	private setupReleasePlease: boolean = false;

	async prompting() {
		this.setupReleasePlease = (
			await this.prompt([
				{
					type: `confirm`,
					name: `setupReleasePlease`,
					message: `Do you to add a "release-please" action to automate the creation of releases?`,
					default: true,
				},
			])
		).setupReleasePlease;
	}

	writing() {
		if (this.setupReleasePlease) {
			this.composeWith(require.resolve(`../release-please`));
		}

		this.log(Format.step(`Adding GitHub actions workflow`));
		this.fs.copy(this.templatePath(), this.destinationPath(), {
			globOptions: { dot: true },
		});
		this.log(Format.success(`Action added successfully`));

		this.log(
			Format.warning(
				`Please remember to update the workflow file with your own settings, such as environment variables and secrets!`,
			),
		);
	}
}
