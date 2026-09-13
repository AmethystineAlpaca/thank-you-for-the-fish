const BASE_WIDTH=360,BASE_HEIGHT=270,MIN_SCALE=.6,MAX_SCALE=1.5;
function sizeForScale(value){const scale=Math.max(MIN_SCALE,Math.min(MAX_SCALE,Number.isFinite(value)?value:1));return {scale,width:Math.round(BASE_WIDTH*scale),height:Math.round(BASE_HEIGHT*scale)}}
// Project the pointer displacement onto the original diagonal. Horizontal,
// vertical and diagonal drags all change the whole widget proportionally.
function scaleForDrag(start,dx,dy){return sizeForScale(start+(dx*BASE_WIDTH+dy*BASE_HEIGHT)/(BASE_WIDTH**2+BASE_HEIGHT**2)).scale}
module.exports={sizeForScale,scaleForDrag};
