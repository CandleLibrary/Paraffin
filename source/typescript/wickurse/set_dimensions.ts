import { CSSProperty, CSS_Percentage } from "@candlefw/css";
import { min_max } from "./min_max.js";
import { BoxMetrics, CALCFlag } from "./calculated_flags.js";
export function setWidth(prop: CSSProperty, box: BoxMetrics, parent_box: BoxMetrics) {

	const val = prop.val[0];

	if (val instanceof CSS_Percentage)
		box.w = min_max(0, parent_box.w * (+val / 100), parent_box.w);
	else
		box.w = min_max(0, (+val), parent_box.w);

	box.defined |= CALCFlag.WIDTH;
}
export function setHeight(prop: CSSProperty, box: BoxMetrics, parent_box: BoxMetrics) {
	const val = prop.val[0];
	if (val instanceof CSS_Percentage)
		box.h = min_max(0, parent_box.h * (+val / 100), parent_box.h);
	else
		box.h = min_max(0, (+val), parent_box.h);
	box.defined |= CALCFlag.HEIGHT;
}
