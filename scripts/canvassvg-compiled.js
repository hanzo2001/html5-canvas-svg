/// <reference path="./typings.d.ts" />
var SVGCanvasUtils = (function () {
    function SVGCanvasUtils(canvas, ctx, paths) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.paths = paths;
        this.currentPath = {
            type: "path",
            points: [],
            style: {}
        };
    }
    SVGCanvasUtils.prototype.updateCanvasSettings = function (o) {
        for (var i in o) {
            o.hasOwnProperty(i) && (this.ctx[i] = o[i]);
        }
        this.ctx.setLineDash(o.lineDash);
    };
    SVGCanvasUtils.prototype.pushToStack = function () {
        if (this.currentPath.points.length > 0) {
            this.paths.push(this.currentPath);
            this.currentPath = {
                type: "path",
                points: [],
                style: {}
            };
        }
    };
    SVGCanvasUtils.prototype.generateSVG = function () {
        var xml = '', i = 0, s = this.paths.length;
        xml += '<?xml version="1.0" encoding="UTF-8"?>';
        xml += '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
        xml += '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="' + this.canvas.width + '" height="' + this.canvas.height + '" viewBox="0, 0, ' + this.canvas.width + ', ' + this.canvas.height + '">';
        while (i < s) {
            //console.log(i);
            var path = this.paths[i++], style = '', attr = void 0;
            var re_color = /rgba\((\d*),(\d*),(\d*),(\d*\.?\d*)\)/;
            for (attr in path.style) {
                try {
                    // Traduction de tous les codes de couleur rgba en hexa :
                    var match = path.style[attr].match(re_color);
                    if (match) {
                        if (attr === 'fill') {
                            style += 'fill-opacity:' + match[4] + '; ';
                        }
                        else if (attr === 'stroke') {
                            style += 'stroke-opacity:' + match[4] + '; ';
                        }
                        //let nn = Number(0x1000000+parseInt(match[1]) * 0x10000+parseInt(match[2]) * 0x100+parseInt(match[3])).toString(16).substring(1);
                        path.style[attr] = '#' + Number(0x1000000 + parseInt(match[1]) * 0x10000 + parseInt(match[2]) * 0x100 + parseInt(match[3])).toString(16).substring(1);
                    }
                }
                catch (e) { }
                // séparation de l'attribut font en deux attributs : font-size et font-family :
                if (attr === 'font') {
                    var stl = path.style[attr].split(' ');
                    if (stl.length === 2) {
                        style += 'font-size:' + stl[0] + '; ';
                        style += 'font-family:' + stl[1] + '; ';
                    }
                    else
                        style += attr + ':' + path.style[attr] + '; ';
                }
                else if ((attr === 'text-align') && (path.style[attr] === 'center')) {
                    style += 'text-anchor:middle; text-align:center; ';
                }
                else if ((attr === 'text-align') && (path.style[attr] === 'left')) {
                    style += 'text-anchor:start; text-align:left; ';
                }
                else if ((attr === 'text-align') && (path.style[attr] === 'right')) {
                    style += 'text-anchor:end; text-align:right; ';
                }
                else
                    style += attr + ':' + path.style[attr] + '; ';
            }
            if (path.type == 'text') {
                xml += '<text x="' + path.x + '" y="' + path.y + '" style="' + style + '" ';
                if (path.hasOwnProperty('TRANSFORM')) {
                    xml += 'transform="' + path.TRANSFORM + '" ';
                }
                ;
                xml += '>' + path.text + '</text>';
            }
            else if (path.type == 'path') {
                var points = '';
                for (var j = 0; j < path.points.length; j++) {
                    var point = path.points[j];
                    if (point.action == 'move') {
                        points += 'M' + point.x + ' ' + point.y + ' ';
                    }
                    else if (point.action == 'line') {
                        points += 'L' + point.x + ' ' + point.y + ' ';
                    }
                    else if (point.action == 'quadratic') {
                        points += 'Q' + point.x1 + ' ' + point.y1 + ' ' + point.x + ' ' + point.y + ' ';
                    }
                    else if (point.action == 'bezier') {
                        points += 'C' + point.x2 + ' ' + point.y2 + ' ' + point.x1 + ' ' + point.y1 + ' ' + point.x + ' ' + point.y + ' ';
                    }
                    else if (point.action == 'arc') {
                        points += 'M' + point.x1 + ' ' + point.y1 + ' A ' + point.r +
                            ' ' + point.r + ' 0 ' + point.wa + ' ' + point.acw + ' ' + point.x2 + ' ' + point.y2 + ' ';
                    }
                    else if (point.action == 'circle') {
                        points += 'M ' + point.x + ', ' + point.y + ' m ' + (-point.r) + ', 0' + ' a ' + point.r + ',' + point.r + ' 0 1,0' + ' ' + (2 * point.r) + ',0' + ' a ' + point.r + ',' + point.r + ' 0 1,0' + ' ' + (-2 * point.r) + ',0';
                    }
                }
                xml += '<path d="' + points + '" style="' + style + '" />';
            }
        }
        xml += '</svg>';
        return xml;
    };
    SVGCanvasUtils.prototype.pushPoint = function (point) {
        this.currentPath.points.push(point);
    };
    SVGCanvasUtils.prototype.pathLength = function () {
        return this.currentPath.points.length;
    };
    return SVGCanvasUtils;
}());
/*!
 * HTML5 Canvas SVG Alpha 2.0
 * http://specinnovations.com/
 *
 * Copyright 2011, SPEC Innovations
 * Dual licensed under the MIT or Apache 2.0.
 * http://code.google.com/p/html5-canvas-svg/
 * Alex Rhea, Chris Ritter
 *
 * Date: Tue Aug 09 2011 -0400
 */
