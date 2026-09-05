// Manejo de autenticación y sesiones de usuario

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', manejarInicioSesion);
    }
});

async function manejarInicioSesion(e) {
    e.preventDefault();
    
    const email = document.getElementById('email-input').value.trim();
    const password = document.getElementById('password-input').value;
    const errorMsg = document.getElementById('error-msg');
    const btnSubmit = document.getElementById('btn-submit');

    errorMsg.classList.add('hidden');
    btnSubmit.disabled = true;
    btnSubmit.innerText = 'Autenticando...';

    // 1. Iniciar sesión en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (authError) {
        mostrarError('Credenciales inválidas. Verificá tu correo y contraseña.');
        btnSubmit.disabled = false;
        btnSubmit.innerText = 'Iniciar Sesión';
        return;
    }

    const userId = authData.user.id;

    // 2. Determinar si el usuario es Administrador de Feria
    const { data: feria } = await supabase
        .from('ferias')
        .select('id, nombre')
        .eq('usuario_id', userId)
        .maybeSingle();

    if (feria) {
        window.location.href = 'admin-feria.html';
        return;
    }

    // 3. Determinar si el usuario es Feriante
    const { data: feriante } = await supabase
        .from('feriantes')
        .select('id, nombre_emprendimiento')
        .eq('usuario_id', userId)
        .maybeSingle();

    if (feriante) {
        window.location.href = 'admin-feriante.html';
        return;
    }

    // Si no tiene rol asignado
    mostrarError('El usuario no tiene una feria o emprendimiento asociado.');
    btnSubmit.disabled = false;
    btnSubmit.innerText = 'Iniciar Sesión';
}

function mostrarError(mensaje) {
    const errorMsg = document.getElementById('error-msg');
    errorMsg.innerText = mensaje;
    errorMsg.classList.remove('hidden');
}

// Función auxiliar para cerrar sesión desde los paneles
async function cerrarSesion() {
    await supabase.auth.signOut();
    window.location.href = 'login.html';
}
