
import { ParserEnvironment } from "@candlelib/hydrocarbon";
//import parse_data from "../parser/parser.js";
import framework from "../parser/args_parser.js";

const { parse } = await framework;



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
export function getProcessArgs<T>(
    /** An object whose keys represent expected argument keys
     *  and key~values which can either be `true`, `false` or a string
     * 
     * 1. If the value is `true` then the any argument with -- or -
     * proceeding it will have capture the next naked argument
     * 
     * 2. If this value is `false` then no value will be assigned to the
     * argv unless the argv key is followed by an equal [=] character
     * 
     * 2. If the value is a `string` then the it will act like case 1.
     * and, in addition, the value will be remapped to an output property
     * with a key that matches the `string` value. 
     * > This will overwrite any existing property with the same name.
     */
    arg_candidates: T = <T>{},

    /**
     * An optional error message to log to the console in the 
     * event arguments could not be parsed
     * 
     * Defaults to ""
     */
    process_arguments: string[] = process.argv.slice(2)

): Output<typeof arg_candidates> {

    if (process_arguments.length < 1) {
        return {
            __array__: [],
            trailing_arguments: []
        };
    }


    const env: ParserEnvironment = <ParserEnvironment>{
        options: {},
        functions: {},
        data: arg_candidates
    };

    const { result, err } = parse(process_arguments.join(" "), env);

    const value = result[0];


    // for each arg candidate,
    // if the arg candidate value is a string, then replace the output value entry 
    // with the value of this argument.

    if (err) {

        console.error(err);

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

        for (const [key, val, hyphens] of value.__array__.reverse()) {
            if (val || hyphens > 0) break;
            value.trailing_arguments.push(key);
        }

        value.trailing_arguments = value.trailing_arguments.reverse();
    }

    return value;
}

type Argument = {
    /**
     * The argument name for this config type. 
     * if the key is the same value as the previous
     * command argument in addConfig, then this 
     * object is used as the config settings for 
     * the command. 
     */
    key: string | number;

    REQUIRES_VALUE?: boolean,

    /**
     * A default value to set the arg to 
     * if none is supplied by the user.
     */
    default?: string;

    /**
     * An array of values which are acceptable
     * inputs for the argument. If the input argument
     * is not one of these values than an error will
     * be thrown.
     * This is overridden by the validate function if present
     * 
     */
    accepted_values?: string[];

    /**
     * A function used to determine if the argument
     * if valid. If any string value other than the
     * empty string is provided, the argument
     * value is considered to be invalid, and the 
     * returned string is used to provide an error
     * message to the user. 
     */
    validate?: (arg: string) => string;

    /**
     * A simple help message that is displayed when
     * the --help, -h, or -? argument is specified.
     */
    help_brief?: string;


    handles?: ArgumentHandle[],

    path?: string,
};

type CommandBlock = {
    path: string,
    name: string;
    help_brief: string;
    arguments: { [i in string]: Argument };
    sub_commands: Map<string, CommandBlock>;
    handle?: ArgumentHandle;
};

const configs: CommandBlock = {
    path: "root",
    name: "root",
    help_brief: "",
    arguments: {},
    sub_commands: new Map
};

type ArgumentHandle = {
    value: string,
    argument: Argument;
    callback?: (args: Output<any>) => void;
};
/**
 * Assigns an argument or command data to a command path and returns a 
 * handle to the argument object, or to the command.
 * @param commands 
 * @returns 
 */
