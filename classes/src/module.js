var $ModuleProvider = function $ModuleProvider() {

    if (!(this instanceof $ModuleProvider)) return new $ModuleProvider();

    this.$get = function() {
        return Module;
    };

    function Module(moduleName, obj) {
		if (!(this instanceof Module)) return new Module(moduleName, obj);
        this.$moduleName = moduleName;
        obj = obj || {};
        if (isFunction(obj.model)) {
            obj.model.call(this);
            modules[moduleName] = this;
        } else if (isObject(obj.model)) {
            extend(this, obj.model);
            modules[moduleName] = this;
        } else {
            throw new Error('要初始化一个模块，model一定是一个构造函数或一个对象');
        }
    }
    extend(Module.prototype, {
        $new: function(moduleName, obj) {
            function a() {}
            a.prototype = this;
            var newModule = new a();
            this.$init.call(newModule, moduleName, obj);
            return newModule;
        },
        $apply: function() {

        }
    })
};
