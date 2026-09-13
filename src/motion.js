/* Local image deformation on one shared GPU context; no new artwork or network. */
(function(){
const surface=document.createElement('canvas');surface.width=640;surface.height=400;
const gl=surface.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:false,preserveDrawingBuffer:true});
const textures=new WeakMap();
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
 }else if(kind<1.5){
  // Right-facing fish: stable head, travelling body wave and flexible caudal fin.
  float tail=pow(1.-smoothstep(.06,.76,uv.x),1.6);
  p.y-=tail*.075*sin(t*4.8-uv.x*7.);
  p.x-=tail*.018*sin(t*4.8+1.1)*(uv.x-.68);
  float fins=band(uv.x,.3,.64,.05)*(1.-band(uv.y,.34,.67,.05));
  p.y-=fins*.014*sin(t*6.2+uv.x*9.);
 }else if(kind<2.5){
  float arms=smoothstep(.4,.89,uv.y);
  p.x-=arms*.047*sin(t*3.5+uv.y*10.+uv.x*7.);
  p.y-=arms*.019*sin(t*4.+uv.x*15.);
 }else{
  float wing=pow(abs(uv.x-.5)*2.,1.3);
  p.y-=wing*.065*sin(t*3.1+uv.x*4.);
  p.x-=wing*.01*sin(t*3.1);
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
  for(let i=0;i<count;i++){
   const q=i/count;
   if(kind===0){const sy=q*source.height,sh=source.height/count;const water=Math.max(0,(q-.66)/.34);c.drawImage(source,0,sy,source.width,sh,x+Math.sin(q*60-t*2)*w*.01*water,y+q*h,w,h/count+.4)}
   else{const sx=q*source.width,sw=source.width/count;const strength=Math.pow(Math.max(0,1-q/.76),1.6);c.drawImage(source,sx,0,sw,source.height,x+q*w,y+Math.sin(t*4.8-q*7)*h*.075*strength,w/count+.4,h)}
  }return;
 }
 let texture=textures.get(source);
 if(!texture){texture=gl.createTexture();textures.set(source,texture);gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source)}
 else gl.bindTexture(gl.TEXTURE_2D,texture);
 gl.uniform1f(loc.time,t%10000);gl.uniform1f(loc.kind,kind);gl.uniform1f(loc.tug,tug);gl.viewport(0,0,640,400);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
 c.drawImage(surface,x,y,w,h);
}
window.Motion={draw,backend:gl?'webgl':'canvas-strips'};
})();
