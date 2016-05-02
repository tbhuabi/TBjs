var $ModuleProvider = function $ModuleProvider() {

    if (!(this instanceof $ModuleProvider)) return new $ModuleProvider();

    this.$get = function() {
        return Module;
    };

    function Module(moduleName, dependence) {
        var instanceModule = new Module.prototype.$init(moduleName, dependence);
        modules[moduleName] = instanceModule;
        return instanceModule;

    }
    Module.prototype.$init = function(moduleName, dependence) {
        this.$moduleName = moduleName;
        this.$controllers = {};
        this.$directives = {};
        this.$services = {};
    };

    Module.prototype.$init.prototype = Module.prototype;
    extend(Module.prototype, {
        controller: function(controllerName, factoryFunction) {
            this.$controllers[controllerName] = factoryFunction;
            return this;
        },
        directive: function(directiveName, factoryFunction) {
            this.$directives[directiveName] = factoryFunction;
            return this;
        },
        service: function(serviceName, factoryFunction) {
            this.$services[serviceName] = factoryFunction;
            return this;
        }
    })
};
