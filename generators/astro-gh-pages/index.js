"use-strict";
const Generator = require(`yeoman-generator`);
const { Format } = require(`../../lib/Format`);

module.exports = class extends Generator {
	writing() {
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
