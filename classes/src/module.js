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

        function TBModule(moduleName, obj) {

        }
        toolkit(TBModule.prototype, {
            $new: function() {

            }
        })


        module.exports = TBModule
    })
})
