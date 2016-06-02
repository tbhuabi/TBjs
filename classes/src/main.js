/**
 * 向全局抛出TBjs
 * @param   {window|global} global 全局对象
 * @returns {function} app方法
 */
function init(global) {

    function ensure(obj, name, factory) {
        return obj[name] || (obj[name] = factory())
    }

    var TBjs = ensure(global, 'TBjs', Object);
    var appCache = {
        TB: {
            requires: [],
            provider: {
                $astProvider: $AstProvider,
                $compileProvider: $CompilerProvider,
                $httpProvider: $HttpProvider,
                $lexerProvider: $LexerProvider,
                $modelProvider: $ModelProvider,
                $parseProvider: $ParseProvider,
                $promiseProvider: $PromiseProvider,
                $queryProvider: $QueryProvider,
                $valueProvider: $ValueProvider,
                $xmlEngineProvider: $XmlEngineProvider,
            },
            directive: {},
            module: {}
        }
    };
    var appFactory = ensure(TBjs, 'app', function() {
        return function app(appName, requires) {
            requires = requires || [];
            return ensure(appCache, appName, function() {
                appCache[appName] = appCache[appName] || {};
                var methods = appCache[appName];
                var appInstance = {
                    requires: requires,
                    directive: addMethodSuffix('Directive'),
                    provider: addMethodSuffix('Provider'),
                    module: addMethodSuffix('Module')
                };
                return appInstance;

                function addMethodSuffix(suffix) {
                    return function(key, fn) {
                        methods[suffix.toLowerCase()] = methods[suffix] || {};
                        methods[suffix.toLowerCase()][key + suffix] = fn;
                    }
                }
            })
        }
    });
    ensure(TBjs, 'bootstrap', function() {
        var applicationsInstance = {};
        var injectorErr = minErr('injector');

        return function(element, keys) {
            keys.forEach(function(appName) {
                var app = appCache[appName];
                var requires = app.requires;
                requires.forEach(function(key) {
                    instanceApp(key, appName);
                })
            })
        }

        function instanceApp(key, appName) {
            if (!appCache[key]) {
                throw injectorErr('instance', '应用{0}注入依赖{1}失败，{1}未注册！', appName, key);
            }
            var dependApp = applicationsInstance[key];
            if (dependApp) {
                applicationsInstance[appName] = {
                    provider: extend({}, dependApp.provider),
                    directive: extend({}, dependApp.directive),
                    module: extend({}, dependApp.module)
                };
            } else {
                var requires = appCache[key].requires;
                requires.forEach(function(dependKey) {
                    instanceApp(dependKey, key);
                })

            }
        }
    })
}
init(window);
