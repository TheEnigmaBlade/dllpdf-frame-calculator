import {createHtmlPlugin} from "vite-plugin-html";

/** @type {import('vite').UserConfig} */
export default {
	"base": "/dllpdf-frame-calculator/",
	"build": {
		"cssMinify": "lightningcss"
	},
	"css": {
		"transformer": "lightningcss"
	},
	"plugins": [
		createHtmlPlugin({
			minify: true,
			template: "views/index.html",
			inject: {
				data: {
					isDev: true,
				}
			}
		})
	]
}
