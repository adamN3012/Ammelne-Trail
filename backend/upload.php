<?php
// POST /backend/upload.php
// Upload du logo (image PNG/JPG/SVG/WEBP, max 2 Mo)

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_err('Méthode non autorisée', 405);

$file = $_FILES['logo'] ?? null;
if (!$file || $file['error'] !== UPLOAD_ERR_OK) json_err('Fichier manquant ou erreur upload');

$allowed = ['image/png','image/jpeg','image/webp','image/svg+xml'];
$mime    = mime_content_type($file['tmp_name']);
if (!in_array($mime, $allowed)) json_err('Format non autorisé (PNG, JPG, WEBP, SVG uniquement)');
if ($file['size'] > 2 * 1024 * 1024) json_err('Fichier trop lourd (max 2 Mo)');

$ext      = pathinfo($file['name'], PATHINFO_EXTENSION) ?: 'png';
$filename = 'logo_' . time() . '.' . $ext;
$dir      = __DIR__ . '/uploads/';
if (!is_dir($dir)) mkdir($dir, 0755, true);

if (!move_uploaded_file($file['tmp_name'], $dir . $filename)) json_err('Erreur lors de la sauvegarde');

// Sauvegarder l'URL dans site_settings
$url  = '/backend/uploads/' . $filename;
$stmt = db()->prepare("INSERT INTO site_settings (`key`, `value`) VALUES ('logo_url', :v)
                       ON DUPLICATE KEY UPDATE `value` = :v2, updated_at = NOW()");
$stmt->execute([':v' => $url, ':v2' => $url]);

json_ok(['success' => true, 'url' => $url]);
