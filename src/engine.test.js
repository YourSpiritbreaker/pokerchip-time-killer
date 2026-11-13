const E=require('./engine.js');const {C}=E;
const names=Object.keys(C);
function tally(mode,minPair,joker){const d=E.makeDeck(joker),n=d.length,t=new Array(17).fill(0),h=[0,0,0,0,0];
for(let a=0;a<n;a++)for(let b=a+1;b<n;b++)for(let c=b+1;c<n;c++)for(let e=c+1;e<n;e++)for(let f=e+1;f<n;f++){h[0]=d[a];h[1]=d[b];h[2]=d[c];h[3]=d[e];h[4]=d[f];t[E.evaluate(h,mode,minPair)]++;}
const o={};t.forEach((v,i)=>{if(v)o[names[i]]=v});return o;}
console.log('JOB',JSON.stringify(tally(0,9,false)));
console.log('DEUCES',JSON.stringify(tally(1,99,false)));
console.log('JOKER',JSON.stringify(tally(2,11,true)));
// EV: KsQsJsTs + 9h, hold first four, 9/6 JOB at 5 coins per coin
const card=(r,s)=>"23456789TJQKA".indexOf(r)*4+"shdc".indexOf(s);
const hand=[card('K','s'),card('Q','s'),card('J','s'),card('T','s'),card('9','h')];
const deck=E.makeDeck(false).filter(c=>!hand.includes(c));
const pay=new Array(17).fill(0);Object.assign(pay,{[C.NRF]:800,[C.SF]:50,[C.A4K]:25,[C.L4K]:25,[C.A4]:25,[C.L4]:25,[C.K4]:25,[C.FH]:9,[C.FL]:6,[C.ST]:4,[C.T3]:3,[C.TP]:2,[C.PAIR]:1});
let t=Date.now();const ev=E.enumerateEV(hand,deck,0,9,pay);const ms=Date.now()-t;
let best=0;for(let m=0;m<32;m++)if(ev[m]>ev[best])best=m;
console.log('EV hold KQJT =',ev[15].toFixed(4),'expected',(925/47).toFixed(4),'best mask',best,'ms',ms);
