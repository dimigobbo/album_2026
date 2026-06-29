// Gera data/catalog.json a partir da lista oficial das 48 seleções da Copa 2026.
// Reexecute este script (`node scripts/generate-catalog.mjs`) sempre que quiser
// regenerar o catálogo do zero (ex: depois de editar a lista de times abaixo).
//
// IMPORTANTE: os nomes dos jogadores/figurinhas de cada time (campos `name`)
// são preenchidos como placeholder ("Brasil #05"), porque o conteúdo exato do
// álbum oficial (qual jogador é a figurinha nº5 do Brasil, por exemplo) não é
// um dado público estruturado — vem do álbum físico/digital da Panini. Edite
// data/catalog.json diretamente para colocar os nomes reais conforme você for
// abrindo os pacotinhos, ou troque o helper `placeholderName` abaixo por uma
// leitura de um CSV/planilha sua com os nomes já mapeados.

import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// 12 grupos x 4 seleções = 48 (fase de grupos da Copa 2026, confirmada)
const TEAMS = [
  // Grupo A
  { team: "México", abbreviation: "MEX", group: "A" },
  { team: "Coreia do Sul", abbreviation: "KOR", group: "A" },
  { team: "África do Sul", abbreviation: "RSA", group: "A" },
  { team: "Tchéquia", abbreviation: "CZE", group: "A" },
  // Grupo B
  { team: "Canadá", abbreviation: "CAN", group: "B" },
  { team: "Suíça", abbreviation: "SUI", group: "B" },
  { team: "Catar", abbreviation: "QAT", group: "B" },
  { team: "Bósnia e Herzegovina", abbreviation: "BIH", group: "B" },
  // Grupo C
  { team: "Brasil", abbreviation: "BRA", group: "C" },
  { team: "Marrocos", abbreviation: "MAR", group: "C" },
  { team: "Haiti", abbreviation: "HAI", group: "C" },
  { team: "Escócia", abbreviation: "SCO", group: "C" },
  // Grupo D
  { team: "Estados Unidos", abbreviation: "USA", group: "D" },
  { team: "Paraguai", abbreviation: "PAR", group: "D" },
  { team: "Austrália", abbreviation: "AUS", group: "D" },
  { team: "Turquia", abbreviation: "TUR", group: "D" },
  // Grupo E
  { team: "Alemanha", abbreviation: "GER", group: "E" },
  { team: "Curaçao", abbreviation: "CUW", group: "E" },
  { team: "Costa do Marfim", abbreviation: "CIV", group: "E" },
  { team: "Equador", abbreviation: "ECU", group: "E" },
  // Grupo F
  { team: "Holanda", abbreviation: "NED", group: "F" },
  { team: "Japão", abbreviation: "JPN", group: "F" },
  { team: "Tunísia", abbreviation: "TUN", group: "F" },
  { team: "Suécia", abbreviation: "SWE", group: "F" },
  // Grupo G
  { team: "Bélgica", abbreviation: "BEL", group: "G" },
  { team: "Egito", abbreviation: "EGY", group: "G" },
  { team: "Irã", abbreviation: "IRN", group: "G" },
  { team: "Nova Zelândia", abbreviation: "NZL", group: "G" },
  // Grupo H
  { team: "Espanha", abbreviation: "ESP", group: "H" },
  { team: "Cabo Verde", abbreviation: "CPV", group: "H" },
  { team: "Arábia Saudita", abbreviation: "KSA", group: "H" },
  { team: "Uruguai", abbreviation: "URU", group: "H" },
  // Grupo I
  { team: "França", abbreviation: "FRA", group: "I" },
  { team: "Senegal", abbreviation: "SEN", group: "I" },
  { team: "Iraque", abbreviation: "IRQ", group: "I" },
  { team: "Noruega", abbreviation: "NOR", group: "I" },
  // Grupo J
  { team: "Argentina", abbreviation: "ARG", group: "J" },
  { team: "Argélia", abbreviation: "ALG", group: "J" },
  { team: "Áustria", abbreviation: "AUT", group: "J" },
  { team: "Jordânia", abbreviation: "JOR", group: "J" },
  // Grupo K
  { team: "Portugal", abbreviation: "POR", group: "K" },
  { team: "Colômbia", abbreviation: "COL", group: "K" },
  { team: "Uzbequistão", abbreviation: "UZB", group: "K" },
  { team: "RD Congo", abbreviation: "COD", group: "K" },
  // Grupo L
  { team: "Inglaterra", abbreviation: "ENG", group: "L" },
  { team: "Croácia", abbreviation: "CRO", group: "L" },
  { team: "Gana", abbreviation: "GHA", group: "L" },
  { team: "Panamá", abbreviation: "PAN", group: "L" },
];

const STICKERS_PER_TEAM = 20; // confirmado por você: figurinhas 1 a 20 por seleção
const FWC_COUNT = 19; // confirmado por você: figurinhas FWC 1 a 19
const EXTRA_EXAMPLE_COUNT = 3; // exemplo — ajuste para a quantidade real de "Extra"

const pad2 = (n) => String(n).padStart(2, "0");

function buildCatalog() {
  const catalog = [];

  for (const t of TEAMS) {
    for (let n = 1; n <= STICKERS_PER_TEAM; n++) {
      catalog.push({
        id: `${t.abbreviation}_${pad2(n)}`,
        number: n,
        name: `${t.team} #${pad2(n)}`, // placeholder — edite com o nome real do jogador
        team: t.team,
        abbreviation: t.abbreviation,
        group: t.group,
        category: "Team",
      });
    }
  }

  for (let n = 1; n <= FWC_COUNT; n++) {
    catalog.push({
      id: `FWC_${pad2(n)}`,
      number: n,
      name: `Mundial #${pad2(n)}`, // placeholder — taça, mascote, estádios etc.
      team: "Mundial (FWC)",
      abbreviation: "FWC",
      group: null,
      category: "FWC",
    });
  }

  // Categoria "Extra" deixada como exemplo — ajuste a quantidade real
  // (o álbum físico tem cromos especiais além do FWC; edite/expanda aqui
  // quando confirmar a numeração exata no seu álbum).
  for (let n = 1; n <= EXTRA_EXAMPLE_COUNT; n++) {
    catalog.push({
      id: `EXTRA_${pad2(n)}`,
      number: n,
      name: `Especial #${pad2(n)}`,
      team: "Especiais",
      abbreviation: "EXTRA",
      group: null,
      category: "Extra",
    });
  }

  return catalog;
}

const catalog = buildCatalog();
const outPath = join(__dirname, "..", "data", "catalog.json");
writeFileSync(outPath, JSON.stringify(catalog, null, 2));

console.log(`Catálogo gerado com ${catalog.length} figurinhas em ${outPath}`);
console.log(`- Times: ${TEAMS.length} x ${STICKERS_PER_TEAM} = ${TEAMS.length * STICKERS_PER_TEAM}`);
console.log(`- FWC: ${FWC_COUNT}`);
console.log(`- Extra (exemplo): ${EXTRA_EXAMPLE_COUNT}`);
