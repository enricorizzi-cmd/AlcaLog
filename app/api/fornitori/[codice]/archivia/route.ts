import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// PATCH /api/fornitori/[codice]/archivia - Archivia fornitore (soft delete)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ codice: string }> }
) {
  try {
    const { codice } = await params;
    const supabase = await createClient();

    // Verifica autenticazione
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from('fornitori')
      .update({
        archiviato: true,
        updated_at: new Date().toISOString(),
      })
      .eq('codice', codice)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Errore archiviazione fornitore:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

