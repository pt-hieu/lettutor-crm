"use strict";
var _a;
exports.__esModule = true;
var yargs = require("yargs");
var child_process_1 = require("child_process");
var choices = ['apollo', 'artemis', 'poseidon', 'zeus'];
var agrv = yargs.options({
    block: { type: 'array', choices: choices, required: true, "default": choices },
    init: { type: 'boolean', "default": false }
}).argv;
var command = '';
if ('then' in agrv) {
    yargs.exit(1, new Error('Script failed'));
}
else {
    if (agrv.init) {
        command =
            'concurrently ' +
                agrv.block.map(function (choice) { return "\"cd ".concat(choice, " && yarn\""); }).join(' ');
    }
    else {
        command =
            'concurrently -k ' +
                agrv.block.map(function (choice) { return "\"cd ".concat(choice, " && yarn dev\""); }).join(' ');
    }
}
var concurrentProc = (0, child_process_1.exec)(command, function () { });
(_a = concurrentProc === null || concurrentProc === void 0 ? void 0 : concurrentProc.stdout) === null || _a === void 0 ? void 0 : _a.pipe(process.stdout);
