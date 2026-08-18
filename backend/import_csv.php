<?php
/**
 * import_csv.php
 * Importe les inscriptions depuis registrations.csv vers MySQL
 * Lance une seule fois : http://localhost/ammelne-trail/backend/import_csv.php
 */

require_once 'config.php';

$csvPath = __DIR__ . '/../../registrations.csv';

if (!file_exists($csvPath)) {
    die("❌ Fichier registrations.csv introuvable à : $csvPath");
}

$handle  = fopen($csvPath, 'r');
$headers = fgetcsv($handle); // première ligne = en-têtes
$count   = 0;
$errors  = 0;

$stmt = db()->prepare("
    INSERT IGNORE INTO inscriptions
        (full_name, email, phone, city, parcours, tshirt, amount, payment_status, payment_ref, created_at)
    VALUES
        (:full_name, :email, :phone, :city, :parcours, :tshirt, :amount, :payment_status, :payment_ref, :created_at)
");

while (($row = fgetcsv($handle)) !== false) {
    if (count($row) < 2) continue;
    $data = array_combine($headers, $row);

    try {
        $stmt->execute([
            ':full_name'      => $data['fullName']      ?? $data['full_name']      ?? '',
            ':email'          => $data['email']          ?? '',
            ':phone'          => $data['phone']          ?? '',
            ':city'           => $data['city']           ?? 'Tafraout',
            ':parcours'       => $data['parcours']       ?? '',
            ':tshirt'         => $data['tshirt']         ?? 'M',
            ':amount'         => floatval($data['amount'] ?? 0),
            ':payment_status' => $data['paymentStatus']  ?? $data['payment_status'] ?? 'En attente',
            ':payment_ref'    => $data['paymentRef']     ?? $data['payment_ref']    ?? '',
            ':created_at'     => $data['date']           ?? $data['created_at']     ?? date('Y-m-d H:i:s'),
        ]);
        $count++;
    } catch (Exception $e) {
        echo "⚠️  Erreur ligne $count : " . $e->getMessage() . "<br>";
        $errors++;
    }
}

fclose($handle);

echo "✅ Import terminé : <strong>$count inscriptions importées</strong>";
if ($errors) echo ", $errors erreurs.";
echo "<br><br><a href='registrations.php'>Voir les inscriptions →</a>";
