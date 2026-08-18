<?php
/**
 * import_settings.php
 * Importe site_settings.json vers la table site_settings MySQL
 * Lance une seule fois : http://localhost/ammelne-trail/backend/import_settings.php
 */

require_once 'config.php';

$jsonPath = __DIR__ . '/../../site_settings.json';

if (!file_exists($jsonPath)) {
    die("❌ Fichier site_settings.json introuvable. Aucun setting à importer.");
}

$settings = json_decode(file_get_contents($jsonPath), true);
if (!$settings) {
    die("❌ Fichier site_settings.json invalide ou vide.");
}

$stmt = db()->prepare("
    INSERT INTO site_settings (`key`, `value`)
    VALUES (:k, :v)
    ON DUPLICATE KEY UPDATE `value` = :v2, updated_at = NOW()
");

$count = 0;
foreach ($settings as $key => $value) {
    $key   = preg_replace('/[^a-z0-9_]/', '', strtolower($key));
    $value = (string)$value;
    $stmt->execute([':k' => $key, ':v' => $value, ':v2' => $value]);
    $count++;
}

echo "✅ Import terminé : <strong>$count settings importés</strong>";
echo "<br><br>Vos textes, logo et paramètres sont maintenant dans MySQL.";
