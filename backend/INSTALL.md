# Installation PostgreSQL + Backend

## 1. Installer PostgreSQL sur Windows

Télécharge l'installeur : https://www.postgresql.org/download/windows/
- Version recommandée : 16.x
- Pendant l'installation, note le mot de passe du superuser `postgres`

## 2. Créer la base de données et l'utilisateur

Ouvre **pgAdmin** ou **psql** et exécute :

```sql
CREATE USER audit_user WITH PASSWORD 'audit1234';
CREATE DATABASE learn_audit OWNER audit_user;
GRANT ALL PRIVILEGES ON DATABASE learn_audit TO audit_user;
```

## 3. Installer les dépendances Node.js

```powershell
Set-Location backend
npm install
```

## 4. Initialiser les tables (UNE SEULE FOIS)

```powershell
node init.js
```

Tu dois voir :
```
✓ 12 contrôles ISO 27002 insérés
✓ Toutes les tables créées avec succès
```

## 5. Lancer le backend

```powershell
node index.js
```

## 6. Lancer le frontend (autre terminal)

```powershell
npm run dev
```
