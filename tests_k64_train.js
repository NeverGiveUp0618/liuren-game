const fs=require('fs'),{JSDOM}=require('jsdom');
const P='/Users/xiaojin/Documents/文稿同步文件夹/03_学习 (Learning)/Seafile/学习资料/自创项目/liuren-game/index.html';
const dom=new JSDOM(fs.readFileSync(P,'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/'});
setTimeout(()=>{
  const w=dom.window,d=w.document;let pass=0,fail=0;
  const t=(n,f)=>{try{const r=f();const ok=r===true;console.log((ok?'✓ ':'✗ ')+n+(ok?'':' → '+r));ok?pass++:fail++}
    catch(e){console.log('✗ '+n+' → THREW '+e.message);fail++}};

  t('训练分类已加「课体格局」',()=>w.eval("TRAIN_CATS.k64&&TRAIN_CATS.k64.name")==='课体格局'||'没加');
  const pool=w.eval('trainK64Pool("k64")');
  t('题库能出题',()=>pool.length>0?true:'0 题');
  console.log('   出了 '+pool.length+' 题');
  t('每题 4 个选项且含正解',()=>{
    const bad=pool.filter(q=>q.opts.length!==4||!q.opts.includes(q.a));
    return bad.length?bad.length+' 题选项不合格':true});
  t('⭐ 不出坏题：干扰项都不是本盘成立的格',()=>{
    const bad=[];
    pool.forEach(q=>{
      const also=q.opts.filter(o=>o!==q.a&&q.k64hits.includes(o));
      if(also.length)bad.push(`${q.a} 的干扰项混进同样成立的 ${also.join(',')}`);
    });
    return bad.length?bad.slice(0,2).join(' | '):true});
  t('id 按格名（错题本才能落到"哪个格"）',()=>{
    const bad=pool.filter(q=>!/^k64_/.test(q.id)||/\d{6,}/.test(q.id));
    return bad.length?'id 不稳定: '+bad[0].id:true});
  t('题面含日干支·月将·占时·四课·三传',()=>{
    const q=pool[0].q;
    return (/日/.test(q)&&/将/.test(q)&&/时/.test(q)&&/四课上神/.test(q)&&/三传/.test(q))?true:q.slice(0,60)});
  t('解析给出成格条件',()=>pool.every(q=>/成格：/.test(q.ex))?true:'有题缺成格条件');
  t('多格盘的解析写明可答任一',()=>{
    const multi=pool.filter(q=>q.k64hits.length>1);
    if(!multi.length)return true;
    return multi.every(q=>/答其中任一个都算对/.test(q.ex))?true:'没写明'});

  console.log('\n— 判分认多解 —');
  w.eval(`trainState={qs:${JSON.stringify([{cat:'k64',q:'x',a:'甲课',opts:['甲课','乙课','丙课','丁课'],ex:'e',id:'k64_甲课',k64hits:['甲课','乙课']}])},idx:0,correct:0,wrong:[],answered:false,sessionCats:{}}`);
  d.getElementById('train-opts').innerHTML='<button class="qz-opt"></button><button class="qz-opt"></button><button class="qz-opt"></button><button class="qz-opt"></button>';
  w.trainAnswer(1,d.querySelectorAll('#train-opts .qz-opt')[1]);   // 选「乙课」——本盘也成立
  t('选中本盘同样成立的格算对',()=>w.eval('trainState.correct')===1?true:'算错了');

  t('薄弱点复习中心有入口',()=>{
    const fx=w.eval('FX_CATS.map(x=>x.k)');
    return fx.includes('课体格局')?true:fx.join('、')});

  console.log(`\n${fail?'❌ '+fail+' 项未通过':'✅ 全部 '+pass+' 项通过'}`);
  process.exit(fail?1:0);
},1200);