export function addCLIConfig(...commands: (string | Argument)[]): ArgumentHandle {

    if (typeof commands.slice(-1)[0] != "object")
        throw new Error("Invalid type provided for the last argument. Should be an object that matches the Argument interface");

    const argument: Argument = <any>commands.slice(-1)[0];

    let command_block = configs;

    let path = commands.slice(0, -1);

    let command_path = [];

    for (const command of path) {

        command_path.push(command);

        if (typeof command == "string") {

            if (!command_block.sub_commands.has(command)) {

                command_block.sub_commands.set(command, {
                    path: command_path.join("/"),
                    name: command,
                    help_brief: "undefined",
                    arguments: {},
                    sub_commands: new Map
                });
            }

            command_block = command_block.sub_commands.get(command);
        }
    }


    if (command_block.name == argument.key) {

        command_block.help_brief = argument.help_brief;

        const handle: ArgumentHandle = {
            argument: null,
            value: "command",
            callback: _ => _
        };

        command_block.handle = handle;

        return handle;

    } else {

        argument.handles = [];

        argument.path = path.join("/") + "::" + argument.key,

            command_block.arguments[argument.key] = argument;

        const handle: ArgumentHandle = {
            argument: argument,
            value: null
        };

        argument.handles.push(handle);

        return handle;
    }
};


export function processCLIConfig(process_arguments: string[] = process.argv.slice(2)): string {
    try {
        let command_block: CommandBlock = configs;
        let i = 0;

        for (; i < process_arguments.length; i++) {

            const command_candidate = process_arguments[i];

            if (command_block.sub_commands.has(command_candidate)) {

                command_block = command_block.sub_commands.get(command_candidate);

                continue;

            } else break;
        }

        const remaining_arguments = process_arguments.slice(i);

        const arg_params = {};

        for (const key in command_block.arguments) {

            const arg = command_block.arguments[key];

            arg_params[key] = false;

            if (arg.REQUIRES_VALUE)
                arg_params[key] = true;
        }

        const args = getProcessArgs(arg_params, remaining_arguments);

        for (const key in args) {


            if (key == "h" || key == "help" || key == "?") {

                const help_doc = renderHelpDoc(command_block);

                console.log(help_doc);

                return command_block.path + "::help";
            }

            if (command_block.arguments[key]) {

                const arg = command_block.arguments[key];



                const val = arg.REQUIRES_VALUE ? args[key].val || arg.default : arg.default || true;

                if (arg.validate) {

                    const error_message = arg.validate(val);

                    if (error_message != undefined) {
                        const error = `ARGUMENT ERROR:\n\n[--${arg.key}] = ${val}\n`
                            + addIndent(error_message, 4)
                            + "\n";

                        console.error(error);
                        throw new Error(error);
                    }
                } else if (arg.accepted_values) {
                    if (!arg.accepted_values.includes(val))
                        throw new Error(`ARGUMENT ERROR: ${val} is not a valid argument for [--${arg.key}].`
                            + ` This argument accepts ["${arg.accepted_values.join("\" | \"")}"]`);
                }

                for (const handle of arg.handles)
                    handle.value = val;
            } else {

            }
        }

        command_block?.handle?.callback(args);

        return command_block.path;
    } catch (e) {
        console.error(e.message);

        throw new Error("Could process arguments");
    }
}

function addIndent(error_message: string, number_of_indent_space: number = 2) {
    const space = " ".repeat(number_of_indent_space);
    const indent = "\n" + space;
    return space + error_message.split("\n").join(indent);
}

function renderHelpDoc(command_block: CommandBlock) {

    const help_message = [];

    if (command_block.name != "root")
        help_message.push("", "Command: " + command_block.path);

    if (command_block.help_brief)
        help_message.push(command_block.help_brief);

    help_message.push("");

    if (Object.keys(command_block.arguments).length > 0) {

        help_message.push("Arguments:\n");

        for (const key in command_block.arguments) {
            const arg = command_block.arguments[key];
            help_message.push(addIndent(`--${key}\n${addIndent(arg.help_brief || "", 4)}`, 4));
        }
    }

    if (command_block.sub_commands.size > 0)

        help_message.push("Sub-Commands:\n");

    for (const [name, cb] of command_block.sub_commands.entries()) {

        help_message.push(addIndent(`\n[${name}]\n${addIndent(cb.help_brief || "", 4)}`, 4));
    }

    return help_message.join("\n") + "\n";
}