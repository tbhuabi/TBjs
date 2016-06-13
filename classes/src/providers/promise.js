function $PromiseProvider() {

    this.$get = function() {
        return Promise;
    };

    function PromiseHandler(onFulfilled, onRejected, resolve, reject) {
        this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
        this.onRejected = typeof onRejected === 'function' ? onRejected : null;
        this.resolve = resolve;
        this.reject = reject;
    }

    function Promise(fn) {

        // 如果不是一个Promise对象，那么调用构造函数包装下
        if (!(this instanceof Promise)) return new Promise(fn);

        // 参数必须是一个函数
        if (typeof fn !== 'function') throw new TypeError('not a function');

        var state = null;
        var delegating = false;
        var value = null;
        var deferreds = [];
        var self = this;

        // 处理defer，fulfill, reject等问题
        //
        function handle(deferred) {
            // 还在pending？那么走人
            if (state === null) {
                deferreds.push(deferred);
                return;
            }
            // 状态已变：
            setTimeout(function() {
                // 根据state来决定是调用fulfill还是reject
                var cb = state ? deferred.onFulfilled : deferred.onRejected;
                if (cb === null) {
                    // 假如没有提供对应的callback，那么调用“默认”的回调
                    (state ? deferred.resolve : deferred.reject)(value);
                    return;
                }

                // 调用对应的回调
                var ret;
                try {
                    ret = cb(value);
                } catch (e) {
                    // 出现异常了，那么把状态改成reject
                    deferred.reject(e);
                    return;
                }

                // 回调运行没问题，那么就把回调的返回值作为自己的值，状态变成fulfilled
                deferred.resolve(ret);
            })
        }
        // 成员函数：then。返回Promise2
        this.then = function(onFulfilled, onRejected) {
            // 返回一个新的Promise，Promise2。
            return new Promise(function(resolve, reject) {
                // PromiseHandler没特别的，就是为了保存4个参数
                var deferred = new PromiseHandler(onFulfilled, onRejected, resolve, reject)
                handle(deferred);
            })
        };


        // 作为第一个参数传给你写的那个函数
        //
        function resolve(newValue) {
            // 这里有点没搞懂，为啥要针对delegating flag来return，
            // 其实假如delegating标记已设置，这个函数就再也进不来了呀。
            // 难道仅仅为了防止出错？
            if (delegating) return;
            resolve_(newValue);
        }

        function resolve_(newValue) {
            // 说明已经被处理过了！不用再处理了，其实如果会被调用两次，应该是出错了!
            if (state !== null) return;
            try { //Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
                if (newValue === self) {
                    throw new TypeError('A promise cannot be resolved with itself.');
                }

                // resolve的返回值可以是普通值，也可以是一个promise，针对promise要特殊处理下
                if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {

                    // 判别他是不是一个promise
                    var then = newValue.then;
                    if (typeof then === 'function') {

                        // 是的。。那就有点麻烦，设个标记先
                        delegating = true;
                        // 根据 Promise/A+，当前promise的状态保持pending，且依赖于返回的promise的状态，即newValue
                        // 所以调用 newValue.then。
                        then.call(newValue, resolve_, reject_);
                        return;
                    }
                }

                // 普通值，简单了
                state = true;
                value = newValue;
                // 触发依赖于这个promise的所有回调（通过then设置上去的）
                invoke();
            } catch (e) {
                reject_(e);
            }
        }

        // 作为第二个参数传给你写的那个函数
        //
        function reject(newValue) {
            if (delegating) return;
            reject_(newValue);
        }

        function reject_(newValue) {
            if (state !== null) return;
            state = false;
            value = newValue;
            invoke();
        }

        // 触发依赖于这个promise的所有回调（通过then设置上去的）
        function invoke() {
            for (var i = 0, len = deferreds.length; i < len; i++) {
                handle(deferreds[i]);
            }
            deferreds = null;
        }

        // 创建完，马上就调用，真直接
        //
        try {
            fn(resolve, reject);
        } catch (e) {
            reject(e);
        }
    }

};
