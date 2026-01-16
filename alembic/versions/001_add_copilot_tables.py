"""Add copilot tables

Revision ID: 001_add_copilot
Revises: 
Create Date: 2026-01-XX

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_add_copilot'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # copilot_suggestion
    op.create_table(
        'copilot_suggestion',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('correlation_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('prompt_rendered', sa.Text(), nullable=False),
        sa.Column('prompt_hash', sa.String(64), nullable=False),
        sa.Column('llm_raw_response', sa.Text(), nullable=False),
        sa.Column('llm_response_hash', sa.String(64), nullable=False),
        sa.Column('user_query', sa.Text(), nullable=False),
        sa.Column('entity_type', sa.String(50), nullable=True),
        sa.Column('entity_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('response_json', postgresql.JSONB(), nullable=False),
        sa.Column('validation_passed', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('validation_errors', postgresql.JSONB(), nullable=True),
        sa.Column('citations', postgresql.JSONB(), nullable=False),
        sa.Column('model', sa.String(100), nullable=False),
        sa.Column('tokens', sa.Integer(), nullable=True),
        sa.Column('latency_ms', sa.Integer(), nullable=False),
        sa.Column('actor_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('actor_role', sa.String(50), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Index('idx_copilot_suggestion_tenant_created', 'tenant_id', 'created_at'),
        sa.Index('idx_copilot_suggestion_correlation', 'correlation_id'),
        sa.Index('idx_copilot_suggestion_actor', 'actor_id'),
    )
    
    # copilot_rag_chunk
    op.create_table(
        'copilot_rag_chunk',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('source_type', sa.String(50), nullable=False),
        sa.Column('source_id', sa.String(255), nullable=False),
        sa.Column('chunk_index', sa.Integer(), nullable=False),
        sa.Column('chunk_text', sa.Text(), nullable=False),
        sa.Column('embedding', sa.Text(), nullable=True),  # JSON array ou pgvector
        sa.Column('metadata', postgresql.JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Index('idx_copilot_rag_chunk_tenant', 'tenant_id'),
        sa.Index('idx_copilot_rag_chunk_source', 'source_type', 'source_id'),
    )
    
    # copilot_daily_feedback
    op.create_table(
        'copilot_daily_feedback',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('feedback_json', postgresql.JSONB(), nullable=False),
        sa.Column('generated_at', sa.DateTime(), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.UniqueConstraint('tenant_id', 'date', name='uq_copilot_daily_feedback_tenant_date'),
        sa.Index('idx_copilot_daily_feedback_tenant_date', 'tenant_id', 'date'),
    )
    
    # copilot_decision_pr
    op.create_table(
        'copilot_decision_pr',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('suggestion_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('payload', postgresql.JSONB(), nullable=False),
        sa.Column('status', sa.String(20), nullable=False, server_default='PENDING'),
        sa.Column('approved_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('approved_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['suggestion_id'], ['copilot_suggestion.id']),
        sa.Index('idx_copilot_decision_pr_suggestion', 'suggestion_id'),
        sa.Index('idx_copilot_decision_pr_status', 'status'),
    )


def downgrade() -> None:
    op.drop_table('copilot_decision_pr')
    op.drop_table('copilot_daily_feedback')
    op.drop_table('copilot_rag_chunk')
    op.drop_table('copilot_suggestion')


