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
        this.$provider = {};
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
        provider: function(providerName, factoryFunction) {
            this.$services[providerName] = factoryFunction;
            return this;
        }
    })
};
