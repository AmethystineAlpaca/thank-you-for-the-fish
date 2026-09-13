(function(root){
// Roughly 1/5 of the bar per second at the beginning. Two slow waves avoid a
// metronomic ping-pong; the envelope settles near the right as the catch nears.
function position(progress,seconds,phase=0){
 const p=Math.max(0,Math.min(1,progress));
 const center=.48+.47*Math.pow(p,1.6);
 const amplitude=.38*Math.pow(1-p,.85);
 const sway=.73*Math.sin(seconds*.42+phase)+.27*Math.sin(seconds*.83+phase*1.7);
 return Math.max(.04,Math.min(.975,center+amplitude*sway));
}
const api={position};if(typeof module!=='undefined')module.exports=api;else root.Bite=api;
})(typeof window==='undefined'?globalThis:window);
