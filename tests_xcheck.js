const fs=require('fs'),{JSDOM}=require('jsdom');
const P='/Users/xiaojin/Documents/文稿同步文件夹/03_学习 (Learning)/Seafile/学习资料/自创项目/liuren-game/index.html';
const dom=new JSDOM(fs.readFileSync(P,'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/'});
setTimeout(()=>{const w=dom.window;
  const KU=w.eval('BF_KU'),YJ=w.eval('YJ_TBL');
  let tot=0,ok=0; const bad=[]; const byM={};
  KU.forEach(law=>law.ge.forEach(g=>{
    const b=g.board; if(!b||!b.sc||b.sc.length!==3)return;
    const yjIdx=YJ.findIndex(y=>y.yj===b.yj); if(yjIdx<0)return;
    const st=w.eval(`_manualKC('${b.r[0]}','${b.r[1]}',YJ_TBL[${yjIdx}],'${b.zs}')`);
    if(!st)return;
    tot++;
    const got=[st.cc,st.zc,st.mc].join(''),exp=b.sc.join('');
    const m=st.mt;
    byM[m]=byM[m]||{t:0,o:0}; byM[m].t++;
    if(got===exp){ok++;byM[m].o++;}
    else bad.push({law:law.n,name:g.name,r:b.r,yj:b.yj,zs:b.zs,exp,got,m});
  }));
  console.log(`原著课盘交叉验证：${ok}/${tot} 一致 (${(ok/tot*100).toFixed(1)}%)\n`);
  console.log('按发传法统计：');
  Object.entries(byM).sort((a,b)=>b[1].t-a[1].t).forEach(([k,v])=>
    console.log(`  ${k.padEnd(8)} ${String(v.o).padStart(3)}/${String(v.t).padStart(3)}  ${v.o===v.t?'✓':'← 有不符 '+(v.t-v.o)+' 例'}`));
  if(bad.length){console.log('\n不符明细（前25）：');
    bad.slice(0,25).forEach(x=>console.log(`  第${x.law}法 ${x.name} | ${x.r}日 ${x.yj}将 ${x.zs}时 [${x.m}] 书:${x.exp} 站:${x.got}`));}
  fs.writeFileSync('xcheck.json',JSON.stringify(bad,null,1));
},1500);
