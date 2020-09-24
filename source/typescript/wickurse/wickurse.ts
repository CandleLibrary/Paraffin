//@ts-nocheck
/*
	Converts Wick components into dynamic CommandLine UIs
	
	Limited color support through specific CSS syntax - mainly background-color and color.  
*/

import tty from "tty";
import spark from "@candlefw/spark";
import integrateComposite, { getCompositeBoxes } from "./compositing.js";
import integrateSelection from "./selection.js";
import key from "../utils/keyboard_codes.js";
import { WickLibrary, CSSNode } from "@candlefw/wick";
import html, { HTMLNode, TextNode } from "@candlefw/html";
import URL from "@candlefw/url";
import { DrawBox } from "../types/draw_box.js";
import { componentToMutatedCSS } from "@candlefw/wick/build/library/component/component_data_to_css.js";
import {
	xtColor,
	xtReset,
	xtBold,
	xtDim,
	xtUnderline,
	xtBlink,
	xtInvert,
	xtHidden,
	xtRBold,
	xtRDim,
	xtRUnderline,
	xtRBlink,
	xtRInvert,
	xtF,
	col_x11
} from "../color/color.js";
const
	xtRESET_COLOR = xtF(xtReset);
interface Wickurse extends WickLibrary {
	/**
	 * Creates a CLI from a wick template and optional model.
	 * @param template 
	 * @param model 
	 */
	cli(template: string | URL, model: any): Promise<{
		/**
		 * Runs the CLI until until an `EXIT` event
		 * is received.
		 */
		start(): Promise<void>;
	}>;
}

/**
 * Converts wick templates into CLI interfaces, 
 * providing ways to descibe cursor based display and 
 * inputs using HTML and CSS syntaxees, and user interaction 
 * with JS scripting syntaxes.  
 * 
 * @param wick 
 * @param html 
 */
export default async function integrate(wick: WickLibrary): Wickurse {

	await wick.server();
	await html.server();

	global.Node = html.HTMLNode;

	const
		ele_prototype = HTMLNode.prototype,
		txt_prototype = TextNode.prototype,
		stdout = process.stdout,
		stdin = process.stdin;

	stdin.setRawMode(true);

	integrateComposite();
	integrateSelection();

	let DEBOUNCE = false, PENDING = false;

	function renderCLI(ele: HTMLElement, css: CSSNode) {

		if (DEBOUNCE) return void (PENDING = true);
		DEBOUNCE = true;


		//Prepare wick to operate in NodeJS.
		const columns = process.stdout.columns;
		const rows = process.stdout.rows;

		//writes data to console
		const { box } = getCompositeBoxes(ele, css, 0, 0, columns, rows, 0);

		//Assign positional values to boxes

		//Starting at top left and working towards bottom left height, write block data to console. 
		//For text and special elements within block data, write text data.

		//Using basic flex arrangement for text data. L-R unless the css prop flex-direction column is set. 

		let str = xtRESET_COLOR, prev_col = "";

		const data = { txt: "", color: "", index: 0 };

		//console.dir(box, { depth: 20 });

		for (let i = 0; i < box.height; i++) {
			for (let j = 0; j < columns; j++) {

				writeCell(box, j, i, data);

				if (prev_col != data.color) {
					str += (data.color + "");
					prev_col = data.color + "";
				}

				str += data.txt[0] || " ";

				data.txt = "";
			}
		}

		stdout.write(str + xtRESET_COLOR);

		if (PENDING) {
			PENDING = false;
			() => stdout.cursorTo(0, 0, () => {
				stdout.clearScreenDown(() => {
					{
						DEBOUNCE = false;
						renderCLI(ele, css);
					};
				});
			});
		} else {
			DEBOUNCE = false;
		}
	};

	function writeCell(box: DrawBox, x: number, y: number, data: { txt: string, color: string; }) {
		if (y >= box.top && y < box.top + box.height) {
			if (x >= box.left && x < box.left + box.width) {
				switch (box.type) {
					case "block":
						data.txt = " ";
						data.color = box.color;
						break;
					case "text":

						const i = y - box.top;

						if (!box.value[i]) return;

						const { txt, off } = box.value[i];
						const index = x - off - box.left;

						if (index < 0 || index >= txt.length) return;

						data.txt = txt[index];

						break;
				}

				const cx = x - box.left, cy = y - box.top;

				for (const cbox of box.boxes || []) {
					writeCell(cbox, cx, cy, data);
				}
			}
		}
	}
	txt_prototype.bubbleUpdate = ele_prototype.bubbleUpdate = function () {

		if (this.parent)
			this.parent.bubbleUpdate();
	};

	wick.cli = async function (template_or_url, model = {}) {

		const
			comp_data = await wick(template_or_url),
			style_sheet = componentToMutatedCSS(comp_data.CSS[0], comp_data),
			ele = html("<div></div>"),
			comp = (new comp_data.class(model)).appendToDOM(ele),
			write = () => stdout.cursorTo(0, 0, () => {
				stdout.clearScreenDown(() => {
					{
						renderCLI(ele, style_sheet);
					};
				});
			});

		ele.bubbleUpdate = () => write();

		let i = 0;

		return {
			start: () => {
				return new Promise(res => {
					write();

					let cli_input_string = "";

					let selected_ele = ele.selectNextInput();

					if (selected_ele)
						selected_ele.selected = true;
					//Create a command poller to handle user input
					const id = setInterval(() => {

						const data = stdin.read("utf8");

						if (data) {
							const ctrl = data[0] << 0 | data[1] << 8 | data[2] << 16 | data[3] << 24 | data[4] << 32 | data[5] << 40 | data[6] << 48 | data[7] << 54;

							const str = data.toString();

							if (ctrl == key.END_OF_TXT) // CTR-C ETX
							{
								clearInterval(id);
								return res();
							}

							if (selected_ele)
								selected_ele.selected = false;

							if (ctrl == key.UP_ARROW) // UP Arrow
							{ if (selected_ele) selected_ele = selected_ele.selectPrevInput(); }
							if (ctrl == key.DOWN_ARROW) // DN Arrow
							{ if (selected_ele) selected_ele = selected_ele.selectNextInput(); }
							if (ctrl == key.LEFT_ARROW) // LT Arrow
							{ if (selected_ele) selected_ele = selected_ele.selectPrevInput(); }
							if (ctrl == key.RIGHT_ARROW) // RT Arrow
							{ if (selected_ele) selected_ele = selected_ele.selectNextInput(); }

							if (str && selected_ele)
								selected_ele.update(ctrl, str);

							if (selected_ele)
								selected_ele.selected = true;

							write();
						}
					}, 10);
				});
			}
		};
	};

	return <Wickurse>wick;
}