/* ==========================================================================
   Parts & Inventory Manager Component
   ========================================================================== */

const PartsManager = {
  render(state) {
    const tableBody = document.getElementById('partsTableBody');
    if (!tableBody) return;

    let filtered = state.parts;
    if (state.selectedVehicleId !== 'ALL') {
      filtered = filtered.filter(p => p.vehicleId === state.selectedVehicleId);
    }

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 32px;">
            No spare parts logged in inventory.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = filtered.map(p => {
      const v = state.vehicles.find(veh => veh.id === p.vehicleId);
      const vehicleName = v ? `${v.year} ${v.make} ${v.model}` : 'Universal Part';

      let statusBadge = `<span style="background: rgba(16,185,129,0.15); color: var(--accent-emerald); padding: 3px 8px; border-radius: 99px; font-weight: 600; font-size: 11px;">In Stock (${p.qty})</span>`;
      if (p.status === 'Installed') {
        statusBadge = `<span style="background: rgba(6,182,212,0.15); color: var(--accent-cyan); padding: 3px 8px; border-radius: 99px; font-weight: 600; font-size: 11px;">Installed</span>`;
      } else if (p.status === 'Ordered') {
        statusBadge = `<span style="background: rgba(245,158,11,0.15); color: var(--accent-amber); padding: 3px 8px; border-radius: 99px; font-weight: 600; font-size: 11px;">On Order</span>`;
      }

      return `
        <tr>
          <td>
            <div style="font-weight: 600; color: #fff;">${p.partName}</div>
            <div style="font-size: 11px; color: var(--text-muted); font-family: monospace;">P/N: ${p.partNumber || 'N/A'}</div>
          </td>
          <td>
            <span class="category-tag tag-routine">${p.category || 'General'}</span>
          </td>
          <td style="color: var(--accent-cyan); font-weight: 500;">
            ${vehicleName}
          </td>
          <td>
            $${Number(p.price).toFixed(2)}
          </td>
          <td>
            ${p.vendor || 'Direct'}
          </td>
          <td>
            ${statusBadge}
          </td>
          <td style="text-align: right;">
            <button class="btn btn-secondary btn-sm" onclick="PartsManager.deletePart('${p.id}')" style="color: var(--accent-red); border-color: rgba(239,68,68,0.3)">
              🗑️
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  addPart(e) {
    e.preventDefault();
    const form = e.target;

    const newPart = {
      id: 'p_' + Date.now(),
      vehicleId: form.vehicleId.value,
      partName: form.partName.value.trim(),
      partNumber: form.partNumber.value.trim(),
      category: form.category.value,
      qty: parseInt(form.qty.value, 10) || 1,
      price: parseFloat(form.price.value) || 0,
      vendor: form.vendor.value.trim(),
      status: form.status.value
    };

    App.state.parts.push(newPart);
    App.saveState();
    App.closeModal('addPartModal');
    form.reset();
    App.render();
  },

  deletePart(id) {
    if (!confirm("Are you sure you want to remove this part from inventory?")) return;
    App.state.parts = App.state.parts.filter(p => p.id !== id);
    App.saveState();
    App.render();
  }
};

window.PartsManager = PartsManager;
