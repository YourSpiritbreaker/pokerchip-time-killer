// PokerChip Time Killer — original 16-bit pixel card art, rendered to canvas at 50x70.
var CardArt = (function(){
  var W = 50, H = 70;
  var RED = '#d8141c', BLK = '#14142a';
  var GLYPH = {
    A:[".XXX.","X...X","X...X","XXXXX","X...X","X...X","X...X"],
    2:[".XXX.","X...X","....X","...X.","..X..",".X...","XXXXX"],
    3:["XXXX.","....X","....X",".XXX.","....X","....X","XXXX."],
    4:["...X.","..XX.",".X.X.","X..X.","XXXXX","...X.","...X."],
    5:["XXXXX","X....","XXXX.","....X","....X","X...X",".XXX."],
    6:[".XXX.","X....","X....","XXXX.","X...X","X...X",".XXX."],
    7:["XXXXX","....X","...X.","..X..",".X...",".X...",".X..."],
    8:[".XXX.","X...X","X...X",".XXX.","X...X","X...X",".XXX."],
    9:[".XXX.","X...X","X...X",".XXXX","....X","....X",".XXX."],
    1:[".X.","XX.",".X.",".X.",".X.",".X.","XXX"],
    0:[".XXX.","X...X","X..XX","X.X.X","XX..X","X...X",".XXX."],
    J:["..XXX","...X.","...X.","...X.","...X.","X..X.",".XX.."],
    Q:[".XXX.","X...X","X...X","X...X","X.X.X","X..X.",".XX.X"],
    K:["X...X","X..X.","X.X..","XX...","X.X..","X..X.","X...X"]
  };
  var TINY = {
    W:["X...X","X...X","X.X.X","XX.XX","X...X"], I:["XXX",".X.",".X.",".X.","XXX"],
    L:["X..","X..","X..","X..","XXX"], D:["XX.","X.X","X.X","X.X","XX."],
    J:["..X","..X","..X","X.X",".X."], O:[".X.","X.X","X.X","X.X",".X."],
    K:["X.X","X.X","XX.","X.X","X.X"], E:["XXX","X..","XX.","X..","XXX"], R:["XX.","X.X","XX.","X.X","X.X"]
  };
  var SUIT = [
    ["....X....","...XXX...","..XXXXX..",".XXXXXXX.","XXXXXXXXX","XXXXXXXXX",".XX.X.XX.","....X....","...XXX..."], // spade
    [".XX...XX.","XXXX.XXXX","XXXXXXXXX","XXXXXXXXX",".XXXXXXX.","..XXXXX..","...XXX...","....X....","........."], // heart
    ["....X....","...XXX...","..XXXXX..",".XXXXXXX.","XXXXXXXXX",".XXXXXXX.","..XXXXX..","...XXX...","....X...."], // diamond
    ["...XXX...","..XXXXX..","..XXXXX..","XX.XXX.XX","XXXXXXXXX","XXXXXXXXX","XX.XXX.XX","....X....","...XXX..."]  // club
  ];
  function mir(rows){ return rows.map(function(l){ return l + l.split('').reverse().join(''); }); }
  var KING = mir([
    "...y....y.","...yy..yyy","...yyyyyyy","...ybyyzyy","...YYYYYYY","..gggggggg","..gsssssss","..gsGGssss",
    "..gssKssss","..gspsssss","..gssssssS","..wwwwwwww","..wwwwwwmm","..wwwwwwww","...wwwwwww","rrrr.wwwww",
    "rRrrr.wwww","rRrrrr.www","rRrrrry.ww","rRrrrryy.w","rRrarryyy.","rRrarrryyy","rRaaarryyy","rRrarrryyy"]);
  var QUEEN = mir([
    "......y..y",".....yyyyy",".....yybyz","...hhhhhhh","..hhhhhhhh","..hhhsssss",".hhhssssss",".hhsKKssss",
    ".hhssKssss",".hhspsssss",".hhssssssS",".hhsssssmm",".hhhssssss",".hhhhSssss","hhhhhhwwww","hhhhhwwwww",
    "hhhrrwwwww","hhrrrrwwwy","hrrrrrrrww","rRrrrrrrrr","rRrrarrrrr","rRrraarrrr","rRrrarrryy","rRrrrrrryy"]);
  var JACK = mir([
    "..........","..........","....aaaaaa","..aaaaaaaa",".aaaaaaaaa",".yyyyyyyyy","..ooosssss","..oossssss",
    "..oosKssss","..ospsssss","..ossssssS","..ossssssm","...sssssss","....Ssssss","..wwwwwwww",".wwwwwwwww",
    "rrrwwwwwyy","rRrrrrrryy","rRrrrrryyr","rRrrrryyrr","rRrrryyrrr","rRrryyrrrr","rRryyrrrrr","rRyyrrrrrr"]);
  // asymmetric feather on the jack's cap
  [[16,0],[17,0],[15,1],[16,1],[17,1],[14,2],[15,2],[16,2],[13,3],[14,3]].forEach(function(p){
    var r = JACK[p[1]]; JACK[p[1]] = r.substr(0,p[0]) + 'e' + r.substr(p[0]+1);
  });
  var JESTER = mir([
    "y.........","aa........",".aa.......",".aaa....rr","..aaa.rrrr","..aaaarrrr","...aaarrrr","...yyyyyyy",
    "...sssssss","...ssKssss","...spsssss","...smsssss","....smmmmm",".....sssss","..wywywywy",".ywywywywy",
    "..aaaarrrr","..aaaarrrr"]);

  function palette(suit){
    var red = suit === 1 || suit === 2;
    return {K:'#1b1030',y:'#ffd23f',Y:'#c88a10',s:'#f8c890',S:'#d8925a',p:'#f08080',w:'#ffffff',g:'#d0d0e0',G:'#8888a0',
      h:'#7a4020',H:'#4a2410',o:'#f0b030',O:'#b87818',b:'#3878ff',z:'#e02040',e:'#30b050',m:'#b02030',
      r: red ? '#d8141c' : '#2848c8', R: red ? '#8a0a12' : '#182878', a: red ? '#2848c8' : '#d8141c'};
  }
  function px(ctx,x,y,c){ ctx.fillStyle=c; ctx.fillRect(x,y,1,1); }
  function bitmap(ctx,rows,x,y,col,scale){
    scale = scale || 1; ctx.fillStyle = col;
    for (var j=0;j<rows.length;j++) for (var i=0;i<rows[j].length;i++) if (rows[j][i]==='X') ctx.fillRect(x+i*scale,y+j*scale,scale,scale);
  }
  function sprite(ctx,rows,x,y,pal){
    var h = rows.length, w = rows[0].length, i, j;
    var on = function(i,j){ return j>=0&&j<h&&i>=0&&i<w&&rows[j][i]!=='.'; };
    // auto outline: every empty pixel touching a filled one becomes the dark ink
    for (j=-1;j<=h;j++) for (i=-1;i<=w;i++) if (!on(i,j) && (on(i-1,j)||on(i+1,j)||on(i,j-1)||on(i,j+1))) px(ctx,x+i,y+j,'#1b1030');
    for (j=0;j<h;j++) for (i=0;i<w;i++){ var c=rows[j][i]; if (c!=='.') px(ctx,x+i,y+j,pal[c]); }
  }
  function blank(){
    var cv = document.createElement('canvas'); cv.width=W; cv.height=H;
    var ctx = cv.getContext('2d');
    ctx.fillStyle='#2a2a44'; ctx.fillRect(2,0,W-4,H); ctx.fillRect(0,2,W,H-4); ctx.fillRect(1,1,W-2,H-2);
    ctx.fillStyle='#ffffff'; ctx.fillRect(2,1,W-4,H-2); ctx.fillRect(1,2,W-2,H-4);
    ctx.fillStyle='#e4e4ee'; ctx.fillRect(2,H-3,W-4,1); ctx.fillRect(W-3,2,1,H-4);
    return {cv:cv,ctx:ctx};
  }
  function chip(ctx,x,y,suit){
    var col = (suit===1||suit===2)?RED:BLK;
    for (var j=0;j<22;j++) for (var i=0;i<22;i++){
      var dx=i-10.5, dy=j-10.5, d=Math.sqrt(dx*dx+dy*dy), c=null;
      if (d<=10.6){
        if (d>7.6){ var a=(Math.atan2(dy,dx)+Math.PI)/(Math.PI*2)*8; c=(Math.floor(a+0.5)%2)?col:'#ffffff'; if (d>9.8) c=col; }
        else if (d>6.6) c=col; else c='#ffffff';
      } else if (d<=11.6) c='#1b1030';
      if (c) px(ctx,x+i,y+j,c);
    }
    bitmap(ctx,SUIT[suit],x+6,y+6,col,1);
  }
  function tinyWord(ctx,word,x,y,col,scale){
    for (var k=0;k<word.length;k++){ var g=TINY[word[k]]; bitmap(ctx,g,x,y,col,scale); x+=(g[0].length+1)*scale; }
  }
  function tinyWidth(word,scale){ var w=0; for (var k=0;k<word.length;k++) w+=(TINY[word[k]][0].length+1)*scale; return w-scale; }
  var cache = {};
  function face(c, wild){
    var key = c + (wild?'w':''); if (cache[key]) return cache[key];
    var b = blank(), ctx = b.ctx;
    if (c === 52){
      sprite(ctx,JESTER,15,5,{K:'#1b1030',y:'#ffd23f',s:'#f8c890',p:'#f08080',w:'#ffffff',m:'#b02030',r:'#d8141c',a:'#7028c0'});
      tinyWord(ctx,'JOKER',(W-tinyWidth('JOKER',2))>>1,32,'#7028c0',2);
      [[8,50],[40,46],[24,58],[12,62],[36,60]].forEach(function(p){ var x=p[0],y=p[1]; ctx.fillStyle='#ffd23f';
        ctx.fillRect(x,y-2,1,5); ctx.fillRect(x-2,y,5,1); ctx.fillStyle='#c88a10'; px(ctx,x,y,'#fff6b0'); });
    } else {
      var r = c>>2, s = c&3, col = (s===1||s===2)?RED:BLK, ch = '23456789TJQKA'[r];
      if (ch==='T'){ bitmap(ctx,GLYPH[1],3,4,col,2); bitmap(ctx,GLYPH[0],11,4,col,2); }
      else bitmap(ctx,GLYPH[ch],4,4,col,2);
      bitmap(ctx,SUIT[s],4,21,col,1);
      if (r>=9 && r<=11){
        sprite(ctx,[JACK,QUEEN,KING][r-9],27,4,palette(s));
        bitmap(ctx,SUIT[s],28,48,col,2);
      } else if (r===12){
        chip(ctx,25,4,s); bitmap(ctx,SUIT[s],28,48,col,2);
      } else {
        bitmap(ctx,SUIT[s],19,39,col,3);
      }
      if (wild){
        ctx.fillStyle='#1b1030'; ctx.fillRect(1,56,W-2,11); ctx.fillStyle='#ffd23f'; ctx.fillRect(2,57,W-4,9);
        tinyWord(ctx,'WILD',(W-tinyWidth('WILD',1))>>1,59,'#1b1030',1);
      }
    }
    return (cache[key] = b.cv.toDataURL());
  }
  function back(){
    if (cache.back) return cache.back;
    var b = blank(), ctx = b.ctx;
    for (var y=3;y<H-3;y++) for (var x=3;x<W-3;x++){
      var lat = ((x+y)%6===0)||((x-y+66)%6===0);
      px(ctx,x,y, (x<5||y<5||x>W-6||y>H-6) ? '#ffffff' : lat ? '#8a0a12' : '#c8141f');
    }
    chip(ctx,14,24,0);
    return (cache.back = b.cv.toDataURL());
  }
  return {face:face, back:back, chip:chip};
})();
