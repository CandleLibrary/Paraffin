import { CSSProperty } from "@candlefw/css";
export function setPadding(prop: CSSProperty, padding: { t: number; r: number; b: number; l: number; }) {


	const { val } = prop;

	switch (val.length) {
		case 4:
			padding.t = +val[0];
			padding.r = +val[1];
			padding.b = +val[2];
			padding.l = +val[3];
			break;
		case 3:
			padding.t = +val[0];
			padding.b = +val[1];
			padding.r = padding.l = +val[2];
			break;
		case 3:
			padding.t = padding.b = +val[0];
			padding.r = padding.l = +val[1];
			break;
		case 1:
			padding.t = padding.b = padding.r = padding.l = +val[0];
			break;
	}
}

export function setPaddingTop(prop: CSSProperty, padding: { t: number; r: number; b: number; l: number; }) {
	const { val } = prop;
	padding.t = val[0];
};
export function setPaddingLeft(prop: CSSProperty, padding: { t: number; r: number; b: number; l: number; }) {
	const { val } = prop;
	padding.l = val[0];
};
export function setPaddingRight(prop: CSSProperty, padding: { t: number; r: number; b: number; l: number; }) {
	const { val } = prop;
	padding.r = val[0];
};
export function setPaddingBottom(prop: CSSProperty, padding: { t: number; r: number; b: number; l: number; }) {
	const { val } = prop;
	padding.b = val[0];
};
