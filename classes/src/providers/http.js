function $HttpProvider() {
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
        return Http;

        function Http(data) {
            data = data || {};

            data.method = data.method || 'get';
            data.async = data.async === undefined ? true : !!data.async;

            var xhr = new XMLHttpRequest();

            var method = _this.config[data.method.toLowerCase()];
            for (var key in method.requestHeaders) {
                xhr.setRequestHeader(key, method.requestHeaders[key]);
            }
            var paramsString = transferParams(data.params);
            paramsString = paramsString ? '?' + paramsString : '';

            switch (data.method.toUpperCase()) {
                case 'GET':
                    xhr.open('GET', data.url + paramsString, data.async);
                    xhr.send();
                case 'POST':
                    xhr.open('POST', data.url + paramsString, data.async);
                    xhr.open(JSON.stringify(data.data));
            }
        }
        extend(Http.prototype, {
            success: function(data) {

            },
            error: function() {

            },
            timeout: function() {

            }
        })
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
