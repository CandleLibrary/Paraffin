import key from "../utils/keyboard_codes.js";
import html, { HTMLNode, TextNode } from "@candlefw/html";
import { ExtendedHTMLElement } from "../types/extended_HTML_element.js";

export default function () {

	const
		ele_prototype: ExtendedHTMLElement = (<any>HTMLNode).prototype,
		txt_prototype = TextNode.prototype;

	ele_prototype.update = function (this: ExtendedHTMLElement, code, str) {
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

	function setNext(node, root) {
		if (node.tag == "input") return node;
		else if (node?.getAttribute?.("selectable") == "true") return node;
		return node.selectNextInput(node, root);
	}

	ele_prototype.selectNextInput = function (prev = null, root = null) {

		if (root == this) return null;

		let ch = this.fch, start = this.fch;

		if (ch) {

			if (prev) {
				while (ch !== prev) {
					ch = ch.next;
					if (ch == this.fch) break;
				}
				start = ch;
			}

			do {
				if (ch !== prev) {
					let result = setNext(ch, this);

					if (result) return result;
				}
				ch = ch.next;
			} while (ch !== start);
		}

		if (this.par) return this.par.selectNextInput(this, root);

		return null;
	};
	//@ts-ignore
	txt_prototype.selectNextInput = function (start) {
		return null;
	};

	function setPrev(node, root) {
		if (node.tag == "input") return node;
		else if (node?.getAttribute?.("selectable") == "true") return node;
		return node.selectPrevInput(node, root);
	}
	//@ts-ignore
	ele_prototype.selectPrevInput = function (prev = null, root = null) {

		if (root == this) return null;

		let ch = this.fch, start = this.fch;

		if (ch) {

			if (prev) {
				while (ch !== prev) {
					ch = ch.previous;
					if (ch == this.fch) break;
				}
				start = ch;
			}

			do {
				if (ch !== prev) {
					let result = setPrev(ch, this);

					if (result) return result;
				}
				ch = ch.previous;
			} while (ch !== start);
		}

		if (this.par) return this.par.selectPrevInput(this, root);

		return null;
	};
	//@ts-ignore
	txt_prototype.selectPrevInput = function (start) {
		return null;
	};
}