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

class SVGCanvas {
	protected canvas: HTMLCanvasElement;
	protected ctx: CanvasRenderingContext2D;
	protected elements: any[] = [];
	protected TRANSFORM: string[] = [];
	protected util: SVGCanvasUtils;
	lineDash: number[] = [];
	strokeStyle = 'black';
	lineWidth = 1;
	lineCap = 'butt';
	lineJoin = 'miter';
	miterLimit = 10;
	fillStyle = 'black';
	shadowOffsetX = 0;
	shadowOffsetY = 0;
	shadowBlur = 0;
	shadowColor = 'transparent black';
	font = '10px sans-serif';
	textAlign = 'start';
	textBaseline = 'alphabetic';
	globalAlpha = 1.0;
	globalCompositeOperation = 'source-over';
	constructor(id:string) {
		this.canvas = <HTMLCanvasElement>document.getElementById(id);
		this.ctx = this.canvas.getContext('2d');
		this.util = new SVGCanvasUtils(this.canvas,this.ctx,this.elements);
		let notEnum = {enumerable:false};
		Object.defineProperties(this,{
			canvas:   notEnum,
			ctx:      notEnum,
			elements: notEnum,
			lineDash: notEnum,
			TRANSFORM:notEnum,
			util:     notEnum
		});
	}
	getCanvas(): HTMLCanvasElement {
		return this.canvas;
	}
	getContext(): CanvasRenderingContext2D {
		return this.ctx;
	}
	polarToCartesian(centerX:number, centerY:number, radius:number, angleInRadians:number): SVGCanvasPoint {
		var x = centerX + radius * Math.cos(angleInRadians);
		var y = centerY + radius * Math.sin(angleInRadians);
		return {x,y};
	}
	beginPath() {
		this.util.pushToStack();
		this.ctx.beginPath();
	}
	closePath() {
		this.util.pushToStack();
		this.ctx.closePath();
	}
	moveTo(x:number, y:number) {
		this.util.pushPoint({x, y, action: 'move'});
		this.ctx.moveTo(x, y);
	}
	lineTo(x:number, y:number) {
		this.util.pushPoint({x, y, action: 'line'});
		this.ctx.lineTo(x, y);
	}
	quadraticCurveTo(cpx:number, cpy:number, x:number, y:number) {
		let x1=cpx, y1=cpy;
		this.util.pushPoint({x, y, x1, y1, action: 'quadratic'});
		this.ctx.quadraticCurveTo(cpx, cpy, x, y);
	}
	bezierCurveTo(cp1x:number, cp1y:number, cp2x:number, cp2y:number, x?:number, y?:number) {
		let x1=cp1x, y1=cp1y, x2=cp2x, y2=cp2y;
		this.util.pushPoint({x, y, x1, y1, x2, y2, action: 'bezier'});
		this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
	}
	arcTo(x1:number, y1:number, x2:number, y2:number, radius:number) {
		this.util.pushPoint({action: 'move', x: x1, y: y1});
		this.bezierCurveTo(x1, (y1 + radius), x2, (y2 + radius));
		this.ctx.arcTo(x1, y1, x2, y2, radius);
	}
	arc(cx:number, cy:number, radius:number, startAngle:number, endAngle:number, anticlockwise?:boolean) {
		//console.log(Math.abs(Math.abs(startAngle - endAngle) - Math.PI * 2));
		if (Math.abs(Math.abs(startAngle - endAngle) - Math.PI * 2) < 1e-9) {
			this.util.pushPoint({action: 'circle', r: radius, x: cx, y: cy});
			this.util.pushToStack();
		} else {
			//console.log("**************");
			//console.log("x=" + cx + " y=" + cy + " r=" + radius);
			//console.log(" startAngle=" + startAngle + " endAngle=" + endAngle);
			//console.log("dA>Math.PI="+(dA>Math.PI));
			//console.log(" anticlockwise=" + anticlockwise);
			//console.log("TEST="+((dA>Math.PI && !anticlockwise)||(dA<Math.PI && anticlockwise)));
			let angleDiff = endAngle - startAngle;
			while (angleDiff < 0) {angleDiff += 2 * Math.PI;}
			let start = this.polarToCartesian(cx, cy, radius, startAngle);
			let end = this.polarToCartesian(cx, cy, radius, endAngle);
			let largeArc = 1 * ~~(((angleDiff > Math.PI && !anticlockwise) || (angleDiff < Math.PI && anticlockwise)));
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
	}
	rect(x:number, y:number, width:number, height:number) {
		this.util.pushPoint({action: "move", x: x, y: y});
		this.util.pushPoint({action: "line", x: x + width, y: y});
		this.util.pushPoint({action: "line", x: x + width, y: y + height });
		this.util.pushPoint({action: "line", x: x, y: y + height});
		this.util.pushPoint({action: "line", x: x, y: y});
		this.ctx.rect(x, y, width, height);
	}
	clearRect(x:number, y:number, width:number, height:number) {
		this.util.pushPoint({action: "move", x: x, y: y});
		this.util.pushPoint({action: "line", x: x + width, y: y});
		this.util.pushPoint({action: "line", x: x + width, y: y + height});
		this.util.pushPoint({action: "line", x: x, y: y + height});
		this.util.pushPoint({action: "line", x: x, y: y});
		this.ctx.clearRect(x, y, width, height);
	}
	fillRect(x:number, y:number, width:number, height:number) {
		let rect = {type: "path", style: {}, points: []};
		this.util.pushToStack();
		rect.points.push({action: "move", x: x, y: y});
		rect.points.push({action: "line", x: x + width, y: y});
		rect.points.push({action: "line", x: x + width, y: y + height});
		rect.points.push({action: "line", x: x, y: y + height});
		rect.points.push({action: "line", x: x, y: y});
		rect.style["fill"] = this.ctx.fillStyle = this.fillStyle;
		this.elements.push(rect);
		this.util.updateCanvasSettings(this);
		this.ctx.fillRect(x, y, width, height);
	}
	strokeRect(x:number, y:number, width:number, height:number) {
		this.util.pushToStack();
		let rect = {type: "path", style: {}, points: []};
		rect.points.push({action: "move", x: x, y: y});
		rect.points.push({action: "line", x: x + width, y: y});
		rect.points.push({action: "line", x: x + width, y: y + height});
		rect.points.push({action: "line", x: x, y: y + height});
		rect.points.push({action: "line", x: x, y: y});
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
	}
	isPointInPath(x:number, y:number) {
		return this.ctx.isPointInPath(x, y);
	}
	stroke() {
		let path: SVGCanvasPath = this.util.pathLength() > 0
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
		if (!path.style["fill"]) {path.style["fill"] = "none";}
		this.util.updateCanvasSettings(this);
		this.ctx.stroke();
	}
	fill() {
		let path: SVGCanvasPath = this.util.pathLength() > 0
			? this.util.currentPath
			: this.elements[this.elements.length - 1];
		path.style["fill"] = this.ctx.fillStyle = this.fillStyle;
		this.util.updateCanvasSettings(this);
		this.ctx.fill();
	}
	strokeText(text:string, x:number, y:number) {
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
	}
	fillText(text:string, x:number, y:number) {
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
	}
	measureText(text:string) {
		return this.ctx.measureText(text);
	}
	clip() {
		this.util.updateCanvasSettings(this);
		this.ctx.clip();
	}
	save() {
		this.TRANSFORM = [];
		this.ctx.save();
	}
	restore() {
		this.TRANSFORM = [];
		this.ctx.restore();
	}
	createLinearGradient(x0:number, y0:number, x1:number, y1:number) {
		return this.ctx.createLinearGradient(x0, y0, x1, y1);
	}
	createRadialGradient(x0:number, y0:number, r0:number, x1:number, y1:number, r1:number) {
		return this.ctx.createRadialGradient(x0, y0, r0, x1, y1, r1);
	}
	createPattern(image, repetition) {
		return this.ctx.createPattern(image, repetition);
	}
	createImageData(sw:number, sh:number)
	createImageData(imageData:ImageData)
	createImageData() {
		if (arguments.length === 1) {
			let imageData = arguments[0];
			return this.ctx.createImageData(imageData);
		}
		let sw = arguments[0]
		let sh = arguments[1];
		return this.ctx.createImageData(sw, sh);
	}
	getImageData(sx:number, sy:number, sw:number, sh:number): ImageData {
		return this.ctx.getImageData(sx, sy, sw, sh);
	}
	putImageData(imagedata:ImageData, dx:number, dy:number, dirtyX:number, dirtyY:number, dirtyWidth:number, dirtyHeight:number) {
		return this.ctx.putImageData(imagedata, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight);
	}
	drawImage() {
		return (arguments.length > 5)
			? this.ctx.drawImage(arguments[0].value, arguments[1].value, arguments[2].value, arguments[3].value, arguments[4].value)
			: this.ctx.drawImage(arguments[0].value, arguments[1].value, arguments[2].value, arguments[3].value, arguments[4].value, arguments[5].value, arguments[6].value, arguments[7].value, arguments[8].value);
	}
	scale(x:number, y:number) {
		this.ctx.scale(x, y);
	}
	rotate(angle:number) {
		while (angle < 0) {angle += 2 * Math.PI;}
		angle = angle * 180 / Math.PI;
		this.TRANSFORM.push("rotate(" + angle + ")");
		this.ctx.rotate(angle);
	}
	translate(x:number, y:number) {
		this.TRANSFORM.push("translate(" + x + "," + y + ")");
		this.ctx.translate(x, y);
	}
	setLineDash(tab:number[]) {
		this.lineDash = tab;
	}
	transform(m11, m12, m21, m22, dx, dy) {
		this.ctx.transform(m11, m12, m21, m22, dx, dy);
	}
	setTransform(m11, m12, m21, m22, dx, dy) {
		this.ctx.setTransform(m11, m12, m21, m22, dx, dy);
	}
	toDataURL(type, args) {
		if (type == "image/svg+xml") {
			return this.util.generateSVG();
		} else {
			return this.canvas.toDataURL(type, args);
		}
	}
}

(<any>window).SVGCanvas = SVGCanvas;
