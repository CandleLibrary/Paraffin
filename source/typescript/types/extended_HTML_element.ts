import { HTMLNode } from "@candlefw/html";
import { DrawBox } from "./draw_box";
export class ExtendedHTMLElement extends HTMLNode {

    public SELECTED?: boolean;

    public checked?: boolean;

    public value?: string;

    children: ExtendedHTMLElement[];

    update: (code: number, str: string) => void;

    selectNextInput: (start: ExtendedHTMLElement, prev: ExtendedHTMLElement) => ExtendedHTMLElement;

    handleCompositeSpecialization: (
        boxes: DrawBox[],
        x: number,
        y: number,
        w: number,
        h: number,
        pl: number,
        pt: number,
        max_width: number,
        max_height: number,
        cursor_start: number,
        cursor_end: number
    ) => DrawBox;

    getCompositeBoxes: (
        x: number,
        y: number,
        width: number,
        height: number,
        cursor: number
    ) => DrawBox;
}