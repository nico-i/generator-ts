const { default: chalk } = require("chalk");

const Format = {
	warning: (message) => {
		return chalk.yellow(`⚠ ${message}`);
	},
	step: (message) => {
		return `${message} …`;
	},
	success: (message) => {
		return `${chalk.green("✓")} ${chalk.greenBright(message)}`;
	},
	instruction: (message) => {
		return `${chalk.blueBright(message)}`;
	},
};

module.exports = { Format };
