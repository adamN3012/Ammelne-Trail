# Backend PHP — Ammelne Trail

## Prérequis
- XAMPP / WAMP / Laragon (PHP 8.1+ et MySQL)
- Composer (pour PhpSpreadsheet)

## Installation en 4 étapes

### 1. Copier le dossier
Place le dossier `backend/` dans `htdocs/` (XAMPP) ou `www/` (WAMP) :
```
C:/xampp/htdocs/ammelne-trail/backend/
```

### 2. Créer la base de données
Ouvre **phpMyAdmin** → onglet SQL → colle et exécute le contenu de `setup.sql`

### 3. Installer PhpSpreadsheet
Ouvre un terminal dans le dossier `backend/` :
```bash
composer require phpoffice/phpspreadsheet
```

### 4. Configurer
Ouvre `config.php` et modifie si besoin :
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'ammelne_trail');
define('DB_USER', 'root');
define('DB_PASS', '');           // ton mot de passe MySQL
define('ADMIN_PASSWORD', 'trail2024');
```

## Endpoints

| Méthode | URL | Description |
|---------|-----|-------------|
| POST | `/backend/register.php` | Enregistre une inscription |
| GET  | `/backend/registrations.php` | Liste toutes les inscriptions (admin) |
| GET  | `/backend/export.php` | Télécharge le fichier Excel |

## Connecter le frontend React

Dans `src/components/site/RegistrationForm.tsx`, change l'URL :
```ts
// Avant
fetch("/api/register", ...)

// Après
fetch("http://localhost/ammelne-trail/backend/register.php", ...)
```

Dans `src/components/site/AdminPage.tsx`, change les deux URLs :
```ts
fetch("http://localhost/ammelne-trail/backend/registrations.php")
fetch("http://localhost/ammelne-trail/backend/export.php")
```
