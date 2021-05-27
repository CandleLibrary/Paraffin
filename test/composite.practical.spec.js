import { wickurse } from "@candlelib/wax";

const cursed_wick = await wickurse(wick, html);
const model = { number: 55 };
const cli_page = await cursed_wick.cli(`
import {number} from "@model";

function onLoad(){
    number += 1000;
}

export default <div>Hello World TATA <span>\${ number \} toasty</span> dada<input type="checkbox"/>
    <div class="main">
        Thanks For Using CFW WAX! 

        COPYRIGHT 2020 ACWeathersby
        
        THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
        INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR 
        PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE 
        FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, 
        ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
        Farewell to arms!
    </div>
</div>;

<style>
    root {
        top:0;
        padding:2
        background-color:darkgreen;
    }

    root span {
        color:deeppink;
    }

    root input {
        color:red;
        background-color:green;
    }

    .main{
        background-color:gray;
        color:black;
        width:60;
        height:20;
        padding:3;
        padding-left:12;
        padding-top:1;
    }
</style>;
`, model);

const res = await cli_page.start();

process.exit(0);
//assert(res == "")