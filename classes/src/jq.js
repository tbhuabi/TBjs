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
        var PENDING = undefined,
            FULFILLED = 1,
            REJECTED = 2;

        var isFunction = function(obj) {
            return 'function' === typeof obj;
        }
        var isArray = function(obj) {
            return Object.prototype.toString.call(obj) === "[object Array]";
        }
        var isThenable = function(obj) {
            return obj && typeof obj['then'] == 'function';
        }


        var Promise = function(resolver) {

            var transition = function(status2, value) {
                if (status2 === PENDING) return;
                // 所以的执行都是异步调用，保证then是先执行的
                setTimeout(function() {
                    status = status2;
                    publish(value);
                });
            }
            var publish = function(val) {
                var fn,
                    st = status === FULFILLED;
                queue = st ? resolves : rejects;

                while (fn = queue.shift()) {
                    val = fn(val) || val;
                }
                st ? value = val : reason = val;
                resolves = rejects = null;
            }

            var promise = this;
            var value;
            var reason;
            var status = PENDING;
            var resolves = [];
            var rejects = [];

            var resolve = function(value) {
                transition(FULFILLED, value);
            }
            var reject = function(reason) {
                transition(REJECTED, reason);
            }

            this.then = function(onFulfilled, onRejected) {
                // 每次返回一个promise，保证是可thenable的
                return new Promise(function(resolve, reject) {
                    function callback(value) {
                        var ret = isFunction(onFulfilled) && onFulfilled(value) || value;
                        if (isThenable(ret)) {
                            ret.then(function(value) {
                                resolve(value);
                            }, function(reason) {
                                reject(reason);
                            });
                        } else {
                            resolve(ret);
                        }
                    }

                    function errback(reason) {
                        reason = isFunction(onRejected) && onRejected(reason) || reason;
                        reject(reason);
                    }
                    if (status === PENDING) {
                        resolves.push(callback);
                        rejects.push(errback);
                    } else if (status === FULFILLED) { // 状态改变后的then操作，立刻执行
                        callback(value);
                    } else if (status === REJECTED) {
                        errback(reason);
                    }
                });
            }
            resolver(resolve, reject);
        }





        module.exports = Promise;
    })
})

