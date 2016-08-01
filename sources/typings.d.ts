
type SVGCanvasPoint = {
	x?: number,
	y?: number,
	x1?: number,
	y1?: number,
	x2?: number,
	y2?: number,
	action?: string,
	r?: number,
	wa?: number,
	acw?: number
};

type SVGCanvasOptions = {
	lineDash: number[]
	strokeStyle: string;
	lineWidth: number;
	lineCap: string;
	lineJoin: string;
	miterLimit: number;
	fillStyle: string;
	shadowOffsetX: number;
	shadowOffsetY: number;
	shadowBlur: number;
	shadowColor: string;
	font: string;
	textAlign: string;
	textBaseline: string;
	globalAlpha: number;
	globalCompositeOperation: string;
}

type SVGCanvasPath = {type: string, points: SVGCanvasPoint[], style: Object, x?:number, y?:number, text?:string, TRANSFORM?:string};
