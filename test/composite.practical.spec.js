import { wickurse } from "@candlefw/wax";
import wick from "@candlefw/wick";
import html from "@candlefw/html";

const cursed_wick = await wickurse(wick, html);

const cli_page = await cursed_wick.cli(`
var number = 22;

export default <div>Hello World \${ number \} </div>;
`);

const res = await cli_page.start();

process.exit(0);
//assert(res == "")