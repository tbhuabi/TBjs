var $AppProvider = function $AppProvider() {

    if (!(this instanceof $AppProvider)) return new $AppProvider();

    this.$get = function() {
        return App;
    };

    function App(appName, dependence) {
        var instanceApp = new App.prototype.$init(appName, dependence);
        applications[appName] = instanceApp;
        return instanceApp;

    }
    App.prototype.$init = function(appName, dependence) {
        this.$appName = appName;
        this.$modules = {};
        this.$directives = {};
        this.$services = {};
    };

    App.prototype.$init.prototype = App.prototype;
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
