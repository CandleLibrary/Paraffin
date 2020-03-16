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
} from "./color.js";

const
	xtSELECTED_INPUT = xtF(xtColor(col_x11.Maroon, col_x11.Gray50), xtUnderline),
	xtUNDERLINE_COLOR = xtF(xtColor(col_x11.Black, col_x11.Gray85), xtUnderline),
	xtRESET_COLOR = xtF(xtReset);

export default function color(wick, html) {
	const
		ele_prototype = html.HTMLNode.prototype,
		txt_prototype = html.TextNode.prototype;

	ele_prototype.handleCompositeSpecialization = function (
		boxes = [],
		x = 0,
		y = 0,
		w = 0,
		h = 0,
		pl = 0,
		pt = 0,
		max_width = 0,
		max_height = 0,
		cursor_start = 0,
		cursor_end = 0
	) {
		const box = {
			//ele: this,
			tag: this.tag,
			cur_start: cursor_start,
			cur_end: cursor_end,
			x,
			y,
			w,
			h,
			pl,
			pt,
			type: "block",
			boxes,
			color: xtRESET_COLOR
		};

		switch (this.tag) {
			case "input":
				{

					box.type = "inline";

					if (this.selected)
						box.color = xtSELECTED_INPUT;

					switch (this.getAttribute("type")) {
						case "checkbox":
							{

								const checked = !!this.checked;
								//min width 1, height is also 1
								const text = (createTextBox(checked ? "✓" : "✗", x, y, w, h, cursor_start));
								boxes.push(text);
								box.cur_start = text.cur_start;
								box.cur_end = text.cur_end;
								box.h = text.h;

							}
							break;
						case "text":
						default: //Text
							{
								let val = this.value || "";
								// if the text field is too long to fit into the current line, 
								// drop to next line
								if (!val) {
									val = this.getAttribute("placeholder") || "";
								}

								val += (" ").repeat(Math.max(0, 20 - val.length));

								if ((box.w + box.x) - box.cur_start < Math.max(20, val.length)) {
									box.cur_start = box.x;
									box.y++;
								}

								const node = createTextBox(val, box.x, box.y, w, h, box.cur_start);

								box.boxes.push(node);
								box.cur_end = node.cur_end;
								box.h = node.h;

								if (box.color == xtRESET_COLOR)
									box.color = xtUNDERLINE_COLOR;
							}
							break;
					}
				}
				break;
			default:
				box.cur_end = x + w;
				if (box.cur_start !== 0) {
					box.y++;
					box.cur_start = box.x;
				}
				break;
		}

		return box;
	};

	ele_prototype.getCompositeBoxes = function (x = 0, y = 0, width = 0, height = 0, cursor = 0) {

		const
			boxes = [],
			padding = { t: 0, b: 0, l: 0, r: 0 },
			p_lr = padding.l + padding.r,
			p_tb = padding.t + padding.b,
			len = this.children.length,
			max_height = height - p_tb,
			max_width = width - p_lr,
			cursor_start = cursor,
			origin_x = x,
			origin_y = y;

		x += padding.l; //Padding
		y += padding.t;

		let box = null;

		for (const child of this.children.reduce(
			(r, e) => {
				if (e instanceof html.TextNode) {
					if (Array.isArray(r[r.length - 1]))
						r[r.length - 1].push(e);
					else
						r.push([e]);
				} else
					r.push(e);
				return r;
			},
			[]
		)) {

			if (Array.isArray(child)) {
				const
					STARTS_WITH_SPACE = ("\n \t").includes(child[0].txt[0]),
					ENDS_WITH_SPACE = ("\n \t").includes(child.slice(-1)[0].txt.slice(-1));

				let text = child.map(c => (c.txt + "").trim().replace(/[\t\n]/g, " ")).join(" ").trim();

				if (text && STARTS_WITH_SPACE)
					text = " " + text;
				if (text && ENDS_WITH_SPACE)
					text = text + " ";
				box = createTextBox(text, x, y, Math.max(max_width, 0), Math.max(max_height - y, 0), cursor);
			} else
				box = child.getCompositeBoxes(x, y, Math.max(max_width, 0), Math.max(max_height - y, 0), cursor);

			if (box) {
				x = box.x;
				y = box.y;
				cursor = box.cur_end;
				if (box.type == "inline" || box.type == "text") {
					y += box.h - 1;
				} else {
					y += box.h;
					cursor = origin_x;
				}
				boxes.push(box);
			}
		}

		return this.handleCompositeSpecialization(boxes, origin_x, origin_y, max_width + p_lr, y + 1 - origin_y, padding.l, padding.t, max_width, max_height, cursor_start, cursor);
	};

	function createTextBox(text, x, y, width, height, cursor) {
		//Split the text up along the bondaries of the container. Only split on spaces. 
		if (!text)
			return null;

		const
			value = [],
			max_width = width,
			max_height = height;

		let
			cut_width = Math.min(text.length, (x + width) - cursor),
			curr_index = cut_width,
			curr_base = 0,
			curr_line = 0,
			base = 0,
			end_cursor_start = cursor,
			i = 0;

		while (curr_line < max_height && curr_base < text.length) {
			curr_index = Math.min(text.length, i + cut_width);
			cut_width = max_width;
			i = curr_index;

			base = curr_base;

			if (i < text.length)
				//minimize cut width until a space boundary is found
				while (text[i] !== " " && i-- > base) { };

			value.push(text.slice(base, i + 1));

			curr_line++;

			if (curr_line >= max_height || i >= text.length)
				break;

			end_cursor_start = 0;
			curr_base = i + 1;
		}

		return {
			cur_start: cursor,
			cur_end: end_cursor_start + x + i - base,
			type: "text",
			x,
			y,
			h: curr_line,
			w: width,
			value,
			boxes: [],
			color: xtRESET_COLOR
		};
	}
}