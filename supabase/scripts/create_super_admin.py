#!/usr/bin/env python3
"""
Script per creare automaticamente utente Super Admin
Usa la Service Role Key di Supabase per creare l'utente e configurarlo
"""

import os
import sys
import requests
from urllib.parse import urljoin

# Configurazione
SUPABASE_URL = os.getenv(
    'SUPABASE_URL',
    'https://sycqyblsvepbyywveokap.supabase.co'
)
SERVICE_ROLE_KEY = os.getenv(
    'SUPABASE_SERVICE_ROLE_KEY',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5Y3F5YmxzdmVwYnl5d2Vva2FwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjE3MTkxMiwiZXhwIjoyMDc3NzQ3OTEyfQ.x_2Y0dkEQ_-BJTjFHyG1Pufoev6M4AVyu-R-GInYZOE'
)

USER_EMAIL = 'enricorizzi1991@gmail.com'
USER_PASSWORD = 'Enri124578!'
USER_NOME = 'Enrico'
USER_COGNOME = 'Rizzi'
ADMIN_ROLE = 'ADMIN'

def create_auth_user():
    """Crea l'utente in Supabase Auth"""
    print("🔐 Creazione utente in Supabase Auth...")
    
    url = urljoin(SUPABASE_URL, '/auth/v1/admin/users')
    headers = {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': f'Bearer {SERVICE_ROLE_KEY}',
        'Content-Type': 'application/json'
    }
    
    payload = {
        'email': USER_EMAIL,
        'password': USER_PASSWORD,
        'email_confirm': True,
        'user_metadata': {
            'nome': USER_NOME,
            'cognome': USER_COGNOME
        }
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        
        user_data = response.json()
        user_uuid = user_data.get('id')
        
        print(f"✅ Utente creato con successo!")
        print(f"   UUID: {user_uuid}")
        print(f"   Email: {USER_EMAIL}")
        
        return user_uuid
        
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 422:
            # Utente già esistente, prova a trovarlo
            print("⚠️  Utente già esistente, ricerca UUID...")
            return find_user_uuid()
        else:
            print(f"❌ Errore creazione utente: {e}")
            if e.response.text:
                print(f"   Dettagli: {e.response.text}")
            sys.exit(1)
    except Exception as e:
        print(f"❌ Errore: {e}")
        sys.exit(1)

def find_user_uuid():
    """Trova l'UUID di un utente esistente"""
    url = urljoin(SUPABASE_URL, '/auth/v1/admin/users')
    headers = {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': f'Bearer {SERVICE_ROLE_KEY}'
    }
    
    params = {'email': USER_EMAIL}
    
    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        
        users = response.json().get('users', [])
        if users:
            user_uuid = users[0].get('id')
            print(f"✅ Utente trovato: {user_uuid}")
            return user_uuid
        else:
            print("❌ Utente non trovato")
            sys.exit(1)
            
    except Exception as e:
        print(f"❌ Errore ricerca utente: {e}")
        sys.exit(1)

def execute_sql(query):
    """Esegue una query SQL su Supabase"""
    url = urljoin(SUPABASE_URL, '/rest/v1/rpc/exec_sql')
    headers = {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': f'Bearer {SERVICE_ROLE_KEY}',
        'Content-Type': 'application/json'
    }
    
    # Nota: Supabase non ha un endpoint diretto per SQL arbitrario
    # Useremo l'API REST per le operazioni specifiche
    pass

def create_user_profile(user_uuid):
    """Crea/aggiorna il profilo utente e i permessi"""
    print("\n👤 Creazione profilo utente...")
    
    # 1. Assicura che il ruolo ADMIN esista
    ensure_admin_role()
    
    # 2. Crea/aggiorna il profilo utente
    create_profile_record(user_uuid)
    
    # 3. Assegna tutti i permessi
    assign_all_permissions()
    
    print("✅ Profilo e permessi configurati!")

def ensure_admin_role():
    """Assicura che il ruolo ADMIN esista"""
    url = urljoin(SUPABASE_URL, '/rest/v1/ruoli')
    headers = {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': f'Bearer {SERVICE_ROLE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
    }
    
    payload = {
        'codice': ADMIN_ROLE,
        'descrizione': 'Amministratore'
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        # Ignora se già esiste (409)
        if response.status_code not in [201, 409]:
            response.raise_for_status()
    except Exception as e:
        print(f"⚠️  Errore creazione ruolo: {e}")

def create_profile_record(user_uuid):
    """Crea/aggiorna il record in utenti_profilo"""
    url = urljoin(SUPABASE_URL, '/rest/v1/utenti_profilo')
    headers = {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': f'Bearer {SERVICE_ROLE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
    }
    
    payload = {
        'id': user_uuid,
        'nome': USER_NOME,
        'cognome': USER_COGNOME,
        'ruolo_codice': ADMIN_ROLE
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        print(f"✅ Profilo utente creato/aggiornato")
    except Exception as e:
        print(f"❌ Errore creazione profilo: {e}")
        if hasattr(e, 'response') and e.response.text:
            print(f"   Dettagli: {e.response.text}")

def assign_all_permissions():
    """Assegna tutti i permessi al ruolo ADMIN"""
    print("🔑 Assegnazione permessi...")
    
    tabs = [
        'Fornitori', 'Articoli', 'Magazzini', 'Giacenze', 'Ordini',
        'Ricevimento', 'Prelievo', 'Trasferimenti', 'Inventario',
        'Movimenti', 'Pianificazione', 'Utenti', 'Ruoli', 'Notifiche'
    ]
    
    url = urljoin(SUPABASE_URL, '/rest/v1/ruoli_tab_abilitate')
    headers = {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': f'Bearer {SERVICE_ROLE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
    }
    
    for tab in tabs:
        payload = {
            'ruolo_codice': ADMIN_ROLE,
            'tab_nome': tab,
            'permesso_vista': True,
            'permesso_modifica': True
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers)
            if response.status_code not in [201, 409]:
                response.raise_for_status()
        except Exception as e:
            print(f"⚠️  Errore permesso {tab}: {e}")
    
    print(f"✅ {len(tabs)} permessi assegnati al ruolo ADMIN")

def main():
    """Funzione principale"""
    print("=" * 60)
    print("🚀 CREAZIONE UTENTE SUPER ADMIN")
    print("=" * 60)
    print(f"Email: {USER_EMAIL}")
    print(f"Ruolo: {ADMIN_ROLE}")
    print("=" * 60)
    
    # 1. Crea utente in Auth
    user_uuid = create_auth_user()
    
    # 2. Crea profilo e permessi
    create_user_profile(user_uuid)
    
    # 3. Verifica finale
    print("\n" + "=" * 60)
    print("✅ COMPLETATO!")
    print("=" * 60)
    print(f"Credenziali:")
    print(f"  Email: {USER_EMAIL}")
    print(f"  Password: {USER_PASSWORD}")
    print(f"  Ruolo: {ADMIN_ROLE} (Super Admin)")
    print("=" * 60)
    print("🔑 Puoi ora accedere all'applicazione!")

if __name__ == '__main__':
    # Controlla variabili d'ambiente
    if not SERVICE_ROLE_KEY or SERVICE_ROLE_KEY == 'your-service-role-key':
        print("❌ Errore: Configura SUPABASE_SERVICE_ROLE_KEY")
        print("   Esporta la variabile o modifica lo script")
        sys.exit(1)
    
    main()

