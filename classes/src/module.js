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
        this.$invokeQueue = [];
    };

    Module.prototype.$init.prototype = Module.prototype;
    extend(Module.prototype, {
        controller: function(controllerName, factoryFunction) {
            this.$invokeQueue.push(['$controllerProvider', 'register', arguments]);
            return this;
        },
        directive: function(directiveName, factoryFunction) {
            this.$invokeQueue.push(['$directiveProvider', 'register', arguments]);
            return this;
        },
        factory: function(serviceName, factoryFunction) {
            this.$invokeQueue.push(['$providerProvider', 'factory', arguments]);
            return this;
        },
        service: function(serviceName, factoryFunction) {
            this.$invokeQueue.push(['$providerProvider', 'service', arguments]);
            return this;
        },
        provider: function(serviceName, factoryFunction) {
            this.$invokeQueue.push(['$providerProvider', 'provider', arguments]);
            return this;
        }
    })
};