/*!
 * Original transcode by Santiago Acosta
 * Original repo: https://github.com/dgpad/dgpad
 * File source: https://github.com/hanzo2001/dgpad/blob/master/scripts/svgcanvas.js
 *
 * Modifications by Eric Hakenholtz (DGPad Author)
 * - fixed svg header generation
 * - maybe more?
 *
 * Deviation from the original
 * - create TypeScript source file
 * - swap some things around
 * - no new functionality
 * Date: Mon Aug 01 2016 -0500
 */
/// <reference path="./SVGCanvasUtils.ts" />
var SVGCanvas = (function () {
    function SVGCanvas(id) {
        this.elements = [];
        this.TRANSFORM = [];
        this.lineDash = [];
        this.strokeStyle = 'black';
        this.lineWidth = 1;
        this.lineCap = 'butt';
        this.lineJoin = 'miter';
        this.miterLimit = 10;
        this.fillStyle = 'black';
        this.shadowOffsetX = 0;
        this.shadowOffsetY = 0;
        this.shadowBlur = 0;
        this.shadowColor = 'transparent black';
        this.font = '10px sans-serif';
        this.textAlign = 'start';
        this.textBaseline = 'alphabetic';
        this.globalAlpha = 1.0;
        this.globalCompositeOperation = 'source-over';
        this.canvas = document.getElementById(id);
        this.ctx = this.canvas.getContext('2d');
        this.util = new SVGCanvasUtils(this.canvas, this.ctx, this.elements);
        var notEnum = { enumerable: false };
        Object.defineProperties(this, {
            canvas: notEnum,
            ctx: notEnum,
            elements: notEnum,
            lineDash: notEnum,
            TRANSFORM: notEnum,
            util: notEnum
        });
    }
    SVGCanvas.prototype.getCanvas = function () {
        return this.canvas;
    };
    SVGCanvas.prototype.getContext = function () {
        return this.ctx;
    };
    SVGCanvas.prototype.polarToCartesian = function (centerX, centerY, radius, angleInRadians) {
        var x = centerX + radius * Math.cos(angleInRadians);
        var y = centerY + radius * Math.sin(angleInRadians);
        return { x: x, y: y };
    };
    SVGCanvas.prototype.beginPath = function () {
        this.util.pushToStack();
        this.ctx.beginPath();
    };
    SVGCanvas.prototype.closePath = function () {
        this.util.pushToStack();
        this.ctx.closePath();
    };
    SVGCanvas.prototype.moveTo = function (x, y) {
        this.util.pushPoint({ x: x, y: y, action: 'move' });
        this.ctx.moveTo(x, y);
    };
    SVGCanvas.prototype.lineTo = function (x, y) {
        this.util.pushPoint({ x: x, y: y, action: 'line' });
        this.ctx.lineTo(x, y);
    };
    SVGCanvas.prototype.quadraticCurveTo = function (cpx, cpy, x, y) {
        var x1 = cpx, y1 = cpy;
        this.util.pushPoint({ x: x, y: y, x1: x1, y1: y1, action: 'quadratic' });
        this.ctx.quadraticCurveTo(cpx, cpy, x, y);
    };
    SVGCanvas.prototype.bezierCurveTo = function (cp1x, cp1y, cp2x, cp2y, x, y) {
        var x1 = cp1x, y1 = cp1y, x2 = cp2x, y2 = cp2y;
        this.util.pushPoint({ x: x, y: y, x1: x1, y1: y1, x2: x2, y2: y2, action: 'bezier' });
        this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
    };
    SVGCanvas.prototype.arcTo = function (x1, y1, x2, y2, radius) {
        this.util.pushPoint({ action: 'move', x: x1, y: y1 });
        this.bezierCurveTo(x1, (y1 + radius), x2, (y2 + radius));
        this.ctx.arcTo(x1, y1, x2, y2, radius);
    };
    SVGCanvas.prototype.arc = function (cx, cy, radius, startAngle, endAngle, anticlockwise) {
        //console.log(Math.abs(Math.abs(startAngle - endAngle) - Math.PI * 2));
        if (Math.abs(Math.abs(startAngle - endAngle) - Math.PI * 2) < 1e-9) {
            this.util.pushPoint({ action: 'circle', r: radius, x: cx, y: cy });
            this.util.pushToStack();
        }
        else {
            //console.log("**************");
            //console.log("x=" + cx + " y=" + cy + " r=" + radius);
            //console.log(" startAngle=" + startAngle + " endAngle=" + endAngle);
            //console.log("dA>Math.PI="+(dA>Math.PI));
            //console.log(" anticlockwise=" + anticlockwise);
            //console.log("TEST="+((dA>Math.PI && !anticlockwise)||(dA<Math.PI && anticlockwise)));
            var angleDiff = endAngle - startAngle;
            while (angleDiff < 0) {
                angleDiff += 2 * Math.PI;
            }
            var start = this.polarToCartesian(cx, cy, radius, startAngle);
            var end = this.polarToCartesian(cx, cy, radius, endAngle);
            var largeArc = 1 * ~~(((angleDiff > Math.PI && !anticlockwise) || (angleDiff < Math.PI && anticlockwise)));
            this.util.pushPoint({
                action: 'arc',
                r: radius,
                x1: start.x,
                y1: start.y,
                x2: end.x,
                y2: end.y,
                acw: 1 - 1 * ~~anticlockwise,
                wa: largeArc
            });
            this.util.pushToStack();
        }
    };
    SVGCanvas.prototype.rect = function (x, y, width, height) {
        this.util.pushPoint({ action: "move", x: x, y: y });
        this.util.pushPoint({ action: "line", x: x + width, y: y });
        this.util.pushPoint({ action: "line", x: x + width, y: y + height });
        this.util.pushPoint({ action: "line", x: x, y: y + height });
        this.util.pushPoint({ action: "line", x: x, y: y });
        this.ctx.rect(x, y, width, height);
    };
    SVGCanvas.prototype.clearRect = function (x, y, width, height) {
        this.util.pushPoint({ action: "move", x: x, y: y });
        this.util.pushPoint({ action: "line", x: x + width, y: y });
        this.util.pushPoint({ action: "line", x: x + width, y: y + height });
        this.util.pushPoint({ action: "line", x: x, y: y + height });
        this.util.pushPoint({ action: "line", x: x, y: y });
        this.ctx.clearRect(x, y, width, height);
    };
    SVGCanvas.prototype.fillRect = function (x, y, width, height) {
        var rect = { type: "path", style: {}, points: [] };
        this.util.pushToStack();
        rect.points.push({ action: "move", x: x, y: y });
        rect.points.push({ action: "line", x: x + width, y: y });
        rect.points.push({ action: "line", x: x + width, y: y + height });
        rect.points.push({ action: "line", x: x, y: y + height });
        rect.points.push({ action: "line", x: x, y: y });
        rect.style["fill"] = this.ctx.fillStyle = this.fillStyle;
        this.elements.push(rect);
        this.util.updateCanvasSettings(this);
        this.ctx.fillRect(x, y, width, height);
    };
    SVGCanvas.prototype.strokeRect = function (x, y, width, height) {
        this.util.pushToStack();
        var rect = { type: "path", style: {}, points: [] };
        rect.points.push({ action: "move", x: x, y: y });
        rect.points.push({ action: "line", x: x + width, y: y });
        rect.points.push({ action: "line", x: x + width, y: y + height });
        rect.points.push({ action: "line", x: x, y: y + height });
        rect.points.push({ action: "line", x: x, y: y });
        rect.style["stroke"] = this.ctx.strokeStyle = this.strokeStyle;
        rect.style["stroke-width"] = this.ctx.lineWidth = this.lineWidth;
        rect.style["stroke-linecap"] = this.ctx.lineCap = this.lineCap;
        rect.style["stroke-miterlimit"] = this.ctx.miterLimit = this.miterLimit;
        rect.style["stroke-linejoin"] = this.ctx.lineJoin = this.lineJoin;
        if (this.lineDash.length > 0) {
            rect.style["stroke-dasharray"] = this.lineDash.join(",");
        }
        this.elements.push(rect);
        this.util.updateCanvasSettings(this);
        this.ctx.strokeRect(x, y, width, height);
    };
    SVGCanvas.prototype.isPointInPath = function (x, y) {
        return this.ctx.isPointInPath(x, y);
    };
    SVGCanvas.prototype.stroke = function () {
        var path = this.util.pathLength() > 0
            ? this.util.currentPath
            : this.elements[this.elements.length - 1];
        path.style["stroke"] = this.ctx.strokeStyle = this.strokeStyle;
        path.style["stroke-width"] = this.ctx.lineWidth = this.lineWidth;
        path.style["stroke-linecap"] = this.ctx.lineCap = this.lineCap;
        path.style["stroke-miterlimit"] = this.ctx.miterLimit = this.miterLimit;
        path.style["stroke-linejoin"] = this.ctx.lineJoin = this.lineJoin;
        if (this.lineDash.length > 0) {
            path.style["stroke-dasharray"] = this.lineDash.join(",");
        }
        if (!path.style["fill"]) {
            path.style["fill"] = "none";
        }
        this.util.updateCanvasSettings(this);
        this.ctx.stroke();
    };
    SVGCanvas.prototype.fill = function () {
        var path = this.util.pathLength() > 0
            ? this.util.currentPath
            : this.elements[this.elements.length - 1];
        path.style["fill"] = this.ctx.fillStyle = this.fillStyle;
        this.util.updateCanvasSettings(this);
        this.ctx.fill();
    };
    SVGCanvas.prototype.strokeText = function (text, x, y) {
        this.ctx.font = this.font;
        this.elements.push({
            type: "text",
            text: text,
            x: x,
            y: y,
            style: {
                "font": this.font,
                "text-align": this.textAlign,
                "alignment-baseline": this.textBaseline,
                "fill": this.strokeStyle
            }
        });
        this.util.updateCanvasSettings(this);
        this.ctx.strokeText(text, x, y);
    };
    SVGCanvas.prototype.fillText = function (text, x, y) {
        this.ctx.font = this.font;
        var items = {
            type: "text",
            text: text,
            x: x,
            y: y,
            style: {
                "font": this.font,
                "text-align": this.textAlign,
                "alignment-baseline": this.textBaseline,
                "fill": this.fillStyle
            }
        };
        if (this.TRANSFORM.length > 0) {
            items['TRANSFORM'] = this.TRANSFORM.join(" ");
        }
        this.elements.push(items);
        this.util.updateCanvasSettings(this);
        this.ctx.fillText(text, x, y);
    };
    SVGCanvas.prototype.measureText = function (text) {
        return this.ctx.measureText(text);
    };
    SVGCanvas.prototype.clip = function () {
        this.util.updateCanvasSettings(this);
        this.ctx.clip();
    };
    SVGCanvas.prototype.save = function () {
        this.TRANSFORM = [];
        this.ctx.save();
    };
    SVGCanvas.prototype.restore = function () {
        this.TRANSFORM = [];
        this.ctx.restore();
    };
    SVGCanvas.prototype.createLinearGradient = function (x0, y0, x1, y1) {
        return this.ctx.createLinearGradient(x0, y0, x1, y1);
    };
    SVGCanvas.prototype.createRadialGradient = function (x0, y0, r0, x1, y1, r1) {
        return this.ctx.createRadialGradient(x0, y0, r0, x1, y1, r1);
    };
    SVGCanvas.prototype.createPattern = function (image, repetition) {
        return this.ctx.createPattern(image, repetition);
    };
    SVGCanvas.prototype.createImageData = function () {
        if (arguments.length === 1) {
            var imageData = arguments[0];
            return this.ctx.createImageData(imageData);
        }
        var sw = arguments[0];
        var sh = arguments[1];
        return this.ctx.createImageData(sw, sh);
    };
    SVGCanvas.prototype.getImageData = function (sx, sy, sw, sh) {
        return this.ctx.getImageData(sx, sy, sw, sh);
    };
    SVGCanvas.prototype.putImageData = function (imagedata, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight) {
        return this.ctx.putImageData(imagedata, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight);
    };
    SVGCanvas.prototype.drawImage = function () {
        return (arguments.length > 5)
            ? this.ctx.drawImage(arguments[0].value, arguments[1].value, arguments[2].value, arguments[3].value, arguments[4].value)
            : this.ctx.drawImage(arguments[0].value, arguments[1].value, arguments[2].value, arguments[3].value, arguments[4].value, arguments[5].value, arguments[6].value, arguments[7].value, arguments[8].value);
    };
    SVGCanvas.prototype.scale = function (x, y) {
        this.ctx.scale(x, y);
    };
    SVGCanvas.prototype.rotate = function (angle) {
        while (angle < 0) {
            angle += 2 * Math.PI;
        }
        angle = angle * 180 / Math.PI;
        this.TRANSFORM.push("rotate(" + angle + ")");
        this.ctx.rotate(angle);
    };
    SVGCanvas.prototype.translate = function (x, y) {
        this.TRANSFORM.push("translate(" + x + "," + y + ")");
        this.ctx.translate(x, y);
    };
    SVGCanvas.prototype.setLineDash = function (tab) {
        this.lineDash = tab;
    };
    SVGCanvas.prototype.transform = function (m11, m12, m21, m22, dx, dy) {
        this.ctx.transform(m11, m12, m21, m22, dx, dy);
    };
    SVGCanvas.prototype.setTransform = function (m11, m12, m21, m22, dx, dy) {
        this.ctx.setTransform(m11, m12, m21, m22, dx, dy);
    };
    SVGCanvas.prototype.toDataURL = function (type, args) {
        if (type == "image/svg+xml") {
            return this.util.generateSVG();
        }
        else {
            return this.canvas.toDataURL(type, args);
        }
    };
    return SVGCanvas;
}());
window.SVGCanvas = SVGCanvas;
