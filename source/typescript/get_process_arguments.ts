import { lrParse, ParserData, ParserEnvironment } from "@candlefw/hydrocarbon";
import parse_data from "./parser/process_args.js";
import { type } from "os";

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

/**[API]
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
function getProcessArgs(
    /** An object whose keys represent expected argument keys
     *  and key~values which can either be `true`, `false` or a string
     * 
     * 1. If the value is `true` then the any argument with -- or -
     * proceeding it will have capture the next naked argument
     * 
     * 2. If this value is `false` then no value will be assigned to the
     * argv unless it the argv key is followed by an = character
     * 
     * 2. If the value is a `string` then the it will act like case 1.
     * and, in addition, the value will be remapped to an output property
     * with a key that matches to the `string` value. 
     * > This will overwrite any existing property with the same name.
     */
    arg_candidates: any = {}

): { key: string, val?: string; }[] {


    const env: ParserEnvironment = <ParserEnvironment>{
        options: {},
        functions: {},
        data: arg_candidates
    };
    const { value, error } = lrParse<any[]>(process.argv.slice(2).join(" "), <ParserData><any>parse_data, env);

    // for each arg candidate,
    // if the arg candidate value is a string, then replace the output value entry 
    // with the value of this argument.

    if (error) {
        console.error(error);
    }

    for (const name in arg_candidates) {
        if (typeof arg_candidates[name] == "string") {
            if (value[name])
                value[arg_candidates[name]] = value[name];
        }
    }

    if (error) console.warn(error);

    return value;
}

export default getProcessArgs;