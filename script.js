"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var chalk_1 = __importDefault(require("chalk"));
var child_process_1 = require("child_process");
var helpers_1 = require("yargs/helpers");
var yargs_1 = __importDefault(require("yargs/yargs"));
function run(command) {
    var _a;
    var concurrentProc = (0, child_process_1.exec)(command, function () { });
    (_a = concurrentProc === null || concurrentProc === void 0 ? void 0 : concurrentProc.stdout) === null || _a === void 0 ? void 0 : _a.pipe(process.stdout);
}
function capitalize(str) {
    return str.charAt(0).toLocaleUpperCase() + str.slice(1);
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
            description: 'Add to devDependencies'
        }
    });
}, function (agrv) {
    var command = "cd ".concat(agrv.service, " && yarn add").concat(agrv.D ? ' -D ' : ' ').concat(agrv.dependency.join(' '));
    console.log(chalk_1["default"].green("\n[CRM] Adding ".concat(chalk_1["default"].bold(agrv.dependency.join(', ')), " to ").concat(agrv.D ? 'devDependencies' : 'dependencies', " of ").concat(chalk_1["default"].bold(capitalize(agrv.service)), "\n")));
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
    console.log(chalk_1["default"].green("\n[CRM] Removing ".concat(chalk_1["default"].bold(agrv.dependency.join(', ')), " in ").concat(agrv.D ? 'devDependencies' : 'dependencies', " of ").concat(chalk_1["default"].bold(capitalize(agrv.service)), "\n")));
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
    console.log(chalk_1["default"].green("\n[CRM] Initializing dependencies in ".concat(chalk_1["default"].bold(agrv.services.map(function (s) { return capitalize(s); }).join(', ')), "\n")));
    run(command);
})
    .command('dev [services..]', 'Run CRM services in local environment, default to run all services', function (y) {
    return y
        .positional('services', {
        demandOption: false,
        "default": services,
        choices: services,
        array: true
    })
        .option('skip', {
        alias: 'S',
        type: 'string',
        array: true,
        choices: services,
        "default": [],
        demandOption: false,
        description: 'CRM services to skip'
    });
}, function (agrv) {
    var servicesToRun = agrv.services.filter(function (service) { return !agrv.skip.includes(service); });
    var command = "concurrently -k ".concat(servicesToRun
        .map(function (service) { return "\"cd ".concat(service, " && yarn dev\""); })
        .join(' '), " --names ").concat(servicesToRun.join(','));
    console.log(chalk_1["default"].green("\n[CRM] Starting ".concat(chalk_1["default"].bold(servicesToRun.map(function (s) { return capitalize(s); }).join(', '))).concat(agrv.skip.length
        ? ", skipping ".concat(chalk_1["default"].bold(agrv.skip.map(function (s) { return capitalize(s); }).join(', ')))
        : '', "\n")));
    run(command);
})
    .parse();
