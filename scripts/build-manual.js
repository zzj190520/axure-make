import { spawnSync } from 'child_process';
import fs from 'fs';

const entries = [
  'components/ref-button',
  'components/ref-line-chart',
  'components/side-menu',
  'prototypes/bi-data-platform',
  'prototypes/bi-data-platform-mobile',
  'prototypes/ed-quality-ai-platform',
  'prototypes/ipd-delivery-system',
  'themes/antd-new',
  'themes/firecrawl',
  'themes/trae-design',
];

for (const key of entries) {
  console.log(`\n==== 构建入口: ${key} ====`);
  const result = spawnSync('npx', ['vite', 'build'], {
    cwd: process.cwd(),
    env: { ...process.env, ENTRY_KEY: key },
    stdio: 'inherit',
    shell: true,
  });

  if (result.status !== 0) {
    console.error(`构建 ${key} 失败，退出码 ${result.status}`);
    process.exit(result.status ?? 1);
  }
}

console.log('\n所有入口构建完成 ✅');
