<?php
// POST /backend/register.php
// Enregistre une nouvelle inscription

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_err('Méthode non autorisée', 405);

$b = body();

// ── Validation ────────────────────────────────────────────────
$fullName = trim($b['fullName'] ?? '');
$email    = trim($b['email']    ?? '');
$phone    = trim($b['phone']    ?? '');
$city     = trim($b['city']     ?? '');
$parcours = trim($b['parcours'] ?? '');
$tshirt   = trim($b['tshirt']   ?? 'M');
$amount   = floatval($b['amount'] ?? 0);
$card     = $b['card'] ?? [];

if (!$fullName || !$email || !$parcours || !$amount) json_err('Champs obligatoires manquants');
if (!filter_var($email, FILTER_VALIDATE_EMAIL))      json_err('Email invalide');
if ($amount <= 0)                                     json_err('Montant invalide');

// ── Validation Luhn ───────────────────────────────────────────
$cardNum = preg_replace('/\s+/', '', $card['number'] ?? '');
if (!luhn($cardNum)) json_err('Numéro de carte invalide', 402);

function luhn(string $num): bool {
    $sum = 0;
    $len = strlen($num);
    for ($i = 0; $i < $len; $i++) {
        $d = (int)$num[$len - 1 - $i];
        if ($i % 2 === 1) { $d *= 2; if ($d > 9) $d -= 9; }
        $sum += $d;
    }
    return $sum % 10 === 0;
}

// ── Insertion en base ─────────────────────────────────────────
$ref = 'TRAIL-' . time() . '-' . rand(1000, 9999);

$stmt = db()->prepare("
    INSERT INTO inscriptions
        (full_name, email, phone, city, parcours, tshirt, amount, payment_status, payment_ref)
    VALUES
        (:full_name, :email, :phone, :city, :parcours, :tshirt, :amount, 'Payé', :ref)
");

$stmt->execute([
    ':full_name' => $fullName,
    ':email'     => $email,
    ':phone'     => $phone,
    ':city'      => $city,
    ':parcours'  => $parcours,
    ':tshirt'    => $tshirt,
    ':amount'    => $amount,
    ':ref'       => $ref,
]);

$id = db()->lastInsertId();
error_log("✅ Inscription #$id — $fullName ($parcours)");

json_ok(['success' => true, 'id' => (int)$id, 'paymentRef' => $ref]);
