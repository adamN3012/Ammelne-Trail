<?php
// GET /backend/export.php
// Génère et télécharge un fichier Excel avec toutes les inscriptions

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_err('Méthode non autorisée', 405);

// Charger PhpSpreadsheet via Composer (voir README)
require_once __DIR__ . '/vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Color;

// ── Données ───────────────────────────────────────────────────
$rows = db()->query("
    SELECT id, full_name, email, phone, city, parcours, tshirt, amount, payment_status, payment_ref, created_at
    FROM inscriptions ORDER BY id ASC
")->fetchAll();

// ── Spreadsheet ───────────────────────────────────────────────
$spreadsheet = new Spreadsheet();
$sheet       = $spreadsheet->getActiveSheet();
$sheet->setTitle('Inscriptions');

// En-têtes
$headers = ['ID','Nom complet','Email','Téléphone','Ville','Parcours','T-shirt','Montant (MAD)','Statut','Réf. paiement','Date'];
foreach ($headers as $col => $h) {
    $sheet->setCellValueByColumnAndRow($col + 1, 1, $h);
}

// Style en-tête
$headerStyle = [
    'font'      => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF'], 'size' => 11],
    'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF1D4ED8']],
    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
    'borders'   => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FFB0C4DE']]],
];
$sheet->getStyle('A1:K1')->applyFromArray($headerStyle);
$sheet->getRowDimension(1)->setRowHeight(24);
$sheet->freezePane('A2');

// Largeurs colonnes
$widths = [6, 26, 32, 18, 18, 20, 10, 14, 12, 24, 22];
foreach ($widths as $i => $w) {
    $sheet->getColumnDimensionByColumn($i + 1)->setWidth($w);
}

// Données
foreach ($rows as $rowIdx => $r) {
    $row = $rowIdx + 2;
    $sheet->setCellValueByColumnAndRow(1,  $row, $r['id']);
    $sheet->setCellValueByColumnAndRow(2,  $row, $r['full_name']);
    $sheet->setCellValueByColumnAndRow(3,  $row, $r['email']);
    $sheet->setCellValueByColumnAndRow(4,  $row, $r['phone']);
    $sheet->setCellValueByColumnAndRow(5,  $row, $r['city']);
    $sheet->setCellValueByColumnAndRow(6,  $row, $r['parcours']);
    $sheet->setCellValueByColumnAndRow(7,  $row, $r['tshirt']);
    $sheet->setCellValueByColumnAndRow(8,  $row, (float)$r['amount']);
    $sheet->setCellValueByColumnAndRow(9,  $row, $r['payment_status']);
    $sheet->setCellValueByColumnAndRow(10, $row, $r['payment_ref']);
    $sheet->setCellValueByColumnAndRow(11, $row, $r['created_at']);

    // Alternance couleur fond
    $bg = $rowIdx % 2 === 0 ? 'FFFFFFFF' : 'FFE8F0FE';
    $sheet->getStyle("A{$row}:K{$row}")->applyFromArray([
        'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => $bg]],
        'borders'   => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FFB0C4DE']]],
        'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
    ]);

    // Statut "Payé" en vert
    if ($r['payment_status'] === 'Payé') {
        $sheet->getStyleByColumnAndRow(9, $row)->getFont()
            ->setBold(true)->getColor()->setARGB('FF15803D');
    }

    $sheet->getRowDimension($row)->setRowHeight(20);
}

// ── Téléchargement ────────────────────────────────────────────
$filename = 'inscriptions-' . date('Y-m-d') . '.xlsx';

header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header("Content-Disposition: attachment; filename=\"$filename\"");
header('Cache-Control: max-age=0');

// Désactiver le JSON header défini dans config.php
header_remove('Content-Type');
header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

$writer = new Xlsx($spreadsheet);
$writer->save('php://output');
exit;
