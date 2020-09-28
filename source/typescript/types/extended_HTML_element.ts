import { HTMLNode } from "@candlefw/html";
import { DrawBox } from "./draw_box";
import { CSSNode } from "@candlefw/css";
export class ExtendedHTMLElement extends HTMLNode {

    public selected?: boolean;

    public checked?: boolean;

    public value?: string;

    children: ExtendedHTMLElement[];

    update: (code: number, str: string) => void;

    selectNextInput: (start: ExtendedHTMLElement, prev: ExtendedHTMLElement) => ExtendedHTMLElement;
}
