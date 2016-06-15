function $AsyncProvider() {
    var _this = this;

    function transferParams(obj) {
        obj = obj || {};
        var arr = [];
        for (var i in obj) {
            arr.push(i + '=' + obj[i]);
        }
        return arr.join('&');
    }
    this.$get = ['$promise', function($promise) {

        return function http(data) {
            data = data || {};

            data.method = data.method || 'get';
            var xhr = new XMLHttpRequest();

            return new $promise(function(succ, fail) {
                var method = _this.config[data.method.toLowerCase()];
                for (var key in method.requestHeaders) {
                    xhr.setRequestHeader(key, method.requestHeaders[key]);
                }
                var paramsString = transferParams(data.params);
                paramsString = paramsString ? '?' + paramsString : '';
                xhr.onreadystatechange = function() {
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        succ(xhr.responseText);
                    } else {
                        fail(xhr);
                    }
                };

                switch (data.method.toUpperCase()) {
                    case 'GET':
                        xhr.open('GET', data.url + paramsString, true);
                        xhr.send();
                    case 'POST':
                        xhr.open('POST', data.url + paramsString, true);
                        xhr.open(JSON.stringify(data.data));
                }

            })
        }
    }];
    this.interceptors = [];

    this.config = {
        get: {
            method: 'get',
            requestHeaders: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            params: null,
            transformRequest: []
        },
        post: {
            method: 'post',
            requestHeaders: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            params: null,
            data: null,
            transformRequest: []
        }
    };
};
