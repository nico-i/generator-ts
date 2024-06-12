/** @type {import('astro-i18next').AstroI18nextConfig} */
export default {
	defaultLocale: "<%= defaultLocale %>",
	locales: <%- JSON.stringify(locales) %>
};
