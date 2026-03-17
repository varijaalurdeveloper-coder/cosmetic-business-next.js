const fs = require('fs');
const path = require('path');
function walk(dir){
  let res = [];
  for(const name of fs.readdirSync(dir,{withFileTypes:true})){
    const p = path.join(dir,name.name);
    if(name.isDirectory()) res = res.concat(walk(p));
    else if(name.isFile() && p.endsWith('.tsx')) res.push(p);
  }
  return res;
}
const files = walk('src/components/ui');
let updated=0;
for(const f of files){
  let c=fs.readFileSync(f,'utf8');
  const old=c;
  c=c.replace(/@radix-ui\/react-([a-z0-9-]+)@[0-9]+\.[0-9]+\.[0-9]+/g,'@radix-ui/react-$1');
  c=c.replace(/lucide-react\(empty\)\d+\.?\d*/g,'lucide-react');
  if(c!==old){ fs.writeFileSync(f,c,'utf8'); updated++; console.log('updated',f); }
}
console.log('done',updated,'files');
