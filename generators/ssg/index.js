"use strict";
const Generator = require("yeoman-generator");
const chalk = require("chalk");
const yosay = require("yosay");

module.exports = class extends Generator {
  prompting() {
    // Have Yeoman greet the user.
    this.log(
      yosay(
        `Welcome to the great ${chalk.red("@nico-i/generator-ts")} generator!`
      )
    );

    const prompts = [
      {
        type: "confirm",
        name: "someAnswer",
        message: "Would you like to enable this option?",
        default: true
      }
    ];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;
    });
  }

  writing() {
    const pkgJson = {
      devDependencies: {
        eslint: "^3.15.0"
      },
      dependencies: {
        react: "^16.2.0"
      }
    };

    this.fs.extendJSON(this.destinationPath("package.json"), pkgJson);
  }
};
