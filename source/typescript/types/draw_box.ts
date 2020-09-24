
export interface DrawBox {
	tag?: string;
	left: number;
	top: number;
	width: number;
	height: number;
	pad_left?: number;
	pad_top?: number;
	type: "block" | "text" | "inline";
	value?: string[];
	boxes?: DrawBox[];
	color?: string;
}
