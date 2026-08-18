<?php
// GET  /backend/settings.php  → retourne tous les settings
// POST /backend/settings.php  → met à jour un ou plusieurs settings

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $rows = db()->query("SELECT `key`, `value` FROM site_settings")->fetchAll();
    $out  = [];
    foreach ($rows as $r) $out[$r['key']] = $r['value'];
    json_ok($out);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = body();
    if (empty($data)) json_err('Aucune donnée reçue');

    $stmt = db()->prepare("INSERT INTO site_settings (`key`, `value`) VALUES (:k, :v)
                           ON DUPLICATE KEY UPDATE `value` = :v2, updated_at = NOW()");
    foreach ($data as $key => $value) {
        $key   = preg_replace('/[^a-z0-9_]/', '', strtolower($key)); // sanitize key
        $value = (string)$value;
        $stmt->execute([':k' => $key, ':v' => $value, ':v2' => $value]);
    }
    json_ok(['success' => true, 'updated' => count($data)]);
}

json_err('Méthode non autorisée', 405);
