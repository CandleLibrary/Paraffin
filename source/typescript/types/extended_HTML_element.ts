import { HTMLNode } from "@candlelib/html";
import { DrawBox } from "./draw_box";
import { CSSNode } from "@candlelib/css";
export class ExtendedHTMLElement extends HTMLNode {

    public selected?: boolean;

    public checked?: boolean;

    public value: string;

    children: ExtendedHTMLElement[];

    update: (code: number, str: string) => void;

    selectNextInput: (start?: ExtendedHTMLElement, prev?: ExtendedHTMLElement) => ExtendedHTMLElement;
    selectPrevInput: (start?: ExtendedHTMLElement, prev?: ExtendedHTMLElement) => ExtendedHTMLElement;

    runEvent: (event_name: string, event_data: any) => void;
}
