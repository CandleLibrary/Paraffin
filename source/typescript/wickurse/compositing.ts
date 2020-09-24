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
	col_x11,
	col_css
} from "../color/color.js";

const
	xtSELECTED_INPUT = xtF(xtColor(col_x11.Maroon, col_x11.Gray50), xtUnderline),
	xtUNDERLINE_COLOR = xtF(xtColor(col_x11.Black, col_x11.Gray85), xtUnderline),
	xtRESET_COLOR = xtF(xtReset);

import html, { HTMLNode, TextNode } from "@candlefw/html";
import { ExtendedHTMLElement } from "../types/extended_HTML_element.js";
import { DrawBox } from "../types/draw_box";
import { CSSNode, getArrayOfMatchedRules, CSS_Color } from "@candlefw/css";
import { setPadding, setPaddingBottom, setPaddingRight, setPaddingLeft, setPaddingTop } from "./set_padding.js";

export default function color() {
	CSS_Color.parse = function (lex) {
		return <any>col_css[lex.tx] || col_css.black;
	};
}


export function handleCompositeSpecialization(
	obj: ExtendedHTMLElement,
	box: DrawBox,
	css: CSSNode,
	x: number,
	y: number,
	max_width: number,
	max_height: number,
	cursor_x: number,
	cursor_y: number
) {

	switch (obj.tag) {
		case "input":
			{
				switch (obj.getAttribute("type")) {
					case "checkbox":
						{
							const checked = !!obj.checked;
							//min width 1, height is also 1
							// /box.left = cursor_x;
							box.width = 3;

							const { box: text, cursor_x: x } = (createTextBox(checked ? " ☑ " : " ☐ ", 0, 0, 3, 1, 0, 0));
							cursor_x = x;
							box.boxes.push(text);
							box.height = text.height;
							text.value[0].off = 0;
						}
						break;
					case "text":
					default: //Text
						{
							let val = obj.value || "";
							// if the text field is too long to fit into the current line, 
							// drop to next line
							if (!val) {
								val = obj.getAttribute("placeholder") || "";
							}

							val += (" ").repeat(Math.max(0, 20 - val.length));

							if ((box.width + box.left) < Math.max(20, val.length))
								box.top++;

							const { box: node, cursor_x: x } = createTextBox(val, box.left, box.top, max_width, max_height, 0, 0);
							cursor_x = x;
							box.boxes.push(node);
							box.height = node.height;
							if (box.color == xtRESET_COLOR)
								box.color = xtUNDERLINE_COLOR;
						}
						break;
				}
			}
			break;
	}

	return { cursor_x, cursor_y, box };
};


function tagIsInline(tag: string) {
	return ["span", "a", "input", "button"].indexOf(tag) >= 0;
}

