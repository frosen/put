window.__require = (function e(t, n, r) {
    function s(o, u) {
        if (!n[o]) {
            if (!t[o]) {
                var b = o.split('/');
                b = b[b.length - 1];
                if (!t[b]) {
                    var a = 'function' == typeof __require && __require;
                    if (!u && a) return a(b, !0);
                    if (i) return i(b, !0);
                    throw new Error("Cannot find module '" + o + "'");
                }
            }
            var f = (n[o] = {
                exports: {}
            });
            t[o][0].call(
                f.exports,
                function(e) {
                    var n = t[o][1][e];
                    return s(n || e);
                },
                f,
                f.exports,
                e,
                t,
                n,
                r
            );
        }
        return n[o].exports;
    }
    var i = 'function' == typeof __require && __require;
    for (var o = 0; o < r.length; o++) s(r[o]);
    return s;
})(
    {
        BaseController: [
            function(require, module, exports) {
                'use strict';
                cc._RF.push(module, 'fb129pTaFRDYIDK1iKXvM+l', 'BaseController');
                ('use strict');
                var __extends =
                    (this && this.__extends) ||
                    (function() {
                        var extendStatics = function(d, b) {
                            extendStatics =
                                Object.setPrototypeOf ||
                                ({
                                    __proto__: []
                                } instanceof Array &&
                                    function(d, b) {
                                        d.__proto__ = b;
                                    }) ||
                                function(d, b) {
                                    for (var p in b) b.hasOwnProperty(p) && (d[p] = b[p]);
                                };
                            return extendStatics(d, b);
                        };
                        return function(d, b) {
                            extendStatics(d, b);
                            function __() {
                                this.constructor = d;
                            }
                            d.prototype = null === b ? Object.create(b) : ((__.prototype = b.prototype), new __());
                        };
                    })();
                var __decorate =
                    (this && this.__decorate) ||
                    function(decorators, target, key, desc) {
                        var c = arguments.length,
                            r =
                                c < 3
                                    ? target
                                    : null === desc
                                    ? (desc = Object.getOwnPropertyDescriptor(target, key))
                                    : desc,
                            d;
                        if ('object' === typeof Reflect && 'function' === typeof Reflect.decorate)
                            r = Reflect.decorate(decorators, target, key, desc);
                        else
                            for (var i = decorators.length - 1; i >= 0; i--)
                                (d = decorators[i]) &&
                                    (r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r);
                        return c > 3 && r && Object.defineProperty(target, key, r), r;
                    };
                Object.defineProperty(exports, '__esModule', {
                    value: true
                });
                var _a = cc._decorator,
                    ccclass = _a.ccclass,
                    property = _a.property;
                var customEngineInfo = cc.director.customEngineInfo;
                customEngineInfo ? cc.log('Custom engine info: ' + customEngineInfo) : cc.error('Need custom engine!!!!!');
                var BaseController = (function(_super) {
                    __extends(BaseController, _super);
                    function BaseController() {
                        return (null !== _super && _super.apply(this, arguments)) || this;
                    }
                    BaseController.prototype.onLoad = function() {
                        var rect = cc.sys.getSafeAreaRect();
                        this.node.width = rect.width;
                        this.node.height = rect.height;
                        var parent = this.node.parent;
                        this.node.y = 0.5 * (this.node.height - parent.height) + rect.y;
                    };
                    BaseController = __decorate([ccclass], BaseController);
                    return BaseController;
                })(cc.Component);
                exports.default = BaseController;
                cc._RF.pop();
            },
            {}
        ],
        Tea: [
            function(require, module, exports) {
                'use strict';
                cc._RF.push(module, 'd5f031cOEdF8K4ti1QArZNq', 'Tea');
                ('use strict');
                var Tea = {};
                Tea.encrypt = function(plaintext, password) {
                    if (0 == plaintext.length) return '';
                    var v = Tea.strToLongs(Utf8.encode(plaintext));
                    v.length <= 1 && (v[1] = 0);
                    var k = Tea.strToLongs(Utf8.encode(password).slice(0, 16));
                    var n = v.length;
                    var z = v[n - 1],
                        y = v[0],
                        delta = 2654435769;
                    var mx,
                        e,
                        q = Math.floor(6 + 52 / n),
                        sum = 0;
                    while (q-- > 0) {
                        sum += delta;
                        e = (sum >>> 2) & 3;
                        for (var p = 0; p < n; p++) {
                            y = v[(p + 1) % n];
                            mx = (((z >>> 5) ^ (y << 2)) + ((y >>> 3) ^ (z << 4))) ^ ((sum ^ y) + (k[(3 & p) ^ e] ^ z));
                            z = v[p] += mx;
                        }
                    }
                    var ciphertext = Tea.longsToStr(v);
                    return Base64.encode(ciphertext);
                };
                Tea.decrypt = function(ciphertext, password) {
                    if (0 == ciphertext.length) return '';
                    var v = Tea.strToLongs(Base64.decode(ciphertext));
                    var k = Tea.strToLongs(Utf8.encode(password).slice(0, 16));
                    var n = v.length;
                    var z = v[n - 1],
                        y = v[0],
                        delta = 2654435769;
                    var mx,
                        e,
                        q = Math.floor(6 + 52 / n),
                        sum = q * delta;
                    while (0 != sum) {
                        e = (sum >>> 2) & 3;
                        for (var p = n - 1; p >= 0; p--) {
                            z = v[p > 0 ? p - 1 : n - 1];
                            mx = (((z >>> 5) ^ (y << 2)) + ((y >>> 3) ^ (z << 4))) ^ ((sum ^ y) + (k[(3 & p) ^ e] ^ z));
                            y = v[p] -= mx;
                        }
                        sum -= delta;
                    }
                    var plaintext = Tea.longsToStr(v);
                    plaintext = plaintext.replace(/\0+$/, '');
                    return Utf8.decode(plaintext);
                };
                Tea.strToLongs = function(s) {
                    var l = new Array(Math.ceil(s.length / 4));
                    for (var i = 0; i < l.length; i++)
                        l[i] =
                            s.charCodeAt(4 * i) +
                            (s.charCodeAt(4 * i + 1) << 8) +
                            (s.charCodeAt(4 * i + 2) << 16) +
                            (s.charCodeAt(4 * i + 3) << 24);
                    return l;
                };
                Tea.longsToStr = function(l) {
                    var a = new Array(l.length);
                    for (var i = 0; i < l.length; i++)
                        a[i] = String.fromCharCode(255 & l[i], (l[i] >>> 8) & 255, (l[i] >>> 16) & 255, (l[i] >>> 24) & 255);
                    return a.join('');
                };
                var Base64 = {};
                Base64.code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
                Base64.encode = function(str, utf8encode) {
                    utf8encode = 'undefined' != typeof utf8encode && utf8encode;
                    var o1,
                        o2,
                        o3,
                        bits,
                        h1,
                        h2,
                        h3,
                        h4,
                        e = [],
                        pad = '',
                        c,
                        plain,
                        coded;
                    var b64 = Base64.code;
                    plain = utf8encode ? Utf8.encode(str) : str;
                    c = plain.length % 3;
                    if (c > 0)
                        while (c++ < 3) {
                            pad += '=';
                            plain += '\0';
                        }
                    for (c = 0; c < plain.length; c += 3) {
                        o1 = plain.charCodeAt(c);
                        o2 = plain.charCodeAt(c + 1);
                        o3 = plain.charCodeAt(c + 2);
                        bits = (o1 << 16) | (o2 << 8) | o3;
                        h1 = (bits >> 18) & 63;
                        h2 = (bits >> 12) & 63;
                        h3 = (bits >> 6) & 63;
                        h4 = 63 & bits;
                        e[c / 3] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
                    }
                    coded = e.join('');
                    coded = coded.slice(0, coded.length - pad.length) + pad;
                    return coded;
                };
                Base64.decode = function(str, utf8decode) {
                    utf8decode = 'undefined' != typeof utf8decode && utf8decode;
                    var o1,
                        o2,
                        o3,
                        h1,
                        h2,
                        h3,
                        h4,
                        bits,
                        d = [],
                        plain,
                        coded;
                    var b64 = Base64.code;
                    coded = utf8decode ? Utf8.decode(str) : str;
                    for (var c = 0; c < coded.length; c += 4) {
                        h1 = b64.indexOf(coded.charAt(c));
                        h2 = b64.indexOf(coded.charAt(c + 1));
                        h3 = b64.indexOf(coded.charAt(c + 2));
                        h4 = b64.indexOf(coded.charAt(c + 3));
                        bits = (h1 << 18) | (h2 << 12) | (h3 << 6) | h4;
                        o1 = (bits >>> 16) & 255;
                        o2 = (bits >>> 8) & 255;
                        o3 = 255 & bits;
                        d[c / 4] = String.fromCharCode(o1, o2, o3);
                        64 == h4 && (d[c / 4] = String.fromCharCode(o1, o2));
                        64 == h3 && (d[c / 4] = String.fromCharCode(o1));
                    }
                    plain = d.join('');
                    return utf8decode ? Utf8.decode(plain) : plain;
                };
                var Utf8 = {};
                Utf8.encode = function(strUni) {
                    var strUtf = strUni.replace(/[\u0080-\u07ff]/g, function(c) {
                        var cc = c.charCodeAt(0);
                        return String.fromCharCode(192 | (cc >> 6), 128 | (63 & cc));
                    });
                    strUtf = strUtf.replace(/[\u0800-\uffff]/g, function(c) {
                        var cc = c.charCodeAt(0);
                        return String.fromCharCode(224 | (cc >> 12), 128 | ((cc >> 6) & 63), 128 | (63 & cc));
                    });
                    return strUtf;
                };
                Utf8.decode = function(strUtf) {
                    var strUni = strUtf.replace(/[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]/g, function(c) {
                        var cc = ((15 & c.charCodeAt(0)) << 12) | ((63 & c.charCodeAt(1)) << 6) | (63 & c.charCodeAt(2));
                        return String.fromCharCode(cc);
                    });
                    strUni = strUni.replace(/[\u00c0-\u00df][\u0080-\u00bf]/g, function(c) {
                        var cc = ((31 & c.charCodeAt(0)) << 6) | (63 & c.charCodeAt(1));
                        return String.fromCharCode(cc);
                    });
                    return strUni;
                };
                module.exports = {
                    Tea: Tea
                };
                cc._RF.pop();
            },
            {}
        ]
    },
    {},
    ['BaseController', 'Tea']
);
