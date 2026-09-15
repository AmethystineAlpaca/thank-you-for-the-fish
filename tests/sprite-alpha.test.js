const {test}=require('node:test');
const assert=require('node:assert/strict');
const {clean}=require('../src/sprite-alpha');

test('alpha cleanup preserves pale tissue, enclosed gaps and separated feeler tips',()=>{
 const w=48,h=32,data=new Uint8ClampedArray(w*h*4);
 const pixel=(x,y,a=255)=>data.set([255,255,255,a],(y*w+x)*4);
 for(let y=9;y<24;y++)for(let x=10;x<29;x++)pixel(x,y,160);
 for(let x=16;x<24;x++)pixel(x,16,0);
 for(let x=28;x<36;x++)pixel(x,10,40);
 pixel(38,10,25);
 pixel(28,8,4); // very faint edge beside preserved tissue
 pixel(3,3,4); // equally faint isolated dust
 pixel(2,29);pixel(3,29);
 for(let x=29;x<w;x++)pixel(x,26); // clipped neighbor near the body
 const before=data.slice();clean(data,w,h,3);
 for(const [x,y] of [[15,12],[20,16],[34,10],[38,10],[28,8]]){
  const i=(y*w+x)*4;assert.deepEqual(data.slice(i,i+4),before.slice(i,i+4));
 }
 assert.equal(data[(29*w+2)*4+3],0);
 assert.equal(data[(29*w+3)*4+3],0);
 assert.equal(data[(26*w+29)*4+3],0);
 assert.equal(data[(3*w+3)*4+3],0);
});

test('alpha cleanup handles empty textures and is idempotent',()=>{
 const empty=new Uint8ClampedArray(16*16*4);clean(empty,16,16);assert.ok(empty.every(v=>v===0));
 const data=empty.slice();data.set([110,180,240,255],(8*16+8)*4);
 clean(data,16,16);const once=data.slice();clean(data,16,16);assert.deepEqual(data,once);
});
