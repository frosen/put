/*
 * NewInspectors.js
 * 重载或新增编辑器inspector，让编辑器变得更强大！！！
 * luleyan
 */

'use strict';

import { getNodeByUuid } from './Utils';

let refactorCompDict = {
    'cc-event-prop': {
        using: false,
        call: () => {
            /**
             * 重载事件属性编辑器
             * 移除custom data，因为都使用vip handler的动态参数生成了
             */
            Vue.component('cc-event-prop', {
                template: `    
                    <ui-prop
                        :name="target.name"
                        :indent="indent"
                        :tooltip="target.attrs.tooltip"
                        style="padding-top: 10px;"
                        auto-height
                        >
                        <div class="layout vertical flex-1">
                            <div class="layout horizontal">
                                <ui-node class="flex-1" v-value="target.value.target.value.uuid"></ui-node>
                                <ui-select class="flex-1" v-value="target.value._componentName.value">
                                    <option v-for="item in components" :value="item">
                                        {{item}}
                                    </option>
                                </ui-select>
                                <ui-select class="flex-1" v-value="target.value.handler.value">
                                    <option v-for="item in handlers" :value="item">
                                        {{item}}
                                    </option>
                                </ui-select>
                            </div>
                        </div>
                    </ui-prop>
                    `,
                props: { indent: { type: Number, default: 0 }, target: { twoWay: !0, type: Object } },
                data: () => ({ components: [], handlers: [] }),
                watch: {
                    'target.value.target.value.uuid': '_updateDump',
                    'target.value._componentName.value': '_updateHandlers'
                },
                compiled() {
                    this._updateDump();
                },
                methods: {
                    _updateDump() {
                        this._requestID && (Editor.Ipc.cancelRequest(this._requestID), (this._requestID = null)),
                            (this._dump = null);
                        let e = this.target.value.target.value.uuid;
                        this._requestID = Editor.Ipc.sendToPanel(
                            'scene',
                            'scene:query-node-functions',
                            e,
                            (e, t) => {
                                (this._dump = t), (this._requestID = null), this._updateComponents(), this._updateHandlers();
                            },
                            -1
                        );
                    },
                    _updateComponents() {
                        if (!this._dump) return (this.components = []), void 0;
                        this.components = Object.keys(this._dump);
                    },
                    _updateHandlers() {
                        if (!this._dump) return (this.handlers = []), void 0;
                        let e = this._dump[this.target.value._componentName.value];
                        e &&
                            e.sort(function (e, t) {
                                return e.localeCompare(t);
                            }),
                            (this.handlers = e || []);
                    }
                }
            });
        }
    },
    'cc-array-prop': {
        using: false,
        call: () => {
            /**
             * 重载列表属性编辑器
             * 屏蔽了鼠标滚轮对列表size的修改，避免误操作
             */
            Vue.component('cc-array-prop', {
                template: `
                    <ui-prop
                        :tooltip="target.attrs.tooltip"
                        :name="target.name"
                        :indent="indent"
                        v-readonly="target.attrs.readonly"
                        foldable
                        >
                        <template v-if="!target.values || target.values.length <= 1">
                            <div class="layout horizontal flex-1">
                                <ui-num-input class="flex-1"
                                    type="int" min="0"
                                    :value="target.value.length"
                                    @confirm="arraySizeChanged"
                                ></ui-num-input>
                                <ui-input style="width: 65px;" placeholder="命令行"
                                    title="数组命令行：\n  添加空项：a，如 a 0为在最前添加一项\n  删除：d，如 d 0为删除第一项\n  移动：mv，如 mv 1 0为把第二项放在第一项前面"
                                    :value="commandStr"
                                    @confirm="confirmCommandStr"
                                ></ui-input>
                                <ui-button 
                                    class="green tiny" style="width: 35px"
                                    @confirm="modifyArray"
                                >Go</ui-button>
                            </div>
                            <div class="child">
                                <component
                                    v-for="prop in target.value"
                                    :is="prop.compType"
                                    :target.sync="prop"
                                    :indent="indent+1"
                                ></component>
                            </div>
                        </template>
                        <template v-else>
                        <span>Difference</span>
                        </template>
                    </ui-prop>
                    `,
                props: { indent: { type: Number, default: 0 }, target: { twoWay: !0, type: Object } },
                compiled() {
                    this.changeCommandStr();
                },
                methods: {
                    arraySizeChanged(e) {
                        if (e.detail && e.detail.confirmByEnter === false) {
                            Editor.log('PUT 为了避免误操作，屏蔽了鼠标滚轮改变编辑器上数组的大小');
                            return;
                        }
                        if (e.detail.value < this.target.value.length) {
                            let t = new Array(e.detail.value);
                            for (let n = 0; n < e.detail.value; ++n) t[n] = this.target.value[n];
                            this.target.value = t;
                        } else this.target.value.length = e.detail.value;
                        Editor.UI.fire(this.$el, 'target-size-change', {
                            bubbles: !0,
                            detail: { path: this.target.path + '.length', value: e.detail.value }
                        });
                    },
                    confirmCommandStr(e) {
                        cc.log('PUT 确定了命令字符串的值为：', e.detail.value);
                        this.commandStr = e.detail.value;
                    },
                    changeCommandStr() {
                        this.commandStr = '';
                    },
                    resetCommandStr() {
                        this.commandStr = '---';
                        setTimeout(() => {
                            this.changeCommandStr();
                        }, 100);
                    },
                    modifyArray() {
                        let commandDatas = this.commandStr.split(' ');
                        if (
                            commandDatas.length < 2 ||
                            3 < commandDatas.length ||
                            ['a', 'd', 'mv'].indexOf(commandDatas[0]) == -1
                        ) {
                            cc.warn('PUT 数组调整命令有误，请把鼠标hover到输入框上看详情：', this.commandStr);
                            this.resetCommandStr();
                            return;
                        }

                        if (this.target.value.length == 0) {
                            cc.warn('PUT 空数组就不要使用命令行了吧', this.commandStr);
                            this.resetCommandStr();
                            return;
                        }

                        let command = commandDatas[0];
                        let modifyIndex = Number(commandDatas[1]);

                        if (isNaN(modifyIndex) || modifyIndex < 0 || modifyIndex >= this.target.value.length) {
                            cc.warn('PUT 数组调整值有误，请把鼠标hover到输入框上看详情：', this.commandStr);
                            this.resetCommandStr();
                            return;
                        }

                        let compSection = this.getCompSection(this);
                        if (!compSection) {
                            cc.error('PUT 没有compSection');
                            return;
                        }

                        let nodeUuid = compSection.target.node.value.uuid;
                        let node = getNodeByUuid(nodeUuid);
                        if (!node) {
                            cc.error('PUT 没有Node', nodeUuid);
                            return;
                        }

                        let prop = node._components;

                        let fullpath = this.target.path;
                        let paths = fullpath.split('.');
                        for (let index = 2; index < paths.length; index++) {
                            const pathKey = paths[index];
                            prop = prop[pathKey];
                            if (!prop) {
                                cc.error('PUT 没有pathKey：', pathKey, fullpath);
                                return;
                            }
                        }

                        if (!(prop instanceof Array)) {
                            cc.error('PUT prop竟然不是数组：', fullpath);
                            return;
                        }

                        switch (command) {
                            case 'a':
                                prop.splice(modifyIndex, 0, null);
                                break;
                            case 'd':
                                prop.splice(modifyIndex, 1);
                                break;
                            case 'mv':
                                {
                                    let modifyIndex2 = Number(commandDatas[2]);
                                    if (isNaN(modifyIndex2) || modifyIndex2 == modifyIndex) {
                                        cc.warn('PUT 数组调整值有误，请把鼠标hover到输入框上看详情：', this.commandStr);
                                        this.resetCommandStr();
                                        return;
                                    }

                                    if (modifyIndex2 > modifyIndex) modifyIndex2 -= 1;
                                    if (modifyIndex2 < 0 || modifyIndex2 >= this.target.value.length) {
                                        cc.warn('STORM 数组调整值有误，请把鼠标hover到输入框上看详情：', this.commandStr);
                                        this.resetCommandStr();
                                        return;
                                    }
                                    let data = prop[modifyIndex];
                                    prop.splice(modifyIndex, 1);
                                    prop.splice(modifyIndex2, 0, data);
                                }
                                break;
                            default:
                                break;
                        }

                        this.resetCommandStr();
                    },
                    getCompSection(el) {
                        if (el.target && el.target.node && el.target.node.value.uuid) {
                            return el;
                        } else if (!el.$parent) {
                            return null;
                        } else {
                            return this.getCompSection(el.$parent);
                        }
                    }
                },
                data() {
                    return {
                        commandStr: ''
                    };
                },
                watch: {
                    'target.value.length': 'changeCommandStr'
                }
            });
        }
    }
};

