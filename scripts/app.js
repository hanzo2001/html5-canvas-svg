window.addEventListener('load',function(){

	var ctx = new SVGCanvas( "SVG" );

	var cnv = ctx.getCanvas();
	cnv.width = '400';
	cnv.height= '400';

try {

	ctx.beginPath();
		ctx.fillStyle = "#333333";
		ctx.fillRect( 10 , 10 , 290 , 290 );
	ctx.closePath();
	addSvg(ctx);

	ctx.fillText( "Sample Text" , 310 , 10 );
	addSvg(ctx);

	ctx.fillStyle = "#000000";
	roundRect(ctx,200,200,25,25,10,true,false);
	addSvg(ctx);
} catch (e) {
	console.log(e);
}

},false);

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
	if (stroke === void 0) {stroke = true;}
	if (radius === void 0) {radius = 5;}
	ctx.beginPath();
		ctx.moveTo(x + radius, y);
		ctx.lineTo(x + width - radius, y);
		ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
		ctx.lineTo(x + width, y + height - radius);
		ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
		ctx.lineTo(x + radius, y + height);
		ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
		ctx.lineTo(x, y + radius);
		ctx.quadraticCurveTo(x, y, x + radius, y);
	ctx.closePath();
	if (stroke) {ctx.stroke();}
	if (fill) {ctx.fill();}        
}

function addSvg(ctx) {
	var div = document.createElement('div');
	div.innerHTML = ctx.toDataURL("image/svg+xml");
	document.body.appendChild(div);
}
