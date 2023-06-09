
/**
 * 气泡窗类
 * @class
 * 
*/
import "./prompt.css"
class Prompt {
    /**
     * @param {Cesium.Viewer} viewer 地图viewer对象 
     * @param {Object} opt 
     * @param {Cesium.Cartesian3 | Array} [opt.position] 弹窗坐标 （type=2时生效）
     * @param {Boolean} opt.show 是否显示 
     * @param {Function} [opt.success] 创建成功的回调函数
     * @param {Number} [opt.type=1] 1~位置变化提示框 / 2~固定坐标提示框
     * @param {Cesium.Cartesian3 | Array} opt.position 固定坐标提示框的坐标（ cartesian3 / [101,30] ），type为1时，可不设置此参数
     * @param {Boolean} [opt.anchor=true] 是否显示锚点
     * @param {Boolean} [opt.closeBtn=true] 是否显示关闭按钮
     * @param {String} opt.className 自定义class
     * @param {String} opt.content 弹窗内容
     * @param {Function} [opt.close] 关闭弹窗时的回调函数
     * @param {Object} [opt.offset] 偏移参数
     * @param {Number} [opt.offset.x] 横坐标偏移像素单位
     * @param {Number} [opt.offset.y] 纵坐标偏移像素单位
     * @param {Object} [opt.style] 弹窗面板样式
     * @param {String} [opt.style.background='white'] 背景色
     * @param {String} [opt.style.boxShadow] 弹窗阴影（css属性）
     * @param {String} [opt.style.color] 弹窗颜色
     * 
     */
    constructor(viewer, opt) {
        this.viewer = viewer;
        if (!this.viewer) return;
        this.type = "prompt";
        // 默认值
        opt = opt || {};
        const promptType = opt.type == undefined ? 1 : opt.type;
        let defaultOpt = {
            id: (new Date().getTime() + "" + Math.floor(Math.random() * 10000)),
            type: promptType,
            anchor: promptType == 2 ? true : false,
            closeBtn: promptType == 2 ? true : false,
            offset: promptType == 2 ? { x: 0, y: -20 } : { x: 10, y: 10 },
            content: "",
            show: true,
            style: {
                background: "rgba(0,0,0,0.5)",
                color: "white"
            }
        }

        this.opt = Object.assign(defaultOpt, opt);

        /**
         * @property {Object} attr 相关属性
         */
        this.attr = this.opt;
        // ====================== 创建弹窗内容 start ======================
        const mapid = this.viewer.container.id;

        /**
         * @property {Boolearn} isShow 当前显示状态
         */
        this.isShow = this.opt.show == undefined ? true : this.opt.show; // 是否显示
        let anchorHtml = ``;
        let closeHtml = ``;
        const background = this.opt.style.background;
        const color = this.opt.style.color;
        if (this.opt.anchor) {
            anchorHtml += `
            <div class="prompt-anchor-container">
                <div class="prompt-anchor" style="background:${background} !important;">
                </div>
            </div>
            `;
        }
        if (this.opt.closeBtn) { // 移动提示框 不显示关闭按钮
            closeHtml = `<a class="prompt-close" attr="${this.opt.id}" id="prompt-close-${this.opt.id}">x</a>`;
        }
        let boxShadow = this.opt.style.boxShadow;
        const promptId = "prompt-" + this.opt.id;
        const promptConenet = `
                <!-- 文本内容 -->
                <div class="prompt-content-container" style="background:${background} !important;color:${color} !important;box-shadow:${boxShadow} !important">
                    <div class="prompt-content" id="prompt-content-${this.opt.id}">
                        ${this.opt.content}
                    </div>
                </div>
                <!-- 锚 -->
                ${anchorHtml}
                <!-- 关闭按钮 -->
                ${closeHtml}
        `;
        // 构建弹窗元素 
        this.promptDiv = window.document.createElement("div");
        this.promptDiv.className = `easy3d-prompt ${this.opt.className}`;
        this.promptDiv.id = promptId;
        this.promptDiv.innerHTML = promptConenet;
        let mapDom = window.document.getElementById(mapid);
        mapDom.appendChild(this.promptDiv);
        const clsBtn = window.document.getElementById(`prompt-close-${this.opt.id}`);
        let that = this;
        if (clsBtn) {
            clsBtn.addEventListener("click", (e) => {
                that.hide();
                if (that.opt.close) that.opt.close();
            })
        }

        /**
         * @property {Object} promptDom 弹窗div
         */
        this.promptDom = window.document.getElementById(promptId);

        this.position = this.transPosition(this.opt.position);
        // ====================== 创建弹窗内容 end ======================

        if (promptType == 2) this.bindRender(); // 固定位置弹窗 绑定实时渲染 当到地球背面时 隐藏
        if (this.opt.show == false) this.hide();
        this.containerW = this.viewer.container.offsetWidth;
        this.containerH = this.viewer.container.offsetHeight;
        this.containerLeft = this.viewer.container.offsetLeft;
        this.containerTop = this.viewer.container.offsetTop;

        /**
        * @property {Number} contentW 弹窗宽度
        */
        this.contentW = Math.ceil(Number(this.promptDom.offsetWidth)); // 宽度

        /**
         * @property {Number} contentH 弹窗高度
         */
        this.contentH = this.promptDom.offsetHeight; // 高度

        if (this.opt.success) this.opt.success();
    }

