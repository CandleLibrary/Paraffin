import { wickurse } from "../build/library/paraffin.js";
import wick from "@candlelib/wick";
import html from "@candlelib/html";

const d = await wickurse(wick, html);

assert(d == "");