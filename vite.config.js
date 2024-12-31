import * as process from "node:process";
import {createHtmlPlugin} from "vite-plugin-html";
import browserslist from "browserslist";
import {browserslistToTargets} from 'lightningcss';
import {author, name, version} from "./package.json";

import image from '@rollup/plugin-image';

/** @type {import('vite').UserConfig} */
export default {
	"base": "/dllpdf-frame-calculator/",
	"build": {
		"cssMinify": "lightningcss",
	},
	"css": {
		"transformer": "lightningcss",
		"lightningcss": {
			"targets": browserslistToTargets(browserslist(">= 0.5% in US, last 2 versions, Firefox ESR, not dead"))
		}
	},
	"esbuild": {
		"banner": `// ${name} v${version}\n// Copyright (c) ${new Date().getFullYear()} ${author}. Produced for DLLPDF.`,
		"drop": ["debugger"]
	},
	"plugins": [
		// vite-plugin-html
		createHtmlPlugin({
			minify: true,
			template: "views/index.html",
			inject: {
				data: {
					isDev: process.env.NODE_ENV === "development",
				}
			}
		}),
		// rollup/plugin-image
		{
			...image(),
			enforce: "pre"
		},
	]
}
