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

        function Promise(callback) {
            //pending 等待
            //fulfilled 肯定
            //rejected 否定
            //settled 结束
            var status = 'pending';
            this.next = null;
            var resolves = [];
            var rejects = [];
            var _this = this;
            this.resolve = function(resolve) {
                status = 'fulfilled';
                var firstFn;
                while (firstFn = resolves.shift()) {
                    var result = firstFn(resolve);
                    if (_this.next) {
                        _this.next.resolve(result);

                    }
                }
            };
            this.reject = function(e) {
                status = 'rejected';
                var firstFn;
                while (firstFn = resolves.shift()) {
                    var result = firstFn(e);
                    if (_this.next) {
                        _this.next.reject(result);
                    }
                }
            };

            this.then = function(resolve, reject) {
                var next = this.next || (this.next = new Promise());
                switch (status) {
                    case 'pending':
                        toolkit.isFunction(resolve) && resolves.push(resolve);
                        toolkit.isFunction(reject) && rejects.push(reject);
                        return next;
                    case 'fulfilled':
                        if (toolkit.isFunction(resolve)) {
                            try {
                                next.resolve(resolve());
                            } catch (e) {
                                this.reject(e);
                            }
                        } else {
                            next.resolve(resolve);
                        }
                        return next;
                    case 'rejected':
                        if (toolkit.isFunction(reject)) {
                            try {
                                next.reject(reject());
                            } catch (e) {
                                this.reject(e);
                            }
                        } else {
                            next.reject(resolve);
                        }
                        return next;
                }
            }

            toolkit.isFunction(callback) && callback(this.resolve, this.reject);
        }

        module.exports = Promise;
    })
})
