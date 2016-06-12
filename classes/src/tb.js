var TBjs;

function init(global) {

    function ensure(obj, name, factory) {
        return obj[name] || (obj[name] = factory())
    }

    TBjs = ensure(global, 'TBjs', Object)
    ensure(TBjs, 'app', function() {
        var applications = {};
        return function(appName, requires) {

            return ensure(applications, appName, function() {
                var invokeQueue = [];
                var appInstance = {
                    requires: requires,
                    invokeQueue: invokeQueue,
                    provider: invokeLaterAndSetMethodSuffixName('Provider'),
                    module: invokeLaterAndSetMethodSuffixName('Module'),
                    filter: invokeLaterAndSetMethodSuffixName('Filter'),
                    directive: invokeLaterAndSetMethodSuffixName('Directive')
                };
                return appInstance;


                function invokeLaterAndSetMethodSuffixName(suffixName) {
                    return function(name, factoryFunction) {
                        invokeQueue.push([suffixName, name, factoryFunction])
                        return appInstance;
                    }
                }
            })
        }
    })
}
init(window);
