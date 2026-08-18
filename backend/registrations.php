<?php
// GET /backend/registrations.php
// Retourne toutes les inscriptions (admin uniquement)

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_err('Méthode non autorisée', 405);

$rows = db()->query("
    SELECT
        id,
        full_name      AS fullName,
        email,
        phone,
        city,
        parcours,
        tshirt,
        amount,
        payment_status AS paymentStatus,
        payment_ref    AS paymentRef,
        created_at     AS date
    FROM inscriptions
    ORDER BY id DESC
")->fetchAll();

// Convertir amount en string pour cohérence avec le frontend
foreach ($rows as &$r) {
    $r['id']     = (string)$r['id'];
    $r['amount'] = number_format((float)$r['amount'], 2, '.', '');
}

json_ok($rows);
