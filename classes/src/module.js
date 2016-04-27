var $ModuleProvider = function $ModuleProvider() {

    if (!(this instanceof $ModuleProvider)) return new $ModuleProvider();

    var injector = function(module, factoryFunction) {
        if (isFunction(factoryFunction)) {
            return factoryFunction;
        }
        if (isArray(factoryFunction)) {
            var fn = factoryFunction.pop();
            var args = [];
            forEach(factoryFunction, function(item) {
                item = trim(item);
                args.push(module.$services[item]);
            })
            return function factory() {
                fn.apply(this, args);
            }
        }
    };
    this.$get = function() {
        return Module;
    };

    function Module(moduleName, dependence) {
        var instanceModule = new Module.prototype.$init(moduleName, dependence);
        return instanceModule;

    }
    Module.prototype.$init = function(moduleName, dependence) {
        this.$moduleName = moduleName;
        this.$directives = {};
        this.$services = {};
        this.$controllers = {};
    };
    Module.prototype.$init.prototype = Module.prototype;
    extend(Module.prototype, {
        controller: function(controllerName, factoryFunction) {
            this.$controllers[controllerName] = injector(this, factoryFunction);
            return this;
        },
        directive: function(directiveName, factoryFunction) {
            this.$directives[directiveName] = injector(this, factoryFunction);
            return this;
        },
        factory: function(serviceName, factoryFunction) {
            return this.provider(serviceName, function() {
                this.$get = factoryFunction;
            })
        },
        service: function(serviceName, factoryFunction) {
            return this.provider(serviceName, function() {
                this.$get = factoryFunction;
            })
        },
        provider: function(serviceName, factoryFunction) {
            var service = new factoryFunction();
            var Factory = injector(this, service.$get);
            this.$services[serviceName] = new Factory();
            return this;
        }
    })
};
