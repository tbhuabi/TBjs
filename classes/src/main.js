function noop() {}
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
            provider: {},
            directive: {},
            module: {}
        }
    };
    var appFactory = ensure(TBjs, 'app', function() {
        return function app(appName, requires) {
            requires = requires || [];
            requires.unshift('TB');
            appCache[appName] = appCache[appName] || {
                requires: requires,
                directive: {},
                module: {},
                provider: {}
            };
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
                var name = suffix.toLowerCase();
                return function(key, fn) {
                    methods[name][key + suffix] = fn;
                    return appInstance;
                }
            }
        }
    });
    ensure(TBjs, 'bootstrap', function() {
        var builderErr = minErr('builder');

        return function(element, keys) {
            var rootModel = new Model();
            keys.forEach(function(appName) {
                var app = appCache[appName];
                var requires = app.requires;
                requires.forEach(function(requireAppName) {
                    appBuilder(appName, requireAppName);
                })
                new Module(appInstantiate(app, appName), {
                    template: element
                }, rootModel)
            })
        }


        function appInstantiate(app, appName) {
            var obj = {
                directive: {},
                module: {},
                provider: {}
            };

            initProvider(app.provider, obj.provider);
            initDirective(app.directive, obj.directive, app.provider);
            initModule(app.module, obj.module);
            return obj;

            function initProvider(source, target) {
                for (var key in source) {
                    if (target[key]) continue;
                    target[key] = createInjector(source, target, source[key]);
                }
            }

            function initDirective(source, target, provider) {
                for (var key in source) {
                    var params = source[key];
                    if (isFunction(params)) {
                        target[key] = params();
                    } else {
                        fn = params.pop();
                        var args = [];
                        params.forEach(function(name) {
                            if (!provider[name]) {
                                throw builderErr('injector', '应用：{0}中，指令{1}依赖的服务{2}未注册！', appName, key, name);
                            }
                            if (!isFunction(provider[name].$get)) {
                                throw builderErr('injector', '应用：{0}中，provider：{1}未实现$get方法！', appName, name);
                            }
                            args.push(provider[name].$get())
                        })
                        target[key] = fn.apply(undefined, args);
                    }
                }
            }

            function initModule(source, target) {
                for (var key in source) {
                    target[key] = source[key]();
                }
            }
        }

        function createInjector(source, target, factoryFunction) {
            factoryFunction = isFunction(factoryFunction) ? [factoryFunction] : factoryFunction;

            var params = factoryFunction.slice(0, factoryFunction.length - 1);
            factoryFunction = factoryFunction[factoryFunction.length - 1];
            var args = [];

            forEach(params, function(param) {
                if (target[param]) {
                    args.push(target[param]);
                    return;
                }
                var provider = source[param];
                instance = createInjector(source, target, provider);
                source[param] = instance;
                args.push(instance);
            })
            var newProvider = {};
            factoryFunction.apply(newProvider, args);
            return newProvider;
        }

        function appBuilder(appName, requireAppName) {
            var dependApp = appCache[requireAppName];
            if (!dependApp) {
                throw builderErr('injector', '应用{0}注入依赖{1}失败，{1}未注册！', appName, requireAppName);
            }
            dependApp.requires.forEach(function(key) {
                appBuilder(requireAppName, key);
            })
            extend(appCache[appName].provider, dependApp.provider);
            extend(appCache[appName].provider, dependApp.directive);
            extend(appCache[appName].provider, dependApp.module);
        }
    })
}
init(window);
