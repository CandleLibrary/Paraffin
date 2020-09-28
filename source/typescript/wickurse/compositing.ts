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
import { CSSNode, getArrayOfMatchedRules, CSS_Color, CSSProperty, CSS_Percentage, getMatchedRulesGen } from "@candlefw/css";
import { setPadding, setPaddingBottom, setPaddingRight, setPaddingLeft, setPaddingTop } from "./set_padding.js";
import { min_max } from "./min_max.js";
import { BoxMetrics, CALCFlag } from "./calculated_flags.js";

export default function color() {
	CSS_Color.parse = function (lex) {
		return <any>col_css[lex.tx] || col_css.black;
	};
}

/**
 * Dump component information into box.
 */
export function handleCompositeSpecialization(
	obj: ExtendedHTMLElement,
	css: CSSNode,
	box_metrics: BoxMetrics,
	cursor_x: number,
	cursor_y: number
): (HTMLNode | TextNode)[] {

	switch (obj.tag) {
		case "input":
			{
				switch (obj.getAttribute("type")) {
					case "checkbox":
						return [new TextNode(!!obj.checked ? " ☑ " : " ☐ ")];

					case "text":
					default: //Text
						{
							let val = obj.value || "";
							// if the text field is too long to fit into the current line, 
							// drop to next line
							if (!val) val = obj.getAttribute("placeholder") || "";

							return [new TextNode(val)];
						}
						break;
				}
			}
			break;
	}

	return obj.children;
};


function tagIsInline(tag: string) {
	return ["span", "a", "input", "button"].indexOf(tag) >= 0;
}


function setWidth(prop: CSSProperty, box: BoxMetrics, parent_box: BoxMetrics) {

	const val = prop.val[0];

	if (val instanceof CSS_Percentage)
		box.w = min_max(0, parent_box.w * (+val / 100), parent_box.w);
	else
		box.w = min_max(0, (+val), parent_box.w);

	box.defined |= CALCFlag.WIDTH;
}

function setHeight(prop: CSSProperty, box: BoxMetrics, parent_box: BoxMetrics) {
	const val = prop.val[0];
	if (val instanceof CSS_Percentage)
		box.h = min_max(0, parent_box.h * (+val / 100), parent_box.h);
	else
		box.h = min_max(0, (+val), parent_box.h);
	box.defined |= CALCFlag.HEIGHT;
}

export function getCompositeBoxes(
	obj: ExtendedHTMLElement,
	css: CSSNode = null,
	/**
	 * Size and position of parent box as it appears 
	 * to a child box. 
	 */
	parent_box: BoxMetrics,
	cursor_x = 0,
	cursor_y = 0,
) {

	const boxes = [];

	let
		IS_INLINE = tagIsInline(obj.tag),
		calc_box: BoxMetrics = {
			t: 0,
			l: 0,
			w: 0,
			h: 0,
			defined: 0
		},
		box_metrics: BoxMetrics =
		{
			t: parent_box.t,
			l: parent_box.l,
			w: parent_box.w,
			h: parent_box.h,
			defined: 0
		},
		padding = { t: 0, r: 0, b: 0, l: 0 },
		margin = { t: 0, r: 0, b: 0, l: 0 },
		fg_color = undefined,
		bg_color = undefined,
		color = xtRESET_COLOR,
		CENTER_TEXT = false;
	//*
	if (css) {
		for (const { props } of getMatchedRulesGen(obj, css)) {

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
					case "width": setWidth(prop, box_metrics, parent_box); break;
					case "height": setHeight(prop, box_metrics, parent_box); break;
				}
			}
		}

		//Adjust Color -------------------------------
		if (fg_color !== undefined || bg_color !== undefined)
			color = xtF(xtColor(fg_color, bg_color));
		//Adjust Width

		//Adjust padding -----------------------------
		box_metrics.w -= (padding.r + padding.l);
		box_metrics.h -= (padding.b + padding.t);

		//*/
	}

	if (IS_INLINE) {
		box_metrics.t = 0;
		box_metrics.l = 0;
	}

	if (!IS_INLINE && cursor_x != 0) {
		box_metrics.t++;
		box_metrics.h--;
		cursor_x = 0;
		cursor_y = 0;
	}

	const children = handleCompositeSpecialization(
		obj,
		css,
		box_metrics,
		cursor_x,
		cursor_y,
	);

	let box: DrawBox = null;

	for (const child of children) {
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

			const { box: b, cursor_x: cx, cursor_y: cy }
				= createTextBox(text, 0, 0, box_metrics.w, box_metrics.h, cursor_x, cursor_y);

			box = b; cursor_x = cx; cursor_y = cy;

		} else {

			let result = getCompositeBoxes(child, css, box_metrics, cursor_x, cursor_y);

			if (!result) continue;

			const { box: b, cursor_x: cx, cursor_y: cy } = result;

			box = b; cursor_x = cx; cursor_y = cy;
		}

		if (box) {

			calc_box.w = Math.max(calc_box.w, box.left + box.width);
			calc_box.h = Math.max(calc_box.h, box.top + box.height);

			box.left += padding.l;
			box.top += padding.t;
			boxes.push(box);
		}
	}

	if (CENTER_TEXT) {
		for (const text of boxes.filter(t => t.type = "text")) {
			for (const val of text.value) {
				const diff = (calc_box.w - val.txt.length) >> 1;
				val.off = diff;
			}
		}
	}

	const draw_box: DrawBox = {
		//ele: obj,
		tag: obj.tag,
		left: box_metrics.l,
		top: box_metrics.t,
		width: (box_metrics.defined & CALCFlag.WIDTH ? box_metrics.w : calc_box.w) + (padding.r + padding.l),
		height: (box_metrics.defined & CALCFlag.HEIGHT ? box_metrics.h : calc_box.h) + (padding.t + padding.b),
		type: "block",
		color,
		IS_INLINE,
		fg_color,
		bg_color,
		cursor_x,
		cursor_y,
		prop_names: getArrayOfMatchedRules(obj, css).flatMap(r => [...r.props.values()]).map(p => p.val),
		boxes,
	};

	return { cursor_x, cursor_y, box: draw_box };
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
