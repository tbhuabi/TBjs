var virtualDom = minErr('virtualDom');
var ELEMENT_NODE_TYPE = 1;
var TEXT_NODE_TYPE = 3;
var COMMENT_NODE_TYPE = 8;
var DOCUMENT_NODE_TYPE = 9;
var ODD_TAG_LIST = ['img', 'input', 'br', 'hr', 'param', 'meta', 'link'];




//根对象
function RootElementEngine() {
    this.$ENGINE = true;
};
extend(RootElementEngine.prototype, {
    getInnerHtml: function() {
        var self = this;
        if (self.innerHTML) {
            return self.innerHTML;
        } else if (self.nodeType === TEXT_NODE_TYPE || self.nodeType === COMMENT_NODE_TYPE) {
            return self.textContent;
        }
        var innerHTML = '';
        if (self.childNodes) {
            for (var i = 0, len = self.childNodes.length; i < len; i++) {
                innerHTML += self.childNodes[i].getOuterHtml();
            }
        }
        self.innerHTML = innerHTML;
        return innerHTML;
    },
    getOuterHtml: function() {
        var self = this;
        if (self.outerHTML) {
            return self.outerHTML;
        } else if (self.nodeType === TEXT_NODE_TYPE) {
            return self.textContent;
        } else if (self.nodeType === COMMENT_NODE_TYPE) {
            return '<!--' + self.textContent + '-->';
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
        if (self.nodeType === ELEMENT_NODE_TYPE) {
            var tagName = self.tagName.toLowerCase();
            var attrHtml = getAttributeHtml(self.attributes);
            if (ODD_TAG_LIST.indexOf(tagName) === -1) {
                outerHtml = '<' + tagName + (attrHtml ? ' ' + attrHtml : '') + '>' + getChildNodesHtml(self) + '</' + tagName + '>';
            } else {
                outerHtml = '<' + tagName + ' ' + attrHtml + '>';
            }
        } else if (self.nodeType === DOCUMENT_NODE_TYPE) {
            outerHtml = getChildNodesHtml(self);
        }

        self.outerHTML = outerHtml;
        return outerHtml;
    },
    getInnerText: function() {
        var self = this;
        if (self.nodeType === TEXT_NODE_TYPE) {
            return self.textContent;
        } else if (self.nodeType === COMMENT_NODE_TYPE) {
            return;
        }
        var text = '';
        if (self.childNodes) { //单标签没有子级
            for (var i = 0, len = self.childNodes.length; i < len; i++) {
                text += self.childNodes[i].getInnerText() || '';
            }
        }
        self.innerText = text;
        return text;
    }
});

function ElementEventEngine() {};

ElementEventEngine.prototype = new RootElementEngine();
extend(ElementEventEngine.prototype, {
    constructor: ElementEventEngine,
    addEventListener: function(eventType, fn, useCapture) {
        var self = this;
        useCapture = !!useCapture;
        eventType = eventType.toLowerCase();
        if (!isArray(self.eventListener[eventType])) {
            self.eventListener[eventType] = [];
        }
        self.eventListener[eventType].push({
            fn: fn,
            useCapture: useCapture
        });
    },
    removeEventListener: function(eventType, fn) {
        var self = this;
        if (isArray(self.eventListener[eventType])) {
            for (var i = 0, len = self.eventListener.length; i < len; i++) {
                if (self.eventListener[i].fn === fn) {
                    self.eventListener.splice(i, 1);
                    return;
                }
            }
        }
    }
})

//dom元素构造函数

function ElementEngine() {};
ElementEngine.prototype = new ElementEventEngine();
extend(ElementEngine.prototype, {
    constructor: ElementEngine,
    $refresh: function() {
        var self = this;
        self.innerHTML = self.outerHTML = self.innerText = '';
        self.getOuterHtml();
        self.getInnerHtml();
        self.getInnerText();
        if (self.parentNode) {
            self.parentNode.$refresh();
        }
    },
    setInnerHtml: function(arg) {
        var self = this;
        var newNodeElements = new VirtualDom(arg);
        self.childNodes = [];
        self.children = [];
        for (var i = 0, len = newNodeElements.childNodes.length; i < len; i++) {
            self.appendChild(newNodeElements.childNodes[i]);
        }
        newNodeElements = null;
        self.$refresh();
    },
    setAttribute: function(attributes, value) {
        var item;
        var self = this;
        for (var i = 0, len = self.attributes.length; i < len; i++) {
            if (self.attributes[i].name === attributes) {
                item = self.attributes[i];
                break;
            }
        }
        if (!item) {
            item = {};
            self.attributes.push(item);
        }
        item.name = attributes;
        if (!isUndefined(value)) {
            item.value = value;
        }
        self.className = self.getAttribute('class');
        self.classList = self.className.match(/\S+/g) || [];
        self.id = self.getAttribute('id');
        self.$refresh();
    },
    getAttribute: function(key) {
        var self = this;
        for (var i = 0, len = self.attributes.length; i < len; i++) {
            if (self.attributes[i].name === key) {
                return self.attributes[i].value;
            }
        }
        return '';
    },
    hasAttribute: function(key) {
        var self = this;
        for (var i = 0, len = self.attributes.length; i < len; i++) {
            if (self.attributes[i].name === key) {
                return true;
            }
        }
        return false;
    },
    removeAttribute: function(key) {
        var self = this;
        for (var i = 0, len = self.attributes.length; i < len; i++) {
            if (self.attributes[i].name === key) {
                self.attributes.splice(i, 1);
                if (key === 'class') {
                    self.className = '';
                    self.classList = [];
                } else if (key === 'id') {
                    self.id = '';
                }
                break;
            }
        }
        self.$refresh();
    },
    querySelectorAll: function(selector) {
        selector = ' ' + trim(selector);
        var elements = [];



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
                        if (currentElement.tagName === tagName.toUpperCase()) {
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
                throw virtualDom('qureySelectorAll', '{0}不是一个正确的选择器！', selector);
            }
            parentElements = unique(parentElements);
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
extend(ElementMethodEngine.prototype, {
    constructor: ElementMethodEngine,
    getElementsByTagName: function(tagName) {
        tagName = trim(tagName);
        var elements = [];
        var self = this;
        for (var i = 0, len = self.children.length; i < len; i++) {
            if (self.children[i].tagName === tagName || tagName === '*') {
                elements.push(self.children[i]);
            }
            if (self.children[i].children) {
                self.children[i].getElementsByTagName(tagName).filter(function(item) {
                    elements.push(item);
                });
            }
        }
        return elements;
    },
    getElementsByClassName: function(className) {
        var elements = [];
        var self = this;
        for (var i = 0, len = self.children.length; i < len; i++) {
            if (self.children[i].hasClass(className)) {
                elements.push(self.children[i]);
            }
            if (self.children[i].children) {
                self.children[i].getElementsByClassName(className).filter(function(item) {
                    elements.push(item);
                });
            }
        }
        return elements;
    },
    appendChild: function(TBDomElement) {
        var self = this;
        if (TBDomElement.parentNode !== self) {
            TBDomElement.parentNode = self;
            self.childNodes.push(TBDomElement);
            if (TBDomElement.nodeType === ELEMENT_NODE_TYPE) {
                self.children.push(TBDomElement);
            }
        } else {
            for (var i = 0, len = self.childNodes.length; i < len; i++) {
                if (TBDomElement === self.childNodes[i]) {
                    self.childNodes.push(self.childNodes.splice(i, 1));
                    break;
                }
            }
            if (TBDomElement.nodeType === ELEMENT_NODE_TYPE) {
                for (var i = 0, len = self.children.length; i < len; i++) {
                    if (TBDomElement === self.children[i]) {
                        self.children.push(self.children.splice(i, 1));
                        break;
                    }
                }
            }
        }
        self.$refresh();
    },
    removeChild: function(TBDomElement) {
        var self = this;
        for (var i = 0, len = self.childNodes.length; i < len; i++) {
            if (self.childNodes[i] === TBDomElement) {
                self.childNodes.splice(i, 1);
                break;
            }
        }
        if (TBDomElement.nodeType === ELEMENT_NODE_TYPE) {
            for (var i = 0, len = self.children.length; i < len; i++) {
                if (self.children[i] === TBDomElement) {
                    self.children.splice(i, 1);
                    break;
                }
            }
        }
        self.$refresh();
    },
    insertBefore: function(TBDomElement, nextElement) {
        var self = this;
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
        TBDomElement.parentNode = self;
        for (var i = 0, len = self.childNodes.length; i < len; i++) {
            if (self.childNodes[i] === nextElement) {
                self.childNodes.splice(i, 0, TBDomElement);
                break;
            }
        }
        for (var i = 0, len = self.children.length; i < len; i++) {
            if (self.children[i] === nextElement) {
                self.children.splice(i, 0, TBDomElement);
                break;
            }
        }
        self.$refresh();
    }
})
var xmlEngine = function(context, htmlText) {

    var ALL_RGE_STRING = '.|[\\n\\t\\r\\v\\s]';
    var TAG_OR_PROPERTY_REG_STRING = '[a-zA-Z]\\w*(?:-\\w+)*';
    var TAG_ATTRIBUTE_VALUE_REG_STRING = '="[^"]*"|=\'[^\']*\'|=[^\\s>]+';
    var TAG_ATTRIBUTE_REG_STRING = '\\s*' + TAG_OR_PROPERTY_REG_STRING + '(?:' + TAG_ATTRIBUTE_VALUE_REG_STRING + ')?';
    var TAG_CLOSE_REG_STRING = '</' + TAG_OR_PROPERTY_REG_STRING + '>';

    var TEST_SCRIPT_BERORE_REG = new RegExp('^<script\\s(' + TAG_ATTRIBUTE_REG_STRING + ')*>|^<script\\s*>', 'i');

    var SPLIT_SCRIPT_CONTENT_REG = new RegExp('^(<script\\s(?:' + TAG_ATTRIBUTE_REG_STRING + ')+' + '>|^<script\\s*>)((?:' + ALL_RGE_STRING + ')*)(</script>)', 'i');

    var SPLIT_TAG_BEFORE_REG = new RegExp('(?!^)(?=(?:<' + TAG_OR_PROPERTY_REG_STRING + '\\s*/?>|<' + TAG_OR_PROPERTY_REG_STRING + '\\s(?:' + TAG_ATTRIBUTE_REG_STRING + ')+\\s*/?>)|</' + TAG_OR_PROPERTY_REG_STRING + '\\s*>)');

    var SPLIT_TAG_AFTER_REG = new RegExp('(<' + TAG_OR_PROPERTY_REG_STRING + '\\s*/?>|<' + TAG_OR_PROPERTY_REG_STRING + '\\s(?:' + TAG_ATTRIBUTE_REG_STRING + ')+\\s*/?>|</' + TAG_OR_PROPERTY_REG_STRING + '\\s*>)((?:' + ALL_RGE_STRING + ')*)');

    var TEST_TAG_REG = new RegExp('^<' + TAG_OR_PROPERTY_REG_STRING + '\\s*/?>$|^<' + TAG_OR_PROPERTY_REG_STRING + '\\s(?:' + TAG_ATTRIBUTE_REG_STRING + ')+\\s*/?>$|^</' + TAG_OR_PROPERTY_REG_STRING + '\\s*>$');


    var arr = [];

    var findScriptOrCommentNode = function(str) {
        var startScriptIndex = str.search(/<script/i);
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
                var scriptTagName = afterStr.slice(1, 7);
                var closeIndex = afterStr.search(new RegExp('</' + scriptTagName + '>', 'i'));
                if (closeIndex === -1) {
                    //如果没有找到结尾标签，添加一个，主要是防止在词法分析时，正则匹配内存溢出的问题
                    closeIndex = afterStr.length;
                    afterStr += '</' + scriptTagName + '>';
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



    findScriptOrCommentNode(htmlText);


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
    xmlBuilder(context, context, arr3, 0);
};
var GET_BEGIN_TAG_REG = /^<(\w+(?:-\w+)*)/;
var GET_TAG_ATTRIBUTES_REG = /^<\w+(-\w+)*\s*|\s*\/?>$/g;
var MATCH_ATTRIBUTE_REG = /(\w+(?:-\w+)*)(="[^"]*"|='[^']*'|[^\s>]+)?/g;
var SPLIT_ATTRIBUTE_REG = /(^\w+(?:-\w+)*)(?:=(.*)$)?/;
var TRIM_QUOTE_REG = /^['"]|['"]$/g;
var TEST_CLOSE_TAG_REG = /^<\/[a-zA-Z]\w*(?:-\w+)*/;
var TEST_COMMENT_REG = /^<!--/;
var TRIM_COMMENT_REG = /^<!--|-->$/g;
var xmlBuilder = function(document, parentNode, arr, i) {
    if (i < arr.length) {
        var currentString = arr[i];
        var beginTag = GET_BEGIN_TAG_REG.exec(currentString);
        if (beginTag) {
            beginTag = beginTag[1];

            var currentElement = document.createElement(beginTag);
            var attrStr = currentString.replace(GET_TAG_ATTRIBUTES_REG, '');
            var attrbutes = attrStr.match(MATCH_ATTRIBUTE_REG);
            if (attrbutes) {
                attrbutes.filter(function(item) {
                    item = trim(item);
                    item.replace(SPLIT_ATTRIBUTE_REG, function(str, $1, $2) {
                        if ($2) {
                            $2 = $2.replace(TRIM_QUOTE_REG, '');
                        }
                        currentElement.setAttribute($1, $2);
                    })
                })
            }
            parentNode.appendChild(currentElement);
            i++;
            if (currentElement.childNodes === undefined || /\/>$/.test(currentString)) {
                xmlBuilder(document, parentNode, arr, i);
            } else {
                xmlBuilder(document, currentElement, arr, i);
            }
            return;
        }
        if (TEST_CLOSE_TAG_REG.test(currentString)) {
            if (parentNode.parentNode) {
                xmlBuilder(document, parentNode.parentNode, arr, ++i);
            }
            return;
        }
        if (TEST_COMMENT_REG.test(currentString)) {
            var currentElement = document.createComment(currentString.replace(TRIM_COMMENT_REG, ''));
            parentNode.appendChild(currentElement);
            xmlBuilder(document, parentNode, arr, ++i);
            return;
        }
        var currentElement = document.createTextNode(currentString);
        parentNode.appendChild(currentElement);
        xmlBuilder(document, parentNode, arr, ++i);
    }
};
//document构造函数
function VirtualDom(htmlContent) {
    var self = this;
    self.$targetElement = null;
    self.nodeType = DOCUMENT_NODE_TYPE;
    self.parentNode = null;
    self.innerHTML = '';
    self.innerText = '';
    self.outerHTML = '';
    self.classList = [];
    self.className = '';
    self.childNodes = [];
    self.children = [];
    self.eventListener = {};
    xmlEngine(self, htmlContent);
}
VirtualDom.prototype = new ElementMethodEngine();
extend(VirtualDom.prototype, {
    constructor: VirtualDom,
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
    }
})

//单标签元素构造函数

function OddElement(tagName) {
    var self = this;
    self.$targetElement = null;
    self.tagName = self.nodeName = tagName.toUpperCase();
    self.nodeType = ELEMENT_NODE_TYPE;
    self.parentNode = null;
    self.innerHTML = '';
    self.innerText = '';
    self.id = '';
    self.outerHTML = '';
    self.classList = [];
    self.className = '';
    self.attributes = [];
    self.eventListener = {};
}
OddElement.prototype = new ElementEngine();
extend(OddElement.prototype, {
    constructor: OddElement
})


//双标签元素构造函数
function EvenElement(tagName) {
    var self = this;
    self.$targetElement = null;
    self.tagName = self.nodeName = tagName.toUpperCase();
    self.nodeType = ELEMENT_NODE_TYPE;
    self.parentNode = null;
    self.innerHTML = '';
    self.innerText = '';
    self.outerHTML = '';
    self.classList = [];
    self.className = '';
    self.id = '';
    self.childNodes = [];
    self.children = [];
    self.attributes = [];
    self.eventListener = {};
}
EvenElement.prototype = new ElementMethodEngine();
extend(EvenElement.prototype, {
    constructor: EvenElement
})

//文本节点构造函数
function TextElement(text) {
    var self = this;
    self.$targetElement = null;
    self.parentNode = null;
    self.nodeType = TEXT_NODE_TYPE;
    self.nodeName = '#text';
    self.textContent = text.replace(/[\n\t\r\v]/g, '');
    self.eventListener = {};
}
TextElement.prototype = new ElementEventEngine();
TextElement.prototype.constructor = TextElement;


function CommentElement(commentText) {
    var self = this;
    self.$targetElement = null;
    self.parentNode = null;
    self.nodeType = COMMENT_NODE_TYPE;
    self.nodeName = '#comment';
    self.textContent = commentText;
}

CommentElement.prototype = new RootElementEngine();
CommentElement.prototype.constructor = CommentElement;
