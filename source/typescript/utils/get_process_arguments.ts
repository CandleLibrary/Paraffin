
//import { ParserEnvironment } from "@candlelib/hydrocarbon";
//import parse_data from "../parser/parser.js";
import { limitColumnLength } from '../logger_inject.js';
import framework from "../parser/args_parser.js";
import { Argument, ArgumentHandle, CommandBlock } from '../types/cli_arg_types';
import { Output } from '../types/output';

const { parse } = await framework;

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
        //@ts-ignore
        return {
            __array__: [],
            trailing_arguments: []
        };
    }


    const env = {
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

let configs: CommandBlock = {
    path: "root",
    name: "root",
    help_brief: "",
    arguments: {},
    sub_commands: new Map
};
/**
 * Assigns an argument or command data to a command path and returns a 
 * handle to the argument object, or to the command.
 * @param commands 
 * @returns 
 */
export function addCLIConfig<T>(...commands: (string | Argument<T>)[]): ArgumentHandle<T> {

    if (typeof commands.slice(-1)[0] != "object")
        throw new Error("Invalid type provided for the last argument. Should be an object that matches the Argument interface");

    const argument: Argument<T> = Object.assign({}, <any>commands.slice(-1)[0]);

    let command_block = configs;

    let path = commands.slice(0, -1);

    let command_path = [];

    if (
        command_block.name == argument.key
        &&
        path.length == 1
        &&
        path[0] == "root"

    ) {
        //Merge the command

        Object.assign(configs, argument);

    } else for (const command of path) {

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

        const handle: ArgumentHandle<any> = {
            argument: null,
            value: "command",
            callback: null
        };

        command_block.handle = handle;

        Object.freeze(command_block);

        return handle;

    } else {

        argument.handles = [];

        argument.path = path.join("/") + "::" + argument.key;

        command_block.arguments[argument.key] = argument;

        const handle: ArgumentHandle<any> = {
            argument: argument,
            value: null
        };

        argument.handles.push(handle);

        return handle;
    }
};


export async function processCLIConfig(process_arguments: string[] = process.argv.slice(2)): Promise<string> {
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

        const arg_params = {}, to_process_arguments: Set<Argument<any>> = new Set();

        for (const key in command_block.arguments) {

            const arg = command_block.arguments[key];

            arg_params[key] = false;

            if (arg.REQUIRES_VALUE)
                arg_params[key] = true;

            if (arg.default)
                to_process_arguments.add(arg);
        }

        const args = getProcessArgs(arg_params, remaining_arguments);

        for (const key in args) {

            if (
                key == "h"
                ||
                key == "help"
                ||
                key == "?"
                ||
                !(command_block?.handle?.callback)
            ) {

                const help_doc = renderHelpDoc(command_block);

                console.log(help_doc);

                return command_block.path + "::help";
            }

            if (command_block.arguments[key]) {
                to_process_arguments.add(command_block.arguments[key]);
            }
        }

        for (const arg of to_process_arguments) {

            const key = arg.key;

            if (arg.REQUIRES_VALUE && args[key]?.val === undefined && arg.default === undefined) {
                const error = `ARGUMENT ERROR:\n\n   No value provided for argument [--${arg.key}]\n`
                    + (arg.accepted_values ? `   Expected value to be one of [ ${arg.accepted_values.map(v => {
                        if (typeof v == "string")
                            return `"${v}"`;
                        else return `<${v.name}>`;
                    }).join(", ")} ]` : "");

                throw new Error(error);
            }

            let val = arg.REQUIRES_VALUE ? args[key]?.val ?? arg.default : arg.default ?? true;

            if (arg.validate) {

                const error_message = arg.validate(val);

                if (error_message != undefined) {
                    const error = `ARGUMENT ERROR:\n\n[--${arg.key}] = ${val}\n`
                        + addIndent(error_message, 4)
                        + "\n";

                    throw new Error(error);
                }
            } else if (arg.accepted_values) {
                let VALID = false;

                for (const validator of arg?.accepted_values ?? []) {
                    if (typeof validator == "string" && val == validator) {
                        VALID = true;
                        break;
                    } else if (validator == Number && !Number.isNaN(Number.parseFloat(val))) {
                        VALID = true;
                        break;
                    }
                }

                if (!VALID)
                    throw new Error(`ARGUMENT ERROR: ${val} is not a valid argument for [--${arg.key}].`
                        + ` This argument accepts ["${arg.accepted_values.join("\" | \"")}"]`);
            }

            if (arg.transform)
                val = await arg.transform(val, args);

            for (const handle of arg.handles)
                handle.value = val;

        }

        if (command_block?.handle?.callback)
            command_block?.handle?.callback(args);

        return command_block.path;

    } catch (e) {

        console.error(e.message);

        throw new Error("Could not process arguments");

        //process.exit(-1);
    }
}

