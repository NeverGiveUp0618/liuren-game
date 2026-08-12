const fs=require('fs'),{JSDOM,VirtualConsole}=require('jsdom');
const P2='/Users/xiaojin/Documents/文稿同步文件夹/03_学习 (Learning)/Seafile/学习资料/自创项目/liuren-game/index.html';
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
 t('经典与案例只剩一个案例入口',()=>{const a=names('phub-classic');
   const n=a.filter(x=>x.includes('案例库')).length;
   return (n===1&&!a.some(x=>x.includes('历代课例库')))||'案例入口 '+n+' 个: '+a.join('/')});
 t('案例库描述已说明含历代实证',()=>{
   const h=d.getElementById('phub-classic').textContent;
   return (h.includes('历代名家实证')&&h.includes('带完整课盘'))||'描述未更新'});
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
 t('案例库列出 13 类 98 例（82教学+16实证）',()=>{
   const n=w.eval('DR_CASELIB.length'),cats=w.eval('[...new Set(DR_CASELIB.map(c=>c.cat))].length');
   return (n===98&&cats===13)||`${cats}类 ${n}例`});
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


 console.log('\n【历代实证并入案例库】');
 t('CASE_LIB 16 条仍在（唯一数据源）',()=>{const n=w.eval('CASE_LIB.length');return n===16||n});
 t('案例库总数 = 82 教学 + 16 实证',()=>{const n=w.eval('DR_CASELIB.length');return n===98||n});
 t('实证条目均标 lidai 且无 board',()=>{
   const ld=w.eval('DR_CASELIB.filter(c=>c.lidai)');
   if(ld.length!==16)return '标记数 '+ld.length;
   const bad=ld.filter(c=>c.board||!c.ccatch||!c.cresult||!c.src);
   return bad.length?bad.length+' 条字段异常':true});
 t('占类已与案例库对齐（疾病→占病·失盗→失物）',()=>{
   const cats=w.eval('[...new Set(DR_CASELIB.filter(c=>c.lidai).map(c=>c.cat))]');
   const bad=cats.filter(c=>c==='疾病'||c==='失盗');
   if(bad.length)return '仍有 '+bad.join(',');
   return (cats.includes('占病')&&cats.includes('失物')&&cats.includes('天时')&&cats.includes('胎产'))?true:'占类:'+cats.join(',')});
 t('天时/胎产已有分组图标',()=>{const I=w.eval('DR_CAT_ICON');
   return !!(I['天时']&&I['胎产'])||'缺图标'});
 t('id 无冲突',()=>{const ids=w.eval('DR_CASELIB.map(c=>c.id)');
   return ids.length===new Set(ids).size||'有重复'});
 t('案例库目录渲染出实证标记',()=>{
   w.eval("_caseSrc='lib'"); w.drMenu();
   const h=d.getElementById('dru-list').innerHTML;
   return h.includes('历代实证')&&h.includes('查看实证')||'目录未标记'});
 t('实证详情页走实证卡（有抓手/验应/出处，无盘）',()=>{
   const id=w.eval("DR_CASELIB.find(c=>c.lidai).id");
   w.drOpen(id);
   const h=d.getElementById('pdr1-body').innerHTML;
   return (h.includes('断法抓手')&&h.includes('验应反馈')&&h.includes('出处')&&
           h.includes('无法可靠复现盘面')&&!h.includes('dr-board'))||'渲染异常'});
 t('教学案例详情仍正常排盘',()=>{
   const id=w.eval("DR_CASELIB.find(c=>!c.lidai).id");
   w.drOpen(id);
   const h=d.getElementById('pdr1-body').innerHTML;
   return (h.includes('dr-board')&&h.includes('先看盘'))||'教学案例渲染坏了'});
 t('历代课例库独立入口已移除',()=>{
   const a=[...d.querySelectorAll('#phub-classic .hub-item-name')].map(x=>x.textContent);
   return !a.some(x=>x.includes('历代课例库'))||'入口仍在: '+a.join('/')});
 t('pcase 屏与孤立函数已清理',()=>{
   const src=fs.readFileSync(P2,'utf8');
   const bad=[];
   if(d.getElementById('pcase'))bad.push('pcase 屏仍在');
   if(/function caseInit|function caseRender|CASE_CATS/.test(src))bad.push('孤立代码残留');
   return bad.length?bad.join(','):true});


 console.log('\n【DOM 结构 · 防「左侧大片空白」回归】');
 t('全部 screen 都在 .app 内（逃逸会导致 body flex 横排、左边露出空 .app）',()=>{
   const app=d.querySelector('.app');
   if(!app)return '.app 不存在';
   const all=[...d.querySelectorAll('.screen')];
   const out=all.filter(x=>!app.contains(x));
   return out.length?`${out.length} 个逃逸: ${out.map(x=>'#'+x.id).join(',')}`:true});
 console.log('\n【底栏：五个根屏】');
 const TABS=[...d.querySelectorAll('#tabbar [data-tab]')];
 t('底栏 5 格',()=>TABS.length===5||'实为'+TABS.length);
 t('底栏没有图标，只有文字',()=>{
   // ⚠️ 用码点判断，别拿正则数 emoji
   const bad=TABS.filter(b=>[...b.textContent.trim()].some(ch=>{
     const c=ch.codePointAt(0);return !(c<0x2000||(c>=0x3000&&c<=0x9fff));}));
   return bad.length===0||'含图标：'+bad.map(b=>b.textContent).join(',')});
 t('每格都对得上一个真实的 screen',()=>{
   const miss=TABS.map(b=>b.dataset.tab).filter(id=>{
     const el=d.getElementById(id);return !el||!el.classList.contains('screen')});
   return miss.length===0||'缺屏：'+miss.join(',')});
 t('综合训练卡已搬进 phub-train',()=>{
   const h=d.getElementById('phub-train').textContent;
   return (h.includes('今日挑战')&&h.includes('错题本')&&h.includes('掌握度'))||'内容没搬全'});
 t('排盘与推演卡已搬进 phub-pan',()=>{
   const h=d.getElementById('phub-pan').textContent;
   return (h.includes('起课步骤')&&h.includes('三传推演')&&h.includes('自选起课'))||'内容没搬全'});
 // ⚠️ 两条互相拉扯的回归，两边都要守：
 //   ① 加底栏那版把四张入口卡全搬进 tab，首页只剩统计 → 用户「打开啥也没有」
 //   ② 补回四个快捷入口后，与底栏重复 → 用户「首页也分格底部也分栏，太繁琐」
 // 定论：导航只留底栏一处；首页＝今日页，有主操作、无分类入口。
 t('首页有「今日挑战」主操作',()=>{
   const b=[...d.querySelectorAll('#ph .htoday button')].map(x=>x.textContent.trim());
   return b.includes('今日挑战')||'实为：'+b.join('/')});
 t('首页没有与底栏重复的分类入口',()=>{
   const tabs=[...d.querySelectorAll('#tabbar [data-tab]')].map(x=>x.dataset.tab);
   const dup=[...d.querySelectorAll('#ph button[onclick]')]
     .map(x=>(x.getAttribute('onclick')||'').match(/show\('([^']+)'\)/))
     .map(m=>m&&m[1]).filter(id=>id&&tabs.includes(id));
   return dup.length===0||'首页又摆了底栏同款入口：'+dup.join(',')});
 t('首页不重复那四张大卡（ID 会串）',()=>{
   const n=d.querySelectorAll('#ph .mcard').length;
   return n===0||'首页又有 '+n+' 张 mcard 了'});
 t('唯一 ID 没被复制',()=>{
   const dup=['train-home-sub','hw-weak-tip'].filter(id=>d.querySelectorAll('#'+id).length>1);
   return dup.length===0||'重复：'+dup.join(',')});

 // ⚠️ 改 CSS 时曾从自己的注释一路切到 .hmap{，把中间上百行样式一起抹了，
 //    页面「能渲染但全是裸文字」。这条守住首页赖以成形的那几条规则。
 t('首页样式规则一条没丢',()=>{
   const css=[...d.querySelectorAll('style')].map(x=>x.textContent).join('');
   const miss=['.hstat{','.hquote{','.hmap{','.update-bar{','.bk-row{','.mcard{','.htoday{']
     .filter(r=>!css.includes(r));
   return miss.length===0||'被删掉了：'+miss.join(' ')});

 // ⚠️ 底栏已经分好类，栏目内就不该再折叠——五组一路铺开，别退回子 tab。
 t('知识库五组全部可见，没有再被子 tab 藏起来',()=>{
   if(d.getElementById('knowledge-tabs'))return '子 tab 又回来了';
   const ps=[...d.querySelectorAll('#phub-knowledge .hub-panel')];
   if(ps.length!==5)return '分组实为'+ps.length+'个';
   const hidden=ps.filter(x=>!x.className.split(/\s+/).every(c=>c==='hub-panel'));
   return hidden.length===0||'有组带了额外 class（多半是又加回 active 切换）';});
 t('五个分组标题都在',()=>{
   const g=[...d.querySelectorAll('#phub-knowledge .hub-grp')].map(x=>x.textContent);
   return g.length===5||'实为'+g.length+'个：'+g.join('/')});
 t('switchKnowledgeTab 只滚动、不再隐藏别的组',()=>{
   const src=fs.readFileSync(P,'utf8');
   const fn=src.slice(src.indexOf('function switchKnowledgeTab'),src.indexOf('function switchKnowledgeTab')+400);
   return (/scrollIntoView/.test(fn)&&!/classList\.toggle/.test(fn))||'又改回切换隐藏了';});
 t('练习与排盘也是一条一行',()=>{
   const a=d.querySelectorAll('#phub-train .hub-item').length;
   const b=d.querySelectorAll('#phub-pan .hub-item').length;
   const m=d.querySelectorAll('#phub-train .mcard, #phub-pan .mcard').length;
   return (a>=4&&b>=4&&m===0)||('练习'+a+'条 排盘'+b+'条 残留mcard'+m)});
 t('搬家后唯一 ID 还在（训练页刷新用）',()=>
   // ⚠️ 要 !! —— 直接 && 返回的是元素，t() 只认 true
   !!(d.getElementById('train-home-sub')&&d.getElementById('hw-weak-tip'))||'丢了');

 t('点「练习」能切过去，且底栏跟着高亮',()=>{
   TABS.find(b=>b.dataset.tab==='phub-train').click();
   const on=d.querySelector('.screen.active').id;
   const lit=TABS.filter(b=>b.classList.contains('on')).map(b=>b.dataset.tab);
   return (on==='phub-train'&&lit.length===1&&lit[0]==='phub-train')
     ||('屏='+on+' 亮='+lit.join(','));});
 t('进子屏时父 tab 保持亮着',()=>{
   w.show('ptrain-report');
   const lit=TABS.filter(b=>b.classList.contains('on')).map(b=>b.dataset.tab);
   return (lit.length===1&&lit[0]==='phub-train')||'亮的是 '+lit.join(',');});
 t('子屏的 ✕ 退回所属根屏，不是一律回首页',()=>{
   w.goHome();
   const on=d.querySelector('.screen.active').id;
   return on==='phub-train'||'退到了 '+on;});
 TABS.find(b=>b.dataset.tab==='ph').click();

 t('body 直接子元素只有 .app / toast / 底栏 / script / 门户链接',()=>{
   const bad=[...d.body.children].filter(c=>{
     const tag=c.tagName.toLowerCase();
     if(tag==='script')return false;
     if(c.classList.contains('app')||c.id==='toast'||c.id==='wst-home-portal'||c.id==='tabbar')return false;
     return true;});
   return bad.length?bad.map(c=>'<'+c.tagName.toLowerCase()+(c.id?'#'+c.id:'')+'>').join(','):true});
 t('无 case-tabs / case-sec 等已删页面的残片',()=>{
   const bad=['case-tabs','case-sec'].filter(id=>d.getElementById(id));
   return bad.length?'残留: '+bad.join(','):true});

 console.log('\n未通过明细:',errs);
 console.log('\n'+(errs.length?'❌ '+errs.length+' 项未通过':'✅ 全部通过'));
 process.exit(errs.length?1:0);
},2500);
