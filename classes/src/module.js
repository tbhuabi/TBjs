var $ModuleProvider = function $ModuleProvider() {

    if (!(this instanceof $ModuleProvider)) return new $ModuleProvider();
    var $injector = function(services, factoryFn) {
        if (isFunction(factoryFn)) {
            return {
                args: [],
                factory: factoryFn
            }
        } else if (isArray(factoryFn)) {
            var fn = factoryFn.pop();
            var args = [];
            factoryFn.forEach(function(item) {
                var service = services[item];
                if (!item) {
                    throw new Error('当前服务：' + item + '，没有注册');
                }
                if (!isFunction(item.$get)) {
                    throw new Error('provider：' + item + '必须实现$get方法');
                }
                args.push(service.$get());
            })
            return {
                args: args,
                factory: fn
            }
        }
    };
    this.$get = function() {
        return Module;
    };

    function Module(moduleName, dependence) {
        return new Module.prototype.$init(moduleName, dependence)
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
            var injectorObj = $injector(this.$services, factoryFunction);
            this.$controllers[controllerName] = function() {
                this.$get = function() {
                    var scope = new Scope();
                    return injectorObj.factory.apply(scope, injectorObj.args);
                }
            };
            return this;
        },
        directive: function(directiveName, factoryFunction) {
            var injectorObj = $injector(this.$services, factoryFunction);
            this.$directives[directiveName] = function() {
                this.$get = function() {

                };
            };
            return this;
        },
        factory: function(serviceName, factoryFunction) {
            var injectorObj = $injector(this.$services, factoryFunction);
            this.provider(serviceName, function() {
                this.$get = function() {
                    return injectorObj.factory.apply(undefined, injectorObj.args);
                }
            })
            return this;
        },
        service: function(serviceName, factoryFunction) {
            var injectorObj = $injector(this.$services, factoryFunction);
            this.provider(serviceName, function() {
                this.$get = function() {
                    var Factory = function() {};
                    var obj = new Factory();
                    return injectorObj.factory.apply(obj, injectorObj.args);
                }
            })
            return this;
        },
        provider: function(serviceName, factoryFunction) {
            this.$services[serviceName] = factoryFunction;
            return this;
        }
    })
};
