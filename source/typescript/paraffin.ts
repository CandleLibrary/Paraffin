/**
 * Copyright 2021
 *
 * MIT License
 *
 * Copyright (c) 2021 Anthony C. Weathersby
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
*/
import "./logger_inject.js";


export { PackageJSONData } from "./types/package.js";

export {
    getProcessArgs,
    addCLIConfig,
    processCLIConfig,
    Argument
} from "./utils/get_process_arguments.js";


export {
    xtColor,
    xtReset,
    xtBold,
    xtDim,
    xtUnderline,
    xtBlink,
    xtInvert,
    xtHidden,
    xtRBold,
    xtRDim,
    xtRUnderline,
    xtRBlink,
    xtRInvert,
    xtF,
    col_x11,
    col_css,
    col_pwg
} from "./color/color.js";

export { getPackageJsonObject, savePackageJSON } from "./utils/get_package_json.js";

/* import initWickCLI from "./wick_cli/wick_cli.js"; */

//export { initWickCLI };

export * from "./utils/traverse_files.js";
