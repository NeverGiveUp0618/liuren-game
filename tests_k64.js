/* 六十四课经·第一批深化的测试
   跑法：NODE_PATH=<有 jsdom 的 node_modules> node tests_k64.js

   ⚠️ 这套测试专盯两类「看着没错其实空转」的坑：
   1. kcState 是 let 声明不挂 window，w.kcState 恒为 undefined；
      早期 k64Detect 又用 try/catch 静默吞错 → 15 格全判不出却一声不吭。
      所以这里用 w.eval('k64GenOnce()') 取盘，并断言「搜到的盘确实成该格」。
   2. 一盘常同时成好几格（实测 53%），出题时干扰项若混进同样成立的格，
      就是两个选项都对的坏题（象义站踩过一模一样的坑）。连出 200 题验它。
*/
const fs=require('fs'),{JSDOM}=require('jsdom');
const P='/Users/xiaojin/Documents/文稿同步文件夹/03_学习 (Learning)/Seafile/学习资料/自创项目/liuren-game/index.html';
const dom=new JSDOM(fs.readFileSync(P,'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/'});
const errs=[];
dom.virtualConsole.on('jsdomError',e=>{if(!/scrollTo|Not implemented/.test(e.message))errs.push(e.message)});
setTimeout(()=>{
  const w=dom.window,d=w.document;let pass=0,fail=0;
  const t=(n,f)=>{try{const r=f();const ok=r===true;console.log((ok?'✓ ':'✗ ')+n+(ok?'':' → '+r));ok?pass++:fail++}
    catch(e){console.log('✗ '+n+' → THREW '+e.message);fail++}};

  t('页面无脚本错误',()=>errs.length===0?true:errs.slice(0,2).join('|'));
  w.show('p64');
  t('格局库页激活',()=>d.getElementById('p64').classList.contains('active')||'no');

  console.log('\n— 详情页深化 —');
  const html=d.getElementById('k64-sec').innerHTML;
  t('64 格全部列出',()=>{const n=(html.match(/第\d+课 · /g)||[]).length;return n===64?true:'实为'+n});
  t('已深化的标出徽章',()=>{const n=(html.match(/已深化/g)||[]).length;return n===15?true:'实为'+n});
  t('象曰渲染出来',()=>/象曰/.test(html)?true:'没有象曰');
  t('断诀渲染出来',()=>/断诀/.test(html)?true:'没有断诀');
  t('存疑标注可见',()=>(html.match(/⚠️/g)||[]).length>=5?true:'存疑标注太少');
  t('未深化的说明还缺什么',()=>/本格尚未深化/.test(html)?true:'没写清楚');

  console.log('\n— 自动例盘 —');
  const names=w.eval('Object.keys(K64_RULES)');
  let panOK=0,panBad=[];
  names.forEach(nm=>{ if(w.eval(`k64FindPan(${JSON.stringify(nm)},4000)`)) panOK++; else panBad.push(nm); });
  t('15 格都能搜到真盘',()=>panBad.length===0?true:'搜不到: '+panBad.join('、'));
  t('搜到的盘确实成该格',()=>{
    const bad=[];
    names.forEach(nm=>{ if(w.eval(`k64FindPan(${JSON.stringify(nm)},4000)`)){
      const hit=w.eval('k64Detect(kcState)');
      if(!hit.includes(nm)) bad.push(nm);
    }});
    return bad.length?bad.join('、'):true});
  t('例盘用的是纠正后的三传',()=>{
    const s1=w.eval('k64GenOnce(); [kcState.cc,kcState.zc,kcState.mc].join("")');
    const s2=w.eval('_compute3chuan(kcState); [_compute3chuan(kcState).cc,_compute3chuan(kcState).zc,_compute3chuan(kcState).mc].join("")');
    return s1===s2?true:`起课后${s1} 纠正后${s2}`});

  console.log('\n— 看盘认格练习 —');
  t('进页面即出题',()=>{const h=d.getElementById('k64-quiz').innerHTML;return /看盘认格/.test(h)?true:'没出题'});
  t('给出 4 个选项',()=>{const n=d.querySelectorAll('#k64-opts button').length;return n===4?true:'实为'+n});
  t('渲染了真盘',()=>d.querySelector('.k64-quiz-board')?.innerHTML.length>50?true:'盘是空的');
  t('⭐ 不出坏题：干扰项都不成格（连出200题）',()=>{
    const bad=[];
    for(let i=0;i<200;i++){
      w.k64QuizNew();
      const q=w.eval('_k64q');
      if(!q){continue}
      const opts=[...d.querySelectorAll('#k64-opts button')].map(b=>b.textContent);
      const alsoRight=opts.filter(o=>o!==q.right&&q.hits.includes(o));
      if(alsoRight.length) bad.push(`${q.right} 的干扰项里混进了同样成立的 ${alsoRight.join(',')}`);
      if(!opts.includes(q.right)) bad.push('正解不在选项里');
    }
    return bad.length?bad.slice(0,2).join(' | '):true});
  t('答对判定认「本盘命中的任一格」',()=>{
    w.k64QuizNew();
    const q=w.eval('_k64q');
    const btn=[...d.querySelectorAll('#k64-opts button')].find(b=>b.textContent===q.right);
    w.k64QuizAns(q.right,btn);
    return /对/.test(d.getElementById('k64-fb').textContent)?true:'反馈不对'});
  t('答错时告知本盘实际成的格',()=>{
    w.k64QuizNew();
    const q=w.eval('_k64q');
    const wrong=[...d.querySelectorAll('#k64-opts button')].find(b=>!q.hits.includes(b.textContent));
    if(!wrong)return true;
    w.k64QuizAns(wrong.textContent,wrong);
    const fb=d.getElementById('k64-fb').textContent;
    return (/不对/.test(fb)&&q.hits.some(x=>fb.includes(x)))?true:'反馈里没说本盘成什么'});

  console.log(`\n${fail?'❌ '+fail+' 项未通过':'✅ 全部 '+pass+' 项通过'}`);
  process.exit(fail?1:0);
},900);
