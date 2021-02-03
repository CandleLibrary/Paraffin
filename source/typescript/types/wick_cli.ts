import URL from "@candlefw/url";
import { WickLibrary } from "@candlefw/wick";

export interface WickCLI extends WickLibrary {

	/**
	 * Creates a CLI from a wick template and optional model.
	 * @param template
	 * @param model
	 */
	wick: {
		cli: (name: string, template: string | URL, model?: any) => Promise<{
			/**
			 * Runs the CLI until until an `EXIT` event
			 * is received.
			 */
			start(): Promise<void>;
		}>;
	} & WickLibrary;

	/**
	 * Clear the current active CLI view.
	 * Does nothing if there is no active view.
	 */
	clearView: () => void;

	/**
	 * Load a view by name. View must have already
	 * be created before calling.
	 */
	loadView: (viewName: string) => void;

	/**
	 * Activate the next view. Does nothing if the current
	 * view is the most recent
	 */
	nextView: () => void;

	/**
	 * Activate the previous view. Does nothing if the current
	 * view is the first view.
	 */
	previousView: () => void;
}
