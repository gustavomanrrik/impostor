const fs = require('fs');
const files = [
  'client/src/pages/lobbies/ImpostorLobby.tsx',
  'client/src/pages/lobbies/TestaLobby.tsx',
  'client/src/pages/lobbies/NumbersLobby.tsx',
  'client/src/pages/LocalSetup.tsx'
];
files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/className="btn-icon"/g, 'className="btn btn-secondary btn-icon"');
    content = content.replace(/style=\{\{ position: 'absolute', left: -20, zIndex: 10, background: 'var\(--bg-primary\)', border: '3px solid var\(--text-primary\)' \}\}/g, "style={{ position: 'absolute', left: -24, zIndex: 10 }}");
    content = content.replace(/style=\{\{ position: 'absolute', right: -20, zIndex: 10, background: 'var\(--bg-primary\)', border: '3px solid var\(--text-primary\)' \}\}/g, "style={{ position: 'absolute', right: -24, zIndex: 10 }}");
    fs.writeFileSync(f, content);
  }
});
