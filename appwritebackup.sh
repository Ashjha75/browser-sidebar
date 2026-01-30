#!/usr/bin/env bash
set -e

APPWRITE_DB_CONTAINER="appwrite-mariadb"
DB_NAME="appwrite"
DB_USER="user"
DB_PASS="password"

UPLOADS_VOLUME="appwrite_appwrite-uploads"
FUNCTIONS_VOLUME="appwrite_appwrite-functions"

WIN_PWD=$(pwd -W | sed 's|\\|/|g')
BACKUP_ROOT="$WIN_PWD/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
WORKDIR="$BACKUP_ROOT/tmp_$TIMESTAMP"
FINAL_BACKUP="$BACKUP_ROOT/appwrite-backup_$TIMESTAMP.tar.gz"

mkdir -p "$WORKDIR"

echo "▶ Backing up database..."
docker exec -i "$APPWRITE_DB_CONTAINER" \
  mysqldump -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" \
  > "$WORKDIR/appwrite.sql"

echo "▶ Backing up uploads..."
docker run --rm \
  -v "$UPLOADS_VOLUME":/data \
  -v "$WORKDIR":/backup \
  alpine sh -c "tar czf /backup/appwrite-uploads.tar.gz -C /data ."

echo "▶ Backing up functions..."
docker run --rm \
  -v "$FUNCTIONS_VOLUME":/data \
  -v "$WORKDIR":/backup \
  alpine sh -c "tar czf /backup/appwrite-functions.tar.gz -C /data ."

echo "▶ Creating final archive..."
tar --force-local -czf "$FINAL_BACKUP" -C "$WORKDIR" .

echo "▶ Cleaning up temp files..."
rm -rf "$WORKDIR"

echo "✅ Backup completed:"
echo "   $FINAL_BACKUP"
