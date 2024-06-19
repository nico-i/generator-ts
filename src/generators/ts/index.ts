import Generator from "yeoman-generator";
import { Format } from "../../lib/Format";

export default class extends Generator {
	writing() {
		const tsConfigPath = this.destinationPath(`tsconfig.json`);
		if (this.fs.exists(tsConfigPath)) {
			this.log(Format.step(`Extending tsconfig.json with @nico-i/ts-config`));
			this.fs.extendJSON(tsConfigPath, {
				extends: `@nico-i/ts-config/basic`,
			});
		} else {
			this.log(Format.step(`Adding tsconfig.json to project directory`));
			this.fs.copy(this.templatePath(), this.destinationPath(), {
				globOptions: { dot: true },
			});
		}
		this.log(Format.success(`tsconfig.json updated!`));
	}

	install() {
		this.spawnCommand(`bun`, [`add`, `typescript`]);
		this.spawnCommand(`bun`, [`add`, `-D`, `@nico-i/ts-config`]);
	}
}
