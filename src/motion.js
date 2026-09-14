/* Local image deformation on one shared GPU context; no new artwork or network. */
(function(){
const surface=document.createElement('canvas');surface.width=640;surface.height=400;
const gl=surface.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:false,preserveDrawingBuffer:true});
const textures=new WeakMap();
// These groups follow the anatomy and orientation of the finished sprites.
const kinds={fish:1,arms:2,ray:3,shell:4,armor:5,squid:6,cuttle:7,horse:8,garden:9,eel:10,hover:11,flat:12};
const forms={
 octopus:'arms',vampire:'arms',dumbo:'arms',blanket:'arms',
 manta:'ray',ray:'ray',electric:'ray',nautilus:'shell',isopod:'armor',
 squid:'squid',cuttle:'cuttle',horse:'horse',dragon:'horse',leafy:'horse',garden:'garden',
 eel:'eel',gulper:'eel',ribbon:'eel',catfish:'eel',
 puffer:'hover',box:'hover',sunfish:'hover',frog:'hover',angler:'hover',blob:'hover',
 shrimp:'armor',lobster:'armor',crab:'armor',hermit:'armor',horseshoe:'armor',
 barnacle:'hover',bivalve:'hover',snail:'hover',urchin:'hover',star:'flat',cucumber:'flat',
 jelly:'arms',slug:'flat',turtle:'ray',seal:'hover',dugong:'fish',dolphin:'fish',whale:'fish',phoenix:'ray',
 flat:'flat',sole:'flat'
};
function kindFor(shape){return kinds[forms[shape]||'fish']}
const vertex=`attribute vec2 position;varying vec2 uv;void main(){uv=vec2((position.x+1.0)*.5,(1.0-position.y)*.5);gl_Position=vec4(position,0.,1.);}`;
const fragment=`precision highp float;
uniform sampler2D image;uniform float time,kind,tug;varying vec2 uv;
float band(float x,float a,float b,float f){return smoothstep(a-f,a+f,x)*(1.-smoothstep(b-f,b+f,x));}
float segment(vec2 p,vec2 a,vec2 b){vec2 d=b-a;float s=clamp(dot(p-a,d)/dot(d,d),0.,1.);return length(p-a-d*s);}
void main(){vec2 p=uv;float t=time;
 if(kind<.5){
  // Reflections and the water surface move independently of the wooden hull.
  float water=smoothstep(.665,.77,p.y);
  p.x-=water*(.009*sin(p.y*61.-t*2.2)+.004*sin(p.y*113.+t*1.6));
  p.y-=water*(.004*sin(p.x*28.+t*1.8)+.002*sin(p.x*63.-t*2.3));
  if(kind<-.5){
   float body=band(uv.x,.35,.67,.035)*band(uv.y,.32,.55,.04);
   p.y-=body*.002*sin(t*1.15);
  }else{
  float body=band(uv.x,.395,.63,.035)*band(uv.y,.12,.54,.04);
  float breath=sin(t*1.55);
  p.x-=body*(.0028*breath+(uv.y-.51)*.011*sin(t*.9));
  p.y-=body*(.004*breath+.006*tug);
  // The bamboo flex grows toward the tip; the hand end remains anchored.
  float along=clamp((uv.x-.565)/.27,0.,1.);
  float rod=1.-smoothstep(.012,.035,segment(uv,vec2(.565,.455),vec2(.837,.112)));
  float bend=(.011*sin(t*1.8)+.004*sin(t*3.1)+.045*tug)*along*along;
  p.y+=rod*bend;p.x-=rod*.008*along*sin(t*1.8);
  // Line and bobber react to the same pull, instead of moving the full picture.
  float line=1.-smoothstep(.008,.029,segment(uv,vec2(.837,.112),vec2(.885,.66)));
  float depth=clamp((uv.y-.112)/.55,0.,1.);
  p.x-=line*(.008*sin(t*1.8)*(1.-depth)+.006*sin(t*2.3)*depth);
  p.y+=line*(.011*sin(t*1.8)+.045*tug)*(1.-depth);
  float bob=band(uv.x,.859,.913,.013)*band(uv.y,.608,.697,.013);
  p.y-=bob*(.006*sin(t*2.3)-.017*tug);p.x-=bob*.004*sin(t*1.6);
  }
 }else if(kind<1.5){
  // A head-to-tail wave grows smoothly behind the gills. Slow modulation
  // alternates gentle strokes and glides without restarting the swim cycle.
  float along=clamp((.78-uv.x)/.72,0.,1.);
  float tail=along*along*(3.-2.*along);
  float phase=t*4.8+.18*sin(t*.73);
  float effort=.88+.12*sin(t*.91+.6);
  float wave=phase-along*4.6;
  float tip=1.-smoothstep(.12,.38,uv.x);
  p.y-=effort*(tail*.058*sin(wave)+tip*.010*sin(wave*2.-.65));
  p.x-=tail*.009*(sin(wave+.8)+.22*sin(wave*2.));
  // Caudal rays open and relax after the tail stroke; fin edges ripple
  // in body coordinates so their roots stay attached throughout the bend.
  p.y-=tip*(p.y-.5)*.045*sin(wave-.9);
  float fins=band(p.x,.3,.65,.05)*(1.-band(p.y,.34,.67,.06));
  float edge=smoothstep(.10,.36,abs(p.y-.5));
  p.y-=fins*(.009*sin(phase-.8+p.x*8.)+edge*.004*sin(phase*2.-p.x*13.));
  p.x-=fins*edge*.004*sin(phase-1.3+p.y*6.);
  // A small pectoral stroke, with a soft mask that leaves the eye untouched.
  float pectoral=band(p.x,.53,.68,.035)*band(p.y,.52,.69,.035);
  p.y-=pectoral*.005*sin(phase*1.35+.7);
  p.x-=pectoral*.003*sin(phase*1.35-.4);
 }else if(kind<2.5){
  float arms=smoothstep(.4,.89,uv.y);
  float phase=t*3.5+.12*sin(t*.7);
  p.x-=arms*(.040*sin(phase-uv.y*8.+uv.x*7.)+arms*.007*sin(phase*1.7-uv.y*14.+uv.x*11.));
  p.y-=arms*.016*sin(phase-.8+uv.x*15.-uv.y*3.);
 }else if(kind<3.5){
  float wing=pow(abs(uv.x-.5)*2.,1.3);
  float phase=t*3.1+.12*sin(t*.65);
  p.y-=wing*(.056*sin(phase-wing*2.4)+wing*.007*sin(phase*2.-wing*4.+uv.y*3.));
  p.x-=wing*.008*sin(phase-wing*2.4-.6);
 }else if(kind<4.5){
  // Nautilus: shell and eye stay rigid; only the exposed arm tips curl.
  float arms=smoothstep(.64,.84,uv.x)*smoothstep(.40,.65,uv.y);
  p.y-=arms*.017*sin(t*2.1-uv.x*9.+uv.y*8.);
  p.x-=arms*.009*sin(t*1.7-uv.x*7.+uv.y*11.);
 }else if(kind<5.5){
  // Isopod: a solid dorsal carapace above gently alternating short legs.
  float legs=smoothstep(.57,.76,uv.y);
  p.x-=legs*.009*sin(t*3.2-uv.x*23.);
  p.y-=legs*.005*sin(t*3.2-uv.x*23.+1.2);
  float antenna=smoothstep(.76,.9,uv.x)*smoothstep(.46,.67,uv.y);
  p.y-=antenna*.009*sin(t*2.2-uv.x*8.);
 }else if(kind<6.5){
  // Squid sprites point diagonally right: mantle left, trailing arms right.
  float arms=smoothstep(.56,.84,uv.x)*smoothstep(.38,.66,uv.y);
  p.y-=arms*(.024*sin(t*2.7-uv.x*8.+uv.y*4.)+.005*sin(t*4.3-uv.x*13.));
  p.x-=arms*.009*sin(t*2.7-uv.x*8.+1.);
  float mantle=band(uv.x,.22,.52,.04)*band(uv.y,.17,.57,.05);
  p.y-=mantle*(uv.y-.38)*.018*sin(t*2.7);
  float fins=band(uv.x,.2,.43,.05)*(1.-band(uv.y,.3,.46,.04));
  p.y-=fins*.006*sin(t*3.1-uv.x*10.);
 }else if(kind<7.5){
  // Cuttlefish: a travelling ripple along the mantle skirt, short arms in front.
  float skirt=band(uv.x,.18,.62,.04)*(1.-band(uv.y,.36,.55,.04));
  p.y-=skirt*.011*sin(t*3.8-uv.x*17.);
  float arms=smoothstep(.64,.82,uv.x)*smoothstep(.48,.71,uv.y);
  p.x-=arms*.012*sin(t*2.3-uv.y*9.+uv.x*5.);
  p.y-=arms*.009*sin(t*2.3-uv.y*8.-.7);
 }else if(kind<8.5){
  // Seahorses and dragons: plated trunk stays firm, appendages gently flutter.
  float fin=band(uv.x,.28,.47,.035)*band(uv.y,.4,.64,.04);
  p.x-=fin*.005*sin(t*9.+uv.y*14.);
  float ends=smoothstep(.16,.34,abs(uv.y-.48))*(1.-smoothstep(.58,.73,uv.x));
  p.x-=ends*.007*sin(t*1.5-uv.y*7.);
  p.y-=ends*.004*sin(t*1.8+uv.x*8.);
 }else if(kind<9.5){
  // Garden eel: sway above an anchored lower end, rather than waving its base.
  float height=1.-smoothstep(.17,.86,uv.y);
  p.x-=height*height*.022*sin(t*1.4-uv.y*2.);
 }else if(kind<10.5){
  // Long and coiled bodies carry a slower, longer wave with a quiet head.
  float flexible=1.-smoothstep(.51,.82,uv.x);
  float phase=t*2.7+uv.x*8.-uv.y*4.;
  p.y-=flexible*.023*sin(phase);
  p.x-=flexible*.012*sin(phase-.8);
 }else if(kind<11.5){
  // Boxy, round and short-bodied fish hover using fins, not a rubbery torso.
  float tail=1.-smoothstep(.22,.38,uv.x);
  p.y-=tail*.012*sin(t*3.4+uv.x*5.);
  float fins=band(uv.x,.36,.66,.035)*(1.-band(uv.y,.33,.66,.04));
  p.y-=fins*.008*sin(t*5.2-uv.x*9.);
  float pectoral=band(uv.x,.54,.68,.025)*band(uv.y,.53,.69,.025);
  p.x-=pectoral*.004*sin(t*7.);
 }else{
  // Flatfish: low ripples along the dorsal/anal fringe, a calm central body.
  float edge=band(uv.x,.18,.78,.05)*(1.-band(uv.y,.35,.64,.05));
  p.y-=edge*.010*sin(t*3.1+uv.x*15.);
  p.y-=(1.-smoothstep(.17,.32,uv.x))*.009*sin(t*2.8+uv.x*5.);
 }
 if(p.x<0.||p.x>1.||p.y<0.||p.y>1.){gl_FragColor=vec4(0.);return;}
 gl_FragColor=texture2D(image,p);
}`;
let program,loc;
if(gl){
 function compile(type,text){const s=gl.createShader(type);gl.shaderSource(s,text);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
 program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);
 if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
 gl.useProgram(program);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
 const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
 loc=Object.fromEntries(['image','time','kind','tug'].map(k=>[k,gl.getUniformLocation(program,k)]));gl.uniform1i(loc.image,0);
}
function draw(c,source,x,y,w,h,t,kind=1,tug=0){
 if(!gl||gl.isContextLost()){
  // Software fallback still bends local strips, rather than bobbing one rigid image.
  const count=64;
  const smooth=(a,b,v)=>{const q=Math.max(0,Math.min(1,(v-a)/(b-a)));return q*q*(3-2*q)};
  const phase=t*4.8+.18*Math.sin(t*.73),effort=.88+.12*Math.sin(t*.91+.6);
  for(let i=0;i<count;i++){
   const q=i/count;
   if(kind<=0){const sy=q*source.height,sh=source.height/count;const water=Math.max(0,(q-.66)/.34);c.drawImage(source,0,sy,source.width,sh,x+Math.sin(q*60-t*2)*w*.01*water,y+q*h,w,h/count+.4)}
   else if(kind===2){
    const arms=smooth(.4,.89,q),p=t*3.5+.12*Math.sin(t*.7);
    const dx=arms*(.040*Math.sin(p-q*8.+3.5)+arms*.007*Math.sin(p*1.7-q*14.+5.5));
    c.drawImage(source,0,q*source.height,source.width,source.height/count,x+dx*w,y+q*h,w,h/count+.4);
   }else if(kind>=4){
    // A cheaper anatomy-aware approximation when WebGL is unavailable.
    // Shells/armor never fall back to the generic fish's full-body bend.
    let dx=0,dy=0;const horizontal=[5,8,9].includes(kind);
    if(kind===4){const arms=smooth(.68,.86,q);dy=arms*.014*Math.sin(t*2.1-q*9.);}
    else if(kind===5){const legs=smooth(.60,.78,q);dx=legs*.007*Math.sin(t*3.2-q*17.);}
    else if(kind===6){const arms=smooth(.6,.86,q);dy=arms*.022*Math.sin(t*2.7-q*8.);}
    else if(kind===7){const arms=smooth(.65,.84,q);dy=arms*.009*Math.sin(t*2.3-q*8.);}
    else if(kind===8){dx=smooth(.65,.88,q)*.005*Math.sin(t*1.5-q*7.);}
    else if(kind===9){const height=1-smooth(.17,.86,q);dx=height*height*.022*Math.sin(t*1.4-q*2.);}
    else if(kind===10){dy=(1-smooth(.51,.82,q))*.023*Math.sin(t*2.7+q*8.-2.);}
    else if(kind===11){dy=(1-smooth(.22,.38,q))*.012*Math.sin(t*3.4+q*5.);}
    else{dy=(1-smooth(.17,.32,q))*.009*Math.sin(t*2.8+q*5.);}
    if(horizontal)c.drawImage(source,0,q*source.height,source.width,source.height/count,x+dx*w,y+q*h,w,h/count+.4);
    else c.drawImage(source,q*source.width,0,source.width/count,source.height,x+q*w,y+dy*h,w/count+.4,h);
   }else{
    let dy;
    if(kind===3){const wing=Math.pow(Math.abs(q-.5)*2,1.3),p=t*3.1+.12*Math.sin(t*.65);dy=wing*(.056*Math.sin(p-wing*2.4)+wing*.007*Math.sin(p*2.-wing*4.+1.5))}
    else{const along=Math.max(0,Math.min(1,(.78-q)/.72)),tail=along*along*(3-2*along),wave=phase-along*4.6,tip=1-smooth(.12,.38,q);dy=effort*(tail*.058*Math.sin(wave)+tip*.010*Math.sin(wave*2.-.65))}
    c.drawImage(source,q*source.width,0,source.width/count,source.height,x+q*w,y+dy*h,w/count+.4,h);
   }
  }return;
 }
 let texture=textures.get(source);
 if(!texture){texture=gl.createTexture();textures.set(source,texture);gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source)}
 else gl.bindTexture(gl.TEXTURE_2D,texture);
 gl.uniform1f(loc.time,t%10000);gl.uniform1f(loc.kind,kind);gl.uniform1f(loc.tug,tug);gl.viewport(0,0,640,400);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
 c.drawImage(surface,x,y,w,h);
}
window.Motion={draw,kindFor,kinds,backend:gl?'webgl':'canvas-strips'};
})();
