const { addApiServer, addIndexer } = require("./definitions/ecosystem_settings");

module.exports = {
    apps: [
        addIndexer('leopays'),
        addApiServer('leopays', 1)
    ]
};
