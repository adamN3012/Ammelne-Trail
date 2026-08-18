<?php
// POST /backend/login.php
// Vérifie email + mot de passe admin, retourne un token de session

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_err('Méthode non autorisée', 405);

$b        = body();
$email    = trim($b['email']    ?? '');
$password = trim($b['password'] ?? '');

if (!$email || !$password) json_err('Champs obligatoires manquants');

if ($email !== ADMIN_EMAIL || $password !== ADMIN_PASSWORD) {
    json_err('Email ou mot de passe incorrect', 401);
}

// Retourne le mot de passe comme token (utilisé dans X-Admin-Password)
json_ok(['success' => true, 'token' => ADMIN_PASSWORD]);
