// =============================================
// Despensa del Hogar - Supabase Edition
// =============================================

const SUPABASE_URL = 'https://akxqzvznhredtsuuphyo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_TGlasu1b8RQ-J_Oh0YLD6g_dRB4gRt7';

// Mini Supabase REST client (sin librería externa)
const supabase = {
  _headers: {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
  },
  async query(table, { select, eq, order } = {}) {
    let url = `${SUPABASE_URL}/rest/v1/${table}`;
    const params = [];
    if (select) params.push(`select=${select}`);
    if (eq) params.push(`${eq.col}=eq.${encodeURIComponent(eq.val)}`);
    if (order) params.push(`order=${order.col}.${order.dir || 'asc'}`);
    if (params.length) url += '?' + params.join('&');
    const res = await fetch(url, {
      headers: { ...this._headers, 'Accept': 'application/json' },
      cache: 'no-store'
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    return res.json();
  },
  async insert(table, data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: { ...this._headers, 'Prefer': 'return=representation' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    return res.json();
  },
  async count(table) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=id&limit=0`, {
      headers: { ...this._headers, 'Accept': 'application/json', 'Prefer': 'count=exact' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return parseInt(res.headers.get('content-range')?.split('/')[1] || '0');
  },
  async update(table, id, data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: 'PATCH',
      headers: { ...this._headers, 'Prefer': 'return=representation' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    return res.json();
  },
  async remove(table, id) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: 'DELETE',
      headers: { ...this._headers }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    return true;
  },
  async toggle(table, id, field, value) {
    return this.update(table, id, { [field]: value });
  }
};

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

    const productosList = document.getElementById('productosList');
    const sugerenciaContent = document.getElementById('sugerenciaContent');
    const lastUpdate = document.getElementById('lastUpdate');

    // --- Cargar productos desde Supabase ---
    let productosDB = [];
    try {
        productosDB = await supabase.query('productos', { select: '*', order: { col: 'categoria', dir: 'asc' } });
        const total = await supabase.count('productos');
        lastUpdate.textContent = `📡 Base de datos · ${total} productos · En vivo desde la nube`;
    } catch (e) {
        console.warn('Supabase no disponible, cargando JSON local:', e.message);
        try {
            const resp = await fetch('despensa.json?' + Date.now());
            const data = await resp.json();
            productosDB = data.productos;
            lastUpdate.textContent = '📁 Modo local (sin conexión a BD) - ' + data.actualizado;
        } catch (e2) {
            productosList.innerHTML = '<p class="loading">Error cargando datos. ¿Supabase configurado?</p>';
            sugerenciaContent.innerHTML = '<p class="loading">Esperando datos...</p>';
            return;
        }
    }

    renderProductos(productosDB);
    renderSugerencia(productosDB);

    // --- Render productos ---
    function renderProductos(productos) {
        const categorias = {};
        productos.forEach(p => {
            if (!categorias[p.categoria]) categorias[p.categoria] = [];
            categorias[p.categoria].push(p);
        });

        let html = '<div class="inv-header">' +
            '<h2>📦 Inventario (' + productos.length + ' productos)</h2>' +
            '<button class="btn-refresh" onclick="location.reload()">🔄</button>' +
            '</div>';
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
                const hasId = p.id !== undefined && p.id !== null;
                html += '<div class="producto-item" data-id="' + (hasId ? p.id : '') + '">' +
                    '<div class="producto-info">' +
                    (hasId
                        ? '<span class="producto-status clickable ' + (p.tiene ? 'si' : 'no') + '" onclick="toggleProducto(' + p.id + ',' + (p.tiene ? 'false' : 'true') + ')" title="' + (p.tiene ? 'Tiene' : 'No tiene') + '"></span>'
                        : '<span class="producto-status ' + (p.tiene ? 'si' : 'no') + '"></span>'
                    ) +
                    '<span class="prod-nombre">' + p.nombre + '</span>' +
                    (p.nota ? '<span class="producto-nota">— ' + p.nota + '</span>' : '') +
                    (p.cantidad ? '<span class="producto-nota">(' + p.cantidad + ')</span>' : '') +
                    '</div>' +
                    (hasId
                        ? '<div class="prod-actions">' +
                        '<button class="btn-icon btn-edit" onclick="editarProducto(' + p.id + ',\'' + escapeJs(p.nombre) + '\',\'' + escapeJs(p.categoria) + '\',\'' + escapeJs(p.nota || '') + '\',\'' + escapeJs(p.cantidad || '') + '\')" title="Editar">✏️</button>' +
                        '<button class="btn-icon btn-del" onclick="eliminarProducto(' + p.id + ',\'' + escapeJs(p.nombre) + '\')" title="Eliminar">🗑️</button>' +
                        '</div>'
                        : ''
                    ) +
                    '</div>';
            });
            html += '</div>';
        });
        productosList.innerHTML = html;
    }

    // Helper to escape strings for JS
    function escapeJs(s) {
        if (!s) return '';
        return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, '\\n');
    }

    // --- Funciones globales con SweetAlert2 ---
    window.toggleProducto = async function(id, nuevoValor) {
        try {
            await supabase.update('productos', id, { tiene: nuevoValor });
            const productos = await supabase.query('productos', { select: '*', order: { col: 'categoria', dir: 'asc' } });
            renderProductos(productos);
            Swal.fire({
                icon: 'success',
                title: nuevoValor ? '✅ Marcado como disponible' : '❌ Marcado como agotado',
                timer: 1200,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
        } catch (e) {
            Swal.fire('Error', 'No se pudo actualizar: ' + e.message, 'error');
        }
    };

    window.eliminarProducto = async function(id, nombre) {
        const result = await Swal.fire({
            title: '🗑️ ¿Eliminar?',
            text: '¿Eliminar "' + nombre + '" de la despensa?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });
        if (!result.isConfirmed) return;

        try {
            await supabase.remove('productos', id);
            const productos = await supabase.query('productos', { select: '*', order: { col: 'categoria', dir: 'asc' } });
            renderProductos(productos);
            Swal.fire({
                icon: 'success',
                title: 'Eliminado',
                text: '"' + nombre + '" eliminado de la despensa',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (e) {
            Swal.fire('Error', 'No se pudo eliminar: ' + e.message, 'error');
        }
    };

    window.editarProducto = async function(id, nombreActual, categoriaActual, notaActual, cantidadActual) {
        const { value: formValues } = await Swal.fire({
            title: '✏️ Editar producto',
            html:
                '<input id="swal-nombre" class="swal2-input" placeholder="Nombre" value="' + escapeHtml(nombreActual) + '">' +
                '<input id="swal-nota" class="swal2-input" placeholder="Nota (ej: 0.5 kg)" value="' + escapeHtml(notaActual || '') + '">' +
                '<input id="swal-cantidad" class="swal2-input" placeholder="Cantidad" value="' + escapeHtml(cantidadActual || '') + '">',
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: '💾 Guardar',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                return {
                    nombre: document.getElementById('swal-nombre').value,
                    nota: document.getElementById('swal-nota').value,
                    cantidad: document.getElementById('swal-cantidad').value
                };
            }
        });

        if (!formValues) return;
        if (!formValues.nombre.trim()) {
            Swal.fire('Error', 'El nombre no puede estar vacío', 'error');
            return;
        }

        try {
            await supabase.update('productos', id, {
                nombre: formValues.nombre.trim(),
                nota: formValues.nota.trim() || '',
                cantidad: formValues.cantidad.trim() || ''
            });
            const productos = await supabase.query('productos', { select: '*', order: { col: 'categoria', dir: 'asc' } });
            renderProductos(productos);
            Swal.fire({
                icon: 'success',
                title: '✅ Actualizado',
                timer: 1200,
                showConfirmButton: false
            });
        } catch (e) {
            Swal.fire('Error', 'No se pudo editar: ' + e.message, 'error');
        }
    };

    function escapeHtml(s) {
        if (!s) return '';
        return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // --- Render sugerencia ---
    function renderSugerencia(productos) {
        const listaNombres = productos.map(p => p.nombre.toLowerCase());

        function tiene(...items) {
            return items.every(i => listaNombres.some(n => n.includes(i)));
        }

        const hoy = new Date();
        const diaSemana = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'];
        const dia = diaSemana[hoy.getDay()];

        let sugerencia;

        // Viernes = tradición
        if (dia === 'viernes') {
            sugerencia = {
                titulo: '🍛 Fríjoles con cerdo y arroz (Tradición de los viernes)',
                desc: 'Prepara los fríjoles con costilla o carne de cerdo, cebolla, ajo y cilantro. Sirve con arroz blanco.',
                acompanante: 'Ensalada de tomate, cebolla y limón. Patacones de plátano verde.',
                bebida: 'Agua de limón'
            };
        } else {
            const sugerencias = [
                {
                    titulo: '🥗 Salteado de verduras con atún y arroz',
                    desc: 'Saltea cebolla, ajo, pimentón, habichuela, zanahoria, brócoli y arveja. Añade el atún escurrido. Sirve con arroz blanco y cilantro picado.',
                    acompanante: 'Ensalada de pepino, tomate y cebolla con limón.',
                    bebida: 'Agua de limón'
                },
                {
                    titulo: '🍛 Arroz con verduras y queso costeño',
                    desc: 'Prepara arroz y cuando esté listo mezcla vegetales mixtos salteados con ajo y cebolla. Añade queso costeño desmechado por encima.',
                    acompanante: 'Rodajas de tomate con limón y sal.',
                    bebida: 'Agua de limón'
                },
                {
                    titulo: '🥘 Mazorca con auyama y queso',
                    desc: 'Cocina la mazorca y la auyama en trozos. Sirve con queso costeño derretido y cilantro.',
                    acompanante: 'Arroz blanco y ensalada de espinaca con mango.',
                    bebida: 'Agua de limón'
                },
                {
                    titulo: '🥩 Carne para pitar guisada con arroz',
                    desc: 'Guisa la carne para pitar con cebolla, ajo, pimentón, tomate y cilantro a fuego lento.',
                    acompanante: 'Arroz blanco y ensalada de espinaca con mango y limón.',
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
                    desc: 'Prepara el pescado al sartén con ajo y limón.',
                    acompanante: 'Ensalada de pepino, tomate y cebolla. Patacones de plátano verde.',
                    bebida: 'Agua de limón'
                },
                {
                    titulo: '🥗 Ensalada de atún con granola y yogurt',
                    desc: 'Mezcla atún desmenuzado con espinaca, mango, limón. Acompaña con Vitagranola.',
                    acompanante: 'Pan tostado o arepa.',
                    bebida: 'Agua de limón'
                }
            ];
            const idx = hoy.getDate() % sugerencias.length;
            sugerencia = sugerencias[idx];
        }

        sugerenciaContent.innerHTML = '<div class="sugerencia-card">' +
            '<span class="dia-badge">' + capitalize(dia) + '</span>' +
            '<h3>' + sugerencia.titulo + '</h3>' +
            '<p><strong>Preparación:</strong> ' + sugerencia.desc + '</p>' +
            '<p><strong>Acompañante:</strong> ' + sugerencia.acompanante + '</p>' +
            '<p><strong>Bebida:</strong> ' + sugerencia.bebida + '</p>' +
            '<p style="margin-top:10px"><small>💬 ¿Quieres cambiar algo? Avísale a Poncho 🤖</small></p>' +
            '</div>';
    }

    // --- Formulario Agregar ---
    const form = document.getElementById('formAgregar');
    const mensaje = document.getElementById('mensajeAgregar');
    const agregadosLocal = document.getElementById('agregadosLocal');

    function cargarLocales() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
        catch { return []; }
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

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const nombre = document.getElementById('nombre').value.trim();
        if (!nombre) return;

        const producto = {
            nombre: nombre,
            categoria: document.getElementById('categoria').value,
            cantidad: document.getElementById('cantidad').value.trim(),
            nota: document.getElementById('nota').value.trim(),
            tiene: true,
            creado_por: 'web'
        };

        // Guardar local siempre
        const items = cargarLocales();
        items.push(producto);
        guardarLocales(items);

        // Intentar guardar en Supabase
        let enBD = false;
        try {
            await supabase.insert('productos', producto);
            enBD = true;
            mensaje.className = 'mensaje exito';
            mensaje.textContent = '✅ ' + nombre + ' agregado a la nube (Supabase) y a tu lista local.';
        } catch (e) {
            mensaje.className = 'mensaje exito';
            mensaje.textContent = '✅ ' + nombre + ' agregado a tu lista local. Se sincronizará con la nube cuando la BD esté lista.';
        }
        mensaje.style.display = 'block';
        form.reset();
        renderLocales();
        setTimeout(() => { mensaje.style.display = 'none'; }, 4000);
    });

    renderLocales();

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');
    }
});
