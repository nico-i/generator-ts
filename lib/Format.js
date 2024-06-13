const { default: chalk } = require("chalk");

const Format = {
	warning: (message) => {
		return `${chalk.yellow("⚠")} ${message}`;
	},
	step: (message) => {
		return `${message} …`;
	},
	success: (message) => {
		return `${chalk.green("✓")} ${chalk.greenBright(message)}`;
	},
};

module.exports = { Format };
