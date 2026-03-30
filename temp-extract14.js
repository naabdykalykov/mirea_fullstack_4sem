const fs = require('fs');
const zlib = require('zlib');
const path = 'C:/Users/abdyk/Downloads/№14 Практические занятия Фронтенд и бэкенд разработка (Часть 2 из 2).pdf';
if (!fs.existsSync(path)) { console.error('not found'); process.exit(1); }
const data = fs.readFileSync(path);
const textChunks = [];
const str = data.toString('latin1');
let idx = 0;
while (true) {
  const s = str.indexOf('stream', idx);
  if (s === -1) break;
  const start = str.indexOf('\n', s);
  const e = str.indexOf('endstream', start);
  if (start === -1 || e === -1) break;
  const raw = data.slice(start + 1, e - 1);
  let out;
  try { out = zlib.inflateSync(raw); } catch (err) { out = raw; }
  const t = out.toString('utf8');
  if (/[А-Яа-яA-Za-z]{5,}/.test(t)) textChunks.push(t);
  idx = e + 9;
}
console.log('chunks', textChunks.length);
textChunks.slice(0,6).forEach((t,i)=>{
  console.log('\n---'+i+'---');
  console.log(t.slice(0,2000));
});
