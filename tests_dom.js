const fs=require('fs'),{JSDOM,VirtualConsole}=require('jsdom');
const P='/Users/xiaojin/Documents/文稿同步文件夹/03_学习 (Learning)/Seafile/学习资料/自创项目/liuren-game/index.html';
const vc=new VirtualConsole();vc.on('jsdomError',()=>{});
const dom=new JSDOM(fs.readFileSync(P,'utf8'),{runScripts:'outside-only',virtualConsole:vc});
const d=dom.window.document;
const app=d.querySelector('.app');
console.log('.app 存在:',!!app);
const all=[...d.querySelectorAll('.screen')];
console.log('screen 总数:',all.length);
const outside=all.filter(s=>!app.contains(s));
const inside=all.filter(s=>app.contains(s));
console.log('在 .app 内:',inside.length,'　逃逸到 .app 外:',outside.length);
if(outside.length){
  console.log('\n❌ 逃逸的 screen（按文档顺序）:');
  outside.forEach(s=>console.log('   #'+s.id));
  console.log('\n最后一个仍在 .app 内的 screen: #'+(inside[inside.length-1]||{}).id);
}
// body 直接子元素
console.log('\nbody 直接子元素:');
[...d.body.children].forEach(c=>console.log('   <'+c.tagName.toLowerCase()+(c.id?' id='+c.id:'')+(c.className?' class="'+c.className+'"':'')+'>'));
