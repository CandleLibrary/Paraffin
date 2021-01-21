
export interface DrawBox {
	left: number;
	top: number;
	width: number;
	height: number;
	type: "block" | "text";
	IS_INLINE?: boolean;
}

export interface BlockDrawBox extends DrawBox {
	tag: string;
	width: number;
	height: number;
	pad_left?: number;
	pad_top?: number;
	IS_INLINE: boolean;
	type: "block";
	boxes: DrawBox[];
	color: string | "";
};

export interface TextDrawBox extends DrawBox {
	type: "text";
	value: { txt: string, off: number; }[];
}
