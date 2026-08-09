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
  t('已深化的标出徽章',()=>{const n=(html.match(/已深化/g)||[]).length;const k=w.eval('Object.keys(K64X).length');return n===k?true:`徽章${n} 数据${k}`});
  t('象曰渲染出来',()=>/象曰/.test(html)?true:'没有象曰');
  t('断诀渲染出来',()=>/断诀/.test(html)?true:'没有断诀');
  t('存疑标注可见',()=>(html.match(/⚠️/g)||[]).length>=5?true:'存疑标注太少');
  // 64 格已全部深化，「尚未深化」分支不再出现；改验每格都真的渲染了内容
  t('64 格全部渲染出深化内容',()=>{
    const n=(html.match(/成格/g)||[]).length;
    return n>=64?true:`只有 ${n} 格渲染了成格条目`});
  t('不自动判的格不给「看一个真盘」按钮',()=>{
    const R=w.eval('Object.keys(K64_RULES)');
    const nine=['元首课','重审课','知一课','涉害课','遥克课','昴星课','别责课','八专课','伏吟课','返吟课'];
    const noRule=w.eval('K64.map(x=>x.name)').filter(n=>!R.includes(n)&&!nine.includes(n));
    const bad=noRule.filter(n=>new RegExp(`k64Example\\('${n}'`).test(html));
    return bad.length?'这些格判不了却给了搜盘按钮: '+bad.join('、'):true});

  console.log('\n— 自动例盘 —');
  const names=w.eval('Object.keys(K64_RULES)');
  let panOK=0,panBad=[];
  names.forEach(nm=>{ if(w.eval(`k64FindPan(${JSON.stringify(nm)},4000)`)) panOK++; else panBad.push(nm); });
  t(`${names.length} 格都能搜到真盘`,()=>panBad.length===0?true:'搜不到: '+panBad.join('、'));
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

  console.log('\n— 全书覆盖 —');
  t('64 格内容全部补齐',()=>{
    const K=w.eval('K64.map(x=>x.name)'), X=w.eval('Object.keys(K64X)');
    const miss=K.filter(n=>!X.includes(n));
    return miss.length?'缺内容: '+miss.join('、'):true});
  t('每格都标了出处或存疑',()=>{
    const bad=w.eval('Object.entries(K64X).filter(([k,v])=>!v.p&&!v.warn).map(([k])=>k)');
    return bad.length?'既无出处也无存疑标注: '+bad.join('、'):true});
  t('不判的格必须写明原因',()=>{
    const R=w.eval('Object.keys(K64_RULES)');
    const nine=['元首课','重审课','知一课','涉害课','遥克课','昴星课','别责课','八专课','伏吟课','返吟课'];
    const noRule=w.eval('K64.map(x=>x.name)').filter(n=>!R.includes(n)&&!nine.includes(n));
    const bad=noRule.filter(n=>!w.eval(`(K64X[${JSON.stringify(n)}]||{}).warn`));
    console.log('   不自动判的 '+noRule.length+' 格：'+noRule.join('、'));
    return bad.length?'未说明原因: '+bad.join('、'):true});
  t('由月将推月建：须与月将成六合',()=>{
    const bad=[];
    for(let i=0;i<12;i++){
      w.eval(`(k64GenOnce(), kcState.yj=YJ_TBL[${i}])`);
      const yj=w.eval('kcState.yj.yj'), jian=w.eval('_yueJian(kcState)');
      if(w.eval(`_LIUHE[${JSON.stringify(yj)}]`)!==jian) bad.push(yj+'将→'+jian+'建');
    }
    return bad.length?bad.join(' '):true});
  t('正月建寅·天马午·天德丁·月德丙',()=>{
    w.eval('(k64GenOnce(), kcState.yj=YJ_TBL[0])');
    const r=[w.eval('_yueJian(kcState)'),w.eval('_yueNum(kcState)'),
             w.eval('_tianMa(kcState)'),w.eval('_tianDe(kcState)'),w.eval('_yueDe(kcState)')];
    return (r[0]==='寅'&&r[1]===1&&r[2]==='午'&&r[3]==='丁'&&r[4]==='丙')?true:JSON.stringify(r)});

  console.log('\n— 分路判定不能有半边是死的 —');
  // ⚠️ 三奇课有「旬奇」「日奇」两条路，游子课靠「旬丁」。
  //    KONG_TBL 的 xun 是「甲子旬」带旬字，而查表键是「甲子」——
  //    键对不上会让旬奇/旬丁静默失效，而三奇因日奇兜底，命中率看着还正常。
  t('旬名解析成「甲X」不带旬字',()=>{
    const x=w.eval('(k64GenOnce(), _xunOf(kcState))');
    return /^甲[子戌申午辰寅]$/.test(x)?true:'实为 '+x});
  t('三奇课两条路都活着（旬奇 / 日奇）',()=>{
    let xq=0,rq=0;
    for(let i=0;i<20000;i++){
      const st=w.eval('k64GenOnce()'), c=[st.cc,st.zc,st.mc];
      const a=w.eval('_XUNQI[_xunOf(kcState)]'), b=w.eval(`_RIQI[${JSON.stringify(st.rg)}]`);
      if(a&&c.includes(a))xq++; if(b&&c.includes(b))rq++;
    }
    return (xq>0&&rq>0)?true:`旬奇${xq}次 日奇${rq}次，有一路是死的`});
  t('游子课能被触发（旬丁路）',()=>{
    for(let i=0;i<20000;i++) if(w.k64Detect(w.eval('k64GenOnce()')).includes('游子课')) return true;
    return '20000 次未触发'});

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
