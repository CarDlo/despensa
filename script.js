document.addEventListener('DOMContentLoaded', async function() {
    const STORAGE_KEY = 'despensa_agregados';

    // --- Tabs ---
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            document.getElementById('tab-' + this.dataset.tab).classList.add('active');
        });
    });

    // --- Cargar despensa oficial ---
    async function cargarDespensa() {
        try {
            const resp = await fetch('despensa.json?' + Date.now());
            return await resp.json();
        } catch (e) {
            return null;
        }
    }

    const data = await cargarDespensa();
    const lastUpdate = document.getElementById('lastUpdate');
    const productosList = document.getElementById('productosList');
    const sugerenciaContent = document.getElementById('sugerenciaContent');

    if (data) {
        lastUpdate.textContent = 'Última actualización: ' + data.actualizado + (data.nota ? ' · ' + data.nota : '');
        renderProductos(data.productos);
        renderSugerencia();
    } else {
        productosList.innerHTML = '<p class="loading">No hay datos de despensa aún.</p>';
        sugerenciaContent.innerHTML = '<p class="loading">Esperando despensa...</p>';
    }

    // --- Render productos ---
    function renderProductos(productos) {
        const categorias = {};
        productos.forEach(p => {
            if (!categorias[p.categoria]) categorias[p.categoria] = [];
            categorias[p.categoria].push(p);
        });

        let html = '<h2>📦 Inventario (' + productos.length + ' productos)</h2>';
        const catOrden = ['proteinas', 'verduras', 'frutas', 'granos', 'lacteos', 'congelados', 'snacks', 'aceites', 'condimentos', 'bebidas', 'cafe', 'despensa', 'limpieza', 'cuidado_personal', 'otros'];
        const catKeys = Object.keys(categorias).sort((a, b) => {
            const ia = catOrden.indexOf(a);
            const ib = catOrden.indexOf(b);
            return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
        });

        catKeys.forEach(cat => {
            html += '<div class="categoria-group">' +
                '<div class="categoria-titulo">' + capitalize(cat) + '</div>';
            categorias[cat].forEach(p => {
                html += '<div class="producto-item">' +
                    '<div class="producto-info">' +
                    '<span class="producto-status ' + (p.tiene ? 'si' : 'no') + '"></span>' +
                    '<span>' + p.nombre + '</span>' +
                    (p.nota ? '<span class="producto-nota">— ' + p.nota + '</span>' : '') +
                    '</div></div>';
            });
            html += '</div>';
        });
        productosList.innerHTML = html;
    }

    // --- Render sugerencia ---
    function renderSugerencia() {
        const sugerencias = [
            {
                titulo: '🥗 Salteado de verduras con atún y arroz',
                desc: 'Saltea cebolla, ajo, pimentón, habichuela, zanahoria, brócoli y arveja. Añade el atún escurrido. Sirve con arroz blanco y cilantro picado.',
                acompanante: 'Ensalada de pepino, tomate y cebolla con limón.',
                bebida: 'Agua de limón'
            },
            {
                titulo: '🍛 Arroz con verduras y queso costeño',
                desc: 'Prepara arroz y cuando esté listo mezcla vegetales mixtos McCain salteados con ajo y cebolla. Añade queso costeño desmechado por encima.',
                acompanante: 'Rodajas de aguacate o tomate con limón y sal.',
                bebida: 'Agua de limón'
            },
            {
                titulo: '🥘 Mazorca con auyama y queso',
                desc: 'Cocina la mazorca y la auyama en trozos. Sirve con queso costeño derretido y un toque de cilantro.',
                acompanante: 'Arroz blanco y ensalada de espinaca con mango.',
                bebida: 'Agua de limón. Si quieren variar: jugo de granadilla'
            },
            {
                titulo: '🍳 Tortilla de verduras con ensalada',
                desc: 'Si tienen huevos: bate con espinaca picada, cebolla y tomate. Cocina como tortilla gruesa.',
                acompanante: 'Arroz blanco y ensalada de pepino con limón.',
                bebida: 'Agua de limón'
            },
            {
                titulo: '🥩 Carne para pitar guisada con arroz',
                desc: 'Guisa la carne para pitar con cebolla, ajo, pimentón, tomate y cilantro. Cocina a fuego lento hasta que esté suave. Sirve con arroz.',
                acompanante: 'Ensalada de espinaca con mango y limón.',
                bebida: 'Agua de limón'
            },
            {
                titulo: '🐔 Pechuga de pollo salteada con verduras',
                desc: 'Corta la pechuga en tiras y saltea con cebolla, ajo y pimentón. Añade brócoli, zanahoria y habichuela.',
                acompanante: 'Arroz blanco y rodajas de tomate con limón.',
                bebida: 'Agua de limón'
            },
            {
                titulo: '🐟 Pescado con ensalada y patacones',
                desc: 'Prepara el pescado al sartén con ajo y limón. Acompaña con plátano verde en patacones y ensalada fresca.',
                acompanante: 'Ensalada de pepino, tomate y cebolla. Patacones de plátano verde.',
                bebida: 'Agua de limón'
            }
        ];

        // Friday special
        const diaSemana = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'];
        const hoyNombre = diaSemana[new Date().getDay()];

        const hoy = new Date().getDate();
        const idx = hoy % sugerencias.length;
        const s = sugerencias[idx];

        sugerenciaContent.innerHTML = '<div class="sugerencia-card">' +
            '<h3>' + s.titulo + '</h3>' +
            '<p><strong>Preparación:</strong> ' + s.desc + '</p>' +
            '<p><strong>Acompañante:</strong> ' + s.acompanante + '</p>' +
            '<p><strong>Jugo:</strong> ' + s.jugo + '</p>' +
            '<p style="margin-top:10px"><small>💬 ¿Quieres cambiar algo? Pregúntale a Poncho por WhatsApp</small></p>' +
            '</div>';
    }

    // --- Formulario Agregar ---
    const form = document.getElementById('formAgregar');
    const mensaje = document.getElementById('mensajeAgregar');
    const agregadosLocal = document.getElementById('agregadosLocal');

    function cargarLocales() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch { return []; }
    }

    function guardarLocales(items) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }

    function renderLocales() {
        const items = cargarLocales();
        if (items.length === 0) {
            agregadosLocal.innerHTML = '<p class="nota-ayuda">Aún no has agregado nada desde este dispositivo.</p>';
            return;
        }
        agregadosLocal.innerHTML = items.map((item, i) =>
            '<div class="item-local">' +
            '<span><strong>' + item.nombre + '</strong> (' + item.categoria + ')' +
            (item.cantidad ? ' — ' + item.cantidad : '') +
            (item.nota ? ' <em>' + item.nota + '</em>' : '') +
            '</span>' +
            '<button onclick="eliminarLocal(' + i + ')" style="background:none;border:none;color:#f44336;cursor:pointer;font-size:1.2em">✕</button>' +
            '</div>'
        ).join('');
    }

    window.eliminarLocal = function(idx) {
        const items = cargarLocales();
        items.splice(idx, 1);
        guardarLocales(items);
        renderLocales();
    };

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const nombre = document.getElementById('nombre').value.trim();
        if (!nombre) return;

        const producto = {
            nombre: nombre,
            categoria: document.getElementById('categoria').value,
            cantidad: document.getElementById('cantidad').value.trim(),
            nota: document.getElementById('nota').value.trim(),
            agregado: new Date().toLocaleString('es-CO')
        };

        const items = cargarLocales();
        items.push(producto);
        guardarLocales(items);

        mensaje.className = 'mensaje exito';
        mensaje.textContent = '✅ ' + nombre + ' agregado a tu lista local. Poncho lo sincronizará con la despensa oficial.';
        mensaje.style.display = 'block';
        form.reset();
        renderLocales();

        setTimeout(() => { mensaje.style.display = 'none'; }, 4000);
    });

    renderLocales();

    // --- Helper ---
    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');
    }
});