if (CC_EDITOR && window.hasOwnProperty('Vue')) {
    // 重载Vue.component，使其在加载一个默认的组件时，有一个回调，在这个回调里面进行vue组件的重载
    let oldVueComponent = Vue.component;
    Vue.component = function (name, dict) {
        oldVueComponent.call(this, name, dict);
        if (refactorCompDict.hasOwnProperty(name) && refactorCompDict[name].using === false) {
            refactorCompDict[name].using = true;
            refactorCompDict[name].call();
        }
        return Vue.options.components[name];
    };
}

// 自定义编辑器UI -----------------------------------------------------------------

let NewInspectors = {};

if (CC_EDITOR && window.hasOwnProperty('Vue')) {
    let customCompNames = {};

    NewInspectors.customCompNames = customCompNames;

    function handleCompValue(value) {
        if (value.attrs && value.attrs.type in customCompNames) {
            value.compType = customCompNames[value.attrs.type];
        }

        if (value.type == 'Array') {
            for (let index = 0; index < value.value.length; index++) {
                const subValue = value.value[index];
                handleCompValue(subValue);
            }
        } else if (value.type == 'Object') {
            for (let subKey in value.value) {
                let subVallue = value.value[subKey];
                handleCompValue(subVallue);
            }
        }
    }

    function handleCompType(compData) {
        for (let compKey in compData) {
            if ('__comps__' !== compKey) continue;
            let comps = compData[compKey];

            for (let index = 0; index < comps.length; ++index) {
                let comp = comps[index];
                for (let valueKey in comp.value) {
                    let value = comp.value[valueKey];
                    handleCompValue(value);
                }
            }
        }
    }

    // buildNode里面会处理各个class的compType
    let inspectorUtils = Editor.require('packages://inspector/utils/utils');
    let oldFunc = inspectorUtils.buildNode;
    inspectorUtils.buildNode = function (e, r, a) {
        oldFunc(e, r, a);
        handleCompType(r);
    };
}

module.exports = NewInspectors;
