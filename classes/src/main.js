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
                $compileProvider: $CompilerProvider,
                $httpProvider: $HttpProvider,
                $modelProvider: $ModelProvider,
                $parseProvider: $ParseProvider,
                $promiseProvider: $PromiseProvider,
                $queryProvider: $QueryProvider,
                $valueProvider: $ValueProvider,
                $virtualDomProvider: $VirtualDomProvider,
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
        var builderErr = minErr('builder');

        return function(element, keys) {
            keys.forEach(function(appName) {
                var app = appCache[appName];
                var requires = app.requires;
                requires.forEach(function(requireAppName) {
                    appBuilder(appName, requireAppName);
                })
				var vDom = new VirtualDom('');
				vDom.$targetElement = element;
				createDomMap(element, vDom, vDom);
            })
        }

        function createDomMap(element, context, vDom) {
            var attributes = element.attributes;
            var currentVDom;
            if (element.nodeType === ELEMENT_NODE_TYPE) {
                currentVDom = vDom.createElement(element.nodeName);
                forEach(attributes, function(attr) {
					currentVDom.setAttribute(attr.name,attr.value);
                })
                context.appendChild(currentVDom);
                forEach(element.childNodes, function(child) {
                    createDomMap(child, currentVDom, vDom);
                })
            } else if (element.nodeType === TEXT_NODE_TYPE) {
                currentVDom = vDom.createTextNode(element.textContent);
                context.appendChild(currentVDom);
            } else if (element.nodeType === COMMENT_NODE_TYPE) {
                currentVDom = vDom.createComment(element.textContent);
                context.appendChild(currentVDom);
            }
            currentVDom.$targetElement = element;
        };

        function appBuilder(appName, requireAppName) {
            var dependApp = appCache[requireAppName];
            if (!dependApp) {
                throw builderErr('injector', '应用{0}注入依赖{1}失败，{1}未注册！', appName, requireAppName);
            }
            dependApp.requires.forEach(function(key) {
                appBuilder(requireAppName, key);
            })
            appCache[appName].provider = extend({}, dependApp.provider);
            appCache[appName].directive = extend({}, dependApp.directive);
            appCache[appName].module = extend({}, dependApp.module);
        }
    })
}
init(window);
