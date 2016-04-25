var $ModuleProvider = function $ModuleProvider() {

    if (!(this instanceof $ModuleProvider)) return new $ModuleProvider();

    this.$get = function() {
        return Module;
    };

    function Module(moduleName, callback) {
        return new Module.prototype.$init(moduleName, callback)
    }
    Module.prototype.$init = function(moduleName, callback) {
        this.$moduleName = moduleName;
        this.$directives = {};
        this.$service = {};
        this.$controllers = {};
    };
    Module.prototype.$init.prototype = Module.prototype;
    extend(Module.prototype, {
        controller: function(controllerName, callback) {
            this.$controllers[controllerName] = callback;
        },
        directive: function(directiveName, callback) {
            this.$directives[directiveName] = callback;
        },
        service: function(serviceName, callback) {
            this.$service[serviceName] = callback;
        },
		factory: function(serviceName,callback){

		},
		provider: function(serviceName,callback){

		}
    })
};
