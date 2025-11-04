import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Variabili Supabase mancanti per registrazione');
}

// POST /api/auth/registrazione - Crea nuovo utente
export async function POST(request: NextRequest) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Configurazione server non valida' },
        { status: 500 }
      );
    }

    // Usa service role key per creare utente
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const body = await request.json();
    const { email, password, nome, cognome, ruolo_codice, sede_predefinita, sezione_predefinita } = body;

    if (!email || !password || !nome || !cognome || !ruolo_codice) {
      return NextResponse.json(
        { error: 'Email, password, nome, cognome e ruolo sono obbligatori' },
        { status: 400 }
      );
    }

    // Crea utente in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm per semplificare
    });

    if (authError) {
      console.error('Errore creazione utente auth:', authError);
      return NextResponse.json(
        { error: authError.message || 'Errore nella creazione dell\'utente' },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Utente creato ma dati non disponibili' },
        { status: 500 }
      );
    }

    // Crea profilo utente
    const { error: profiloError } = await supabaseAdmin
      .from('utenti_profilo')
      .insert({
        id: authData.user.id,
        nome,
        cognome,
        ruolo_codice,
        sede_predefinita: sede_predefinita || null,
        sezione_predefinita: sezione_predefinita || null,
      });

    if (profiloError) {
      console.error('Errore creazione profilo:', profiloError);
      // Tenta di eliminare l'utente auth se fallisce il profilo
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: profiloError.message || 'Errore nella creazione del profilo utente' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
      message: 'Utente registrato con successo',
    }, { status: 201 });
  } catch (error) {
    console.error('Errore registrazione:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

