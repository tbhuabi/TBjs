function $DirectiveProvider() {
    var directiveSuffix = 'Directive';
    var directiveCache = {};

    this.$get = ['$injector', function($injector) {
        return {
            has: hasDirecrtive,
            get: getDirective
        }

        function hasDirecrtive(name) {
            return directiveCache.hasOwnProperty(name) || $injector.has(name + directiveSuffix);
        }

        function getDirective(name) {
            if (directiveCache.hasOwnProperty(name)) {
                return directiveCache[name];
            }
            return directiveCache[name] = directiveNormalize($injector.get(name + directiveSuffix));
        }
    }];


    function directiveNormalize(directive) {
        if (isFunction(directive)) {
            directive = {
                controller: directive
            }
        }
        if (!isObject(directive)) {
            throw compileMinErr('directive', 'directive必须返回一个控制函数或一个对象!');
        }
        var directiveTemplate = {
            restrict: 'AM',
            priority: 1000,
            compile: noop,
            replace: false,
            terminal: false,
            require: '',
            transclude: false,
            controller: noop
        };
        for (var key in directiveTemplate) {
            if (directive.hasOwnProperty(key)) {
                directiveTemplate[key] = directive[key];
            }
        }
        return directiveTemplate;
    }
}
