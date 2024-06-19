import Generator from "yeoman-generator";

export default class extends Generator {
	installPlaywright() {
		this.spawnCommand(`bun`, [`create`, `playwright@latest`]);
	}
}
