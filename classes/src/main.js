function noop() {}

function transferName(str) {
    return function(key) {
        return key.replace(/-\w/g, function(str) {
            return str.charAt(1).toUpperCase();
        }) + str;
    }
}
var transferDirectiveName = transferName('Directive');
var transferProviderName = transferName('Provider');
var transferModuleName = transferName('Module');
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
                app.requires.forEach(function(requireAppName) {
                    publishApi(appName, requireAppName);
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

            var key;
            for (key in app.provider) {
                obj.provider[key] = injector(app.provider, obj.provider, {}, key);
            }
            for (key in app.directive) {
                obj.directive[key] = injector(app.directive, obj.provider, undefined, key);
            }
            for (key in app.module) {
                obj.module[key] = injector(app.module, obj.provider, undefined, key);
            }

            return obj;

        }

        function injector(source, target, result, serviceName) {
            var factoryFunction = source[serviceName];
            factoryFunction = isFunction(factoryFunction) ? [factoryFunction] : factoryFunction;
            var params = factoryFunction.slice(0, factoryFunction.length - 1);
            factoryFunction = factoryFunction[factoryFunction.length - 1];
            var args = [];

            forEach(params, function(param) {
                param = transferProviderName(param);
                var instance = null;
                if (target[param]) {
                    instance = target[param];
                } else {
                    instance = injector(source, target, result, param);
                    source[param] = instance;
                }
                args.push(result ? instance : instance.$get());
            })
            if (result) {
                factoryFunction.apply(result, args)
                return result;
            }
            return factoryFunction.apply(result, args);
        }


        function publishApi(appName, requireAppName) {
            var dependApp = appCache[requireAppName];
            if (!dependApp) {
                throw builderErr('injector', '应用{0}注入依赖{1}失败，{1}未注册！', appName, requireAppName);
            }
            dependApp.requires.forEach(function(key) {
                appBuilder(requireAppName, key);
            })
            extend(appCache[appName].provider, dependApp.provider);
            extend(appCache[appName].directive, dependApp.directive);
            extend(appCache[appName].module, dependApp.module);
        }
    })
}
init(window);
