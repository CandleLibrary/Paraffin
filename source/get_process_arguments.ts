type Flag = {
    /**
     * Name of the flag.
     */
    name: string;
    /**
     * Number of hyphens preceding the name.
     */
    hyphens: number;
    /**
     * Value of the flag, if flag is followed by a un-hyphenated value.
     */
    value: string;
};

/** 
 *	Returns an object housing key:value pairs from the values of process.argv. 
 *	
 *	Maps argv that begin with [-] to keys, and following argv values that 
 *	do not lead with [-] to values. 
 *	
 *	Prop keys are created by stripping Argv keys of leading [-] chars and having 
 *	all other [-] chars replaced with [_]. 
 *	
 *	Argv keys that are not followed by non [-] leading argv values have value set to [""].
 *
 *	Returned object contains both properties named by the converted keys assigned to the key:value pairs,
 *	and an __array__ prop that contains the the key:value pairs ordered left to right based on the 
 *	original argv index location. 
 */
function getProcessArgs(values: any): { __array__: Flag[]; } & { [key: string]: Flag; } {

    let array = [];

    return process
        .argv
        .slice(2) // Fist two values, Node dir and Working Dir, can be ignored
        .reduce(
            (r, str, j, a) => {
                let name = "", value = "", skip = false;
                ((str[0] == "-"
                    && (str[1] != "-"
                        // -abc.. single char flags 
                        ? (Array.from(str.slice(1)).forEach((n, a) => r.push(
                            {
                                name: n
                                ,
                                hyphens: 1
                                ,
                                value: ""
                            })), true)
                        : (r.push(

                            {
                                name: name =
                                    str.replace(/\-/g, " ")
                                        .trim()
                                        .replace(/ /g, "_")
                                ,
                                hyphens: str.length - str.replace(/\-/g, " ")
                                    .trim()
                                    .replace(/ /g, "_").length
                                ,
                                value: (values && name.toLocaleLowerCase() in values)
                                    ? (a[j + 1] && a[j + 1][0] !== "-")
                                        ? (skip = true, value = a[j + 1], values[name] = this, value)
                                        : ""
                                    : ""
                            }
                        ), true)))
                    || ((!skip || (skip = false)) && ((a[j - 1] && a[j - 1][1] !== "-") || !a[j - 1])
                        && r.push({
                            name:
                                str.replace(/\-/g, " ")
                                    .trim()
                                    .replace(/ /g, "_")
                            ,
                            hyphens: 0
                            ,
                            value: ""
                        })
                    )
                );
                return r;
            },
            array)
        .reduce((r, i) => (r[i.name] = i, r), { __array__: array, values });
}

export default getProcessArgs;