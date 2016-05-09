var $AppProvider = function $AppProvider() {

    if (!(this instanceof $AppProvider)) return new $AppProvider();

    this.$get = function() {
        return App;
    };

    function App(appName, dependence) {
        if (!(this instanceof App)) return new App(appName, dependence);
        applications[appName] = this;

        this.$appName = appName;
        this.$modules = {};
        this.$directives = {};
        this.$services = {};
    }
    extend(App.prototype, {
        module: function(moduleName, factoryFunction) {
            this.$modules[moduleName] = factoryFunction;
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
