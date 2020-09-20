import { wickurse } from "@candlefw/wax";
import wick from "@candlefw/wick";
import html from "@candlefw/html";

const cursed_wick = await wickurse(wick, html);
const model = { number: 55 }
const cli_page = await cursed_wick.cli(`
import {number} from "@model";

function onLoad(){
    number += 1000;
}

export default <div>Hello World \${ number \} <input type="checkbox"/></div>;
`, model);

const res = await cli_page.start();

process.exit(0);
//assert(res == "")