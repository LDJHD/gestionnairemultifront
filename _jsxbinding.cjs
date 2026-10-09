/* Vérificateur de Binding JSX : liste les composants capitalisés utilisés dans
   le JSX mais NI importés NI déclarés localement → ReferenceError à l'exécution. */
const fs = require("fs");
const path = require("path");

const fichiers = process.argv.slice(2);
let total = 0;

for (const f of fichiers) {
  const src = fs.readFileSync(f, "utf8");
  const sansComments = src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1");

  // Noms capitalisésEmployees utilisés en JSX : <Xxx ...> ou <Xxx />
  const utilises = new Set();
  for (const m of sansComments.matchAll(/<([A-Z][A-Za-z0-9_]*)(?=[\s/>])/g)) utilises.add(m[1]);

  // Ce qui est importé
  const importes = new Set();
  for (const m of sansComments.matchAll(/import\s+([\s\S]*?)\s+from\s+["'][^"']+["']/g)) {
    const clause = m[1];
    const accolades = clause.match(/\{([\s\S]*?)\}/);
    if (accolades) {
      for (const part of accolades[1].split(",")) {
        const nom = part.trim().split(/\s+as\s+/).pop().trim();
        if (nom) importes.add(nom);
      }
    }
    const defaut = clause.replace(/\{[\s\S]*?\}/, "").replace(/,/g, "").trim();
    if (defaut && /^[A-Z]/.test(defaut)) importes.add(defaut);
  }

  // Déclarations locales (function X, const X =, class X)
  const declares = new Set();
  for (const m of sansComments.matchAll(/(?:^|\s)(?:function|const|let|var|class)\s+([A-Z][A-Za-z0-9_]*)/g))
    declares.add(m[1]);

  const manquants = [...utilises].filter((n) => !importes.has(n) && !declares.has(n));
  total += manquants.length;
  console.log(`\n${path.basename(f)}  (${utilises.size} composants JSX utilisés)`);
  console.log(manquants.length ? "  MANQUANTS : " + manquants.join(", ") : "  OK — tous les composants sont liés");
}

console.log(`\nTotal de composants non liés : ${total}`);
process.exit(total ? 1 : 0);