document.addEventListener('DOMContentLoaded', async function() {
    const productosList = document.getElementById('productosList');
    const sugerenciaContent = document.getElementById('sugerenciaContent');
    const lastUpdate = document.getElementById('lastUpdate');

    // Try to load despensa.json - fallback to inline data if fails
    async function cargarDespensa() {
        try {
            const resp = await fetch('despensa.json');
            return await resp.json();
        } catch (e) {
            return null;
        }
    }

    const data = await cargarDespensa();
    if (!data) {
        productosList.innerHTML = '<p>No hay datos de despensa aún.</p>';
        sugerenciaContent.innerHTML = '<p>Esperando despensa para generar sugerencias...</p>';
        return;
    }

    lastUpdate.textContent = `Última actualización: ${data.actualizado}`;

    // Group products by category
    const categorias = {};
    data.productos.forEach(p => {
        if (!categorias[p.categoria]) categorias[p.categoria] = [];
        categorias[p.categoria].push(p);
    });

    // Display products
    let html = '';
    const catOrden = ['proteinas', 'verduras', 'frutas', 'granos', 'lacteos', 'condimentos', 'otros'];
    const catKeys = Object.keys(categorias).sort((a, b) => catOrden.indexOf(a) - catOrden.indexOf(b));
    
    catKeys.forEach(cat => {
        html += `<div class="categoria-group">
            <div class="categoria-titulo">${cat.charAt(0).toUpperCase() + cat.slice(1)}</div>`;
        categorias[cat].forEach(p => {
            html += `<div class="producto-item">
                <div class="producto-info">
                    <span class="producto-status ${p.tiene ? 'si' : 'no'}"></span>
                    <span>${p.nombre}</span>
                    ${p.nota ? `<span class="producto-nota">— ${p.nota}</span>` : ''}
                </div>
            </div>`;
        });
        html += '</div>';
    });
    productosList.innerHTML = html;

    // Daily suggestion
    sugerenciaContent.innerHTML = `
        <div class="sugerencia-card">
            <h3>🥗 Almuerzo sugerido del día</h3>
            <p>Basado en los ingredientes disponibles en tu despensa.</p>
            <p><small>Pregúntale a Poncho por WhatsApp para la sugerencia del día 🙌</small></p>
        </div>`;
});
