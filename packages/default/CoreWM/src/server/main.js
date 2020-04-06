module.exports.api = {
    test: function (env, http, args) {
        return Promise.resolve('test');
    }
};
module.exports.register = function (env, metadata, servers) {
    return Promise.resolve(true);
};