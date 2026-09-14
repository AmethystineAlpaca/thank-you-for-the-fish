(function(root){
const groups=[
['近岸来信',1, ['小丑鱼','蓝唐王鱼','黄高鳍刺尾鱼','三带蝴蝶鱼','镊口鱼','海金鱼','青魔鱼','雀鲷','隆头鱼','清洁鱼','公子小丑鱼','火焰神仙鱼','皇帝神仙鱼','六带神仙鱼','珊瑚美人','蓝绿光鳃鱼','四眼蝴蝶鱼','人字蝶鱼','长鳍燕鱼','角镰鱼']],
['潮汐漫游',2,['沙丁鱼','凤尾鱼','鲭鱼','竹荚鱼','鲻鱼','银鲳鱼','金鲳鱼','黄花鱼','海鲈鱼','真鲷','黑鲷','石斑鱼','红笛鲷','鲣鱼','鲯鳅','飞鱼','鲱鱼','秋刀鱼','针鱼','梭鱼']],
['礁石邻居',3,['乌贼','剑尖鱿鱼','普通章鱼','椰子章鱼','条纹虾虎鱼','弹涂鱼','鳗鲶','花园鳗','海鳝','狮子鱼','刺鲀','箱鲀','海马','海龙','红娘鱼','比目鱼','牙鲆','舌鳎','鳎鱼','躄鱼']],
['远洋旅人',4,['黄鳍金枪鱼','蓝鳍金枪鱼','长鳍金枪鱼','剑鱼','旗鱼','蓝枪鱼','翻车鱼','月鱼','皇带鱼','鲟鱼','白鲟','锤头鲨','豹纹鲨','鲸鲨','姥鲨','蝠鲼','鹰鳐','电鳐','锯鳐','六鳃鲨']],
['深蓝秘藏',5,['鮟鱇鱼','灯笼鱼','蝰鱼','尖牙鱼','吞噬鳗','巨口鱼','管眼鱼','水滴鱼','银斧鱼','腔棘鱼','鹦鹉螺','大王具足虫','吸血鬼乌贼','小飞象章鱼','玻璃鱿鱼','火焰乌贼','毯子章鱼','叶海龙','麒麟鱼','苏眉鱼']]
];
const designs=typeof module!=='undefined'?require('./fish-designs'):root.FishDesigns;
const fish=groups.flatMap(([habitat,rarity,names],g)=>names.map((name,i)=>{
const id=g*20+i,d=designs[id];return {id,name,habitat,rarity,color:d.colors[1],shape:d.form,base:Math.round(12*Math.pow(2.5,rarity-1)*(1+i/20)),length:Math.round((g+1)*9+i*2+8),description:d.description};
}));
const expansion=typeof module!=='undefined'?require('./marine-expansion'):root.MarineExpansion;
fish.push(...expansion.map(f=>({id:f.id,name:f.name,habitat:f.habitat,rarity:f.rarity,color:f.colors[1],shape:f.form,base:Math.round(12*Math.pow(2.5,f.rarity-1)*(1+(f.id%20)/20)),length:f.length,description:f.description,legendary:f.legendary})));
// Per-species weights: legends are ten times rarer than a deep-blue species.
const rarityWeights=[50,28,14,6,2,.2];
const traits=[{id:'normal',name:'普通',mult:1,color:'#9bacad',weight:72},{id:'alternate',name:'异色',mult:2.5,color:'#aa86bb',weight:16},{id:'glow',name:'荧光',mult:4,color:'#7e9fc7',weight:8},{id:'prism',name:'炫彩',mult:8,color:'#bc91a7',weight:4}];
function weighted(items,weights,rng){let n=rng()*weights.reduce((a,b)=>a+b,0);return items.find((_,i)=>(n-=weights[i])<0)||items.at(-1)}
function catchFish(rng=Math.random,now=Date.now()){const f=weighted(fish,fish.map(f=>rarityWeights[f.rarity-1]),rng);const t=weighted(traits,traits.map(t=>t.weight),rng);const scale=.55+rng()*1.25;return {id:requireId(now,rng),species:f.id,trait:t.id,length:Math.round(f.length*scale*10)/10,weight:Math.round(50*Math.pow(scale,3)),value:Math.round(f.base*t.mult*scale*scale),time:now};}
function requireId(now,rng){return now.toString(36)+'-'+rng().toString(36).slice(2,12)}
function delay(min,max,rng=Math.random){return (min+rng()*(max-min))*60000}
// Old saves keep their original catch records; infer missing grams from their size.
function catchWeight(c){if(Number.isFinite(c.weight)&&c.weight>0)return c.weight;const f=fish[c.species];return Math.max(1,Math.round(50*Math.pow((c.length||f.length)/f.length,3)))}
// Cube-root scaling represents volume while leaving room for fins and glow.
function displayScale(c){return Math.max(.22,Math.min(.92,.52*Math.cbrt(catchWeight(c)/50)))}
const api={fish,traits,rarityWeights,catchFish,delay,catchWeight,displayScale};if(typeof module!=='undefined')module.exports=api;else root.Sea=api;
})(typeof window==='undefined'?globalThis:window);
