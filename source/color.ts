/*
	Credit for most useful table of xterm color values:
	Jonas Jared Jacek: https://jonasjacek.github.io/colors/
	retrieved 02/22/2020
*/
export enum color {
	black = 0,
	maroon = 1,
	green = 2,
	olive = 3,
	navy = 4,
	purple = 5,
	teal = 6,
	silver = 7,
	grey = 8,
	gray = 8,
	red = 9,
	lime = 10,
	yellow = 11,
	blue = 12,
	fuchsia = 13,
	aqua = 14,
	white = 15,
	grey0 = 16,
	navyblue = 17,
	darkblue = 18,
	blue3 = 19,
	blue1 = 21,
	darkgreen = 22,
	deepskyblue4 = 23,
	dodgerblue3 = 26,
	dodgerblue2 = 27,
	green4 = 28,
	springgreen4 = 29,
	turquoise4 = 30,
	deepskyblue3 = 31,
	dodgerblue1 = 33,
	green3 = 34,
	springgreen3 = 35,
	darkcyan = 36,
	lightseagreen = 37,
	deepskyblue2 = 38,
	deepskyblue1 = 39,
	springgreen2 = 42,
	cyan3 = 43,
	darkturquoise = 44,
	turquoise2 = 45,
	green1 = 46,
	springgreen1 = 48,
	mediumspringgreen = 49,
	cyan2 = 50,
	cyan1 = 51,
	darkred = 52,
	deeppink4 = 53,
	purple4 = 54,
	purple3 = 56,
	blueviolet = 57,
	orange4 = 58,
	grey37 = 59,
	mediumpurple4 = 60,
	slateblue3 = 61,
	royalblue1 = 63,
	chartreuse4 = 64,
	darkseagreen4 = 65,
	paleturquoise4 = 66,
	steelblue = 67,
	steelblue3 = 68,
	cornflowerblue = 69,
	chartreuse3 = 70,
	cadetblue = 72,
	skyblue3 = 74,
	steelblue1 = 75,
	palegreen3 = 77,
	seagreen3 = 78,
	aquamarine3 = 79,
	mediumturquoise = 80,
	chartreuse2 = 82,
	seagreen2 = 83,
	seagreen1 = 84,
	aquamarine1 = 86,
	darkslategray2 = 87,
	darkmagenta = 90,
	darkviolet = 92,
	lightpink4 = 95,
	plum4 = 96,
	mediumpurple3 = 97,
	slateblue1 = 99,
	yellow4 = 100,
	wheat4 = 101,
	grey53 = 102,
	gray53 = 102,
	lightslategrey = 103,
	mediumpurple = 104,
	lightslateblue = 105,
	darkolivegreen3 = 107,
	darkseagreen = 108,
	lightskyblue3 = 109,
	skyblue2 = 111,
	darkseagreen3 = 115,
	darkslategray3 = 116,
	skyblue1 = 117,
	chartreuse1 = 118,
	lightgreen = 119,
	palegreen1 = 121,
	darkslategray1 = 123,
	red3 = 124,
	mediumvioletred = 126,
	magenta3 = 127,
	darkorange3 = 130,
	indianred = 131,
	hotpink3 = 132,
	mediumorchid3 = 133,
	mediumorchid = 134,
	mediumpurple2 = 135,
	darkgoldenrod = 136,
	lightsalmon3 = 137,
	rosybrown = 138,
	grey63 = 139,
	gray63 = 139,
	mediumpurple1 = 141,
	gold3 = 142,
	darkkhaki = 143,
	navajowhite3 = 144,
	grey69 = 145,
	lightsteelblue3 = 146,
	lightsteelblue = 147,
	yellow3 = 148,
	darkseagreen2 = 151,
	lightcyan3 = 152,
	lightskyblue1 = 153,
	greenyellow = 154,
	darkolivegreen2 = 155,
	darkseagreen1 = 158,
	paleturquoise1 = 159,
	deeppink3 = 161,
	magenta2 = 165,
	hotpink2 = 169,
	orchid = 170,
	mediumorchid1 = 171,
	orange3 = 172,
	lightpink3 = 174,
	pink3 = 175,
	plum3 = 176,
	violet = 177,
	lightgoldenrod3 = 179,
	tan = 180,
	mistyrose3 = 181,
	thistle3 = 182,
	plum2 = 183,
	khaki3 = 185,
	lightgoldenrod2 = 186,
	lightyellow3 = 187,
	grey84 = 188,
	lightsteelblue1 = 189,
	yellow2 = 190,
	darkolivegreen1 = 191,
	honeydew2 = 194,
	lightcyan1 = 195,
	/**
	 * 
	 */
	red1 = 196,
	deeppink2 = 197,
	deeppink1 = 198,
	magenta1 = 201,
	orangered1 = 202,
	indianred1 = 203,
	hotpink = 205,
	darkorange = 208,
	/**
	 * #020202
	 */
	salmon1 = 209,
	lightcoral = 210,
	palevioletred1 = 211,
	orchid2 = 212,
	orchid1 = 213,
	orange1 = 214,
	sandybrown = 215,
	lightsalmon1 = 216,
	lightpink1 = 217,
	pink1 = 218,
	plum1 = 219,
	gold1 = 220,
	navajowhite1 = 223,
	mistyrose1 = 224,
	thistle1 = 225,
	yellow1 = 226,
	lightgoldenrod1 = 227,
	khaki1 = 228,
	wheat1 = 229,
	cornsilk1 = 230,
	grey100 = 231,
	gray100 = 231,
	grey3 = 232,
	gray3 = 232,
	grey7 = 233,
	gray7 = 233,
	grey11 = 234,
	gray11 = 234,
	grey15 = 235,
	gray15 = 235,
	grey19 = 236,
	gray19 = 236,
	grey23 = 237,
	gray23 = 237,
	grey27 = 238,
	gray27 = 238,
	grey30 = 239,
	gray30 = 239,
	grey35 = 240,
	gray35 = 240,
	grey39 = 241,
	gray39 = 241,
	grey42 = 242,
	gray42 = 242,
	grey46 = 243,
	gray46 = 243,
	grey50 = 244,
	gray50 = 244,
	grey54 = 245,
	gray54 = 245,
	grey58 = 246,
	gray58 = 246,
	grey62 = 247,
	gray62 = 247,
	grey66 = 248,
	gray66 = 248,
	grey70 = 249,
	gray70 = 249,
	grey74 = 250,
	gray74 = 250,
	grey78 = 251,
	gray78 = 251,
	grey82 = 252,
	gray82 = 252,
	grey85 = 253,
	gray85 = 253,
	grey89 = 254,
	gray89 = 254,
	grey93 = 255,
	gray93 = 255
};

export function xtColor(text?: color, background?: color) {

	let
		text_color_code = color.white,
		background_color_code = color.black,
		str = [];

	if (text !== undefined) {
		if (typeof text == "number")
			text_color_code = text & 0xFF;

		str.push(`38;5;${text_color_code}`);
	}

	if (background !== undefined) {
		if (typeof background == "number")
			background_color_code = background & 0xFF;

		str.push(`48;5;${background_color_code}`);
	}

	return str.join(";");
}

export const xtReset = "0";
export const xtBold = "1";
export const xtDim = "2";
export const xtUnderline = "4";
export const xtBlink = "5";
export const xtInvert = "7";
export const xtRHidden = "8";
export const xtRBold = "21";
export const xtRDim = "22";
export const xtRUnderline = "24";
export const xtRBlink = "25";
export const xtRInvert = "27";
export const xtHidden = "28";
export const xtF = (...format_codes) => `\x1b[${format_codes.join(";")}m`;