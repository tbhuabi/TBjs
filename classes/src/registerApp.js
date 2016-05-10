function $AppCacheProvider() {
    var applications = {};
    this.$get = function() {
        return {
            get: function(key) {
                return applications[key];
            },
            set: function(key, app) {
                applications[key] = app;
            }
        }
    };
}

function $AppProvider() {

    if (!(this instanceof $AppProvider)) return new $AppProvider();

    this.$get = ['$appCache',
        function($appCache) {
            return function(appName, dependence) {
                var app = new App(appName, dependence);
                $appCache.set(appName, app);
                return app;
            }

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
        }
    ];

};
