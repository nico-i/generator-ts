"use-strict";
const Generator = require(`yeoman-generator`);
const { Format } = require(`../../lib/Format`);

module.exports = class extends Generator {
	prompting() {
		const answers = this.prompt([
			{
				type: `confirm`,
				name: `setupReleasePlease`,
				message: `Do you to add a "release-please" action to automate the creation of releases?`,
				default: true,
			},
		]);

		this.setupReleasePlease = answers.setupReleasePlease;
	}

	writing() {
		if (this.setupReleasePlease) {
			this.composeWith(require.resolve(`../release-please`));
		}

		this.log(Format.step(`Adding GitHub actions workflow`));
		this.fs.copy(this.templatePath(), this.destinationPath());
		this.log(Format.success(`Action added successfully`));

		this.log(
			Format.warning(
				`Please remember to update the workflow file with your own settings, such as environment variables and secrets!`,
			),
		);
	}
};
