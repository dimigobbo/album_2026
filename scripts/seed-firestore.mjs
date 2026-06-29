// OPCIONAL — use apenas se você quiser manter o catálogo mestre dentro do
// Firestore (a abordagem que o Gemini sugeriu originalmente), em vez de
// usar data/catalog.json direto no front-end (a abordagem que este projeto
// usa por padrão, mais barata e mais rápida — veja lib/catalog.js).
//
// Quando isso pode valer a pena:
// - Você quer editar/corrigir nomes de figurinhas direto no console do
//   Firebase, sem precisar redeployar o site.
// - Você quer rodar Cloud Functions que leem o catálogo no servidor.
//
// Como usar:
// 1. No console do Firebase: Configurações do projeto > Contas de serviço >
//    "Gerar nova chave privada" — isso baixa um JSON.
// 2. Salve esse arquivo como scripts/serviceAccountKey.json (já está no
//    .gitignore — NUNCA suba esse arquivo pro GitHub).
// 3. npm install firebase-admin
// 4. node scripts/seed-firestore.mjs

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const __dirname = dirname(fileURLToPath(import.meta.url));

const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, "serviceAccountKey.json"), "utf-8")
);

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const catalog = JSON.parse(
  readFileSync(join(__dirname, "..", "data", "catalog.json"), "utf-8")
);

async function seed() {
  // batch.set tem limite de 500 operações — quebramos em lotes.
  const BATCH_SIZE = 450;
  for (let i = 0; i < catalog.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const slice = catalog.slice(i, i + BATCH_SIZE);
    for (const sticker of slice) {
      const ref = db.collection("stickers").doc(sticker.id);
      batch.set(ref, sticker);
    }
    await batch.commit();
    console.log(`Enviadas ${Math.min(i + BATCH_SIZE, catalog.length)}/${catalog.length}`);
  }
  console.log("Catálogo enviado para o Firestore com sucesso.");
}

seed().catch((err) => {
  console.error("Erro ao popular o Firestore:", err);
  process.exit(1);
});
