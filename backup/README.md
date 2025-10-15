# Database Backups

Эта директория содержит резервные копии базы данных.

⚠️ **Важно**: Эти файлы не включены в Git репозиторий из-за их большого размера.

## Файлы

- `chinese_guide_*.sql.gz` - сжатые дампы PostgreSQL базы данных

## Использование

Для восстановления базы данных из дампа:

```bash
gunzip -c chinese_guide_20251013.sql.gz | docker exec -i postgres_container psql -U user -d dbname
```

## Создание нового бэкапа

```bash
docker exec -t postgres_container pg_dump -U user -d dbname | gzip > backup/chinese_guide_$(date +%Y%m%d).sql.gz
```

## Хранение

Для продакшена рекомендуется хранить бэкапы в:
- AWS S3
- Google Cloud Storage
- Azure Blob Storage
- Или другом облачном хранилище с версионированием

