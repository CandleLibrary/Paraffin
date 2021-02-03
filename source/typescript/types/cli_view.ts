import { CSSNode, WickRTComponent } from "@candlefw/wick";
import { ExtendedHTMLElement } from "./extended_HTML_element.js";

export interface WickCLIView {
	ele: ExtendedHTMLElement;
	style: CSSNode;
	comp: WickRTComponent;
}
