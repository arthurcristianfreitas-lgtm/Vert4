# database.py — SQLite com SQLAlchemy (sem configuração extra)
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Session(db.Model):
    __tablename__ = 'sessions'
    id            = db.Column(db.String(36), primary_key=True)   # UUID do cookie
    ip            = db.Column(db.String(64))
    user_agent    = db.Column(db.String(256))
    consented     = db.Column(db.Boolean, default=False)
    started_at    = db.Column(db.DateTime, default=datetime.utcnow)
    last_seen     = db.Column(db.DateTime, default=datetime.utcnow)
    duration_sec  = db.Column(db.Integer, default=0)             # enviado no unload
    completed_diag= db.Column(db.Boolean, default=False)         # completou o questionário
    purchase_intent=db.Column(db.Boolean, default=False)         # abriu aba Fase 2 ou clicou WhatsApp
    events        = db.relationship('Event', backref='session', lazy=True)

class Event(db.Model):
    __tablename__ = 'events'
    id         = db.Column(db.Integer, primary_key=True, autoincrement=True)
    session_id = db.Column(db.String(36), db.ForeignKey('sessions.id'), nullable=False)
    event_type = db.Column(db.String(64))   # page_view | tab_view | cta_click | form_start | form_complete | time_update
    payload    = db.Column(db.Text)          # JSON extra (ex: qual aba foi vista)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)