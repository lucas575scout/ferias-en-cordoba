let mapa;
let marcadores = [];

document.addEventListener('DOMContentLoaded', async () => {
    inicializarMapa();
    await cargarTextosDinamicos();
    await cargarFiltrosManteles();
    await cargarCarruselNovedades();
    await cargarFeriasEnMapa();

    document.getElementById('btn-calcular-co2')?.addEventListener('click', calcularHuellaCO2);
    document.getElementById('filtro-activo-checkbox')?.addEventListener('change', filtrarMapaYDirectorio);
    document.getElementById('buscador-input')?.addEventListener('input', filtrarMapaYDirectorio);
});

function inicializarMapa() {
    mapa = L.map('mapa').setView([-31.4167, -64.1833], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap - EcoFerias Córdoba'
    }).addTo(mapa);
}

async function cargarTextosDinamicos() {
    const textos = await obtenerTextosApp();

    if (textos.home_hero_titulo) document.getElementById('home_hero_titulo').innerText = textos.home_hero_titulo;
    if (textos.home_hero_bajada) document.getElementById('home_hero_bajada').innerText = textos.home_hero_bajada;
    if (textos.filtro_activo_label) document.getElementById('filtro_activo_label').innerText = textos.filtro_activo_label;
    if (textos.huella_titulo) document.getElementById('huella_titulo').innerText = textos.huella_titulo;
    if (textos.footer_copyright) document.getElementById('footer_copyright').innerText = textos.footer_copyright;
}

async function cargarCarruselNovedades() {
    const contenedor = document.getElementById('carrusel-container');
    contenedor.innerHTML = '';

    const { data: eventos } = await supabase
        .from('publicaciones_feria')
        .select('*, ferias(nombre)')
        .eq('activa', true)
        .order('fecha_evento', { ascending: true });

    if (eventos && eventos.length > 0) {
        eventos.forEach(ev => {
            const card = document.createElement('div');
            card.className = 'min-w-[260px] max-w-[280px] bg-white p-4 rounded-xl shadow border border-slate-200 flex-shrink-0';
            card.innerHTML = `
                <span class="text-xs font-bold text-emerald-700 uppercase tracking-wider">${ev.ferias?.nombre || 'Feria'}</span>
                <h4 class="font-bold text-slate-800 text-sm mt-1 mb-2">${ev.titulo}</h4>
                <p class="text-xs text-slate-600 line-clamp-2 mb-3">${ev.descripcion || ''}</p>
                <div class="text-xs text-slate-400 font-medium">📅 ${new Date(ev.fecha_evento).toLocaleDateString('es-AR')}</div>
            `;
            contenedor.appendChild(card);
        });
    } else {
        contenedor.innerHTML = '<div class="text-xs text-slate-400 italic">No hay publicaciones destacadas esta semana.</div>';
    }
}

async function cargarFeriasEnMapa() {
    const { data: ferias, error } = await supabase.from('ferias').select('*');

    if (error) {
        console.error('Error al cargar ferias:', error);
        return;
    }

    const feriasLluvia = ferias.filter(f => f.modo_lluvia === true);
    const bannerLluvia = document.getElementById('banner-modo-lluvia');

    if (feriasLluvia.length > 0) {
        bannerLluvia.classList.remove('hidden');
        bannerLluvia.innerHTML = `🌧️ <strong>Aviso Clima:</strong> Hay ${feriasLluvia.length} feria(s) suspendida(s) por lluvia. Podés comprarles directo a sus emprendedores en <strong>⚡ Modo Activo</strong>.`;
    }

    ferias.forEach(feria => {
        const marker = L.marker([feria.latitud, feria.longitud]).addTo(mapa);
        marker.bindPopup(`
            <div class="p-1">
                <h4 class="font-bold text-emerald-800 text-sm">${feria.nombre}</h4>
                <p class="text-xs text-slate-600">${feria.direccion}</p>
                ${feria.modo_lluvia ? '<span class="inline-block mt-2 text-xs bg-sky-100 text-sky-800 px-2 py-0.5 rounded font-bold">🌧️ Modo Lluvia Activo</span>' : ''}
            </div>
        `);
        marcadores.push({ feria, marker });
    });
}

async function filtrarMapaYDirectorio() {
    const textoBusqueda = document.getElementById('buscador-input').value.toLowerCase();

    marcadores.forEach(({ feria, marker }) => {
        const coincideNombre = feria.nombre.toLowerCase().includes(textoBusqueda) || feria.direccion.toLowerCase().includes(textoBusqueda);
        if (coincideNombre) {
            marker.addTo(mapa);
        } else {
            mapa.removeLayer(marker);
        }
    });
}

function cargarFiltrosManteles() {
    const botones = document.querySelectorAll('#manteles-bar button');
    botones.forEach(btn => {
        btn.addEventListener('click', () => {
            botones.forEach(b => b.classList.remove('ring-2', 'ring-emerald-600'));
            btn.classList.add('ring-2', 'ring-emerald-600');
        });
    });
}

function calcularHuellaCO2() {
    const inputKm = document.getElementById('distancia-input').value;
    const divResultado = document.getElementById('resultado-huella');

    if (!inputKm || inputKm <= 0) {
        alert('Por favor ingresá una distancia válida en kilómetros.');
        return;
    }

    const ahorroKg = (inputKm * 0.15).toFixed(2);
    const equivalenteArboles = (ahorroKg / 0.05).toFixed(1);

    divResultado.classList.remove('hidden');
    divResultado.innerHTML = `
        🌱 <strong>¡Excelente elección!</strong> Al comprar localmente a ${inputKm} km de tu casa, evitás la emisión de approx. <strong>${ahorroKg} kg de CO₂</strong>.
        <br><span class="text-xs text-emerald-800 mt-1 block">Ésto equivale al CO₂ absorbido por <strong>${equivalenteArboles} días de un árbol maduro</strong>.</span>
    `;
}
