from sqlalchemy import inspect, text

from app.db.session import engine


def ensure_schema_columns() -> None:
    inspector = inspect(engine)
    migrations = {
        "incident_logs": {
            "place": "ALTER TABLE incident_logs ADD COLUMN place VARCHAR(120) NOT NULL DEFAULT '미기록'",
            "memo": "ALTER TABLE incident_logs ADD COLUMN memo TEXT",
            "emotion": "ALTER TABLE incident_logs ADD COLUMN emotion VARCHAR(40) NOT NULL DEFAULT '일반'",
            "pdf_hash": "ALTER TABLE incident_logs ADD COLUMN pdf_hash VARCHAR(64)",
            "disclaimer_version": "ALTER TABLE incident_logs ADD COLUMN disclaimer_version VARCHAR(20) NOT NULL DEFAULT 'v1.0'",
            "status": "ALTER TABLE incident_logs ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'NEW'",
            "deleted_at": "ALTER TABLE incident_logs ADD COLUMN deleted_at TIMESTAMP",
        },
        "incident_audit_logs": {
            "metadata": "ALTER TABLE incident_audit_logs ADD COLUMN metadata JSON",
        },
        "protection_centers": {
            "available_hours": (
                "ALTER TABLE protection_centers ADD COLUMN available_hours "
                "VARCHAR(40) NOT NULL DEFAULT '09:00~18:00'"
            ),
        },
    }

    with engine.begin() as connection:
        for table_name, additions in migrations.items():
            if not inspector.has_table(table_name):
                continue
            columns = {column["name"] for column in inspector.get_columns(table_name)}
            for name, ddl in additions.items():
                if name not in columns:
                    connection.execute(text(ddl))

        if inspector.has_table("incident_logs"):
            index_names = {index["name"] for index in inspector.get_indexes("incident_logs")}
            if "ix_incident_logs_deleted_at" not in index_names:
                connection.execute(
                    text(
                        "CREATE INDEX ix_incident_logs_deleted_at "
                        "ON incident_logs (deleted_at)"
                    )
                )
