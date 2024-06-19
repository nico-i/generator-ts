import chalk from "chalk";

export const Format = {
	warning: (message: string) => {
		return chalk.yellow(`⚠ ${message}`);
	},
	step: (message: string) => {
		return `${message} …`;
	},
	success: (message: string) => {
		return `${chalk.green(`✓`)} ${chalk.greenBright(message)}`;
	},
	instruction: (message: string) => {
		return `${chalk.blueBright(message)}`;
	},
};
