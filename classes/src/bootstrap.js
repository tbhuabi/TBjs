var bootstrap = function(element, modules) {

    var bootstrapMinErr = minErr('bootstrap');

    var applicationsInstance = {};
    var XmlEngine = (new $XmlEngineProvider()).$get();

    var vDom = new XmlEngine('');
    vDom.$targetElement = element;
    var createDomMap = function(element, context, vDom) {
        var attributes = element.attributes;
        var currentVDom;
        if (element.nodeType === ELEMENT_NODE_TYPE) {
            var obj = {};
            forEach(attributes, function(attr) {
                obj[attr.name] = attr.value;
            })
            currentVDom = vDom.createElement(element.nodeName);
            currentVDom.setAttribute(obj);
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
    createDomMap(element, vDom, vDom);

    modules.forEach(function(appName) {
        var app = applications[appName]
        if (!app) {
            throw bootstrapMinErr('initiation', '模块{0}未注册', appName);
        }
        initModule(app, appName);
    })

    function initModule(app, appName) {

        var servicesCache = {};
        var modulesCache = {};
        var directivesCache = {};

        applicationsInstance[appName] = {
            services: servicesCache,
            modules: modulesCache,
            directives: directivesCache,
            virtualDom: vDom
        };

        var $services = app.$services;
        var $modules = app.$modules;
        var $directives = app.$directives;

        var createInjector = function(factoryFunction) {
            factoryFunction = isFunction(factoryFunction) ? [factoryFunction] : factoryFunction;
            var len = factoryFunction.length - 1;
            var fn = factoryFunction[len];
            var args = [];
            for (var i = 0; i < len; i++) {
                var key = factoryFunction[i];
                var serviceInstance = servicesCache[i];
                if (serviceInstance) {
                    args.push(serviceInstance.$get());
                } else {
                    if (!$services[key]) {
                        throw bootstrapMinErr('injector','应用：{0}中，service：{1}未注册！',appName,key);
                    }
                    var serviceProvider = createInjector($services[key]);
                    servicesCache[key] = serviceProvider;
                    args.push(serviceProvider.$get());
                }
            }
            return new $ServiceProvider(appName, function factory() {
                var result = fn.apply(this, args);
                var instance;
                if (isFunction(result)) {
                    result = new result();
                }
                if (isObject(result) && isFunction(result.$get)) {
                    return result.$get();
                }
                return result;
            })
        };
        for (var key in $services) {
            if (servicesCache.hasOwnProperty(key)) continue;
            var serviceItem = $services[key];
            var factory = createInjector(serviceItem);
            servicesCache[key] = factory;
        }
        for (var key in $directives) {
            directivesCache[key] = new $DirectiveProvider(appName, $directives[key]);
        }
        for (var key in $modules) {
            modulesCache[key] = new $ModuleProvider(appName, $directives[key]);
        }
    };
};
