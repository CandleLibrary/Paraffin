import wick from "@candlefw/wick";
import integrateComposite, { getCompositeBoxes } from "./compositing.js";
import integrateSelection from "./selection.js";
import key from "../utils/keyboard_codes.js";
import { WickLibrary, CSSNode } from "@candlefw/wick";
import html, { HTMLNode, TextNode } from "@candlefw/html";
import URL from "@candlefw/url";
import { BlockDrawBox, DrawBox, TextDrawBox } from "../types/draw_box.js";
import { componentToMutatedCSS } from "@candlefw/wick/build/library/component/component_data_to_css.js";
import { xtReset, xtRBold, xtRDim, xtRUnderline, xtRBlink, xtRInvert, xtF } from "../color/color.js";
import { ExtendedHTMLElement } from "../types/extended_HTML_element.js";
import { CALCFlag } from "./calculated_flags.js";

const
	xtRESET_COLOR = xtF(xtRBlink, xtRUnderline, xtRBold, xtRDim, xtRInvert),
	xtRESET_COLOR_FULL = xtF(xtReset, xtRBlink, xtRUnderline, xtRBold, xtRDim, xtRInvert);
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



function isBoxBlock(box: DrawBox): box is BlockDrawBox {
	return box.type == "block";
}
function isBoxText(box: DrawBox): box is TextDrawBox {
	return box.type == "text";
}

/**
 * Converts wick templates into CLI interfaces, 
 * providing ways to describe cursor based display and 
 * inputs using HTML and CSS syntaxes, and user interaction 
 * with JS scripting syntaxes.  
 * 
 * @param wick 
 * @param html 
 */
export default async function integrate(): Promise<Wickurse> {

	await wick.server();
	await html.server();

	//@ts-ignore
	global.Node = html.HTMLNode;

	const
		ele_prototype = HTMLNode.prototype,
		txt_prototype = TextNode.prototype,
		stdout = process.stdout,
		stdin = process.stdin;

	integrateComposite();
	integrateSelection();

	let DEBOUNCE = false, PENDING = false;

	function clearAndExit(exiting_message: string = "") {

		stdin.setRawMode(false);

		return new Promise(res => {
			stdout.cursorTo(0, 0, () => {
				stdout.clearScreenDown(() => {
					stdout.cursorTo(0, 0, () => {
						console.log(exiting_message);
						res(null);
					});
				});
			});
		});
	}

	function renderCLI(ele: ExtendedHTMLElement, css: CSSNode) {

		if (DEBOUNCE) return void (PENDING = true);

		DEBOUNCE = true;

		stdout.cursorTo(0, 0, () => {

			//stdout.clearScreenDown(() => {

			//Prepare wick to operate in NodeJS.
			const
				columns = process.stdout.columns,
				rows = process.stdout.rows;

			//writes data to console
			const { box } = getCompositeBoxes(<ExtendedHTMLElement>ele, css, { t: 0, l: 0, w: columns, h: rows, defined: CALCFlag.UNDEFINED });

			//Assign positional values to boxes

			//Starting at top left and working towards bottom left height, write block data to console. 
			//For text and special elements within block data, write text data.

			//Using basic flex arrangement for text data. L-R unless the css prop flex-direction column is set. 

			let str = xtRESET_COLOR, prev_col = "";

			const data = { txt: " ", color: "", index: 0 };

			for (let i = 0; i < box.height; i++) {
				for (let j = 0; j < columns; j++) {

					writeCell(box, j, i, data);

					if (prev_col != data.color) {
						str += xtRESET_COLOR + data.color;
						prev_col = data.color;
					}

					str += data.txt;
					data.txt = " ";
					data.color = "";
				}
			}

			str += xtRESET_COLOR;

			for (let i = 0; i < rows - box.height; i++)
				str += (" ").repeat(columns);


			stdout.write(str + xtRESET_COLOR_FULL);

			if (PENDING) {
				PENDING = false;
				{
					DEBOUNCE = false;
					renderCLI(ele, css);
				};
			} else {
				DEBOUNCE = false;
			}
			//	});
		});
	};

	function writeCell(box: DrawBox, x: number, y: number, data: { txt: string, color: string; }) {

		if (y >= box.top && y < box.top + box.height) {

			if (x >= box.left && x < box.left + box.width) {

				if (isBoxBlock(box)) {




					const cx = x - box.left, cy = y - box.top;
					let written = 0;

					//const apply_color = box.INLINE ? (box.color || apply_color) : "";

					if (!box.IS_INLINE && box.color)
						data.color = box.color;

					for (const cbox of box.boxes || [])
						written |= +writeCell(cbox, cx, cy, data);


					if (box.IS_INLINE) {
						if (written) {
							data.color = box.color;
						}
					}

				} else if (isBoxText(box)) {

					const i = y - box.top;

					if (!box.value[i]) return false;

					const
						{ txt, off } = box.value[i],
						index = x - off - box.left;

					if (index < 0 || index >= txt.length) return false;

					data.txt = txt[index];

					return true;
				}

			}
		}
	}

	txt_prototype.bubbleUpdate = ele_prototype.bubbleUpdate = function () {

		if (this.parent)
			this.parent.bubbleUpdate();
	};
	//@ts-ignore
	wick.cli = async function (template_or_url, model = {}) {

		const
			comp_data = await wick(template_or_url);

		console.log(comp_data);
		const
			style_sheet = componentToMutatedCSS(comp_data.CSS[0], comp_data),
			ele: ExtendedHTMLElement = <any>html("<div></div>"),
			comp = (new comp_data.class(model)).appendToDOM(<HTMLElement><any>ele),
			write = () => renderCLI(ele, style_sheet);

		ele.bubbleUpdate = write;

		stdout.on('resize', write);

		return {
			start: () => {
				stdin.setRawMode(true);

				return new Promise(res => {
					write();

					let selected_ele = ele.selectNextInput();

					if (selected_ele) selected_ele.selected = true;

					//Create a command poller to handle user input
					const id = setInterval(async _ => {

						const data = stdin.read();

						if (data) {
							const ctrl = data[0] << 0 | data[1] << 8 | data[2] << 16 | data[3] << 24 | data[4] << 32 | data[5] << 40 | data[6] << 48 | data[7] << 54;

							let str = data.toString();

							if (ctrl == key.END_OF_TXT) // CTR-C ETX
							{
								clearInterval(id);
								await clearAndExit("Closing out");
								return res(null);
							}

							if (selected_ele)
								selected_ele.selected = false;

							if (ctrl == key.CARRIAGE_RETURN) // UP Arrow
							{
								if (selected_ele) {
									selected_ele = selected_ele.selectNextInput();
									str = "";
								}
							}

							if (ctrl == key.HORIZONTAL_TAB) {
								if (selected_ele) {
									selected_ele = selected_ele.selectNextInput();
									str = "";
								}
							}

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