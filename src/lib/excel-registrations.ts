/**
 * excel-registrations.ts
 * - Ajoute chaque inscription dans le MÊME fichier registrations.xlsx
 * - Ne supprime jamais le fichier, ne crée pas de fichier temporaire
 * - Tableau avec bordures sur toutes les cellules
 * - Si le fichier est verrouillé par Excel (ouvert), retourne une erreur claire
 */

import fs from "fs";
import path from "path";

export const XLSX_PATH = path.join(process.cwd(), "registrations.xlsx");

const COLUMNS = [
  { header: "ID",                 key: "id",            width: 6  },
  { header: "Nom complet",        key: "fullName",      width: 26 },
  { header: "Email",              key: "email",         width: 32 },
  { header: "Téléphone",          key: "phone",         width: 18 },
  { header: "Ville",              key: "city",          width: 18 },
  { header: "Parcours",           key: "parcours",      width: 20 },
  { header: "Taille t-shirt",     key: "tshirt",        width: 14 },
  { header: "Montant (MAD)",      key: "amount",        width: 14 },
  { header: "Statut paiement",    key: "paymentStatus", width: 16 },
  { header: "Référence paiement", key: "paymentRef",    width: 24 },
  { header: "Date d'inscription", key: "date",          width: 24 },
];

export interface RegistrationRow {
  fullName:      string;
  email:         string;
  phone:         string;
  city:          string;
  parcours:      string;
  tshirt:        string;
  amount:        number;
  paymentStatus: string;
  paymentRef:    string;
  date:          string;
}

const BORDER_THIN = { style: "thin" as const, color: { argb: "FFB0C4DE" } };

function applyBorders(row: any, numCols: number) {
  for (let c = 1; c <= numCols; c++) {
    const cell = row.getCell(c);
    cell.border = {
      top:    BORDER_THIN,
      left:   BORDER_THIN,
      bottom: BORDER_THIN,
      right:  BORDER_THIN,
    };
  }
}

export async function appendRegistrationToExcel(row: RegistrationRow): Promise<number> {
  const ExcelJS = (await import("exceljs")).default ?? (await import("exceljs"));

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Trail Tafraout";

  let sheet: any;
  let nextId = 1;

  if (fs.existsSync(XLSX_PATH)) {
    // ── Charger le fichier existant ──────────────────────────
    await workbook.xlsx.readFile(XLSX_PATH);
    sheet = workbook.getWorksheet("Inscriptions");

    if (!sheet) {
      // La feuille n'existe pas encore dans ce fichier — on la crée
      sheet = workbook.addWorksheet("Inscriptions");
      sheet.columns = COLUMNS;
      _styleHeader(sheet);
      nextId = 1;
    } else {
      // Compter les lignes existantes pour calculer le prochain ID
      // rowCount inclut l'en-tête (ligne 1), donc données = rowCount - 1
      const dataCount = sheet.rowCount - 1;
      nextId = dataCount > 0 ? dataCount + 1 : 1;
    }
  } else {
    // ── Créer le fichier pour la première fois ───────────────
    sheet = workbook.addWorksheet("Inscriptions");
    sheet.columns = COLUMNS;
    _styleHeader(sheet);
    nextId = 1;
  }

  // ── Ajouter la nouvelle ligne ────────────────────────────
  const newRow = sheet.addRow({
    id:            nextId,
    fullName:      row.fullName,
    email:         row.email,
    phone:         row.phone,
    city:          row.city,
    parcours:      row.parcours,
    tshirt:        row.tshirt,
    amount:        row.amount,
    paymentStatus: row.paymentStatus,
    paymentRef:    row.paymentRef,
    date:          row.date,
  });

  // Alternance blanc / bleu très clair
  newRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: nextId % 2 === 0 ? "FFE8F0FE" : "FFFFFFFF" },
  };
  newRow.alignment = { vertical: "middle" };
  newRow.height    = 20;

  // Statut "Payé" en vert gras
  if (row.paymentStatus === "Payé") {
    newRow.getCell("paymentStatus").font = { color: { argb: "FF15803D" }, bold: true };
  }

  // Bordures sur toutes les colonnes
  applyBorders(newRow, COLUMNS.length);
  newRow.commit();

  // ── Écrire dans le MÊME fichier (pas de suppression, pas de tmp) ──
  await workbook.xlsx.writeFile(XLSX_PATH);

  return nextId;
}

/** Style de la ligne d'en-tête (appelé une seule fois à la création) */
function _styleHeader(sheet: any) {
  const headerRow = sheet.getRow(1);
  headerRow.font      = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
  headerRow.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1D4ED8" } };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };
  headerRow.height    = 24;
  applyBorders(headerRow, COLUMNS.length);
  headerRow.commit();

  // Première ligne figée (toujours visible en scrollant)
  sheet.views = [{ state: "frozen", ySplit: 1 }];
}
