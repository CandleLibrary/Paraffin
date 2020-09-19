import { lrParse, ParserData, ParserEnvironment } from "@candlefw/hydrocarbon";
import parse_data from "../parser/process_args.js";


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


type Output<T> = { [i in keyof T]?: { index: number, val: string | boolean; }; } &
{
    /**
     * All argument [key, val] pairs ordered first to last
     */
    __array__: [string, string][];
    /**
     * The trailing set of arguments without a value member
     */
    trailing_arguments: string[];
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
function getProcessArgs<T>(
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
    arg_candidates: T = <T>{},

    /**
     * An optional error message to log to the console in the 
     * event arguments could not be parsed
     * 
     * Defaults to ""
     */
    error_message: string = "Unable to process arguments"

): Output<typeof arg_candidates> {


    const env: ParserEnvironment = <ParserEnvironment>{
        options: {},
        functions: {},
        data: arg_candidates
    };
    const { value, error } = lrParse<Output<typeof arg_candidates>>(process.argv.slice(2).join(" "), <ParserData><any>parse_data, env);

    // for each arg candidate,
    // if the arg candidate value is a string, then replace the output value entry 
    // with the value of this argument.

    if (error) {
        if (error.message == "Unexpected end of input") {
            //suppress empty argument error
        } else
            console.error(error_message, error.message);

        return <Output<typeof arg_candidates>>{ __array__: [] };
    } else {


        for (const name in arg_candidates) {
            const val = arg_candidates[name];
            if (typeof val == "string") {
                if (value[name])
                    value[<string>val] = value[name];
            }
        }

        value.trailing_arguments = [];

        for (const [key, val] of value.__array__.reverse()) {
            if (val) break;
            value.trailing_arguments.push(key);
        }

        value.trailing_arguments = value.trailing_arguments.reverse();
    }

    return value;
}

export default getProcessArgs;