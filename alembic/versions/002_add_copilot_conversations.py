"""Add copilot conversations and messages tables

Revision ID: 002_add_conversations
Revises: 001_add_copilot
Create Date: 2026-01-15

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '002_add_conversations'
down_revision = '001_add_copilot'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # copilot_conversation
    op.create_table(
        'copilot_conversation',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('actor_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('is_archived', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('last_message_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Index('idx_copilot_conversation_tenant_actor', 'tenant_id', 'actor_id', 'last_message_at'),
        sa.Index('idx_copilot_conversation_tenant_created', 'tenant_id', 'created_at'),
    )
    
    # copilot_message
    op.create_table(
        'copilot_message',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('conversation_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('actor_role', sa.String(20), nullable=False),  # "user" | "copilot"
        sa.Column('content_text', sa.Text(), nullable=False),
        sa.Column('content_structured', postgresql.JSONB(), nullable=True),  # CopilotResponse completo
        sa.Column('correlation_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('latency_ms', sa.Integer(), nullable=True),
        sa.Column('model', sa.String(100), nullable=True),
        sa.Column('validation_passed', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['conversation_id'], ['copilot_conversation.id'], ondelete='CASCADE'),
        sa.Index('idx_copilot_message_conversation', 'conversation_id', 'created_at'),
        sa.Index('idx_copilot_message_correlation', 'correlation_id'),
    )


def downgrade() -> None:
    op.drop_table('copilot_message')
    op.drop_table('copilot_conversation')
