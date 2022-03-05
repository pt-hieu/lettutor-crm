"use strict";
var _a;
exports.__esModule = true;
var yargs = require("yargs");
var child_process_1 = require("child_process");
var choices = ['apollo', 'artemis', 'poseidon', 'ares', 'zeus'];
var agrv = yargs.options({
    b: { type: 'array', choices: choices, required: true, "default": choices },
    i: { type: 'boolean', "default": false },
    s: { type: 'array', choices: choices, required: false, "default": [] }
}).argv;
var command = '';
if ('then' in agrv) {
    yargs.exit(1, new Error('Script failed'));
}
else {
    var blocks = agrv.b.filter(function (choice) { return !agrv.s.includes(choice); });
    if (agrv.i) {
        command =
            'concurrently ' +
                blocks.map(function (choice) { return "\"cd ".concat(choice, " && yarn\""); }).join(' ');
    }
    else {
        command =
            'concurrently -k ' +
                blocks.map(function (choice) { return "\"cd ".concat(choice, " && yarn dev\""); }).join(' ');
    }
    command += ' -n ' + blocks.join(',');
}
var concurrentProc = (0, child_process_1.exec)(command, function () { });
(_a = concurrentProc === null || concurrentProc === void 0 ? void 0 : concurrentProc.stdout) === null || _a === void 0 ? void 0 : _a.pipe(process.stdout);
