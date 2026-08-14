/* ==========================================================================
   Fuel & EV Energy Manager Component
   ========================================================================== */

const FuelManager = {
  render(state) {
    const tableBody = document.getElementById('fuelTableBody');
    if (!tableBody) return;

    let filtered = state.fuelLogs;
    if (state.selectedVehicleId !== 'ALL') {
      filtered = filtered.filter(f => f.vehicleId === state.selectedVehicleId);
    }

    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; color: var(--text-muted); padding: 32px;">
            No fuel or charging records logged yet.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = filtered.map(f => {
      const v = state.vehicles.find(veh => veh.id === f.vehicleId);
      const vehicleName = v ? `${v.year} ${v.make} ${v.model}` : 'Unknown Vehicle';

      const unitSymbol = f.unit === 'kWh' ? 'kWh' : 'Gal';
      const effLabel = f.unit === 'kWh' ? `${f.calculatedMpg} mi/kWh` : `${f.calculatedMpg} MPG`;

      return `
        <tr>
          <td>
            <div style="font-weight: 600;">${f.date}</div>
            <div style="font-size: 11px; color: var(--text-muted);">${f.odometer ? f.odometer.toLocaleString() + ' mi' : 'N/A'}</div>
          </td>
          <td style="font-weight: 600; color: var(--accent-cyan);">
            ${vehicleName}
          </td>
          <td>
            ${f.amount} ${unitSymbol}
          </td>
          <td>
            $${Number(f.costPerUnit).toFixed(2)} / ${unitSymbol}
          </td>
          <td style="font-weight: 700; color: var(--text-primary);">
            $${Number(f.totalCost).toFixed(2)}
          </td>
          <td>
            <span style="background: rgba(16,185,129,0.15); color: var(--accent-emerald); padding: 4px 10px; border-radius: 99px; font-weight: 600; font-size: 12px; border: 1px solid rgba(16,185,129,0.3)">
              ⚡ ${effLabel}
            </span>
          </td>
          <td style="font-size: 12px; color: var(--text-secondary);">
            ${f.location || 'Station'}
          </td>
          <td style="text-align: right;">
            <button class="btn btn-secondary btn-sm" onclick="FuelManager.deleteLog('${f.id}')" style="color: var(--accent-red); border-color: rgba(239,68,68,0.3)">
              🗑️
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  addFuelLog(e) {
    e.preventDefault();
    const form = e.target;

    const amount = parseFloat(form.amount.value) || 0;
    const costPerUnit = parseFloat(form.costPerUnit.value) || 0;
    const totalCost = parseFloat(form.totalCost.value) || (amount * costPerUnit);
    const odometer = parseInt(form.odometer.value, 10) || 0;

    // Calculate MPG if previous log exists
    const vehicleId = form.vehicleId.value;
    const pastLogs = App.state.fuelLogs.filter(f => f.vehicleId === vehicleId).sort((a,b) => b.odometer - a.odometer);
    let calculatedMpg = 25.0; // fallback default
    if (pastLogs.length > 0 && odometer > pastLogs[0].odometer) {
      const distance = odometer - pastLogs[0].odometer;
      calculatedMpg = parseFloat((distance / amount).toFixed(1));
    }

    const newLog = {
      id: 'f_' + Date.now(),
      vehicleId,
      date: form.date.value,
      odometer,
      amount,
      unit: form.unit.value,
      costPerUnit,
      totalCost,
      calculatedMpg,
      location: form.location.value.trim()
    };

    // Update vehicle odometer
    const vehicle = App.state.vehicles.find(v => v.id === vehicleId);
    if (vehicle && odometer > vehicle.odometer) {
      vehicle.odometer = odometer;
    }

    App.state.fuelLogs.push(newLog);
    App.saveState();
    App.closeModal('logFuelModal');
    form.reset();
    App.render();
  },

  deleteLog(id) {
    if (!confirm("Are you sure you want to delete this fuel record?")) return;
    App.state.fuelLogs = App.state.fuelLogs.filter(f => f.id !== id);
    App.saveState();
    App.render();
  }
};

window.FuelManager = FuelManager;
