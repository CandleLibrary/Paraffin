import key from "../utils/keyboard_codes.js";
import html, { HTMLNode, TextNode } from "@candlefw/html";

export default function (wick, html) {
	const
		ele_prototype = HTMLNode.prototype,
		txt_prototype = TextNode.prototype;

	ele_prototype.update = function (code, str) {
		switch (this.getAttribute("type")) {
			case "text":
				if (code < 255) {
					if (!this.value)
						this.value = "";
					if (code == key.DELETE)
						this.value = this.value.slice(0, -1);
					else
						this.value += str;
					this.runEvent("input", { target: this });
				}
				break;
			case "checkbox":
				if (code == key.SPACE) {
					this.checked = !this.checked;
					this.runEvent("input", { target: this });
				}
				break;
		}
	};

	ele_prototype.selectNextInput = function (start = this) {

		if (start.par == this) {
			if (start.next !== this.fch) {
				if (start.next.tag == "input") return start.next;
				return start.next.selectNextInput(start);
			}
		} else {
			if (this.fch && this.fch !== start) {
				if (this.fch.tag == "input") return this.fch;
				return this.fch.selectNextInput(start);
			}
		}

		if (this.next && this.par.fch !== this.next && this.next !== start) {
			if (this.next.tag == "input") return this.next;
			else return this.next.selectNextInput();
		}

		if (this.par && this.par !== start) {
			if (this.par.tag == "input") return this.par;

			if (this.par.next)
				return this.par.selectNextInput(start);
		}

		//if (this.tag == "input")
		//	return this;

		return null;
	};

	txt_prototype.selectNextInput = function (start) {
		if (this.next !== this && this.next !== start && this.next !== this.par.fch) {
			if (this.next.tag == "input") return this.next;
			return this.next.selectNextInput(start);
		}

		if (this.par && this.par !== start) {
			if (this.par.tag == "input") return this.par;

			if (this.par.next)
				return this.par.next.selectNextInput(start);
		}

		return null;
	};

	ele_prototype.selectPrevInput = function (start = this) {

		if (start.par == this) {
			if (start.previous !== this.fch) {
				if (start.previous.tag == "input") return start.previous;
				return start.previous.selectPrevInput(start);
			}
		} else {
			if (this.fch && this.fch !== start) {
				if (this.fch.tag == "input") return this.fch;
				return this.fch.selectPrevInput(start);
			}
		}

		if (this.previous && this.par.fch !== this.previous && this.previous !== start) {
			if (this.previous.tag == "input") return this.previous;
			else return this.previous.selectPrevInput();
		}

		if (this.par && this.par !== start) {
			if (this.par.tag == "input") return this.par;
			return this.par.selectPrevInput(start);
		}

		if (this.tag == "input")
			return this;

		return null;
	};

	txt_prototype.selectPrevInput = function (start) {
		if (this.previous !== this && this.previous !== start && this.previous !== this.par.fch) {
			if (this.previous.tag == "input") return this.previous;
			return this.previous.selectPrevInput(start);
		}

		if (this.par && this.par !== start) {
			if (this.par.tag == "input") return this.par;
			return this.par.selectPrevInput(start);
		}

	};
}