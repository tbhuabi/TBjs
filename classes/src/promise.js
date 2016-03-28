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
        var isThenable = function(obj) {
            return obj && typeof obj['then'] == 'function';
        };

        function Promise(callback) {
            //pending 等待
            //fulfilled 肯定
            //rejected 否定
            //settled 结束

            if (!(this instanceof Promise)) return new Promise(callback);
            var status = 'pending';
            var resolves = [];
            var rejects = [];
            var value, reason;


            function resolve(data) {
                status = 'fulfilled';
                value = data;
                setTimeout(function() {
                    while (resolves.length) {
                        var firstFn = resolves.shift();
                        if (toolkit.isFunction(firstFn)) {
                            firstFn(data);
                        }
                    }
                })
            }


            function reject(errorMsg) {
                status = 'rejected';
                reason = errorMsg;
                setTimeout(function() {
                    while (rejects.length) {
                        var firstFn = rejects.shift();
                        if (toolkit.isFunction(firstFn)) {
                            firstFn(errorMsg);
                        }
                    }
                })
            }


            toolkit.isFunction(callback) && callback(resolve, reject);

            this.then = function(onFulfilled, onRejected) {
                //then方法必须返回一个promise

                //onFulfilled 当得到一个肯定的结果
                //onRejected 当得到一个否定的结果
                return new Promise(function(resolve, reject) {
                    //这个函数会被立即执行

                    //resolve 通知当前promise得到了一个肯定的结果
                    //reject 通知当前promise得到了一个否定的结果
                    function resolveCallback(value) {
                        var thenable = toolkit.isFunction(onFulfilled) && onFulfilled(value) || value;
                        if (isThenable(thenable)) {
                            thenable.then(function(vlaue) {
                                resolve(value);
                            }, function(reason) {
                                reject(reason);
                            })
                        } else {
                            resolve(thenable);
                        }
                    }

                    function rejectCallback(reason) {
                        reason = toolkit.isFunction(onRejected) && onRejected(reason) || reason;
                        reject(reason);
                    }


                    switch (status) {
                        case 'pending':
                            //如果上一个promise还处于挂起状态
                            resolves.push(resolveCallback);
                            rejects.push(rejectCallback);
                            break;
                        case 'fulfilled':
                            //如果上一个promise得到一个肯定的结果
                            //resolveCallback(resolve);
                            resolveCallback(value);
                            break;
                        case 'rejected':
                            rejectCallback(reason);
                            break;
                    }
                })
            }
        }
        module.exports = Promise;
    })
})
