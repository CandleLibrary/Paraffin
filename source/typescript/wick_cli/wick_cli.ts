import html, { HTMLNode, TextNode } from "@candlefw/html";
import spark from "@candlefw/spark";
import URL from "@candlefw/url";
import wick, { CSSNode, ExtendedComponent } from "@candlefw/wick";
import { componentToMutatedCSS } from "@candlefw/wick/build/library/component/component_data_to_css.js";

import { WickCLIView } from "../types/cli_view";
import { ExtendedHTMLElement } from "../types/extended_HTML_element.js";
import { WickCLI } from "../types/wick_cli";
import key from "../utils/keyboard_codes.js";
import integrateComposite from "./compositing.js";
import { renderCLI } from "./render.js";
import integrateSelection from "./selection.js";

function Is_Active_View_Valid(active_view: WickCLIView) {
	return active_view.ele != null || active_view.style != null || active_view.comp != null;
}

/**
 * Converts wick templates into CLI interfaces, 
 * providing ways to describe cursor based display and 
 * inputs using HTML and CSS syntaxes, and user interaction 
 * with JS scripting syntaxes.  
 * 
 * @param wick 
 * @param html 
 */
export default async function integrate(): Promise<WickCLI> {

	await wick.server();
	await html.server();

	//@ts-ignore
	global.Node = html.HTMLNode;

	let
		history_pointer: number = 0;

	const
		views: Map<string, WickCLIView> = new Map,
		history: WickCLIView[] = [],
		active_view:
			WickCLIView = {
			ele: null,
			style: null,
			comp: null
		};

	integrateComposite();
	integrateSelection();

	TextNode.prototype.bubbleUpdate =
		HTMLNode.prototype.bubbleUpdate =
		function () {
			if (this.parent)
				this.parent.bubbleUpdate();
		};

	process.stdout.on('resize', renderActiveView);

	function renderActiveView() {
		if (Is_Active_View_Valid(active_view))
			renderCLI(active_view.ele, active_view.style);
	}

	function updateActiveView(view: WickCLIView) {

		if (
			view.comp == active_view.comp
			&& view.ele == active_view.ele
			&& view.style == active_view.style
		) return processInputsAndOutputs(active_view);

		history.push(Object.assign({}, active_view));
		history_pointer++;

		active_view.comp = view.comp;
		active_view.ele = view.ele;
		active_view.style = view.style;

		processInputsAndOutputs(active_view);
	}

	function loadView(viewName: string) {

		const view = views.get(viewName);

		if (view) {
			history.length = history_pointer;
			updateActiveView(view);
		} else {

		}
	}

	function nextView() {
		if (history.length < history_pointer - 1) {
			history_pointer++;
			updateActiveView(history[history_pointer]);
		}
	}

	function previousView() {
		if (history_pointer > 0) {
			history_pointer--;
			updateActiveView(history[history_pointer]);
		}
	}

	function clearActiveView() {
		active_view.comp = null;
		active_view.ele = null;
		active_view.style = null;
	}

	//@ts-ignore
	wick.cli = async function (
		name: string,
		template_or_url: string | URL,
		model: any = {}
	) {

		model = Object.assign(model, {
			exit: clearActiveView,
			loadView,
			previousView,
			nextView
		});

		const

			comp_data: ExtendedComponent = await wick(template_or_url),

			style: CSSNode = componentToMutatedCSS(comp_data.CSS[0], comp_data),

			ele: ExtendedHTMLElement = <any>html("<div></div>"),

			comp = new comp_data.class(model),

			view: WickCLIView = {
				ele,
				comp,
				style
			};

		views.set(name, view);

		comp.appendToDOM(<HTMLElement><any>ele);

		ele.bubbleUpdate = renderActiveView;

		return { start: () => loadView(name) };
	};

	return <WickCLI>{
		wick,
		clearView: clearActiveView,
		loadView: loadView,
		nextView,
		previousView,
	};
}

let ACTIVE_CLI = false, selected_ele = null;

async function processInputsAndOutputs(active_view: WickCLIView) {

	const { ele, style } = active_view;

	renderCLI(ele, style);

	selected_ele = ele.selectNextInput();

	if (selected_ele)
		selected_ele.selected = true;

	if (ACTIVE_CLI) return;

	ACTIVE_CLI = true;

	const stdin = process.stdin;

	//Create a command poller to handle user input
	process.stdin.setRawMode(true);

	while (true) {

		if (!Is_Active_View_Valid(active_view)) break;

		const
			{ ele, style } = active_view,
			data = stdin.read();

		if (data) {

			const ctrl = data[0] << 0 | data[1] << 8 | data[2] << 16 | data[3] << 24 | data[4] << 32 | data[5] << 40 | data[6] << 48 | data[7] << 54;

			let str = data.toString();

			if (ctrl == key.END_OF_TXT) // CTR-C ETX
				break;

			if (selected_ele)
				selected_ele.selected = false;

			if (ctrl == key.CARRIAGE_RETURN)
				if (selected_ele)
					selected_ele.runEvent("click", { target: selected_ele });


			if (ctrl == key.HORIZONTAL_TAB)
				if (selected_ele) {
					selected_ele = selected_ele.selectNextInput();
					str = "";
				}

			if (ctrl == key.UP_ARROW) // UP Arrow
				if (selected_ele)
					selected_ele = selected_ele.selectPrevInput();


			if (ctrl == key.DOWN_ARROW) // DN Arrow
				if (selected_ele)
					selected_ele = selected_ele.selectNextInput();

			if (ctrl == key.LEFT_ARROW) // LT Arrow		
				if (selected_ele)
					selected_ele = selected_ele.selectPrevInput();


			if (ctrl == key.RIGHT_ARROW) // RT Arrow
				if (selected_ele)
					selected_ele = selected_ele.selectNextInput();

			if (str && selected_ele)
				selected_ele.update(ctrl, str);

			if (selected_ele)
				selected_ele.selected = true;

			renderCLI(ele, style);
		}

		await spark.sleep(10);
	}

	ACTIVE_CLI = false;

	return null;
}

