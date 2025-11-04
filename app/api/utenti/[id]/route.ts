import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// PUT /api/utenti/[id] - Modifica utente
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Verifica autenticazione
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { nome, cognome, ruolo_codice, sede_predefinita, sezione_predefinita } = body;

    const { error } = await supabase
      .from('utenti_profilo')
      .update({
        nome,
        cognome,
        ruolo_codice,
        sede_predefinita: sede_predefinita || null,
        sezione_predefinita: sezione_predefinita || null,
      })
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Errore modifica utente:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

// DELETE /api/utenti/[id] - Elimina utente
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Verifica autenticazione
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    // Elimina profilo
    const { error: profiloError } = await supabase
      .from('utenti_profilo')
      .delete()
      .eq('id', id);

    if (profiloError) {
      return NextResponse.json(
        { error: profiloError.message },
        { status: 400 }
      );
    }

    // Elimina utente auth (richiede service role)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (authError) {
      console.error('Errore eliminazione utente auth:', authError);
      // Non restituiamo errore perché il profilo è già stato eliminato
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Errore eliminazione utente:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

