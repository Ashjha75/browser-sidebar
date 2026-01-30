#!/usr/bin/env bash
set -e

# -------- CONFIG --------
APPWRITE_DB_CONTAINER="appwrite-mariadb"
DB_NAME="appwrite"
DB_USER="user"
DB_PASS="password"

UPLOADS_VOLUME="appwrite_appwrite-uploads"
FUNCTIONS_VOLUME="appwrite_appwrite-functions"

BACKUP_DIR="$PWD"
# ------------------------

SQL_FILE="$BACKUP_DIR/appwrite.sql"
UPLOADS_ARCHIVE="$BACKUP_DIR/appwrite-uploads.tar.gz"
FUNCTIONS_ARCHIVE="$BACKUP_DIR/appwrite-functions.tar.gz"

# -------- VALIDATION --------
[ -f "$SQL_FILE" ] || { echo "❌ appwrite.sql not found"; exit 1; }
[ -f "$UPLOADS_ARCHIVE" ] || { echo "❌ appwrite-uploads.tar.gz not found"; exit 1; }
[ -f "$FUNCTIONS_ARCHIVE" ] || { echo "❌ appwrite-functions.tar.gz not found"; exit 1; }

echo "▶ Stopping Appwrite..."
docker compose down

echo "▶ Starting database only..."
docker compose up -d mariadb

echo "▶ Restoring database..."
docker exec -i "$APPWRITE_DB_CONTAINER" \
  mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$SQL_FILE"

echo "▶ Restoring uploads..."
docker run --rm \
  -v "$UPLOADS_VOLUME":/data \
  -v "$BACKUP_DIR":/backup \
  alpine sh -c "rm -rf /data/* && tar xzf /backup/appwrite-uploads.tar.gz -C /data"

echo "▶ Restoring functions..."
docker run --rm \
  -v "$FUNCTIONS_VOLUME":/data \
  -v "$BACKUP_DIR":/backup \
  alpine sh -c "rm -rf /data/* && tar xzf /backup/appwrite-functions.tar.gz -C /data"

echo "▶ Starting full Appwrite..."
docker compose up -d

echo "✅ Restore completed successfully"
