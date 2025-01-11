import fs from "node:fs";
import {defineConfig} from "vite";
import {createHtmlPlugin} from "vite-plugin-html";
import {viteSingleFile} from "vite-plugin-singlefile"
//import image from '@rollup/plugin-image';
import svgLoader from 'vite-svg-loader';
import browserslist from "browserslist";
import {browserslistToTargets} from 'lightningcss';
import {author, name, version} from "./package.json";

const trashSvg = fs.readFileSync("images/icons/trash.svg", "utf8");
const pencilSvg = fs.readFileSync("images/icons/pencil.svg", "utf8");

/** @type {import('vite').UserConfig} */
export default defineConfig(({mode}) => {
	let base;
	switch (mode) {
		case "pages":
			base = "/dllpdf-frame-calculator/";
			break;
		case "production":
			base = "/files/public";
			break;
		case "development":
		default:
			base = "/";
			break;
	}
	
	let index = "views/index.html";
	
	return {
		base,
		build: {
			outDir: "dist",
			assetsDir: "",
			emptyOutDir: true,
			copyPublicDir: mode !== "production",
			
			minify: mode === "pages",
			assetsInlineLimit: 51200,
			cssMinify: "lightningcss",
			rollupOptions: {
				input: {
					index: index
				},
				// output: {
				// 	entryFileNames: "[name].js",
				// 	chunkFileNames: "[name]-[hash].js",
				// 	assetFileNames: "[name]-[hash][extname]"
				// }
			}
		},
		css: {
			transformer: "lightningcss",
			lightningcss: {
				targets: browserslistToTargets(browserslist(">= 0.5% in US, last 2 versions, Firefox ESR, not dead"))
			}
		},
		esbuild: {
			banner: `// ${name} v${version}\n// Copyright (c) ${new Date().getFullYear()} ${author}. Produced for DLLPDF.`,
			drop: ["debugger"]
		},
		plugins: [
			// vite-plugin-html
			createHtmlPlugin({
				minify: mode === "pages",
				template: index,
				inject: {
					data: {
						isDev: mode === "development",
						isStandalone: mode === "development" || mode === "pages",
						
						icons: {
							delete: trashSvg,
							edit: pencilSvg
						}
					}
				}
			}),
			// rollup/plugin-image
			// {
			// 	...image(),
			// 	enforce: "pre"
			// },
			svgLoader(),
			viteSingleFile(),
		]
	}
});
