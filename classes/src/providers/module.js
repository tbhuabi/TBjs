function $ModuleProvider() {
    var moduleMinErr = minErr('module');
    var moduleSuffix = 'Module';
    var moduleCache = {};
    this.$get = ['$injector', function($injector) {

        return {
            has: hasModule,
            get: getModule
        }

        function hasModule(name) {
            return moduleCache.hasOwnProperty(name) || $injector.has(name + moduleSuffix);
        }

        function getModule(name) {
            if (moduleCache.hasOwnProperty(name)) {
                return moduleCache[name];
            }
            return moduleCache[name] = moduleNormalize($injector.get(name + moduleSuffix));
        }
    }];

    function moduleNormalize(module) {
        if (isFunction(module)) {
            module = {
                model: module
            }
        }
        if (!isObject(module)) {
            throw compileMinErr('normalize', 'module必须返回一个控制函数或一个包含model方法的对象!');
        }
        var defaultProperty = {
            restrict: 'EAM',
            priority: '>',
            compile: noop,
            replace: false,
            terminal: false,
            require: '',
            transclude: false,
            controller: noop
        };
        return module;
    }
}
