import pluginJs from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
	{ files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
	{ languageOptions: { globals: { ...globals.browser, ...globals.node } } },
	pluginJs.configs.recommended,
	...tseslint.configs.recommended,
	{
		ignores: ["**/templates/**/*", ".prettierrc.cjs"],
	},
];
