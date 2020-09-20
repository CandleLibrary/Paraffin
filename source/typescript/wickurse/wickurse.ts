//@ts-nocheck
/*
	Converts Wick components into dynamic CommandLine UIs
	
	Limited color support through specific CSS syntax - mainly background-color and color.  
*/

import tty from "tty";
import spark from "@candlefw/spark";
import integrateComposite from "./compositing.js";
import integrateSelection from "./selection.js";
import key from "../utils/keyboard_codes.js";
import { WickLibrary } from "@candlefw/wick";
import html, { HTMLNode, TextNode } from "@candlefw/html";
import URL from "@candlefw/url";
import { DrawBox } from "../types/draw_box.js";

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
	}>
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

	integrateComposite(wick, html);

	integrateSelection(wick, html);

	ele_prototype.renderCLI = function () {
		//Prepare wick to operate in NodeJS.
		const columns = process.stdout.columns;
		const rows = process.stdout.rows;

		//writes data to console
		const box = this.getCompositeBoxes(0, 0, columns, rows);

		//Assign positional values to boxes

		//Starting at top left and working towards bottom left height, write block data to console. 
		//For text and special elements within block data, write text data.

		//Using basic flex arrangement for text data. L-R unless the css prop flex-direction column is set. 
		let str = "";

		const buffer = { write: s => str += s };

		for (let i = 0; i < rows; i++)
			writeLine(box, buffer, i, 0, columns);

		stdout.write(str);
	};

	function writeLine(box: DrawBox, buffer, line = 0, col = 0, maxwidth = 0) {
		//The first line is all ways a margin of padding. 
		//Should this bell

		//Check to make sure bounding box is within the text area.
		if (line >= box.y && line < box.y + box.h) {
			// If on starting line, and the diff between box.y and line is zero
			// make sure that col == box.cur_start to handle inline offsets.
			if (box.type == "text")

				if ((line - box.y == 0) && col !== box.cur_start)
					return col;

			if (col >= box.x && col < box.x + box.w) {
				//Set padding and color
				if (box.type == "text") {
					//select the correct text string. 
					const i = line - box.y;


					if (!box.value[i])
						return col;

					const x = box.value[i].length;

					buffer.write(box.value[i]);

					return col + x;
				} else {

					buffer.write(box.color);

					if (box.pl > 0) //padding
						buffer.write((" ").repeat(box.pl));

					let x = col + box.pl;

					if (Array.isArray(box.boxes))
						for (const c_box of box.boxes) {
							buffer.write(box.color);
							x = writeLine(c_box, buffer, line, x, box.w);
						}

					buffer.write(box.color);

					for (let i = x; i < box.cur_end; i++)
						buffer.write(" "); //padding

					return box.cur_end;
				}

			}
		}

		return col;
	}

	txt_prototype.bubbleUpdate = ele_prototype.bubbleUpdate = function () {

		if (this.parent)
			this.parent.bubbleUpdate();
	};

	wick.cli = async function (template_or_url, model = {}) {

		const
			comp_data = await wick(template_or_url),
			ele = html("<div></div>"),
			comp = (new comp_data.class(model)).appendToDOM(ele),
			write = () => //stdout.cursorTo(0, 0, () => {
			//stdout.clearScreenDown(() => {
			{

				ele.renderCLI();
			};
		//	})
		// })

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

							console.log("-->", selected_ele.tag)

							write();
						}
					}, 10);
				});
			}
		};
	};

	return <Wickurse>wick
}