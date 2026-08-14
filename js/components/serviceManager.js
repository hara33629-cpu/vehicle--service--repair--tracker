/* ==========================================================================
   Service & Reminders Manager Component
   ========================================================================== */

const ServiceManager = {
  renderServices(state) {
    const tableBody = document.getElementById('serviceTableBody');
    if (!tableBody) return;

    // Filter by vehicle
    let filtered = state.services;
    if (state.selectedVehicleId !== 'ALL') {
      filtered = filtered.filter(s => s.vehicleId === state.selectedVehicleId);
    }

    // Filter by category
    const categoryFilter = document.getElementById('serviceCategoryFilter')?.value || 'ALL';
    if (categoryFilter !== 'ALL') {
      filtered = filtered.filter(s => s.category === categoryFilter);
    }

    // Search query
    const searchVal = (document.getElementById('serviceSearchInput')?.value || '').toLowerCase();
    if (searchVal) {
      filtered = filtered.filter(s => 
        s.serviceName.toLowerCase().includes(searchVal) ||
        s.shop.toLowerCase().includes(searchVal) ||
        s.technician.toLowerCase().includes(searchVal) ||
        (s.notes && s.notes.toLowerCase().includes(searchVal))
      );
    }

    // Sort by date descending
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 32px;">
            No service records found matching your filters.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = filtered.map(s => {
      const v = state.vehicles.find(veh => veh.id === s.vehicleId);
      const vehicleName = v ? `${v.year} ${v.make} ${v.model}` : 'Unknown Vehicle';

      let tagClass = 'tag-routine';
      if (s.category === 'Repair') tagClass = 'tag-repair';
      else if (s.category === 'Tires') tagClass = 'tag-tires';
      else if (s.category === 'EV System') tagClass = 'tag-ev';
      else if (s.category === 'Detailing') tagClass = 'tag-detail';

      return `
        <tr>
          <td>
            <div style="font-weight: 600;">${s.date}</div>
            <div style="font-size: 11px; color: var(--text-muted);">${s.odometer ? s.odometer.toLocaleString() + ' mi' : 'N/A'}</div>
          </td>
          <td>
            <div style="font-weight: 600; color: #fff;">${s.serviceName}</div>
            <div style="font-size: 12px; color: var(--accent-cyan);">${vehicleName}</div>
          </td>
          <td>
            <span class="category-tag ${tagClass}">${s.category}</span>
          </td>
          <td>
            <div style="font-weight: 500;">${s.shop || 'Self Serviced'}</div>
            <div style="font-size: 11px; color: var(--text-muted);">${s.technician ? 'Tech: ' + s.technician : ''}</div>
          </td>
          <td style="font-weight: 700; color: var(--text-primary);">
            $${Number(s.cost).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </td>
          <td>
            ${s.receiptNumber ? `<span style="font-size: 11px; background: rgba(255,255,255,0.08); padding: 2px 6px; border-radius: 4px;">🧾 ${s.receiptNumber}</span>` : '<span style="color: var(--text-muted); font-size: 11px;">No Receipt</span>'}
          </td>
          <td style="text-align: right;">
            <button class="btn btn-secondary btn-sm" onclick="ServiceManager.deleteService('${s.id}')" title="Delete Log" style="color: var(--accent-red); border-color: rgba(239,68,68,0.3)">
              🗑️
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  renderReminders(state) {
    const list = document.getElementById('remindersList');
    if (!list) return;

    let filtered = state.reminders;
    if (state.selectedVehicleId !== 'ALL') {
      filtered = filtered.filter(r => r.vehicleId === state.selectedVehicleId);
    }

    if (filtered.length === 0) {
      list.innerHTML = `
        <div class="card" style="text-align: center; padding: 40px;">
          <div style="font-size: 36px; margin-bottom: 8px;">🎉</div>
          <h3>All Scheduled Maintenance is Up to Date!</h3>
          <p style="color: var(--text-secondary); margin-top: 6px;">No upcoming service alerts registered for your garage.</p>
        </div>
      `;
      return;
    }

    list.innerHTML = filtered.map(r => {
      const v = state.vehicles.find(veh => veh.id === r.vehicleId);
      const vehicleName = v ? `${v.year} ${v.make} ${v.model}` : 'Unknown Vehicle';
      const odoDiff = v ? (r.dueMileage - v.odometer) : 0;
      
      let badgeText = odoDiff > 0 ? `Due in ${odoDiff.toLocaleString()} miles` : `Overdue by ${Math.abs(odoDiff).toLocaleString()} miles`;
      let badgeColor = odoDiff > 0 ? 'var(--accent-amber)' : 'var(--accent-red)';

      return `
        <div class="reminder-item">
          <div class="reminder-info">
            <div class="reminder-icon">🔧</div>
            <div class="reminder-details">
              <h4>${r.taskName}</h4>
              <p>Vehicle: <strong style="color: var(--accent-cyan)">${vehicleName}</strong> • Due Date: ${r.dueDate || 'Flexible'}</p>
              <span style="display: inline-block; font-size: 12px; font-weight: 700; color: ${badgeColor}; margin-top: 4px;">
                ${badgeText}
              </span>
            </div>
          </div>
          <div style="display: flex; gap: 10px; align-items: center;">
            <button class="btn btn-emerald btn-sm" onclick="ServiceManager.completeReminder('${r.id}')">
              ✓ Log & Complete
            </button>
            <button class="btn btn-secondary btn-sm" onclick="ServiceManager.deleteReminder('${r.id}')" title="Dismiss" style="color: var(--text-muted)">
              ✕
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  addService(e) {
    e.preventDefault();
    const form = e.target;

    const newService = {
      id: 's_' + Date.now(),
      vehicleId: form.vehicleId.value,
      serviceName: form.serviceName.value.trim(),
      category: form.category.value,
      date: form.date.value,
      odometer: parseInt(form.odometer.value, 10) || 0,
      cost: parseFloat(form.cost.value) || 0,
      shop: form.shop.value.trim(),
      technician: form.technician.value.trim(),
      notes: form.notes.value.trim(),
      receiptNumber: form.receiptNumber.value.trim()
    };

    // Update vehicle current odometer if higher
    const vehicle = App.state.vehicles.find(v => v.id === newService.vehicleId);
    if (vehicle && newService.odometer > vehicle.odometer) {
      vehicle.odometer = newService.odometer;
    }

    App.state.services.push(newService);
    App.saveState();
    App.closeModal('logServiceModal');
    form.reset();
    App.render();
  },

  addReminder(e) {
    e.preventDefault();
    const form = e.target;

    const newReminder = {
      id: 'r_' + Date.now(),
      vehicleId: form.vehicleId.value,
      taskName: form.taskName.value.trim(),
      category: form.category.value,
      dueMileage: parseInt(form.dueMileage.value, 10) || 0,
      dueDate: form.dueDate.value,
      estimatedCost: parseFloat(form.estimatedCost.value) || 0,
      priority: form.priority.value
    };

    App.state.reminders.push(newReminder);
    App.saveState();
    App.closeModal('addReminderModal');
    form.reset();
    App.render();
  },

  completeReminder(reminderId) {
    const r = App.state.reminders.find(rem => rem.id === reminderId);
    if (!r) return;

    const vehicle = App.state.vehicles.find(v => v.id === r.vehicleId);

    // Auto-create service record
    const newService = {
      id: 's_' + Date.now(),
      vehicleId: r.vehicleId,
      serviceName: r.taskName,
      category: r.category || 'Routine',
      date: new Date().toISOString().split('T')[0],
      odometer: vehicle ? vehicle.odometer : r.dueMileage,
      cost: r.estimatedCost || 0,
      shop: 'Completed Service',
      notes: `Logged automatically from scheduled reminder "${r.taskName}"`,
      receiptNumber: 'REM-' + Math.floor(1000 + Math.random() * 9000)
    };

    App.state.services.push(newService);
    App.state.reminders = App.state.reminders.filter(rem => rem.id !== reminderId);
    App.saveState();
    App.render();
    App.switchTab('services');
  },

  deleteService(id) {
    if (!confirm("Are you sure you want to delete this service entry?")) return;
    App.state.services = App.state.services.filter(s => s.id !== id);
    App.saveState();
    App.render();
  },

  deleteReminder(id) {
    App.state.reminders = App.state.reminders.filter(r => r.id !== id);
    App.saveState();
    App.render();
  }
};

window.ServiceManager = ServiceManager;
