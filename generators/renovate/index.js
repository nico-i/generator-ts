"use-strict";
const Generator = require("yeoman-generator");
const { Format } = require("../../lib/Format");

module.exports = class extends Generator {
	writing() {
		this.log(Format.step("Adding renovate config"));
		this.fs.copy(this.templatePath(), this.destinationPath(), {
			globOptions: { dot: true }
		});
		this.log(Format.success("Renovate config added!"));
	}
};
