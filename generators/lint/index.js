"use-strict";
const Generator = require("yeoman-generator");
const { Format } = require("../../lib/Format");

module.exports = class extends Generator {
	async prompting() {
		this.setupLintStaged = await this.prompt([
			{
				type: "confirm",
				name: "setupLintStaged",
				message: "Would you like to setup pre-commit hooks with lint-staged?",
				default: true
			}
		]);
	}

	writing() {
		const packageJsonPath = this.destinationPath("package.json");

		if (!this.fs.exists(packageJsonPath)) {
			throw new Error(
				"No package.json found in the project directory. Please run this generator in the root of your project."
			);
		}

		this.log(
			Format.step("Adding prettierrc.json and .eslintrc.json to project directory")
		);
		this.fs.copy(this.templatePath(), this.destinationPath(), {
			globOptions: { dot: true }
		});

		this.log(Format.success("Prettier and ESLint config files added!"));

		this.log(Format.step("Adding lint- and format-scripts to package.json"));
		this.fs.extendJSON(packageJsonPath, {
			scripts: {
				lint: "eslint . --ext .js,.jsx,.ts,.tsx,.json",
				"lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx,.json --fix",
				format: "prettier --write .",
				"format:check": "prettier --check ."
			}
		});
		this.log(Format.success("Lint- and format-scripts added to package.json!"));

		if (!this.setupLintStaged) return;

		this.log(Format.step("Adding lint-staged to package.json"));
		this.fs.extendJSON(packageJsonPath, {
			"lint-staged": {
				"*.{js,ts,jsx,tsx,json}": ["npm run lint:fix", "npm run format", "git add"]
			}
		});
		this.log(Format.success("Lint-staged added to package.json!"));

		const huskyPath = this.destinationPath(".husky");

		if (!huskyPath) {
			this.log(Format.warning("husky does not seem to be installed"));
			this.log(Format.step("Installing husky..."));
			this.spawnCommand("bun", ["add", "-d", "husky"]);
			this.spawnCommand("bunx", ["husky", "init"]);
			this.log(Format.success("husky installed!"));
		}

		this.log(Format.step("Adding lint-staged to pre-commit hook"));
		this.fs.copy(this.templatePath(".husky"), this.destinationPath(huskyPath));

		this.log(Format.success("Lint-staged added to pre-commit hook!"));
	}

	install() {
		this.spawnCommand("bun", [
			"add",
			"-d",
			"prettier",
			"@nico-i/prettier-config",
			"lint-staged",
			"eslint",
			"@nico-i/eslint-config"
		]);
	}
};
