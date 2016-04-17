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


        var ODD_TAG_LIST = ['img', 'input', 'br', 'hr', 'param', 'meta', 'link'];


        var ELEMENT_NODE = 1;
        var TEXT_NODE = 3;
        var COMMENT_NODE = 8;
        var DOCUMENT_NODE = 9;

        //根对象
        function RootElementEngine() {
            this.$ENGINE = true;
        };
        toolkit.extend(RootElementEngine.prototype, {
            getInnerHtml: function() {
                if (this.innerHTML) {
                    return this.innerHTML;
                }
                var innerHTML = '';
                if (this.childNodes) {
                    for (var i = 0, len = this.childNodes.length; i < len; i++) {
                        innerHTML += this.childNodes[i].getOuterHtml();
                    }
                }
                this.innerHTML = innerHTML;
                return innerHTML;
            },
            getOuterHtml: function() {
                if (this.outerHTML) {
                    return this.outerHTML;
                }
                if (this.nodeType === TEXT_NODE) {
                    return this.innerText;
                }

                var getAttributeHtml = function(attributes) {
                    var attrbutesList = [];
                    for (var i = 0, len = attributes.length; i < len; i++) {
                        var item = attributes[i];
                        var attr = item.name;
                        if (attr === 'className') {
                            attr = 'class';
                        }
                        if (item.value !== null && item.value !== undefined) {
                            if (item.value.indexOf('"') === -1) {
                                attr = attr + '="' + item.value + '"';
                            } else {
                                attr = attr + "='" + item.value + "'";
                            }
                        }
                        attrbutesList.push(attr);
                    }
                    return attrbutesList.join(' ');
                }

                var getChildNodesHtml = function(obj) {
                    var html = '';
                    for (var i = 0, len = obj.childNodes.length; i < len; i++) {
                        html += obj.childNodes[i].getOuterHtml();
                    }
                    return html;
                }


                var outerHtml = '';
                if (this.nodeType === ELEMENT_NODE) {
                    var attrHtml = getAttributeHtml(this.attributes);
                    if (ODD_TAG_LIST.indexOf(this.tagName) === -1) {
                        outerHtml = '<' + this.tagName + (attrHtml ? ' ' + attrHtml : '') + '>' + getChildNodesHtml(this) + '</' + this.tagName + '>';
                    } else {
                        outerHtml = '<' + this.tagName + ' ' + attrHtml + '>';
                    }
                } else if (this.nodeType === DOCUMENT_NODE) {
                    outerHtml = getChildNodesHtml(this);
                } else if (this.nodeType === COMMENT_NODE) {
                    outerHtml = '<!--' + this.innerText + '-->';
                }

                this.outerHTML = outerHtml;
                return outerHtml;
            },
            getInnerText: function() {
                if (this.innerText) {
                    return this.innerText;
                }
                var text = '';
                if (this.childNodes) { //单标签没有子级
                    for (var i = 0, len = this.childNodes.length; i < len; i++) {
                        text += this.childNodes[i].getInnerText();
                    }
                }
                this.innerText = text.replace(/[\n\t\r]/g, '');
                return this.innerText;
            }
        });

        function ElementEventEngine() {};

        ElementEventEngine.prototype = new RootElementEngine();
        toolkit.extend(ElementEventEngine.prototype, {
            constructor: ElementEventEngine,
            addEventListener: function(eventType, fn, useCapture) {
                useCapture = !! useCapture;
                eventType = eventType.toLowerCase();
                if (!toolkit.isArray(this.eventListener[eventType])) {
                    this.eventListener[eventType] = [];
                }
                this.eventListener[eventType].push({
                    fn: fn,
                    useCapture: useCapture
                });
            },
            removeEventListener: function(eventType, fn) {
                if (toolkit.isArray(this.eventListener[eventType])) {
                    for (var i = 0, len = this.eventListener.length; i < len; i++) {
                        if (this.eventListener[i].fn === fn) {
                            this.eventListener.splice(i, 1);
                            return;
                        }
                    }
                }
            }
        })

        //dom元素构造函数

        function ElementEngine() {};
        ElementEngine.prototype = new ElementEventEngine();
        toolkit.extend(ElementEngine.prototype, {
            constructor: ElementEngine,
            $refresh: function() {
                this.innerHTML = this.outerHTML = this.innerText = '';
                this.getOuterHtml();
                this.getInnerHtml();
                this.getInnerText();
                if (this.parentNode) {
                    this.parentNode.$refresh();
                }
            },
            setInnerHtml: function(arg) {
                var newNodeElements = new DocumentEngine(arg);
                this.childNodes = [];
                this.children = [];
                for (var i = 0, len = newNodeElements.childNodes.length; i < len; i++) {
                    this.appendChild(newNodeElements.childNodes[i]);
                }
                newNodeElements = null;
                this.$refresh();
            },
            setAttribute: function(attributes, value) {
                if (toolkit.isString(attributes)) {
                    for (var i = 0, len = this.attributes.length; i < len; i++) {
                        if (this.attributes[i].name === attributes) {
                            this.attributes[i].value = value;
                            this.className = this.getAttribute('class');
                            this.classList = this.className.match(/[^\s]+/g) || [];
                            this.id = this.getAttribute('id');
                            this.$refresh();
                            return;
                        }
                    }
                    var obj = {};
                    obj.name = attributes;
                    obj.value = value;
                    this.attributes.push(obj);
                } else if (toolkit.isObject(attributes)) {
                    for (var i in attributes) {
                        if (!this.hasAttribute(i)) {
                            this.attributes.push({
                                name: i,
                                value: attributes[i]
                            })
                        }
                    }
                }
                this.className = this.getAttribute('class');
                this.classList = this.className.match(/[^\s]+/g) || [];
                this.id = this.getAttribute('id');
                this.$refresh();
            },
            getAttribute: function(key) {
                var value;
                for (var i = 0, len = this.attributes.length; i < len; i++) {
                    if (this.attributes[i].name === key) {
                        return this.attributes[i].value;
                    }
                }
                return '';
            },
            hasAttribute: function(key) {
                for (var i = 0, len = this.attributes.length; i < len; i++) {
                    if (this.attributes[i].name === key) {
                        return true;
                    }
                }
                return false;
            },
            removeAttribute: function(key) {
                for (var i = 0, len = this.attributes.length; i < len; i++) {
                    if (this.attributes[i].name === key) {
                        this.attributes.splice(i, 1);
                        if (key === 'class') {
                            this.className = '';
                            this.classList = [];
                        } else if (key === 'id') {
                            this.id = '';
                        }
                        break;
                    }
                }
                this.$refresh();
            },
            querySelectorAll: function(selector) {
                selector = ' ' + toolkit.trim(selector);
                var _this = this;
                var elements = [];
                //var selectorFragment = selector.match(/[^\s]+/g);



                var ALL_SELECTOR_REG = /^\s+\*?(?!>|\[|:first-child|:last-child|\+)/;
                var TAG_SELECTOR_REG = /^(\w+(?:-\w+)*)/;
                var ID_SELECTOR_REG = /^#(\w+(?:-\w+)*)/;
                var CLASSNAME_SELECTOR_REG = /^\.(\w+(?:-\w+)*)/;
                var ATTRIBUTE_SELECTOR_REG = /^\s*\[\s*(\w+(?:-\w+)*)(?:\s*=\s*(['"]?)([^\2]*)\2?\s*)?\]/;
                var CHILDREN_SELECTOR_RGE = /^\s*>/;
                var FIRST_SELECTOR_REG = /^\s*:first-child\b/;
                var LAST_SELECTOR_REG = /^\s*:last-child\b/;
                var SIBLINGS_SELECTOR_REG = /^\+\s*/;


                function selectDistributor(selector, context) {

                    var parentElements = [];
                    var nextSelector = '';
                    for (var i = 0, len = context.length; i < len; i++) {
                        var currentElement = context[i];
                        if (ALL_SELECTOR_REG.test(selector)) {
                            nextSelector = selector.replace(ALL_SELECTOR_REG, function() {
                                currentElement.getElementsByTagName('*').filter(function(item) {
                                    parentElements.push(item);
                                })
                                return '';
                            })
                        } else if (TAG_SELECTOR_REG.test(selector)) {
                            nextSelector = selector.replace(TAG_SELECTOR_REG, function(selector, tagName) {
                                if (currentElement.tagName === tagName) {
                                    parentElements.push(currentElement);
                                }
                                return '';
                            })
                        } else if (ID_SELECTOR_REG.test(selector)) {
                            nextSelector = selector.replace(ID_SELECTOR_REG, function(selector, id) {
                                if (currentElement.id === id) {
                                    parentElements.push(currentElement);
                                }
                                return '';
                            })
                        } else if (CLASSNAME_SELECTOR_REG.test(selector)) {
                            nextSelector = selector.replace(CLASSNAME_SELECTOR_REG, function(selector, className) {
                                var reg = new RegExp('(^|\\s+)' + className + '(\\s+|$)');
                                if (reg.test(currentElement.className)) {
                                    parentElements.push(currentElement);
                                }
                                return '';
                            })
                        } else if (ATTRIBUTE_SELECTOR_REG.test(selector)) {
                            nextSelector = selector.replace(ATTRIBUTE_SELECTOR_REG, function(selector, propName, _, propValue) {
                                if (propValue) {
                                    if (currentElement.getAttribute(propName) === propValue) {
                                        parentElements.push(currentElement);
                                    }
                                } else {
                                    if (currentElement.hasAttribute(propName)) {
                                        parentElements.push(currentElement);
                                    }
                                }
                                return '';
                            })
                        } else if (CHILDREN_SELECTOR_RGE.test(selector)) {
                            nextSelector = selector.replace(CHILDREN_SELECTOR_RGE, function() {
                                if (!currentElement.children) return '';
                                for (var j = 0, len = currentElement.children.length; j < len; j++) {
                                    parentElements.push(currentElement.children[j]);
                                }
                                return '';
                            })
                        } else if (FIRST_SELECTOR_REG.test(selector)) {
                            nextSelector = selector.replace(FIRST_SELECTOR_REG, function() {
                                parentElements.push(currentElement);
                                i = len;
                                return '';
                            })
                        } else if (LAST_SELECTOR_REG.test(selector)) {
                            nextSelector = selector.replace(LAST_SELECTOR_REG, function() {
                                parentElements.push(context[len - 1]);
                                i = len;
                                return '';
                            })
                        } else if (SIBLINGS_SELECTOR_REG.test(selector)) {
                            nextSelector = selector.replace(SIBLINGS_SELECTOR_REG, function() {
                                var siblings = currentElement.parentNode.children;
                                siblings.filter(function(item) {
                                    if (item !== currentElement) {
                                        parentElements.push(item);
                                    }
                                })
                                return '';
                            })
                        }


                    }
                    if (selector === nextSelector) {
                        throw new Error(selector + '不是一个正确的选择器！');
                    }
                    parentElements = toolkit.unique(parentElements);
                    if (nextSelector) {
                        return selectDistributor(nextSelector, parentElements);
                    }
                    return parentElements;
                }
                return selectDistributor(selector, [this]);
            },
            querySelector: function(selector) {
                return this.querySelectorAll(selector)[0] || null;
            }
        });

        //dom方法构造函数

        function ElementMethodEngine() {};
        ElementMethodEngine.prototype = new ElementEngine();
        toolkit.extend(ElementMethodEngine.prototype, {
            constructor: ElementMethodEngine,
            getElementsByTagName: function(tagName) {
                tagName = toolkit.trim(tagName);
                var elements = [];
                for (var i = 0, len = this.children.length; i < len; i++) {
                    if (this.children[i].tagName === tagName || tagName === '*') {
                        elements.push(this.children[i]);
                    }
                    if (this.children[i].children) {
                        this.children[i].getElementsByTagName(tagName).filter(function(item) {
                            elements.push(item);
                        });
                    }
                }
                return elements;
            },
            getElementsByClassName: function(className) {
                var elements = [];
                for (var i = 0, len = this.children.length; i < len; i++) {
                    if (this.children[i].hasClass(className)) {
                        elements.push(this.children[i]);
                    }
                    if (this.children[i].children) {
                        this.children[i].getElementsByClassName(className).filter(function(item) {
                            elements.push(item);
                        });
                    }
                }
                return elements;
            },
            appendChild: function(TBDomElement) {
                if (TBDomElement.parentNode !== this) {
                    TBDomElement.parentNode = this;
                    this.childNodes.push(TBDomElement);
                    if (TBDomElement.nodeType === ELEMENT_NODE) {
                        this.children.push(TBDomElement);
                    }
                } else {
                    for (var i = 0, len = this.childNodes.length; i < len; i++) {
                        if (TBDomElement === this.childNodes[i]) {
                            this.childNodes.push(this.childNodes.splice(i, 1));
                            break;
                        }
                    }
                    if (TBDomElement.nodeType === ELEMENT_NODE) {
                        for (var i = 0, len = this.children.length; i < len; i++) {
                            if (TBDomElement === this.children[i]) {
                                this.children.push(this.children.splice(i, 1));
                                break;
                            }
                        }
                    }
                }
                this.$refresh();
            },
            removeChild: function(TBDomElement) {
                for (var i = 0, len = this.childNodes.length; i < len; i++) {
                    if (this.childNodes[i] === TBDomElement) {
                        this.childNodes.splice(i, 1);
                        break;
                    }
                }
                if (TBDomElement.nodeType === ELEMENT_NODE) {
                    for (var i = 0, len = this.children.length; i < len; i++) {
                        if (this.children[i] === TBDomElement) {
                            this.children.splice(i, 1);
                            break;
                        }
                    }
                }
                this.$refresh();
            },
            insertBefore: function(TBDomElement, nextElement) {
                var parentNode = TBDomElement.parentNode;
                for (var i = 0, len = parentNode.childNodes.length; i < len; i++) {
                    if (parentNode.childNodes[i] === TBDomElement) {
                        parentNode.childNodes.splice(i, 1);
                        break;
                    }
                }
                for (var i = 0, len = parentNode.children.length; i < len; i++) {
                    if (parentNode.children[i] === TBDomElement) {
                        parentNode.children.splice(i, 1);
                        break;
                    }
                }
                TBDomElement.parentNode = this;
                for (var i = 0, len = this.childNodes.length; i < len; i++) {
                    if (this.childNodes[i] === nextElement) {
                        this.childNodes.splice(i, 0, TBDomElement);
                        break;
                    }
                }
                for (var i = 0, len = this.children.length; i < len; i++) {
                    if (this.children[i] === nextElement) {
                        this.children.splice(i, 0, TBDomElement);
                        break;
                    }
                }
                this.$refresh();
            }
        })

        //document构造函数
        function DocumentEngine(htmlContent) {
            if (!(this instanceof DocumentEngine)) return new DocumentEngine(htmlContent);
            this.$XMLContent = htmlContent;
            this.nodeType = DOCUMENT_NODE;
            this.parentNode = null;
            this.innerHTML = '';
            this.innerText = '';
            this.outerHTML = '';
            this.classList = [];
            this.className = '';
            this.childNodes = [];
            this.children = [];
            this.eventListener = {};
            this.$XMLEngine();
        }
        DocumentEngine.prototype = new ElementMethodEngine();
        toolkit.extend(DocumentEngine.prototype, {
            constructor: DocumentEngine,
            createElement: function(tag) {
                tag = tag.toLowerCase();
                if (ODD_TAG_LIST.indexOf(tag) === -1) {
                    return new EvenElement(tag);
                }
                return new OddElement(tag);
            },
            createTextNode: function(text) {
                return new TextElement(text);
            },
            createComment: function(commentText) {
                return new CommentElement(commentText);
            },
            getElementById: function(id) {
                function getElementById(parent) {
                    var element = null;
                    var children = parent.children || [];
                    for (var i = 0, len = children.length; i < len; i++) {
                        if (children[i].id === id) {
                            return children[i];
                        } else {
                            element = getElementById(children[i]);
                            if (element) return element;
                        }
                    }
                    return element;
                }
                return getElementById(this);
            },
            getElementsByName: function(name) {
                var elements = [];
                this.getElementsByTagName('form').filter(function(item) {
                    if (item.hasAttribute(name)) {
                        elements.push(item);
                    }
                });
                return elements;
            },
            $XMLEngine: function() {
                //this.$XMLContent = this.$XMLContent.replace(/\s*[\n\t\r]+\s*/g, '');

                var ALL_RGE_STRING = '.|[\\n\\t\\r\\v\\s]';
                var TAG_OR_PROPERTY_REG_STRING = '[a-zA-Z]\\w*(?:-\\w+)*';
                var TAG_ATTRIBUTE_VALUE_REG_STRING = '="[^"]*"|=\'[^\']*\'|=[^\\s>]+';
                var TAG_ATTRIBUTE_REG_STRING = '\\s*' + TAG_OR_PROPERTY_REG_STRING + '(?:' + TAG_ATTRIBUTE_VALUE_REG_STRING + ')?';
                var TAG_CLOSE_REG_STRING = '<\/' + TAG_OR_PROPERTY_REG_STRING + '>';

                var TEST_SCRIPT_BERORE_REG = new RegExp('^<script\\s(' + TAG_ATTRIBUTE_REG_STRING + ')*>|^<script\\s*>', 'i');

                var SPLIT_SCRIPT_CONTENT_REG = new RegExp('^(<script\\s(?:' + TAG_ATTRIBUTE_REG_STRING + ')+' + '>|^<script\\s*>)((?:' + ALL_RGE_STRING + ')*)(<\/script>)', 'i');

                var SPLIT_TAG_BEFORE_REG = new RegExp('(?!^)(?=(?:<' + TAG_OR_PROPERTY_REG_STRING + '\\s*\/?>|<' + TAG_OR_PROPERTY_REG_STRING + '\\s(?:' + TAG_ATTRIBUTE_REG_STRING + ')+\\s*\/?>)|<\/' + TAG_OR_PROPERTY_REG_STRING + '\\s*>)');

                var SPLIT_TAG_AFTER_REG = new RegExp('(<' + TAG_OR_PROPERTY_REG_STRING + '\\s*\/?>|<' + TAG_OR_PROPERTY_REG_STRING + '\\s(?:' + TAG_ATTRIBUTE_REG_STRING + ')+\\s*\/?>|<\/' + TAG_OR_PROPERTY_REG_STRING + '\\s*>)((?:' + ALL_RGE_STRING + ')*)');

                var TEST_TAG_REG = new RegExp('^<' + TAG_OR_PROPERTY_REG_STRING + '\\s*\/?>$|^<' + TAG_OR_PROPERTY_REG_STRING + '\\s(?:' + TAG_ATTRIBUTE_REG_STRING + ')+\\s*\/?>$|^<\/' + TAG_OR_PROPERTY_REG_STRING + '\\s*>$');


                var arr = [];

                var findScriptOrCommentNode = function(str) {
                    var startScriptIndex = str.indexOf('<script');
                    var startCommentIndex = str.indexOf('<!--');


                    var list = [startScriptIndex, startCommentIndex].sort(function(n, m) {
                        return n - m;
                    });

                    var startIndex = list[0] === -1 ? list[1] : list[0];

                    if (startIndex === -1) {
                        arr.push(str);
                        return;
                    }

                    var type = startIndex === startScriptIndex ? 'script' : 'comment';



                    if (type === 'script') {
                        var beforeStr = str.substring(0, startIndex);
                        var afterStr = str.substring(startIndex, str.length);
                        if (TEST_SCRIPT_BERORE_REG.test(afterStr)) {
                            var closeIndex = afterStr.indexOf('</script>');
                            if (closeIndex === -1) {
                                //如果没有找到结尾标签，添加一个，主要是防止在词法分析时，正则匹配内存溢出的问题
                                closeIndex = afterStr.length;
                                afterStr += '</script>';
                            }
                            beforeStr && arr.push(beforeStr);
                            var body = afterStr.substring(0, closeIndex + 9);
                            arr.push(body);
                            if (closeIndex + 9 === afterStr.length) return;
                            findScriptOrCommentNode(afterStr.substring(closeIndex + 9, afterStr.length));
                        }
                    } else {
                        var beforeStr = str.substring(0, startIndex);
                        if (beforeStr) arr.push(beforeStr);
                        var afterStr = str.substring(startIndex, str.length);
                        var closeIndex = afterStr.indexOf('-->');
                        if (closeIndex === -1 || closeIndex + 3 === afterStr.length) {
                            arr.push(afterStr);
                        } else {
                            var body = afterStr.substring(0, closeIndex + 3);
                            arr.push(body);
                            findScriptOrCommentNode(afterStr.substring(closeIndex + 3, afterStr.length));
                        }
                    }
                };



                findScriptOrCommentNode(this.$XMLContent);


                var IS_SCRIPT_REG = /^<script/i;
                var IS_COMMENT_REG = /^<!--/;
                var arr1 = []; //存放第一次标签分析结果
                arr.forEach(function(item) {
                    if (IS_SCRIPT_REG.test(item) || IS_COMMENT_REG.test(item)) {
                        arr1.push(item);
                        return;
                    }
                    item.split(SPLIT_TAG_BEFORE_REG).forEach(function(item) {
                        arr1.push(item);
                    });
                })

                var arr2 = []; //存放第二次标签分析结果
                arr1.forEach(function(item) {
                    if (IS_SCRIPT_REG.test(item) || IS_COMMENT_REG.test(item)) {
                        arr2.push(item);
                        return;
                    }
                    var oldLength = arr2.length;
                    item.replace(SPLIT_TAG_AFTER_REG, function(str, $1, $2) {
                        arr2.push($1);
                        $2 && arr2.push($2);
                    });
                    if (oldLength === arr2.length) {
                        arr2.push(item);
                    }
                })
                var arr3 = []; //存入组合过滤后的dom文本元素集合;
                var text = '';
                for (var i = 0, len = arr2.length; i < len; i++) {
                    if (IS_SCRIPT_REG.test(arr2[i])) {
                        if (text !== '') {
                            arr3.push(text);
                            text = '';
                        }
                        arr2[i].replace(SPLIT_SCRIPT_CONTENT_REG, function(str, $1, $2, $3) {
                            arr3.push($1);
                            $2 && arr3.push($2);
                            arr3.push($3);
                        });
                        continue;
                    } else if (TEST_TAG_REG.test(arr2[i])) {
                        if (text !== '') {
                            arr3.push(text);
                            text = '';
                        }
                        arr3.push(arr2[i]);
                    } else if (IS_COMMENT_REG.test(arr2[i])) {
                        if (text !== '') {
                            arr3.push(text);
                            text = '';
                        }
                        arr3.push(arr2[i]);
                    } else {
                        text += arr2[i];
                    }
                }
                this.$XMLBuilder(this, arr3, 0);
            },
            $XMLBuilder: function(parentNode, arr, i) {
                if (i < arr.length) {
                    var currentString = arr[i];
                    var beginTag = /^<(\w+(?:-\w+)*)/.exec(currentString);
                    if (beginTag) {
                        beginTag = beginTag[1];

                        var currentElement = this.createElement(beginTag);
                        var attrStr = currentString.replace(/^<\w+(-\w+)*\s*|\s*\/?>$/g, '');
                        var attrbutes = attrStr.match(/(\w+(?:-\w+)*)(="[^"]*"|='[^']*'|[^\s>]+)?/g);
                        if (attrbutes) {
                            var attrbutesObj = {};
                            attrbutes.filter(function(item) {
                                item = toolkit.trim(item);
                                item.replace(/(^\w+(?:-\w+)*)(?:=(.*)$)?/, function(str, $1, $2) {
                                    if ($2) {
                                        $2 = $2.replace(/^['"]|['"]$/g, '');
                                    }
                                    attrbutesObj[$1] = $2;
                                })
                            })
                            currentElement.setAttribute(attrbutesObj);
                        }
                        parentNode.appendChild(currentElement);
                        i++;
                        if (currentElement.childNodes === undefined || /\/>$/.test(currentString)) {
                            this.$XMLBuilder(parentNode, arr, i);
                        } else {
                            this.$XMLBuilder(currentElement, arr, i);
                        }
                        return;
                    }
                    if (/^<\/[a-zA-Z]\w*(?:-\w+)*/.test(currentString)) {
                        if (parentNode.parentNode) {
                            this.$XMLBuilder(parentNode.parentNode, arr, ++i);
                        }
                        return;
                    }
                    if (/^<!--/.test(currentString)) {
                        var currentElement = this.createComment(currentString.replace(/^<!--|-->$/g, ''));
                        parentNode.appendChild(currentElement);
                        this.$XMLBuilder(parentNode, arr, ++i);
                        return;
                    }
                    var currentElement = this.createTextNode(currentString);
                    parentNode.appendChild(currentElement);
                    this.$XMLBuilder(parentNode, arr, ++i);
                }
            }
        })

        //单标签元素构造函数

        function OddElement(tagName) {
            this.tagName = this.nodeName = tagName;
            this.nodeType = ELEMENT_NODE;
            this.parentNode = null;
            this.innerHTML = '';
            this.innerText = '';
            this.id = '';
            this.outerHTML = '';
            this.classList = [];
            this.className = '';
            this.attributes = [];
            this.eventListener = {};
        }
        OddElement.prototype = new ElementEngine();
        toolkit.extend(OddElement.prototype, {
            constructor: OddElement
        })


        //双标签元素构造函数
        function EvenElement(tagName) {
            this.tagName = this.nodeName = tagName;
            this.nodeType = ELEMENT_NODE;
            this.parentNode = null;
            this.innerHTML = '';
            this.innerText = '';
            this.outerHTML = '';
            this.classList = [];
            this.className = '';
            this.id = '';
            this.childNodes = [];
            this.children = [];
            this.attributes = [];
            this.eventListener = {};
        }
        EvenElement.prototype = new ElementMethodEngine();
        toolkit.extend(EvenElement.prototype, {
            constructor: EvenElement
        })

        //文本节点构造函数
        function TextElement(text) {
            this.parentNode = null;
            this.nodeType = TEXT_NODE;
            this.innerHTML = this.innerText = this.outerHTML = text;
            this.eventListener = {};
        }
        TextElement.prototype = new ElementEventEngine();
        TextElement.prototype.constructor = TextElement;


        function CommentElement(commentText) {
            this.parentNode = null;
            this.nodeType = COMMENT_NODE;
            this.innerHTML = this.innerText = commentText;
            this.outerHTML = '<!--' + commentText + '-->';
        }

        CommentElement.prototype = new RootElementEngine();
        CommentElement.prototype.constructor = CommentElement;







        module.exports = DocumentEngine;
    })
})
