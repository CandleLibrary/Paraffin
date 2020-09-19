
export interface DrawBox {
	tag?: string;
	cur_start: number;
	cur_end: number;
	x: number;
	y: number;
	w: number;
	h: number;
	pl?: number;
	pt?: number;
	type: "block" | "text" | "inline";
	value?: string[];
	boxes: DrawBox[];
	color: string;
}
