const fs = require('fs');

const c1 = fs.readFileSync('/Users/premkumark/Sites/DAG/dag-patient-connect/scripts/chunk1.txt', 'utf8');
const c2a = fs.readFileSync('/Users/premkumark/Sites/DAG/dag-patient-connect/scripts/chunk2a.txt', 'utf8');
const c2b = fs.readFileSync('/Users/premkumark/Sites/DAG/dag-patient-connect/scripts/chunk2b.txt', 'utf8');

const fullCode = c1 + '\n' + c2a + '\n' + c2b;
fs.writeFileSync('/Users/premkumark/Sites/DAG/dag-patient-connect/src/app/(app)/dashboard/page.tsx', fullCode);
console.log('Dashboard assembled successfully!');
