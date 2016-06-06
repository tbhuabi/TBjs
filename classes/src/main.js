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


var directivePriority = ['tbFor', 'tbIf', 'tbInit', 'tbModel'];
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
                var directive = injector(app.directive, obj.provider, undefined, key);
                if (isFunction(directive)) {
                    directive = {
                        controller: directive
                    }
                }
                if (!isObject(directive)) {
                    throw builderErr('directive', '指令必须返回一个函数或者对象');
                }
                directive.priority = directive.priority || '>';
                obj.directive[key] = directive;

            }
            for (key in obj.directive) {
                var directive = obj.directive[key];
                var priority = directive.priority = directive.priority || '>';
                if (!isString(priority)) {
                    throw builderErr('directive', '指令{0}的执行顺序必须为一个字符串声明\n如：\n`<`\n`>`\n`<directiveName`\n`directiveName>`', key);
                }
                if (priority === '<') {
                    directivePriority.unshift(deleteDirectiveSuffix(key));
                } else if (priority === '>') {
                    directivePriority.push(deleteDirectiveSuffix(key));
                } else if (priority.indexOf('<') === 0) {
                    var anchor = trim(priority.substring(1, priority.length));
                    anchor = deleteDirectiveSuffix(anchor);
                    var index = directivePriority.indexOf(anchor);
                    if (index === -1) {
                        directivePriority.unshift(anchor)
                    } else {
                        directivePriority.splice(index, 0, anchor);
                    }
                } else if (priority.indexOf('>') === priority.length - 1) {
                    var anchor = trim(priority.substring(0, priority.length - 1));
                    anchor = deleteDirectiveSuffix(anchor);
                    var index = directivePriority.indexOf(anchor)
                    if (index == -1) {
                        directivePriority.push(anchor);
                    } else {
                        directivePriority.splice(index, 0, anchor);
                    }
                }
            }
            for (key in app.module) {
                obj.module[key] = injector(app.module, obj.provider, undefined, key);
            }

            return obj;

            function deleteDirectiveSuffix(str) {
                return str.replace(/Directive$/, '')
            }

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
