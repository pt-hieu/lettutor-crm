"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var child_process_1 = require("child_process");
var helpers_1 = require("yargs/helpers");
var yargs_1 = __importDefault(require("yargs/yargs"));
function run(command) {
    var _a;
    console.log(command);
    var concurrentProc = (0, child_process_1.exec)(command, function () { });
    (_a = concurrentProc === null || concurrentProc === void 0 ? void 0 : concurrentProc.stdout) === null || _a === void 0 ? void 0 : _a.pipe(process.stdout);
}
var services = ['apollo', 'artemis', 'poseidon', 'ares', 'zeus'];
(0, yargs_1["default"])((0, helpers_1.hideBin)(process.argv))
    .command('add <service> <dependency..>', 'Install dependencies', function (y) {
    return y
        .positional('service', {
        choices: services,
        demandOption: true
    })
        .positional('dependency', {
        array: true,
        demandOption: true
    })
        .options({
        D: {
            boolean: true,
            "default": false,
            description: 'Add to devDependency'
        }
    });
}, function (agrv) {
    var command = "cd ".concat(agrv.service, " && yarn add").concat(agrv.D ? ' -D ' : ' ').concat(agrv.dependency.join(' '));
    run(command);
})
    .command('remove <service> <dependency..>', 'Uninstall dependencies', function (y) {
    return y
        .positional('service', {
        choices: services,
        demandOption: true
    })
        .positional('dependency', {
        array: true,
        demandOption: true
    });
}, function (agrv) {
    var command = "cd ".concat(agrv.service, " && yarn remove ").concat(agrv.dependency.join(' '));
    run(command);
})
    .command('init [services..]', 'Init dependencies at CRM services', function (y) {
    return y.positional('services', {
        choices: services,
        array: true,
        "default": services,
        demandOption: false
    });
}, function (agrv) {
    var command = "concurrently ".concat(agrv.services
        .map(function (service) { return "\"cd ".concat(service, "\" && yarn"); })
        .join(' '), " --names ").concat(agrv.services.join(','));
    run(command);
})
    .command('dev [services..]', 'Run CRM services in local environment', function (y) {
    return y
        .positional('services', {
        demandOption: false,
        "default": services,
        choices: services,
        array: true
    })
        .option('ignore', {
        alias: 'I',
        type: 'string',
        array: true,
        choices: services,
        "default": [],
        demandOption: false
    });
}, function (agrv) {
    var servicesToRun = agrv.services.filter(function (service) { return !agrv.ignore.includes(service); });
    var command = "concurrently -k ".concat(servicesToRun
        .map(function (service) { return "\"cd ".concat(service, " && yarn dev\""); })
        .join(' '), " --names ").concat(servicesToRun.join(','));
    run(command);
})
    .parse();
