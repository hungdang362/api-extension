function exportAll(module) {
    module = require(module);
    for (const name in module) {
        if (!exports.hasOwnProperty(name)) exports[name] = module[name];
    }
}

exportAll('./dist/controller/Actuator.js');
exportAll('./dist/network/MicroService.js');