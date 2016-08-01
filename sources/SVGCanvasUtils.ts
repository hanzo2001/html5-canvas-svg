/// <reference path="./typings.d.ts" />

class SVGCanvasUtils {
	public currentPath: SVGCanvasPath;
	constructor(
		public canvas: HTMLCanvasElement,
		public ctx: CanvasRenderingContext2D,
		public paths: SVGCanvasPath[]
	) {
		this.currentPath = {
			type: "path",
			points: [],
			style: {}
		};
	}
	updateCanvasSettings(o: SVGCanvasOptions) {
		for (let i in o) {
			o.hasOwnProperty(i) && (this.ctx[i] = o[i]);
		}
		this.ctx.setLineDash(o.lineDash);
	}
	pushToStack() {
		if (this.currentPath.points.length > 0) {
			this.paths.push(this.currentPath);
			this.currentPath = {
				type: "path",
				points: [],
				style: {}
			}
		}
	}
	generateSVG(): string {
		let xml = '', i=0, s=this.paths.length;
		xml += '<?xml version="1.0" encoding="UTF-8"?>';
		xml += '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
		xml += '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="' + this.canvas.width + '" height="' + this.canvas.height + '" viewBox="0, 0, ' + this.canvas.width + ', ' + this.canvas.height + '">';
		while (i<s) {
			//console.log(i);
			let path=this.paths[i++], style='', attr:string;
			let re_color = /rgba\((\d*),(\d*),(\d*),(\d*\.?\d*)\)/;
			for (attr in path.style) {
				try {
					// Traduction de tous les codes de couleur rgba en hexa :
					let match = path.style[attr].match(re_color);
					if (match) {
						if (attr === 'fill')   {style += 'fill-opacity:'+match[4]+'; ';}
						else
						if (attr === 'stroke') {style += 'stroke-opacity:'+match[4]+'; ';}
						//let nn = Number(0x1000000+parseInt(match[1]) * 0x10000+parseInt(match[2]) * 0x100+parseInt(match[3])).toString(16).substring(1);
						path.style[attr] = '#'+Number(0x1000000 + parseInt(match[1]) * 0x10000 + parseInt(match[2]) * 0x100 + parseInt(match[3])).toString(16).substring(1);
					}
				} catch (e) { }
				// séparation de l'attribut font en deux attributs : font-size et font-family :
				if (attr === 'font') {
					var stl = path.style[attr].split(' ');
					if (stl.length === 2) {
						style += 'font-size:'+stl[0]+'; ';
						style += 'font-family:'+stl[1]+'; ';
					} else
						style += attr+':'+path.style[attr]+'; ';
				} else if ((attr === 'text-align') && (path.style[attr] === 'center')) {
					style += 'text-anchor:middle; text-align:center; ';
				} else if ((attr === 'text-align') && (path.style[attr] === 'left')) {
					style += 'text-anchor:start; text-align:left; ';
				} else if ((attr === 'text-align') && (path.style[attr] === 'right')) {
					style += 'text-anchor:end; text-align:right; ';
				} else
					style += attr+':'+path.style[attr]+'; ';
			}
			if (path.type == 'text') {
				xml += '<text x="'+path.x+'" y="'+path.y+'" style="'+style+'" ';
				if (path.hasOwnProperty('TRANSFORM')) {
					xml += 'transform="'+path.TRANSFORM+'" ';
				};
				xml += '>'+path.text+'</text>';
			} else if (path.type == 'path') {
				let points = '';
				for (var j = 0; j < path.points.length; j++) {
					let point = path.points[j];
					if (point.action == 'move') {
						points += 'M'+point.x+' '+point.y+' ';
					} else if (point.action == 'line') {
						points += 'L'+point.x+' '+point.y+' ';
					} else if (point.action == 'quadratic') {
						points += 'Q'+point.x1+' '+point.y1+' '+point.x+' '+point.y+' ';
					} else if (point.action == 'bezier') {
						points += 'C'+point.x2+' '+point.y2+' '+point.x1+' '+point.y1+' '+point.x+' '+point.y+' ';
					} else if (point.action == 'arc') {
						points += 'M'+point.x1+' '+point.y1+' A '+point.r +
							' '+point.r+' 0 '+point.wa+' '+point.acw+' '+point.x2+' '+point.y2+' ';
					} else if (point.action == 'circle') {
						points += 'M '+point.x+', '+point.y+' m '+(-point.r)+', 0'+' a '+point.r+','+point.r+' 0 1,0'+' '+(2 * point.r)+',0'+' a '+point.r+','+point.r+' 0 1,0'+' '+(-2 * point.r)+',0';
						//console.log(points);
					}
				}
				xml += '<path d="'+points+'" style="'+style+'" />';
			}
		}
		xml += '</svg>'
		return xml;
	}
	pushPoint(point:SVGCanvasPoint) {
		this.currentPath.points.push(point);
	}
	pathLength(): number {
		return this.currentPath.points.length;
	}
}
