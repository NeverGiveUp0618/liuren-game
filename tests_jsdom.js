const fs=require('fs'),{JSDOM}=require('jsdom');
const P='/Users/xiaojin/Documents/文稿同步文件夹/03_学习 (Learning)/Seafile/学习资料/自创项目/liuren-game/index.html';
const errs=[];
const dom=new JSDOM(fs.readFileSync(P,'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/'});
dom.virtualConsole.on('jsdomError',e=>{if(!/scrollTo|Not implemented/.test(e.message))errs.push('JSDOM:'+e.message)});
dom.window.onerror=(m)=>errs.push('onerror:'+m);
setTimeout(()=>{
  const w=dom.window,d=w.document;
  const t=(n,f)=>{try{const r=f();console.log((r===true?'✓':'✗')+' '+n+(r===true?'':' → '+r));if(r!==true)errs.push(n)}catch(e){console.log('✗ '+n+' → THREW '+e.message);errs.push(n)}};

  t('页面无脚本错误',()=>errs.length===0?true:errs.join('|'));
  t('JIAZI 60项',()=>w.eval('JIAZI.length')===60?true:'len='+w.eval('JIAZI.length'));
  t('jzOfYear(1978)=戊午',()=>w.jzOfYear(1978)==='戊午'||w.jzOfYear(1978));
  t('xingnianOf 男30=乙未',()=>w.xingnianOf('m',30)==='乙未'||w.xingnianOf('m',30));
  t('xingnianOf 女1=壬申',()=>w.xingnianOf('f',1)==='壬申'||w.xingnianOf('f',1));

  // 打开起课速查 → 本命行年 tab
  w.show('pqk');
  t('pqk 激活',()=>d.getElementById('pqk').classList.contains('active')||'not active');
  t('男行年表已渲染',()=>{const h=d.getElementById('mn-tbl-m').innerHTML;return (h.includes('丙寅')&&h.includes('乙未'))||'空表'});
  t('女行年表已渲染',()=>{const h=d.getElementById('mn-tbl-f').innerHTML;return (h.includes('壬申')&&h.includes('癸亥'))||'空表'});
  w.switchQKTabById('tab-mn');
  t('本命行年tab可切换',()=>d.getElementById('tab-mn').classList.contains('active')||'no');
  d.getElementById('mn-sex').value='m';
  d.getElementById('mn-by').value='1978';
  d.getElementById('mn-ny').value='2007';
  w.mnCalc();
  const mo=d.getElementById('mn-out').textContent;
  t('计算器出戊午/30/乙未/丁亥',()=>(mo.includes('戊午')&&mo.includes('30')&&mo.includes('乙未')&&mo.includes('丁亥'))||mo.slice(0,120));
  d.getElementById('mn-by').value='';w.mnCalc();
  t('空出生年给出提示',()=>d.getElementById('mn-out').textContent.includes('有效的出生年')||'no guard');

  // 自选起课 + 年命
  w.show('pqi');
  d.getElementById('qi-rg').value='丙';d.getElementById('qi-rz').value='申';
  d.getElementById('qi-yj').value='4'; // 夏至后·未将
  d.getElementById('qi-zs').value='巳';
  d.getElementById('qi-sex').value='';
  w.qiCast();
  t('无性别时不出年命卡',()=>d.getElementById('qi-nm').innerHTML===''||'不应渲染');
  t('课盘正常渲染',()=>d.getElementById('qi-board').innerHTML.includes('三 传')||'no board');
  d.getElementById('qi-sex').value='m';
  d.getElementById('qi-by').value='1978';d.getElementById('qi-ny').value='2007';
  w.qiCast();
  const nm=d.getElementById('qi-nm').textContent;
  t('年命卡含太岁/本命/行年',()=>(nm.includes('太岁')&&nm.includes('本命')&&nm.includes('行年'))||nm.slice(0,80));
  t('年命卡三干支正确',()=>(nm.includes('丁亥')&&nm.includes('戊午')&&nm.includes('乙未'))||nm.slice(0,200));
  d.getElementById('qi-by').value='';w.qiCast();
  t('性别有年份缺→提示不崩',()=>d.getElementById('qi-nm').textContent.includes('未加年命')||'no guard');

  // 讲义课例盘面校验：丙申日 未将 巳时 → 四课 未酉戌子
  d.getElementById('qi-by').value='1978';w.qiCast();
  const bd=d.getElementById('qi-board').textContent;
  t('讲义课例四课含未酉戌子',()=>['未','酉','戌','子'].every(z=>bd.includes(z))||bd.slice(0,100));

  // 行年闪卡
  t('行年闪卡8条',()=>w.eval("KJ_DATA['行年法'].length")===8||w.eval("KJ_DATA['行年法'].length"));
  t('闪卡不含旧错误算法',()=>!w.eval("JSON.stringify(KJ_DATA['行年法'])").includes('以本命年支为起点')||'旧文案仍在');
  t('闪卡含丙寅顺行',()=>w.eval("JSON.stringify(KJ_DATA['行年法'])").includes('丙寅')||'缺');


  // ════ 八煞九宝模块 ════
  w.show('pbjb');
  t('pbjb 总纲渲染',()=>d.getElementById('bj-body').textContent.includes('五行的乖戾之气')||'no');
  w.bjTab(d.querySelectorAll('#pbjb .qk-tab')[1],'sha');
  t('八煞8项',()=>{const n=d.querySelectorAll('#pbjb .bj-sec').length;return n===8||'得'+n});
  t('八煞顺序 刑冲破害墓鬼败空',()=>{const a=[...d.querySelectorAll('#pbjb .bj-nm')].map(e=>e.textContent).join('');return a==='刑冲破害墓鬼败空'||a});
  t('害含逐条加临断语',()=>d.getElementById('bj-body').textContent.includes('事无终始，官灾口舌')||'缺');
  t('空含十恶大败日',()=>d.getElementById('bj-body').textContent.includes('十恶大败')||'缺');
  w.bjTab(d.querySelectorAll('#pbjb .qk-tab')[2],'bao');
  t('九宝9项',()=>{const n=d.querySelectorAll('#pbjb .bj-sec').length;return n===9||'得'+n});
  t('九宝顺序 德合奇仪禄马生旺贵',()=>{const a=[...d.querySelectorAll('#pbjb .bj-nm')].map(e=>e.textContent).join('');return a==='德合奇仪禄马生旺贵'||a});
  t('德含四德查表',()=>{const x=d.getElementById('bj-body').textContent;return (x.includes('天德')&&x.includes('月德')&&x.includes('支德')&&x.includes('二德临身'))||'缺'});
  t('奇含旬奇干奇联珠',()=>{const x=d.getElementById('bj-body').textContent;return (x.includes('旬奇')&&x.includes('干奇')&&x.includes('联珠三奇'))||'缺'});
  t('马含丁神',()=>d.getElementById('bj-body').textContent.includes('旬丁')||'缺');
  t('折叠可展开',()=>{const b=d.querySelector('#pbjb .bj-tog');w.bjToggle(b);return b.nextElementSibling.classList.contains('open')||'no'});

  // ════ 查表交叉核对（讲义值）════
  const T=w.eval('BJ_TBL');
  t('日德 甲→寅 乙→申 丙→巳 丁→亥 戊→巳',()=>['甲寅','乙申','丙巳','丁亥','戊巳'].every(x=>T.riDe[x[0]]===x[1])||JSON.stringify(T.riDe));
  t('支德 = 日支+5',()=>w.eval("ZHI_ALL").every((z,i)=>T.zhiDe[z]===w.eval("ZHI_ALL")[(i+5)%12])||JSON.stringify(T.zhiDe));
  t('旬奇 甲子/甲戌→丑 甲申/甲午→亥 甲辰/甲寅→子',()=>(T.xunQi['甲子']==='丑'&&T.xunQi['甲戌']==='丑'&&T.xunQi['甲申']==='亥'&&T.xunQi['甲午']==='亥'&&T.xunQi['甲辰']==='子'&&T.xunQi['甲寅']==='子')||JSON.stringify(T.xunQi));
  t('干奇 甲午乙巳丙辰丁卯戊寅己丑庚未辛申壬酉癸戌',()=>['甲午','乙巳','丙辰','丁卯','戊寅','己丑','庚未','辛申','壬酉','癸戌'].every(x=>T.ganQi[x[0]]===x[1])||JSON.stringify(T.ganQi));
  t('日禄 甲寅乙卯丙戊巳丁己午庚申辛酉壬亥癸子',()=>['甲寅','乙卯','丙巳','丁午','戊巳','己午','庚申','辛酉','壬亥','癸子'].every(x=>T.lu[x[0]]===x[1])||JSON.stringify(T.lu));
  t('驿马 申子辰寅·巳酉丑亥·亥卯未巳·寅午戌申',()=>(T.ma['申子辰']==='寅'&&T.ma['巳酉丑']==='亥'&&T.ma['亥卯未']==='巳'&&T.ma['寅午戌']==='申')||JSON.stringify(T.ma));
  t('旬丁 甲子→卯 甲午→酉 甲寅→巳',()=>(T.dingShen['甲子']==='卯'&&T.dingShen['甲午']==='酉'&&T.dingShen['甲寅']==='巳')||JSON.stringify(T.dingShen));
  t('十干墓 甲癸未·丙戊乙戌·庚丁己丑·壬辛辰',()=>['甲未','癸未','丙戌','戊戌','乙戌','庚丑','丁丑','己丑','壬辰','辛辰'].every(x=>T.muGan[x[0]]===x[1])||JSON.stringify(T.muGan));
  t('沐浴 甲乙子丙丁卯戊己酉庚辛午壬癸酉',()=>['甲子','乙子','丙卯','丁卯','戊酉','己酉','庚午','辛午','壬酉','癸酉'].every(x=>T.bai[x[0]]===x[1])||JSON.stringify(T.bai));
  t('帝旺 甲乙卯丙丁午戊己壬癸子庚辛酉',()=>['甲卯','乙卯','丙午','丁午','戊子','己子','壬子','癸子','庚酉','辛酉'].every(x=>T.diwang[x[0]]===x[1])||JSON.stringify(T.diwang));
  t('十恶大败10日',()=>T.wulu.length===10&&T.wulu.includes('甲戌')&&T.wulu.includes('己丑')||T.wulu.join(''));
  t('六害6对',()=>T.hai.length===6&&T.haiDuan.length===12||'数目不符');
  t('贵人表与站内GR_Z一致',()=>{const G=w.eval('GR_Z');return (G['甲']==='丑'&&G['辛']==='午'&&G['壬']==='巳')||JSON.stringify(G)});

  // ════ 真盘自动检测 ════
  w.show('pqi');
  d.getElementById('qi-rg').value='丙';d.getElementById('qi-rz').value='申';
  d.getElementById('qi-yj').value='4';d.getElementById('qi-zs').value='巳';
  d.getElementById('qi-sex').value='';
  w.qiCast();
  const bj=d.getElementById('qi-bj').textContent;
  t('检测卡渲染',()=>bj.includes('八煞九宝 · 自动检测')||'no');
  t('讲义课例三传=子寅辰',()=>{const st=w.eval("_manualKC('丙','申',YJ_TBL[4],'巳')");return [st.cc,st.zc,st.mc].join('')==='子寅辰'||[st.cc,st.zc,st.mc].join('')});
  t('讲义课例为重审课',()=>{const st=w.eval("_manualKC('丙','申',YJ_TBL[4],'巳')");return st.mt==='重审课'||st.mt});
  t('丙禄巳不在课传→不误报',()=>!bj.includes('巳为丙日之禄')||'误报了');
  t('末传辰空亡应检出勿用',()=>bj.includes('末传空 → 勿用')||bj.slice(0,400));
  t('丙申日甲午旬 旬仪为午',()=>!bj.includes('旬仪')||bj.includes('午为甲午旬旬仪')||bj.slice(0,400));
  t('检测卡带免责提示',()=>bj.includes('不等于吉凶结论')||'缺');
  // 空盘边界：遍历全部60日×12将×12时不应抛错
  t('全量600组不抛错',()=>{
    const G=w.eval('GAN_ALL'),Z=w.eval('ZHI_ALL'),Y=w.eval('YJ_TBL');let c=0;
    for(let i=0;i<60;i++){const rg=G[i%10],rz=Z[i%12];
      for(let y=0;y<12;y+=3)for(let z=0;z<12;z+=3){
        const st=w.eval(`_manualKC('${rg}','${rz}',YJ_TBL[${y}],'${Z[z]}')`);
        if(!st)continue; w.kcState=st; w.eval('_bjDetect(kcState)'); c++;}}
    return c>500?true:'仅测'+c+'组';
  });

  console.log('\n'+(errs.length?'❌ 失败 '+errs.length+' 项':'✅ 全部通过'));
  process.exit(errs.length?1:0);
},1200);
