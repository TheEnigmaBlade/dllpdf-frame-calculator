import * as process from "node:process";
import {createHtmlPlugin} from "vite-plugin-html";
import browserslist from "browserslist";
import {browserslistToTargets} from 'lightningcss';

/** @type {import('vite').UserConfig} */
export default {
	"base": "/dllpdf-frame-calculator/",
	"build": {
		"cssMinify": "lightningcss"
	},
	"css": {
		"transformer": "lightningcss",
		"lightningcss": {
			"targets": browserslistToTargets(browserslist(">= 0.5% in US, last 2 versions, Firefox ESR, not dead"))
		}
	},
	"plugins": [
		createHtmlPlugin({
			minify: true,
			template: "views/index.html",
			inject: {
				data: {
					isDev: process.env.NODE_ENV === "development",
				}
			}
		})
	]
}
