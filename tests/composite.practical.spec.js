import { wickurse } from "../build/library/paraffin.js";

const cursed_wick = await wickurse();
const model = { number: 55 };
const cli_page = await cursed_wick.cli(`
var name = "Tony Blair", email = "thehitchcock@gmail.com", pckg = "title", d = [{name:"tom"}, {name:"tom"}];

<style>

root {
    width: 100%;
    height: 100%;
    padding: 2; 
    background-color:indigo;
    color:darkorange;
    //text-align: center;
}

.title {
    background-color:black;
    color:white;
    padding:1;
    display:inline;
}

div {
    padding:1
}
.test {
    background-color:white;
    color:black;
    padding:2;
}


</style>;

export default <div>What a stylishly vibrant CLI!
    What do you want to accomplish today: <input type="text" placeholder="your name" value=\${name}/>
    <div class="title">Email</div>
    <input type="text" placeholder="your email" value=\${email}/>
    <div class="title">Package Name</div>
    <input type="text" placeholder="your package name" value=\${pckg}/>

    <container data=\${d}>
        <div class="test">Hello World</div>
    </container>

    <div>NAME: \${name || "Missing Name"} </div>
    <div>EMAIL: \${email || "Missing Email"}</div>
    <div>PACKAGE: \${pckg || "Missing Package"}</div>

</div>;`, model);

const res = await cli_page.start();


process.exit(0);
//assert(res == "")