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

	ele_prototype.selectNextInput = function (start = this, prev = null) {
		//We try to traverse depth first

		if (this.fch && !this.fch !== start && this.fch !== prev)
			return setNext(this.fch, start)

		if (this.next && this.next !== this.par.fch && this.next !== start)
			return setNext(this.next, start);

		if (this.par && this.par !== start)
			return setNext(this.par, start, this.next);

		return null;
	};

	function setNext(node, start, prev = null) {
		if (node.tag == "input") return node;
		return node.selectNextInput(start, prev);
	}

	txt_prototype.selectNextInput = function (start) {
		if (this.fch && !this.fch !== start)
			return setNext(this.fch, start)

		if (this.next && this.next !== this.par.fch && this.next !== start)
			return setNext(this.next, start);

		if (this.par && this.par !== start)
			return setNext(this.par, start, this.next);

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