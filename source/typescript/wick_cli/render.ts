import { CSSNode } from "@candlelib/wick";
import { xtRESET_COLOR, xtRESET_COLOR_FULL } from "../color/color_cli.js";
import { CALCFlag } from "../types/calculated_flags.js";
import { BlockDrawBox, DrawBox, TextDrawBox } from "../types/draw_box.js";
import { ExtendedHTMLElement } from "../types/extended_HTML_element.js";
import { getCompositeBoxes } from "./compositing.js";

let DEBOUNCE = false;
let PENDING = false;

/**
 * Should contain
 * [bg_color_16bit, char_color_16bit, char_16bit, depth_16bit] 64 bit fragment
 */
let bufferA = new Uint8Array();
let bufferB = new Uint8Array();

function Box_Is_A_Block(box: DrawBox): box is BlockDrawBox {
	return box.type == "block";
}
function Box_Is_Text(box: DrawBox): box is TextDrawBox {
	return box.type == "text";
}
export function renderCLI(ele: ExtendedHTMLElement, css: CSSNode) {

	if (DEBOUNCE)
		return void (PENDING = true);

	DEBOUNCE = true;

	const { stdout } = process;

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
}
function writeCell(box: DrawBox, x: number, y: number, data: { txt: string; color: string; }) {

	if (y >= box.top && y < box.top + box.height) {

		if (x >= box.left && x < box.left + box.width) {

			if (Box_Is_A_Block(box)) {

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

			} else if (Box_Is_Text(box)) {


				const i = y - box.top;

				if (!box.value[i])
					return false;

				const
					{ txt, off } = box.value[i],
					index = x - off - box.left;

				if (index < 0 || index >= txt.length)
					return false;

				data.txt = txt[index];

				return true;
			}

		}
	}
}
