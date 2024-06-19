import Generator from "yeoman-generator";
import { Format } from "../../lib/Format";

export default class extends Generator {
	writing() {
		this.log(Format.step(`Adding "release-please" GitHub actions workflow`));
		this.fs.copy(this.templatePath(), this.destinationPath(), {
			globOptions: { dot: true },
		});
		this.log(Format.success(`Action added successfully`));

		this.log(
			Format.warning(
				`Please remember to add the "MY_RELEASE_PLEASE_TOKEN" secret to your repository`,
			),
		);
	}
}
