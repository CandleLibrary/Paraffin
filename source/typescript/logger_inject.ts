import { LogLevel, LogWriter } from "@candlelib/log";

import { col_x11, xtBlink, xtBold, xtColor, xtDim, xtF, xtInvert, xtRBold, xtReset } from "./color/color.js";

const log_color = xtF(xtColor(col_x11.SkyBlue2));
const error_color = xtF(xtBlink, xtBold, xtColor(col_x11.Red3));
const warn_color = xtF(xtColor(col_x11.OrangeRed));
const debug_color = xtF(xtColor(col_x11.GreenYellow));
const time_color = xtF(xtColor(col_x11.LemonChiffon1));
const rst = xtF(xtReset);
const dim = xtF(xtDim);

LogWriter.prototype.writeLog = function (
    logger_name: string,
    log_level: LogLevel,
    ...args: any[]
) {


    switch (log_level) {
        case LogLevel.CRITICAL:
            console.error(construct_log_header(xtF(xtBold) + "CRITICAL" + xtF(xtRBold), logger_name, "❗", error_color), ...args);
            break;
        case LogLevel.ERROR:
            console.error(construct_log_header("ERROR", logger_name, "❌", error_color), ...args);
            break;
        case LogLevel.WARN:
            console.warn(construct_log_header("WARN", logger_name, "⚠️", warn_color), ...args);
            break;
        case LogLevel.INFO:
            console.info(construct_log_header("INFO", logger_name, "ℹ️", log_color), ...args);
            break;
        case LogLevel.DEBUG:
            console.debug(construct_log_header("DEBUG", logger_name, "☣️", debug_color), ...args);
            break;
    }
};
function construct_log_header(type, logger_name: string, emoji, color: string): any {

    const time = new Date();

    return ["  ", color, emoji, " ", rst, time_color, time.toLocaleTimeString(undefined, <Intl.DateTimeFormatOptions>{
        hour12: false,
    }), color, " ", logger_name, ` [${type}] `, rst, "\n  ╰─>"].join("");
}

