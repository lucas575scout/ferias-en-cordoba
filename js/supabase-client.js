const SUPABASE_URL = 'https://mtnvffcgbydtavfihxqt.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10bnZmZmNnYnlkdGF2ZmloeHF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1NzQwMjEsImV4cCI6MjEwNDE1MDAyMX0.2A-x9_Dm_m5CUZxjMuAdvQrA1cWdFLPQAjBvWwxc9NY'; 

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function obtenerTextosApp() {
    const { data, error } = await supabase
        .from('textos_app')
        .select('clave, texto');
    
    if (error) {
        console.error('Error al cargar textos dinámicos:', error);
        return {};
    }

    return data.reduce((acc, curr) => {
        acc[curr.clave] = curr.texto;
        return acc;
    }, {});
}
