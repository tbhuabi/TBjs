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
                    appName: appName,
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
                requires.forEach(function(requireAppName) {
                    injectorApp(appName, requireAppName);
                })
                console.log(app)
            })
        }

        function injectorApp(appName, requireAppName) {
            var dependApp = appCache[requireAppName];
            if (!dependApp) {
                throw injectorErr('instance', '应用{0}注入依赖{1}失败，{1}未注册！', appName, requireAppName);
            }
            var requires = dependApp.requires || [];
            requires.forEach(function(key) {
                injectorApp(requireAppName, key);
            })
            appCache[appName].provider = extend({}, dependApp.provider);
            appCache[appName].directive = extend({}, dependApp.directive);
            appCache[appName].module = extend({}, dependApp.module);
        }
    })
}
init(window);
