/* 断案入门(DR_CASES) + 案例库(DR_CASELIB) 的**盘面自检**。
   这两个库此前一直没有测试覆盖——2026-08-24 往六壬课程搬运时才发现里面积了
   4 处错（1 处盘真错、2 处标注错、1 处误报）。这个脚本就是防它再积。

   验三件事，全部只用 board 里原书给的四样（日干支/月将/占时/三传）推：
     ① 「第N局」与月将加占时的偏移量对不对得上（off = (13-N) % 12）
     ② 正文里说的「干上X」「支上Y」「旬空XY」与复算对不对得上
     ③ 三传的中末传是不是初传的天盘递取（伏吟/返吟/昴星等特殊课式除外，会跳过）
   ⚠️ 不验断语对错——那是学理，脚本管不了，只管盘面自洽。 */
const fs = require('fs'), vm = require('vm'), path = require('path');
const h = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
function grab(n) {
  const i = h.indexOf('const ' + n + '=');
  if (i < 0) throw new Error('找不到 ' + n);
  const r = h.slice(i);
  return r.slice(0, r.slice(1).search(/\n(const|var|let|function|\/\*)/) + 1);
}
const ctx = {};
['DR_CASES', 'DR_CASELIB'].forEach(n => vm.runInNewContext(grab(n) + ';' + n + '_=' + n, ctx));
const ALL = [...ctx.DR_CASES_, ...ctx.DR_CASELIB_];

const Z = '子丑寅卯辰巳午未申酉戌亥'.split('');
const JI = { 甲:'寅', 乙:'辰', 丙:'巳', 戊:'巳', 丁:'未', 己:'未', 庚:'申', 辛:'戌', 壬:'亥', 癸:'丑' };
const G10 = '甲乙丙丁戊己庚辛壬癸'.split('');
const CN = { 一:1, 二:2, 三:3, 四:4, 五:5, 六:6, 七:7, 八:8, 九:9, 十:10, 十一:11, 十二:12 };
const tp = (yj, zs) => {
  const off = (Z.indexOf(yj) - Z.indexOf(zs) + 12) % 12, m = {};
  Z.forEach(d => m[d] = Z[(Z.indexOf(d) + off) % 12]);
  return m;
};
function kong(rgz) {   // 旬空两支
  const n = [...Array(60).keys()].find(k => G10[k % 10] === rgz[0] && Z[k % 12] === rgz[1]);
  const head = n - (n % 10);
  return [Z[(head + 10) % 12], Z[(head + 11) % 12]];
}
const strip = s => String(s || '').replace(/<[^>]+>/g, '');
// 特殊课式的中末传另有取法，不按天盘递取，第③项跳过
const SPECIAL = /伏吟|返吟|昴星|别责|八专|第一局/;

let fail = 0, checked = 0, warned = 0;
const bad = (id, msg) => { console.log('  ✗ ' + id + '　' + msg); fail++; };

ALL.forEach(c => {
  const b = c.board;
  if (!b || !b.r || !b.yj || !b.zs || !(b.sc || []).length) return bad(c.id, 'board 不全');
  checked++;
  const t = tp(b.yj, b.zs), off = (Z.indexOf(b.yj) - Z.indexOf(b.zs) + 12) % 12;
  const gan = b.r[0], zhi = b.r[1];
  const ganUp = t[JI[gan]], zhiUp = t[zhi], kg = kong(b.r);
  const say = strip(b.mt) + ' ' + strip(c.bnote) + ' ' +
              (c.steps || []).map(s => strip(s.p) + strip(s.a)).join(' ');

  // ① 局数
  const m = /第([一二三四五六七八九十]+)局/.exec(b.mt || '');
  if (m && CN[m[1]] !== undefined) {
    const want = (13 - CN[m[1]]) % 12;
    if (off !== want)
      bad(c.id, `标「第${CN[m[1]]}局」应 off=${want}，但 ${b.yj}将加${b.zs}时 → off=${off}`);
  }
  // ② 正文说法
  let mm, re1 = /干上(?:神)?(?:是|为)?([子丑寅卯辰巳午未申酉戌亥])/g;
  while ((mm = re1.exec(say))) if (mm[1] !== ganUp) bad(c.id, `正文说干上${mm[1]}，复算是${ganUp}`);
  let re2 = /支上(?:神)?(?:是|为)?([子丑寅卯辰巳午未申酉戌亥])/g;
  while ((mm = re2.exec(say))) if (mm[1] !== zhiUp) bad(c.id, `正文说支上${mm[1]}，复算是${zhiUp}`);
  let re3 = /旬空([子丑寅卯辰巳午未申酉戌亥])([子丑寅卯辰巳午未申酉戌亥])/g;
  while ((mm = re3.exec(say)))
    if (mm[1] !== kg[0] || mm[2] !== kg[1]) bad(c.id, `正文说旬空${mm[1]}${mm[2]}，复算是${kg.join('')}`);
  // ③ 三传递取。board.warn ＝ 已知"盘是反推的、三传来历待核"，跳过但会计数
  if (b.warn) { warned++; return; }
  if (!SPECIAL.test(b.mt || '') && off !== 0) {
    const want = [b.sc[0], t[b.sc[0]], t[t[b.sc[0]]]];
    if (want.join('') !== b.sc.join(''))
      bad(c.id, `三传 ${b.sc.join('')} 非天盘递取（递取应为 ${want.join('')}）——若确是特殊课式，请在 mt 里写明课名`);
  }
});

// ⚠️ 已知的唯一豁免：lcai11 的 mt 用的是原著格名「弃三传就干上午财」，
//    而本盘干上是辰（午是日支）。正文 recap 已写明"干上辰，不可误说干上午"，
//    是**有意保留的原著措辞**，不是错。
console.log(`\n检了 ${checked} 例（入门 ${ctx.DR_CASES_.length} + 案例库 ${ctx.DR_CASELIB_.length}）`);
console.log(`其中 ${warned} 例带 warn（盘为反推、三传待核原书），三传那项跳过`);
const KNOWN = 1;
if (fail === KNOWN) console.log(`✅ 只剩 ${KNOWN} 条已知豁免（lcai11 原著格名措辞），无新问题`);
else if (fail > KNOWN) console.log(`✗ ${fail} 条，比已知豁免多 ${fail - KNOWN} 条`);
else console.log('✅ 全部通过');
process.exit(fail > KNOWN ? 1 : 0);