export function getCompositeBoxes(
	obj: ExtendedHTMLElement,
	css: CSSNode = null,
	x = 0,
	y = 0,
	maximum_width = 0,
	maximum_height = 0,
	cursor_x = 0,
	cursor_y = 0,
) {


	const boxes = [];
	let
		DEFINED_WIDTH = false,
		DEFINED_HEIGHT = false,
		IS_INLINE = tagIsInline(obj.tag),
		max_height = maximum_height,
		max_width = maximum_width,
		padding = { t: 0, r: 0, b: 0, l: 0 },
		margin = { t: 0, r: 0, b: 0, l: 0 },
		fg_color = undefined,
		bg_color = undefined,
		color = xtRESET_COLOR,
		CENTER_TEXT = false,
		calc_width = 1,
		calc_height = 1;

	//*
	if (css) {
		const array = getArrayOfMatchedRules(obj, css);

		for (const { props } of array) {
			for (const [name, prop] of props.entries()) {

				switch (name) {
					case "display":
						IS_INLINE = prop.val[0] == "block";
						if (prop.val[0] == "none") return null;
						break;
					case "color": fg_color = prop.val[0]; break;
					case "background_color": bg_color = prop.val[0]; break;
					case "padding": setPadding(prop, padding); break;
					case "padding_top": setPaddingTop(prop, padding); break;
					case "padding_left": setPaddingLeft(prop, padding); break;
					case "padding_right": setPaddingRight(prop, padding); break;
					case "padding_bottom": setPaddingBottom(prop, padding); break;
					case "text_align": CENTER_TEXT = prop.val[0] == "center"; break;
					case "width":
						DEFINED_WIDTH = true;
						max_width = Math.max(1, Math.min(max_width, +prop.val[0]));
						break;
					case "height":
						DEFINED_HEIGHT = true;
						max_height = Math.max(1, Math.min(max_height, +prop.val[0]));
						break;
				}
			}
		}
	}

	//Adjust Color -------------------------------
	if (fg_color !== undefined || bg_color !== undefined)
		color = xtF(xtColor(fg_color, bg_color));
	//Adjust Width

	//Adjust padding -----------------------------
	max_width -= (padding.r + padding.l);
	max_height -= (padding.b + padding.t);
	//*/
	if (!IS_INLINE && x != 0) {
		x = 0; y++;
	}

	let box: DrawBox = null, box_width = 0, box_height = 0, box_top = 0;

	for (const child of obj.children) {
		//need to know width and height of child; child responsible
		if (child instanceof TextNode) {

			const
				STARTS_WITH_SPACE = ("\n \t").includes(child.data.toString()[0]),
				ENDS_WITH_SPACE = ("\n \t").includes(child.data.toString().slice(-1));

			let text = (child.data + "").trim().replace(/[\t\n]/g, " ");

			if (text && STARTS_WITH_SPACE)
				text = " " + text;

			if (text && ENDS_WITH_SPACE)
				text = text + " ";

			const { box: b, cursor_x: cx, cursor_y: cy } = createTextBox(text, 0, 0, max_width, max_height, cursor_x, cursor_y);

			box = b; cursor_x = cx; cursor_y = cy;

		} else {

			let result = getCompositeBoxes(child, css, cursor_x, 0, max_width, max_height, 0, 0);

			if (!result) continue;

			const { box: b, cursor_x: cx, cursor_y: cy } = result;

			box = b; cursor_x = b.width + b.left; cursor_y = cy;


		}

		if (box) {

			calc_height = Math.max(calc_height, box.top + box.height);
			calc_width = Math.max(calc_width, box.left + box.width);
			box.left += padding.l;
			box.top += padding.t;


			//x = box.left;
			//y = box.top;

			box_width = Math.max(x + box.width, box_width);
			box_height = Math.max(y + box.height, box_height);

			boxes.push(box);
		}
	}

	const out_box: DrawBox = {
		//ele: obj,
		tag: obj.tag,
		left: x,
		top: y,
		width: (DEFINED_WIDTH ? max_width : calc_width) + (padding.r + padding.l),
		height: (DEFINED_HEIGHT ? max_height : calc_height) + (padding.t + padding.b),
		type: "block",
		boxes,
		color,
		IS_INLINE,
		cursor_x,
		cursor_y
	};

	if (CENTER_TEXT) {
		for (const text of out_box.boxes.filter(t => t.type = "text")) {
			for (const val of text.value) {
				const diff = (calc_width - val.txt.length) >> 1;
				val.off = diff;
			}
		}
	}

	return handleCompositeSpecialization(
		obj,
		out_box,
		css,
		x,
		y,
		max_width,
		max_height,
		IS_INLINE ? cursor_x : x,
		y,
	);
};

function createTextBox(
	text: string,
	x: number,
	y: number,
	max_width: number,
	max_height: number,
	cursor_x: number,
	cursor_y: number
): { cursor_x: number, cursor_y: number, box: DrawBox; } {
	//Split the text up along the boundaries of the container. Only split on spaces. 
	if (!text)
		return null;

	const value_lines = [];

	let
		cut_width = Math.min(text.length, max_width - cursor_x),
		max_cut = cut_width,
		curr_index = cut_width,
		curr_base = 0,
		curr_line = 0,
		base = 0,
		i = 0;

	while (curr_line < max_height && curr_base < text.length) {

		curr_index = Math.min(text.length, i + cut_width);

		i = curr_index;

		base = curr_base;

		if (i < text.length)
			//minimize cut width until a space boundary is found
			while (text[i] !== " " && i-- > base) { };

		value_lines.push({
			off: cursor_x, txt: text.slice(base, i + 1)
		});

		curr_line++;

		max_cut = Math.max(max_cut, cursor_x + cut_width);

		if (curr_line >= max_height || i >= text.length) {
			cursor_x += i - base;
			break;
		}

		cursor_x = 0;
		cut_width = max_width;

		curr_base = i + 1;
	}


	return {
		cursor_x,
		cursor_y: cursor_y + curr_line - 1,
		box: {
			type: "text",
			left: x,
			top: y,
			height: curr_line,
			width: max_cut,
			value: value_lines,
			cursor_x,
			cursor_y
		}
	};
}