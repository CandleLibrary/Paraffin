import parser_package from "../build/library/parser/terminfo_parser.js";

const { parser } = parser_package;

const input = `xterm | xterm-debian, dfg=asodmf,`;

// TODO: assert(inspect, parser(input) == 0);