import Generator from "yeoman-generator";
import { Format } from "../../lib/Format";

export default class extends Generator {
	writing() {
		this.log(Format.step(`Adding renovate config`));
		this.fs.copy(this.templatePath(), this.destinationPath(), {
			globOptions: { dot: true },
		});
		this.log(Format.success(`Renovate config added!`));
	}
}
