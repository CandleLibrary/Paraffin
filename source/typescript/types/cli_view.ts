import { CSSNode, WickRTComponent } from "@candlelib/wick";
import { ExtendedHTMLElement } from "./extended_HTML_element.js";

export interface WickCLIView {
	ele: ExtendedHTMLElement;
	style: CSSNode;
	comp: WickRTComponent;
}
