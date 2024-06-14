"use-strict";
const Generator = require(`yeoman-generator`);
const { Format } = require(`../../lib/Format`);

module.exports = class extends Generator {
	async prompting() {
		this.setupLintStaged = await this.prompt([
			{
				type: `confirm`,
				name: `setupLintStaged`,
				message: `Would you like to setup pre-commit hooks with lint-staged?`,
				default: true,
			},
		]);
	}

	default() {
		if (!this.fs.exists(this.packageJson.path)) {
			throw new Error(
				`No package.json found in the project directory. Please run this generator in the root of your project.`,
			);
		}
		this.packageJsonContent = this.fs.readJSON(this.packageJson.path);
	}

	writing() {
		this.log(Format.step(`Adding prettier config to project directory`));
		this.fs.copy(
			this.templatePath(`.prettierrc.cjs`),
			this.destinationPath(`.prettierrc.cjs`),
		);
		this.log(Format.success(`Prettier config added to project directory!`));

		this.log(
			Format.step(
				`Adding or attempting to extend eslint config to project directory`,
			),
		);
		if (this.fs.exists(this.destinationPath(`.eslintrc.json`))) {
			const eslintConfig = this.fs.readJSON(this.templatePath(`.eslintrc.json`));
			this.fs.extendJSON(this.destinationPath(`.eslintrc.json`), {
				...eslintConfig,
			});
		} else {
			this.fs.copy(
				this.templatePath(`.eslintrc.json`),
				this.destinationPath(`.eslintrc.json`),
			);
		}

		this.log(Format.step(`Adding lint- and format-scripts to package.json`));
		this.fs.extendJSON(this.packageJson.path, {
			scripts: {
				lint: `eslint .`,
				"lint:types": `tsc --noEmit --incremental false`,
				"lint:fix": `eslint --fix .`,
				format: `prettier --write .`,
				"format:check": `prettier --check .`,
			},
		});
		this.log(Format.success(`Lint- and format-scripts added to package.json!`));

		if (!this.setupLintStaged) return;

		this.log(Format.step(`Adding lint-staged to package.json`));
		this.fs.extendJSON(this.packageJson.path, {
			"lint-staged": {
				"*.{js,ts,jsx,tsx}": [`eslint --fix`, `prettier --write`],
				"*.json": [`prettier --write`],
			},
		});
		this.log(Format.success(`Lint-staged added to package.json!`));

		if (!this.packageJsonContent.toString().includes(`husky`)) {
			this.log(
				Format.warning(
					`husky does not seem to be installed, husky will be installed`,
				),
			);
			this.installHusky = true;
		}

		if (!this.packageJsonContent.scripts.prepare.includes(`husky`)) {
			this.fs.extendJSON(this.packageJson.path, {
				scripts: {
					prepare: `husky || true`,
				},
			});
		}

		this.log(Format.step(`Adding lint-staged to pre-commit hook`));
		const preCommitHookPath = this.destinationPath(`.husky/pre-commit`);
		if (this.fs.exists(preCommitHookPath)) {
			this.fs.append(preCommitHookPath, `\nnpx --no-install lint-staged`);
		} else {
			this.fs.write(preCommitHookPath, `#!/bin/sh\nnpx --no-install lint-staged`);
		}
		this.log(Format.success(`Lint-staged added to pre-commit hook!`));
	}

	install() {
		if (this.installHusky) {
			this.spawnCommand(`bun`, [`add`, `-D`, `husky`]);
		}

		if (this.setupLintStaged) {
			this.spawnCommand(`bun`, [`add`, `-D`, `lint-staged`]);
		}

		this.spawnCommand(`bun`, [
			`add`,
			`-D`,
			`prettier`,
			`@nico-i/prettier-config`,
			`lint-staged`,
			`eslint@^8.57.0`,
			`@nico-i/eslint-config`,
		]);
	}
};
