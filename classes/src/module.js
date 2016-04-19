(function(factory) {
    if (typeof exports === 'undefined') {
        factory(define)
    } else {
        factory(function(self) {
            self(require, exports, module);
        });
    }
})(function(define) {
    define(function(require, exports, module) {
        var toolkit = require('./toolkit');

        function Module(moduleName, obj) {
            return new Module.prototype.$init(moduleName, obj);
        }
        Module.prototype.$init = function(moduleName, obj) {
            this.$moduleName = moduleName;
            obj = obj || {};
            if (toolkit.isFunction(obj.model)) {
                obj.model.call(this);
            } else if (toolkit.isObject(obj.model)) {
                toolkit.extend(this, obj.model);
            } else {
                throw new Error('要初始化一个模块，model一定是一个构造函数或一个对象');
            }
        };
        Module.prototype.$init.prototype = Module.prototype;
        toolkit.extend(Module.prototype, {
            $new: function(moduleName, obj) {
                function a() {}
                a.prototype = this;
                var newModule = new a();
                this.$init.call(newModule, moduleName, obj);
                return newModule;
            },
            $http: function() {

				return this;
            },
            $directive: function(directiveName, fnController) {
                directiveName = directiveName.replace(/-(\w)/g, function(str, $1) {
                    return $1.toUpperCase();
                })
                this.directives[directiveName] = fnController;
                return this;
            }
        })


        module.exports = Module
    })
})
