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

        function TBPromise(callback) {
            this.$resolves = [];
            this.$rejects = [];
            this.$next = null;
            this.$status = 'pending';
            //pending 等待
            //fulfilled 肯定
            //rejected 否定
            //settled 结束

            if (toolkit.isFunction(callback)) {
                callback(this.resolve, this.reject);
            }

        }

        toolkit.extend(TBPromise.prototype, {
            then: function(resolve, reject) {
                var next = this.$next || (this.$next = new TBPromise());
                var currentStepValue;
                switch (this.$status) {
                    case 'pending':
                        toolkit.isFunction(resolve) && this.$resolves.push(resolve);
                        toolkit.isFunction(reject) && this.$rejects.push(reject);
                        return next;
                    case 'fulfilled':
                        if (!toolkit.isFunction(resolve)) {
                            next.resolve(resolve);
                        } else {
                            try {
                                next.resolve(resolve());
                            } catch (e) {
                                this.reject(e);
                            }
                        }
                        return next;
                    case 'rejected':
                        if (!toolkit.isFunction(reject)) {
                            next.reject(reject);
                        } else {
                            try {
                                next.reject(reject());
                            } catch (e) {
                                this.reject(e);
                            }
                        }
                        return next;
                }
            },
            resolve: function() {
                this.$status = 'fulfilled';
            },
            reject: function() {
                this.$status = 'rejected';
            }
        });

        module.exports = Promise;
    })
})
