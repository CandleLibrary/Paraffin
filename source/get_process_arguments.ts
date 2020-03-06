/* 
	Returns an object housing key:value pairs of process.argv. 
	
	Maps argv that begin with [-] to keys, and right adjacent argv values that 
	do not lead with [-] to values. 
	
	Prop keys are created by stripping Argv keys of leading [-] chars and having 
	all other [-] chars replaced with [_]. 
	
	Argv keys that are not followed by non [-] leading argv values have value set to [""].

	Returned object contains both properties named by the converted keys assigned to the key:value pairs,
	and an __array__ prop that contains the the key:value pairs ordered left to right based on the 
	original Argv index. 
 */
export default function getProcessArgs(){
    let array = [];
    return process
        .argv
        .slice(2) // Fist two values, Node dir and Working Dir, can be ignored
        .reduce(
            (r,i,j,a)=> (
                (i[0] == "-" 
                && r.push(
                        {
                            name:
                                i.replace(/\-/g, " ")
                                    .trim()
                                    .replace(/ /g,"_")
                            , 
                            hyphens: i.length - i.replace(/\-/g, " ")
                                    .trim()
                                    .replace(/ /g,"_").length 
                            ,
                            value: 
                                ( a[j+1] && a[j+1][0] !== "-" ) 
                                ? a[j+1] 
                                : "" 
                        }
                    ))
                || ((i[j-1] && i[j-1][0] !== "-") || !i[j-1]) && r.push({
                            name:
                                i.replace(/\-/g, " ")
                                    .trim()
                                    .replace(/ /g,"_")
                            , 
                            hyphens:0
                            ,
                            value:""
                        }), 
                r), 
            array)
        .reduce((r,i)=>(r[i.name]=i,r), {__array__: array})
}