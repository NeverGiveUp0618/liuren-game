const fs=require('fs'),{JSDOM,VirtualConsole}=require('jsdom');
const P='/Users/xiaojin/Documents/文稿同步文件夹/03_学习 (Learning)/Seafile/学习资料/自创项目/liuren-game/index.html';
const errs=[];const vc=new VirtualConsole();
vc.on('jsdomError',e=>{if(!/scrollTo|Not implemented/.test(e.message))errs.push(e.message)});
const dom=new JSDOM(fs.readFileSync(P,'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/',virtualConsole:vc});
setTimeout(()=>{
 const w=dom.window,d=w.document;
 const t=(n,f)=>{try{const r=f();const ok=r===true;console.log((ok?'✓ ':'✗ ')+n+(ok?'':' → '+r));if(!ok)errs.push(n)}catch(e){console.log('✗ '+n+' → '+e.message);errs.push(n)}};
 const names=id=>[...d.querySelectorAll('#'+id+' .hub-item-name')].map(x=>x.textContent.trim());
 const judge=()=>[...d.querySelectorAll('#kh-judge .hub-item-name')].map(x=>x.textContent.trim());

 t('页面无脚本错误',()=>errs.length===0?true:errs.join('|'));
 console.log('  知识库·断法:',judge().join(' / '));
 console.log('  经典与案例:',names('phub-classic').join(' / '));

 t('案例库已从知识库·断法移除',()=>!judge().some(x=>x.includes('案例库'))||'仍在断法');
 t('断案入门仍留在知识库·断法',()=>judge().some(x=>x.includes('断案入门'))||'不见了');
 t('案例库已在经典与案例',()=>names('phub-classic').some(x=>x.includes('案例库 · 按占类查全'))||'未加入');
 t('案例库排在历代课例库之前',()=>{const a=names('phub-classic');
   const i=a.findIndex(x=>x.includes('案例库 · 按占类查全')),j=a.findIndex(x=>x.includes('历代课例库'));
   return (i>=0&&j>=0&&i<j)||`案例库@${i} 历代@${j}`});
 t('两库描述已点明区别（带课盘 / 不含课盘）',()=>{
   const h=d.getElementById('phub-classic').textContent;
   return (h.includes('带完整课盘')&&h.includes('不含课盘'))||'描述未区分'});
 t('断案入门描述已指路到经典与案例',()=>
   d.getElementById('kh-judge').textContent.includes('去「经典与案例 · 案例库」')||'缺指路');

 console.log('\n【导航：从经典与案例进案例库，✕ 应退回经典与案例】');
 t('入口按钮可点且切到 pdru',()=>{
   w.show('phub-classic');
   const btn=[...d.querySelectorAll('#phub-classic .hub-actions button')]
     .find(b=>(b.getAttribute('onclick')||'').includes("_caseSrc='lib'"));
   if(!btn)return '未找到案例库按钮';
   btn.click();
   return d.getElementById('pdru').classList.contains('active')||'未进入 pdru'});
 t('案例库标题正确',()=>d.getElementById('pdru-title').textContent.includes('案例库')||d.getElementById('pdru-title').textContent);
 t('列出 11 类 82 例',()=>{
   const n=w.eval('DR_CASELIB.length'),cats=w.eval('[...new Set(DR_CASELIB.map(c=>c.cat))].length');
   return (n===82&&cats===11)||`${cats}类 ${n}例`});
 t('✕ 退回「经典与案例」而非知识库',()=>{
   w.goHome();
   return d.getElementById('phub-classic').classList.contains('active')||
     '退到了 '+(d.querySelector('.screen.active')||{}).id});

 console.log('\n【导航：从知识库进断案入门，✕ 应退回知识库】');
 t('断案入门入口可用',()=>{
   w.show('phub-knowledge'); w.switchKnowledgeTab('judge');
   const btn=[...d.querySelectorAll('#kh-judge .hub-actions button')]
     .find(b=>(b.getAttribute('onclick')||'').includes("_caseSrc='intro'"));
   if(!btn)return '未找到入门课按钮';
   btn.click();
   return d.getElementById('pdru').classList.contains('active')||'未进入'});
 t('入门课为 14 篇 44 例',()=>{
   const n=w.eval('DR_CASES.length'),cats=w.eval('[...new Set(DR_CASES.map(c=>c.cat))].length');
   return (n===44&&cats===14)||`${cats}篇 ${n}例`});
 t('✕ 退回「知识库」',()=>{
   w.goHome();
   return d.getElementById('phub-knowledge').classList.contains('active')||
     '退到了 '+(d.querySelector('.screen.active')||{}).id});

 console.log('\n'+(errs.length?'❌ '+errs.length+' 项未通过':'✅ 全部通过'));
 process.exit(errs.length?1:0);
},2500);
