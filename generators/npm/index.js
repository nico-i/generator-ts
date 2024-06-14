"use-strict";
const Generator = require(`yeoman-generator`);
const { Format } = require(`../../lib/Format`);

module.exports = class extends Generator {
	writing() {
		this.log(Format.step(`Adding "Publish to npm" GitHub actions workflow`));
		this.fs.copy(this.templatePath(), this.destinationPath());
		this.log(Format.success(`Action added successfully`));

		this.log(
			Format.warning(
				`Please remember to add the "NPM_TOKEN" secret to your repository`,
			),
		);
	}
};
