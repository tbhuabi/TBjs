function App(appName, dependence) {
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
