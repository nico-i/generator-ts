import astroI18next from "astro-i18next";
import { defineConfig } from "astro/config";

export default defineConfig({
	integrations: [astroI18next()],
});