    /**
     * 销毁
     */
    destroy() {
        if (this.promptDiv) {
            window.document.getElementById(this.viewer.container.id).removeChild(this.promptDiv);
            this.promptDiv = null;
        }
        if (this.rendHandler) {
            this.rendHandler();
            this.rendHandler = null;
        }
    }
    // 实时监听
    bindRender() {
        let that = this;
        this.rendHandler = this.viewer.scene.postRender.addEventListener(function () {
            if (!that.isShow && that.promptDom) {
                that.promptDom.style.display = "none";
                return;
            }
            if (!that.position) return;
            if (that.position instanceof Cesium.Cartesian3) {
                let px = Cesium.SceneTransforms.wgs84ToWindowCoordinates(that.viewer.scene, that.position);
                if (!px) return;
                const occluder = new Cesium.EllipsoidalOccluder(that.viewer.scene.globe.ellipsoid, that.viewer.scene.camera.position);
                // 当前点位是否可见 是否在地球背面
                const res = occluder.isPointVisible(that.position);
                if (res) {
                    if (that.promptDom) that.promptDom.style.display = "block";
                } else {
                    if (that.promptDom) that.promptDom.style.display = "none";
                }
                that.setByPX({
                    x: px.x,
                    y: px.y
                });
            } else {
                that.setByPX({
                    x: that.position.x,
                    y: that.position.y
                });
            }

        }, this);
    }

    /**
     * 
     * @param {Cesium.Cartesian3 | Object} px 弹窗坐标
     * @param {String} html 弹窗内容
     */
    update(px, html) {
        if (px instanceof Cesium.Cartesian3) {
            this.position = px.clone();
            px = Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.viewer.scene, px);
        }
        this.contentW = Math.ceil(Number(this.promptDom.offsetWidth)); // 宽度
        this.contentH = this.promptDom.offsetHeight; // 高度
        if (px) this.setByPX(px);
        if (html) this.setContent(html);
    }

    // 判断是否在当前视野内
    isInView() {
        if (!this.position) return false;
        let px = null;
        if (this.position instanceof Cesium.Cartesian2) {
            px = this.position;
        } else {
            px = Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.viewer.scene, this.position);
        }
        const occluder = new Cesium.EllipsoidalOccluder(this.viewer.scene.globe.ellipsoid, this.viewer.scene.camera.position);
        // 是否在地球背面
        const res = occluder.isPointVisible(this.position);
        let isin = false;
        if (!px) return isin;
        if (
            px.x > this.containerLeft &&
            px.x < (this.containerLeft + this.containerW) &&
            px.y > this.containerTop &&
            px.y < (this.containerTop + this.containerH)
        ) {
            isin = true;
        }
        return res && isin;
    }

    /**
     * 是否可见
     * @param {Boolean} isShow true可见，false不可见
     */
    setVisible(isShow) {
        let isin = this.isInView(this.position);
        if (isin && isShow) {
            this.isShow = true;
            if (this.promptDom) this.promptDom.style.display = "block";
        } else {
            this.isShow = false;
            if (this.promptDom) this.promptDom.style.display = "none";
        }
    }

    /**
     * 显示
     */
    show() {
        this.setVisible(true);
    }

    /**
     * 隐藏
     */
    hide() {
        this.setVisible(false);
    }

    /**
     * 设置弹窗内容
     * @param {String} content 内容 
     */
    setContent(content) {
        let pc = window.document.getElementById(`prompt-content-${this.opt.id}`);
        pc.innerHTML = content;
    }

    /**
     * 设置弹窗坐标
     * @param {Object} opt 屏幕坐标
     */
    setByPX(opt) {
        if (!opt) return;
        if (this.promptDom) {
            const contentW = this.promptDom.offsetWidth; // 宽度
            const contentH = this.promptDom.offsetHeight; // 高度
            if (this.opt.type == 1) {
                this.promptDom.style.left = ((Number(opt.x) + Number(this.opt.offset.x || 0))) + "px";
                this.promptDom.style.top = ((Number(opt.y) + Number(this.opt.offset.y || 0))) + "px";
            } else {
                this.promptDom.style.left = ((Number(opt.x) + Number(this.opt.offset.x || 0)) - Number(this.contentW) / 2) + "px";
                this.promptDom.style.top = ((Number(opt.y) + Number(this.opt.offset.y || 0)) - Number(this.contentH)) + "px";
            }
        }
    }

    // 坐标转换
    transPosition(p) {
        let position;
        if (Array.isArray(p)) {
            const posi = Cesium.Cartesian3.fromDegrees(p[0], p[1], p[2] || 0);
            position = posi.clone();
        } else if (p instanceof Cesium.Cartesian3) {
            position = p.clone();
        } else { // 像素类型
            position = p;
        }
        return position;
    }
}

export default Prompt;