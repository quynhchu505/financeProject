"""settings_features

Revision ID: 20260507_000001
Revises: 20260506_000001
Create Date: 2026-05-07 00:00:01
"""

from alembic import op
import sqlalchemy as sa


revision = "20260507_000001"
down_revision = "20260506_000001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Extend users table with profile + preference fields
    op.add_column("users", sa.Column("phone", sa.String(length=32), nullable=True))
    op.add_column("users", sa.Column("date_of_birth", sa.DateTime(timezone=True), nullable=True))
    op.add_column("users", sa.Column("gender", sa.String(length=16), nullable=True))
    op.add_column("users", sa.Column("address", sa.String(length=500), nullable=True))
    op.add_column("users", sa.Column("avatar_url", sa.String(length=500), nullable=True))
    op.add_column("users", sa.Column("currency", sa.String(length=10), nullable=False, server_default="VND"))
    op.add_column("users", sa.Column("timezone", sa.String(length=64), nullable=False, server_default="Asia/Ho_Chi_Minh"))
    op.add_column("users", sa.Column("language", sa.String(length=10), nullable=False, server_default="vi"))
    op.add_column("users", sa.Column("date_format", sa.String(length=20), nullable=False, server_default="dd/MM/yyyy"))
    op.add_column("users", sa.Column("week_start", sa.String(length=10), nullable=False, server_default="monday"))
    op.add_column("users", sa.Column("notification_prefs", sa.Text(), nullable=True))
    op.add_column("users", sa.Column("two_fa_enabled", sa.Boolean(), nullable=False, server_default=sa.false()))

    # Extend refresh_tokens
    op.add_column("refresh_tokens", sa.Column("user_agent", sa.String(length=500), nullable=True))
    op.add_column("refresh_tokens", sa.Column("ip_address", sa.String(length=64), nullable=True))
    op.add_column("refresh_tokens", sa.Column("last_used_at", sa.DateTime(timezone=True), nullable=True))

    # New login_history table
    op.create_table(
        "login_history",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("ip_address", sa.String(length=64), nullable=True),
        sa.Column("user_agent", sa.String(length=500), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="success"),
        sa.Column("failure_reason", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_login_history_user_id", "login_history", ["user_id"])
    op.create_index("ix_login_history_created_at", "login_history", ["created_at"])


def downgrade() -> None:
    op.drop_index("ix_login_history_created_at", table_name="login_history")
    op.drop_index("ix_login_history_user_id", table_name="login_history")
    op.drop_table("login_history")

    op.drop_column("refresh_tokens", "last_used_at")
    op.drop_column("refresh_tokens", "ip_address")
    op.drop_column("refresh_tokens", "user_agent")

    op.drop_column("users", "two_fa_enabled")
    op.drop_column("users", "notification_prefs")
    op.drop_column("users", "week_start")
    op.drop_column("users", "date_format")
    op.drop_column("users", "language")
    op.drop_column("users", "timezone")
    op.drop_column("users", "currency")
    op.drop_column("users", "avatar_url")
    op.drop_column("users", "address")
    op.drop_column("users", "gender")
    op.drop_column("users", "date_of_birth")
    op.drop_column("users", "phone")
