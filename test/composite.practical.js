import { wickurse } from "@candlelib/wax";
import wick from "@candlelib/wick";
import html from "@candlelib/html";

const d = await wickurse(wick, html);

assert(d == "");