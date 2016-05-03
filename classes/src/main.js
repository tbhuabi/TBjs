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
        this.$controllers = {};
        this.$directives = {};
        this.$services = {};
    };

    App.prototype.$init.prototype = App.prototype;
    extend(App.prototype, {
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