function addIndent(error_message: string, number_of_indent_space: number = 2) {
    const space = " ".repeat(number_of_indent_space);
    const indent = "\n" + space;
    return space + error_message.split("\n").join(indent);
}

function maxWidth(error_message: string, number_of_indent_space: number = 2) {
    const space = " ".repeat(number_of_indent_space);
    const indent = "\n" + space;
    return space + error_message.split("\n").join(indent);
}

import { col_x11, xtBlink, xtBold, xtColor, xtDim, xtF, xtInvert, xtRBold, xtReset } from "../color/color.js";
const warn_color = xtF(xtColor(col_x11.Orange3), xtBold);
const key_color = xtF(xtColor(col_x11.LightBlue3), xtBold);
const string_color = xtF(xtColor(col_x11.SeaGreen3));
const bold = xtF(xtBold);
const rst = xtF(xtReset);
function renderHelpDoc(command_block: CommandBlock) {

    const help_message = [];

    if (command_block.name != "root")
        help_message.push("", "Command: " + command_block.path);

    if (command_block.help_brief)
        help_message.push("\n" + createHelpColumn(command_block, 80));

    help_message.push("");

    if (Object.keys(command_block.arguments).length > 0) {

        help_message.push(`${bold}Arguments:${rst}\n`);

        for (const key in command_block.arguments) {
            const arg = command_block.arguments[key];
            const REQUIRED = arg.REQUIRES_VALUE && arg.default === undefined;

            const lines = [addIndent(`${key_color}--${key}${rst}\n`, 2)];

            if (REQUIRED) {
                lines.push(addIndent(`${warn_color}REQUIRED${rst}\n`, 4));
            }

            if (arg.accepted_values)
                lines.push(addIndent(`Accepted values: [ ${arg.accepted_values.map(accepted_values_to_string).join(" | ")} ]\n`, 4));

            lines.push(addIndent(createHelpColumn(arg), 4));

            help_message.push(...lines, "\n");
        }
    }

    if (command_block.sub_commands.size > 0)

        help_message.push(addIndent("==================================\n\nSub-Commands:", 0));

    for (const [name, cb] of command_block.sub_commands.entries()) {

        help_message.push(addIndent(`\n[${name}]\n\n${addIndent(createHelpColumn(cb), 2)} `, 2));
    }

    return help_message.join("\n") + "\n";
};
function accepted_values_to_string(v) {
    const map = [
        [v => (v === Number), () => "[0..9]*"],
        [v => (v instanceof String), v => `${string_color}"${v}"${rst}`],
        [_ => true, () => `${string_color}"${v.toString()}"${rst}`],
    ];

    for (const [evaluator, value] of map) {
        if (evaluator(v))
            return value(v);
    }
}
function createHelpColumn(cb: CommandBlock | Argument<any>, column_size: number = 74): string {

    if (!cb.help_brief) return "";

    return limitColumnLength(cb.help_brief.replace(/(?<=[^\n])\n(?=[^\n])/g, " ").trim(), column_size);
}
