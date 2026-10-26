#!/usr/bin/env bash
# Сборка и выкладка CareerLens на https://careerlens.denisenkosergey.ru
# Нужен SSH-доступ по ключу: root@denisenkosergey.ru. На сервере нет rsync — передаём архивом.
set -euo pipefail

HOST="${DEPLOY_HOST:-root@denisenkosergey.ru}"
TARGET=/var/www/careerlens

cd "$(dirname "$0")/.."
npm run build

# Новая версия распаковывается рядом и подменяет старую одним mv, чтобы сайт не был наполовину обновлён
COPYFILE_DISABLE=1 tar --no-xattrs -czf - -C dist . | ssh "$HOST" "
  set -e
  rm -rf $TARGET.new && mkdir -p $TARGET.new
  tar -xzf - -C $TARGET.new --no-same-owner
  chown -R www-data:www-data $TARGET.new
  rm -rf $TARGET.old
  if [ -d $TARGET ]; then mv $TARGET $TARGET.old; fi
  mv $TARGET.new $TARGET
  rm -rf $TARGET.old
"
echo "Готово: https://careerlens.denisenkosergey.ru"
