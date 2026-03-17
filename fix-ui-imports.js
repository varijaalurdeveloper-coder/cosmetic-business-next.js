const fs = require('fs');
const path = require('path');
const root = path.join(process.cwd(), 'src', 'components', 'ui');
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(p);
    } else if (p.endsWith('.tsx') || p.endsWith('.ts')) {
      let t = fs.readFileSync(p, 'utf8');
      const orig = t;
      t = t.replace(/@radix-ui\/react-[\w-]+@[0-9.]+/g, (s) => s.split('@').slice(0,-1).join('@'));
      t = t.replace(/vaul@[0-9.]+/g, 'vaul');
      t = t.replace(/cmdk@[0-9.]+/g, 'cmdk');
      t = t.replace(/react-hook-form@[0-9.]+/g, 'react-hook-form');
      t = t.replace(/react-day-picker@[0-9.]+/g, 'react-day-picker');
      t = t.replace(/recharts@[0-9.]+/g, 'recharts');
      t = t.replace(/next-themes@[0-9.]+/g, 'next-themes');
      t = t.replace(/sonner@[0-9.]+/g, 'sonner');
      t = t.replace(/input-otp@[0-9.]+/g, 'input-otp');
      t = t.replace(/react-resizable-panels@[0-9.]+/g, 'react-resizable-panels');
      t = t.replace(/lucide-react\(empty\)[0-9.]+/g, 'lucide-react');
      if (t !== orig) {
        fs.writeFileSync(p, t, 'utf8');
        console.log('patched', p);
      }
    }
  }
}
walk(root);
