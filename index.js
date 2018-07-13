function exportAll(module) {
    module = require(module);
    for (const name in module) {
        if (!exports.hasOwnProperty(name)) exports[name] = module[name];
    }
}

exportAll('./dist/network/MicroService.js');

exports['Swagger'] = require('./dist/plugins/swagger');
exports['Actuator'] = require('./dist/plugins/actuator');