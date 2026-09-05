const SUPABASE_URL = 'https://mtnvffcgbydtavfihxqt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10bnZmZmNnYnlkdGF2ZmloeHF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1NzQwMjEsImV4cCI6MjEwNDE1MDAyMX0.2A-x9_Dm_m5CUZxjMuAdvQrA1cWdFLPQAjBvWwxc9NY';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorBox = document.getElementById('error-msg');
  const btnSubmit = document.getElementById('btn-submit');

  errorBox.classList.add('hidden');
  btnSubmit.disabled = true;
  btnSubmit.innerText = 'Verificando...';

  // 1. Iniciar sesión en Supabase Auth
  const { data: authData, error: authError } = await _supabase.auth.signInWithPassword({
    email,
    password
  });

  if (authError) {
    errorBox.innerText = 'Correo o contraseña incorrectos.';
    errorBox.classList.remove('hidden');
    btnSubmit.disabled = false;
    btnSubmit.innerText = 'Iniciar Sesión';
    return;
  }

  const userId = authData.user.id;

  // 2. Verificar si es Administrador de una Feria
  const { data: feria } = await _supabase
    .from('ferias')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (feria) {
    window.location.href = `admin-feria.html?id=${feria.id}`;
    return;
  }

  // 3. Si no es feria, verificar si es un Feriante
  const { data: feriante } = await _supabase
    .from('feriantes')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (feriante) {
    window.location.href = `admin-feriante.html?id=${feriante.id}`;
    return;
  }

  // Si el usuario existe en Auth pero no está asignado a ninguna feria ni feriante
  errorBox.innerText = 'Esta cuenta no tiene asignado un perfil de Feria ni Feriante.';
  errorBox.classList.remove('hidden');
  btnSubmit.disabled = false;
  btnSubmit.innerText = 'Iniciar Sesión';
}
