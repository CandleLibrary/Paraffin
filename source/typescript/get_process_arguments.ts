import { lrParse, ParserData } from "@candlefw/hydrocarbon";
import parse_data from "./parser/process_args.js";

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
 *	and an array prop that contains the the key:value pairs ordered left to right based on the 
 *	original argv index location. 
 */
function getProcessArgs(): { key: string, val?: string; }[] {

    const { value, error } = lrParse<any[]>(process.argv.slice(2).join(" "), <ParserData><any>parse_data);

    if (error)
        console.warn(error);

    return value;
}

export default getProcessArgs;