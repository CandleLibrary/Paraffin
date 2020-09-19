import { wickurse } from "@candlefw/wax";
import wick from "@candlefw/wick";
import html from "@candlefw/html";

const d = await wickurse(wick, html);

assert(d == "")