import fs from 'fs';

const root = 'd:/Project files/Personal/SIH 2026/Maris/definedvc.com/';
for (const f of ['team/mark-trevitt.html', 'team/sean-brownlee.html', 'team/gautam-chintapenta.html', 'team.html', 'index.html']) {
  const html = fs.readFileSync(root + f, 'utf8');
  const imgs = [...html.matchAll(/https:\/\/framerusercontent\.com\/images\/[^"'\s?)]+(?:\.jpg|\.png|\.webp)[^"'\s?) ]*/g)].map((m) => m[0]);
  const unique = [...new Set(imgs)];
  console.log('=== ' + f + ' ===');
  console.log(unique.join('\n'));
  console.log('');
}
