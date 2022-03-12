"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var deps_json_1 = __importDefault(require("./deps.json"));
var package_json_1 = __importDefault(require("./package.json"));
var chalk_1 = __importDefault(require("chalk"));
var child_process_1 = require("child_process");
var fs_1 = __importDefault(require("fs"));
var helpers_1 = require("yargs/helpers");
var yargs_1 = __importDefault(require("yargs/yargs"));
function run(command) {
    var _a, _b;
    var concurrentProc = (0, child_process_1.exec)(command, function () { });
    (_a = concurrentProc === null || concurrentProc === void 0 ? void 0 : concurrentProc.stdout) === null || _a === void 0 ? void 0 : _a.pipe(process.stdout);
    (_b = concurrentProc === null || concurrentProc === void 0 ? void 0 : concurrentProc.stderr) === null || _b === void 0 ? void 0 : _b.pipe(process.stdout);
}
function capitalize(str) {
    return str.charAt(0).toLocaleUpperCase() + str.slice(1);
}
function keys(o) {
    return Object.keys(o);
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
    var command = "yarn add".concat(agrv.D ? ' -D ' : ' ').concat(agrv.dependency.join(' '));
    var depsToSave = __assign({}, deps_json_1["default"]);
    depsToSave[agrv.service] = depsToSave[agrv.service].concat(agrv.dependency);
    depsToSave[agrv.service] = __spreadArray([], __read(new Set(depsToSave[agrv.service])), false);
    fs_1["default"].writeFileSync('deps.json', JSON.stringify(depsToSave, undefined, 2));
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
    var command = "yarn remove ".concat(agrv.dependency.join(' '));
    var depsToSave = __assign({}, deps_json_1["default"]);
    depsToSave[agrv.service] = depsToSave[agrv.service].filter(function (deps) { return !agrv.dependency.includes(deps); });
    fs_1["default"].writeFileSync('deps.json', JSON.stringify(depsToSave, undefined, 2));
    console.log(chalk_1["default"].green("\n[CRM] Removing ".concat(chalk_1["default"].bold(agrv.dependency.join(', ')), " in ").concat(agrv.D ? 'devDependencies' : 'dependencies', " of ").concat(chalk_1["default"].bold(capitalize(agrv.service)), "\n")));
    run(command);
})
    .command('localize <service>', 'Localize dependencies for a specific CRM service', function (y) {
    return y.positional('service', {
        choices: services,
        demandOption: true
    });
}, function (agrv) {
    var depsToFilter = __assign({}, deps_json_1["default"]);
    var packageJsonToSave = __assign({}, package_json_1["default"]);
    keys(packageJsonToSave.dependencies).forEach(function (key) {
        if (depsToFilter[agrv.service].includes(key))
            return;
        delete packageJsonToSave.dependencies[key];
    });
    keys(packageJsonToSave.devDependencies).forEach(function (key) {
        if (depsToFilter[agrv.service].includes(key))
            return;
        delete packageJsonToSave.devDependencies[key];
    });
    console.log(chalk_1["default"].green("\n[CRM] Localizing dependencies in ".concat(chalk_1["default"].bold(capitalize(agrv.service)), "\n")));
    fs_1["default"].writeFileSync('package.json', JSON.stringify(packageJsonToSave, undefined, 2));
})
    .command('build <service>', 'Build CRM service', function (y) {
    return y
        .positional('service', {
        demandOption: true,
        choices: services
    })
        .option('dev', {
        alias: 'D',
        boolean: true,
        defaul: false,
        demandOption: false,
        description: 'Build using dev environment'
    });
}, function (agrv) {
    var command = "cd ".concat(agrv.service, " && npm run build").concat(agrv.dev ? ':dev' : '');
    console.log(chalk_1["default"].green("\n[CRM] Building ".concat(capitalize(agrv.service)).concat(agrv.dev ? ' targeting dev environment' : '', "\n")));
    run(command);
})
    .command('start <service>', 'Start CRM service', function (y) {
    return y
        .positional('service', {
        demandOption: true,
        choices: services
    })
        .option('dev', {
        alias: 'D',
        boolean: true,
        defaul: false,
        demandOption: false,
        description: 'Start using dev environment'
    });
}, function (agrv) {
    var command = "cd ".concat(agrv.service, " && npm run start").concat(agrv.dev ? ':dev' : '');
    console.log(chalk_1["default"].green("\n[CRM] Starting ".concat(capitalize(agrv.service)).concat(agrv.dev ? ' targeting dev environment' : '', "\n")));
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
        .map(function (service) { return "\"cd ".concat(service, " && npm run dev\""); })
        .join(' '), " --names ").concat(servicesToRun.join(','));
    console.log(chalk_1["default"].green("\n[CRM] Starting ".concat(chalk_1["default"].bold(servicesToRun.map(function (s) { return capitalize(s); }).join(', '))).concat(agrv.skip.length
        ? ", skipping ".concat(chalk_1["default"].bold(agrv.skip.map(function (s) { return capitalize(s); }).join(', ')))
        : '', "\n")));
    run(command);
})
    .parse();
