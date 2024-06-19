import Generator from "yeoman-generator";
import { Format } from "../../lib/Format";

export default class extends Generator {
	writing() {
		const packageJsonPath = this.destinationPath(`package.json`);
		if (!this.fs.exists(packageJsonPath)) {
			throw new Error(
				`No package.json found in the project directory. Please run this generator in the root of your project.`,
			);
		}

		this.log(Format.step(`Adding commitlint config`));
		this.fs.copy(this.templatePath(), this.destinationPath());
		this.log(Format.success(`Commitlint config added!`));

		this.log(Format.step(`Setting up husky commit-msg hook`));
		this.fs.copy(this.templatePath(`.husky`), this.destinationPath(`.husky`));
		this.fs.extendJSON(packageJsonPath, {
			scripts: {
				prepare: `husky || true`,
			},
		});
		this.log(Format.success(`Husky commit-msg hook set up!`));
	}

	install() {
		this.spawnCommand(`bun`, [
			`add`,
			`-D`,
			`@commitlint/cli`,
			`@commitlint/config-conventional`,
			`commitlint-plugin-spend`,
			`husky`,
		]);
	}
}
