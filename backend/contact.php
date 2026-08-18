<?php
// POST /backend/contact.php
// Enregistre un message de contact en base de données

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_err('Méthode non autorisée', 405);

$b = body();

$name    = trim($b['name']    ?? '');
$email   = trim($b['email']   ?? '');
$message = trim($b['message'] ?? '');

if (!$name || !$email || !$message) json_err('Champs obligatoires manquants');
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) json_err('Email invalide');
if (strlen($message) > 5000) json_err('Message trop long (max 5000 caractères)');

// Créer la table si elle n'existe pas encore
db()->exec("
    CREATE TABLE IF NOT EXISTS contact_messages (
        id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name       VARCHAR(120) NOT NULL,
        email      VARCHAR(180) NOT NULL,
        message    TEXT         NOT NULL,
        created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
");

$stmt = db()->prepare("
    INSERT INTO contact_messages (name, email, message)
    VALUES (:name, :email, :message)
");
$stmt->execute([
    ':name'    => $name,
    ':email'   => $email,
    ':message' => $message,
]);

error_log("📩 Message de contact de $name <$email>");

json_ok(['success' => true]);
