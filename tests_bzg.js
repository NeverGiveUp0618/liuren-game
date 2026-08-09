const fs=require('fs'),{JSDOM}=require('jsdom');
const P='/Users/xiaojin/Documents/文稿同步文件夹/03_学习 (Learning)/Seafile/学习资料/自创项目/liuren-game/index.html';
const dom=new JSDOM(fs.readFileSync(P,'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/'});
setTimeout(()=>{
  const w=dom.window,d=w.document;let pass=0,fail=0;
  const t=(n,f)=>{try{const r=f();const ok=r===true;console.log((ok?'✓ ':'✗ ')+n+(ok?'':' → '+r));ok?pass++:fail++}
    catch(e){console.log('✗ '+n+' → THREW '+e.message);fail++}};
  t('XF_BZG 已加载 46 条',()=>w.eval('XF_BZG.length')===46?true:w.eval('XF_BZG.length'));
  t('每条都有出处',()=>w.eval('XF_BZG.every(x=>/通解 p110/.test(x.src))')?true:'有条目缺出处');
  t('原文无页眉污染',()=>w.eval('XF_BZG.filter(x=>/核心笔记|叶飘然著/.test(x.key)).length')===0?true:'有污染');
  w.show('pxf-sym'); w.xfTab('bzg');
  const el=d.getElementById('xfp-bzg');
  t('面板渲染出卡片',()=>{const n=el.querySelectorAll('.xfsym-card').length;return n===46?true:'实为'+n});
  t('标签「歌」',()=>/>歌</.test(el.innerHTML)?true:'标签不对');
  t('只录原文不编白话解（显示「原文」而非「用法」）',()=>
    (/原文/.test(el.innerHTML)&&!/用法/.test(el.innerHTML))?true:'混入了用法行');
  t('分组筛选可用',()=>{
    const sel=d.getElementById('xf-filter');
    return sel&&sel.options.length>3?true:'分组没生成'});
  t('搜索能命中（失猫看功曹）',()=>{
    d.getElementById('xf-search').value='失猫';w.xfSearch();
    const vis=[...el.querySelectorAll('.xfsym-card')].filter(c=>c.style.display!=='none');
    return vis.length>0?true:'搜不到'});
  console.log(`\n${fail?'❌ '+fail+' 项未通过':'✅ 全部 '+pass+' 项通过'}`);
  process.exit(fail?1:0);
},1000);
