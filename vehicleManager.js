/* ==========================================================================
   Vehicle Manager Component
   ========================================================================== */

const VehicleManager = {
  renderGarage(state) {
    const containers = [
      document.getElementById('dashboardGarageGrid'),
      document.getElementById('garageGrid')
    ].filter(Boolean);

    if (containers.length === 0) return;

    let content = '';
    if (state.vehicles.length === 0) {
      content = `
        <div class="card" style="grid-column: 1/-1; text-align: center; padding: 48px;">
          <h3>No Vehicles in Garage</h3>
          <p style="color: var(--text-secondary); margin: 12px 0 20px;">Add your first car, truck, or EV to start tracking maintenance history.</p>
          <button class="btn btn-primary" onclick="App.openModal('addVehicleModal')">
            <span>+ Add Vehicle</span>
          </button>
        </div>
      `;
    } else {
      content = state.vehicles.map(v => {
        // Calculate total spend for this vehicle
        const vServices = state.services.filter(s => s.vehicleId === v.id);
        const totalSpent = vServices.reduce((sum, s) => sum + Number(s.cost || 0), 0);
        const serviceCount = vServices.length;

        // Status badge styling
        let statusClass = 'status-ok';
        let statusLabel = 'Up to Date';
        if (v.status === 'DUE') {
          statusClass = 'status-due';
          statusLabel = 'Service Due';
        } else if (v.status === 'OVERDUE') {
          statusClass = 'status-overdue';
          statusLabel = 'Overdue';
        }

        return `
          <div class="card vehicle-card">
            <div class="vehicle-image-wrap">
              <img src="${v.image}" alt="${v.year} ${v.make} ${v.model}" onerror="this.src='assets/images/porsche_911.png'">
              <span class="vehicle-status-badge ${statusClass}">${statusLabel}</span>
            </div>
            <div class="vehicle-card-body">
              <div class="vehicle-header-info">
                <div>
                  <h3 class="vehicle-name">${v.year} ${v.make} ${v.model}</h3>
                  <span class="vehicle-sub">${v.type} • VIN: ${v.vin || 'N/A'}</span>
                </div>
              </div>

              <div class="specs-grid">
                <div class="spec-item">
                  <span class="spec-label">Odometer</span>
                  <span class="spec-val">${v.odometer.toLocaleString()} mi</span>
                </div>
                <div class="spec-item">
                  <span class="spec-label">License Plate</span>
                  <span class="spec-val">${v.licensePlate || 'N/A'}</span>
                </div>
                <div class="spec-item">
                  <span class="spec-label">Total Maintenance</span>
                  <span class="spec-val" style="color: var(--accent-cyan)">$${totalSpent.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <div class="spec-item">
                  <span class="spec-label">Total Services</span>
                  <span class="spec-val">${serviceCount} records</span>
                </div>
              </div>

              <p style="font-size: 12px; color: var(--text-secondary); line-clamp: 2; display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden;">
                ${v.notes || 'No special notes.'}
              </p>

              <div class="vehicle-actions">
                <button class="btn btn-secondary btn-sm" style="flex: 1" onclick="App.selectVehicle('${v.id}'); App.switchTab('services')">
                  📋 View History
                </button>
                <button class="btn btn-primary btn-sm" style="flex: 1" onclick="App.openLogServiceModal('${v.id}')">
                  + Log Service
                </button>
                <button class="btn btn-secondary btn-sm" onclick="VehicleManager.deleteVehicle('${v.id}')" title="Delete Vehicle" style="color: var(--accent-red); border-color: rgba(239, 68, 68, 0.3)">
                  🗑️
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    containers.forEach(el => el.innerHTML = content);
  },

  renderDropdown(state) {
    const dropdown = document.getElementById('vehicleDropdown');
    if (!dropdown) return;

    let html = `<option value="ALL">🚗 All Garage Vehicles (${state.vehicles.length})</option>`;
    state.vehicles.forEach(v => {
      const selected = state.selectedVehicleId === v.id ? 'selected' : '';
      html += `<option value="${v.id}" ${selected}>${v.year} ${v.make} ${v.model} (${v.odometer.toLocaleString()} mi)</option>`;
    });

    dropdown.innerHTML = html;
  },

  addVehicle(e) {
    e.preventDefault();
    const form = e.target;
    
    const newVehicle = {
      id: 'v_' + Date.now(),
      make: form.make.value.trim(),
      model: form.model.value.trim(),
      year: parseInt(form.year.value, 10),
      type: form.type.value,
      vin: form.vin.value.trim(),
      licensePlate: form.licensePlate.value.trim(),
      odometer: parseInt(form.odometer.value, 10) || 0,
      annualMileageEst: parseInt(form.annualMileage.value, 10) || 12000,
      status: "OK",
      image: form.image.value.trim() || "assets/images/porsche_911.png",
      notes: form.notes.value.trim()
    };

    App.state.vehicles.push(newVehicle);
    App.state.selectedVehicleId = newVehicle.id;
    App.saveState();
    App.closeModal('addVehicleModal');
    form.reset();
    App.render();
  },

  deleteVehicle(id) {
    if (!confirm("Are you sure you want to delete this vehicle and all associated logs?")) return;
    App.state.vehicles = App.state.vehicles.filter(v => v.id !== id);
    App.state.services = App.state.services.filter(s => s.vehicleId !== id);
    App.state.reminders = App.state.reminders.filter(r => r.vehicleId !== id);
    App.state.fuelLogs = App.state.fuelLogs.filter(f => f.vehicleId !== id);
    App.state.parts = App.state.parts.filter(p => p.vehicleId !== id);

    if (App.state.selectedVehicleId === id) {
      App.state.selectedVehicleId = 'ALL';
    }

    App.saveState();
    App.render();
  }
};

window.VehicleManager = VehicleManager;
