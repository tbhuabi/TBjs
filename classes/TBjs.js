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
        var toolkit = require('./src/toolkit');
        var XMLEngine = require('./src/xmlEngine');
        var Query = require('./src/query');
        var TBModule = require('./src/module');
        var $http = require('./src/http');


        var TB = {
            version: '1.0.0',
            module: TBModule,
            $http: $http,
            $: Query,
            directive: function(directiveName, fnController) {
                directiveName = directiveName.replace(/-(\w)/g, function(str, $1) {
                    return $1.toUpperCase();
                })
                this.$directives[directiveName] = fnController;
                return this;
            }
        };
        module.exports = TB;
    })
})
