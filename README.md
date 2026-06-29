# Meu Álbum — Copa 2026

App para controlar seu álbum de figurinhas Panini FIFA World Cup 26™:
quais faltam, quais estão repetidas, e compartilhar essas listas em um toque.

## Decisões de arquitetura (e o porquê)

**Catálogo mestre = JSON local, não Firestore.**
O Gemini sugeriu uma coleção `stickers` no Firestore. Aqui ele virou
`data/catalog.json`, importado direto pelo front-end. O catálogo é igual
para todo mundo e não muda em tempo real, então não há motivo pra pagar
leituras do Firestore (nem latência de rede) pra buscar ~1000 documentos
que são sempre os mesmos. Buscar por nome/abreviação também fica mais
simples: é um `.filter()` no array, sem nenhuma query.

Se um dia você quiser editar o catálogo sem refazer o deploy do site (ex:
direto no console do Firebase), dá pra migrar essa camada pro Firestore —
veja `scripts/seed-firestore.mjs`, que já está pronto pra isso.

**Inventário do usuário = Firestore (`users/{uid}.inventory`).**
Isso sim é dado dinâmico e privado por pessoa, então faz sentido estar no
Firestore com autenticação. Cada toque numa figurinha atualiza só aquele
campo (`inventory.BRA_05`), não o mapa inteiro — mais rápido e evita
sobrescrever progresso se você tiver duas abas abertas.

**982 figurinhas no catálogo gerado:** 48 seleções confirmadas da Copa 2026
× 20 figurinhas (1–20) + Mundial/FWC (1–19) + 3 "Extra" de exemplo. Os
*nomes* de cada figurinha de time (jogador) estão como placeholder
(`"Brasil #05"`) porque esse mapeamento exato é o conteúdo proprietário do
álbum físico — edite `data/catalog.json` à mão conforme for abrindo os
pacotinhos, ou rode `npm run generate-catalog` de novo se mudar a lista de
times/numeração em `scripts/generate-catalog.mjs`.

## Setup

### 1. Criar o projeto no Firebase

No [console do Firebase](https://console.firebase.google.com/):
1. Crie um projeto (ou use o que você já tem com o Firestore).
2. **Authentication** → Sign-in method → ative **Google**.
3. **Firestore Database** → já deployado, ok manter.
4. **Configurações do projeto** → "Seus apps" → adicione um app **Web** →
   copie o objeto `firebaseConfig`.

### 2. Configurar variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Preencha com os valores do `firebaseConfig` que você copiou.

### 3. Instalar e rodar localmente

```bash
npm install
npm run dev
```

Abra http://localhost:3000 — vai pedir login com Google e te levar pro álbum.

### 4. Publicar as regras de segurança do Firestore

```bash
firebase deploy --only firestore:rules
```

(ou cole o conteúdo de `firestore.rules` direto no console, em Firestore →
Regras)

### 5. Deploy

Next.js funciona muito bem na **Vercel** (zero config, é a empresa que
mantém o framework):

```bash
npx vercel
```

Lembre de configurar as mesmas variáveis de ambiente (`NEXT_PUBLIC_FIREBASE_*`)
no painel da Vercel. Como alternativa, o **Firebase App Hosting** também
suporta Next.js nativamente, se você preferir manter tudo dentro do
ecossistema Firebase.

⚠️ **Importante para o login Google funcionar em produção:** depois do
deploy, vá em Authentication → Settings → "Authorized domains" no console
do Firebase e adicione o domínio da Vercel (ou o seu domínio próprio).

## Estrutura

```
app/
  login/page.jsx       login com Google
  album/page.jsx        grid interativo, organizado por seleção, com busca
  relatorios/page.jsx   faltam / repetidas, exportar CSV e compartilhar
  components/           Header, TeamSection, StickerTile
context/
  AuthContext.jsx        estado de autenticação + cria o doc do usuário
lib/
  firebase.js            inicialização do client SDK
  catalog.js             leitura/busca no catálogo (JSON local)
  inventory.js           cálculo de faltam/repetidas, export, share
data/
  catalog.json            982 figurinhas geradas
scripts/
  generate-catalog.mjs    regera data/catalog.json
  seed-firestore.mjs       opcional — sobe o catálogo pro Firestore
firestore.rules           regras de segurança
```

## Como usar

- **Álbum**: toque numa figurinha pra somar 1 (fica verde = tem 1, dourado =
  repetida). O "−" no canto remove uma unidade. Use a busca pra ir direto a
  uma seleção pelo nome ou pela sigla (ex: "BRA").
- **Relatórios**: lista de faltantes e de repetidas, agrupadas por time.
  "Exportar CSV" baixa um arquivo pra abrir em planilha; "Compartilhar"
  abre o menu nativo do celular (ou o WhatsApp) já com o texto formatado.
