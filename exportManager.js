/* ==========================================================================
   Export & Service Passbook Manager
   ========================================================================== */

const ExportManager = {
  renderPassbook(state) {
    const container = document.getElementById('passbookViewContainer');
    if (!container) return;

    // Default to first vehicle if ALL is selected
    let targetVehicle = state.vehicles[0];
    if (state.selectedVehicleId !== 'ALL') {
      const found = state.vehicles.find(v => v.id === state.selectedVehicleId);
      if (found) targetVehicle = found;
    }

    if (!targetVehicle) {
      container.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--text-muted);">Please add a vehicle to view passbook.</div>`;
      return;
    }

    const services = state.services.filter(s => s.vehicleId === targetVehicle.id).sort((a,b) => new Date(a.date) - new Date(b.date));
    const totalSpent = services.reduce((sum, s) => sum + Number(s.cost || 0), 0);

    const rowsHtml = services.length > 0 ? services.map(s => `
      <tr>
        <td><strong>${s.date}</strong></td>
        <td>${s.odometer ? s.odometer.toLocaleString() + ' mi' : 'N/A'}</td>
        <td><strong>${s.serviceName}</strong><br><span style="color: #64748b; font-size: 11px;">${s.notes || ''}</span></td>
        <td>${s.category}</td>
        <td>${s.shop || 'Self Serviced'}</td>
        <td style="font-weight: bold; color: #0f172a;">$${Number(s.cost).toFixed(2)}</td>
      </tr>
    `).join('') : `<tr><td colspan="6" style="text-align: center; color: #94a3b8; padding: 20px;">No service records logged for this vehicle passbook.</td></tr>`;

    container.innerHTML = `
      <div class="passbook-container" id="printablePassbook">
        <div class="passbook-header">
          <div>
            <div style="font-size: 10px; font-weight: 700; letter-spacing: 2px; color: #06b6d4; text-transform: uppercase;">Official Maintenance History</div>
            <h2 class="passbook-title">${targetVehicle.year} ${targetVehicle.make} ${targetVehicle.model}</h2>
            <div style="font-size: 13px; color: #64748b; margin-top: 2px;">
              VIN: <strong style="color: #1e293b; font-family: monospace;">${targetVehicle.vin || 'N/A'}</strong> • License Plate: <strong>${targetVehicle.licensePlate || 'N/A'}</strong>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 12px; color: #64748b;">Current Odometer</div>
            <div style="font-size: 22px; font-weight: 800; color: #0f172a; font-family: 'Space Grotesk', sans-serif;">${targetVehicle.odometer.toLocaleString()} MI</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; background: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
          <div>
            <span style="font-size: 11px; color: #64748b; text-transform: uppercase; display: block;">Drivetrain</span>
            <strong style="color: #0f172a;">${targetVehicle.type}</strong>
          </div>
          <div>
            <span style="font-size: 11px; color: #64748b; text-transform: uppercase; display: block;">Total Maintenance Count</span>
            <strong style="color: #0f172a;">${services.length} Completed Services</strong>
          </div>
          <div>
            <span style="font-size: 11px; color: #64748b; text-transform: uppercase; display: block;">Total Verified Investment</span>
            <strong style="color: #059669; font-size: 16px;">$${totalSpent.toLocaleString(undefined, {minimumFractionDigits: 2})}</strong>
          </div>
        </div>

        <h3 style="font-size: 16px; color: #0f172a; margin-bottom: 10px;">Service & Inspection Log History</h3>
        <table class="passbook-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Odometer</th>
              <th>Service Performed</th>
              <th>Category</th>
              <th>ServiceProvider</th>
              <th>Cost</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px dashed #cbd5e1; display: flex; justify-content: space-between; align-items: flex-end; font-size: 11px; color: #64748b;">
          <div>
            Report Generated on: ${new Date().toLocaleDateString()} via Vehicle Service & Repair Tracker System.
          </div>
          <div style="text-align: center;">
            <div style="width: 180px; border-bottom: 1px solid #94a3b8; margin-bottom: 4px;"></div>
            Authorized Owner / Inspector Signature
          </div>
        </div>
      </div>
    `;
  },

  printPassbook() {
    window.print();
  },

  exportCSV(state) {
    let services = state.services;
    if (state.selectedVehicleId !== 'ALL') {
      services = services.filter(s => s.vehicleId === state.selectedVehicleId);
    }

    if (services.length === 0) {
      alert("No service data to export!");
      return;
    }

    const headers = ["ID", "Vehicle", "Date", "Odometer", "Service Name", "Category", "Cost", "Shop", "Technician", "Receipt Number", "Notes"];
    const rows = services.map(s => {
      const v = state.vehicles.find(veh => veh.id === s.vehicleId);
      const vehicleName = v ? `${v.year} ${v.make} ${v.model}` : 'Unknown';
      return [
        s.id,
        `"${vehicleName}"`,
        s.date,
        s.odometer,
        `"${s.serviceName}"`,
        s.category,
        s.cost,
        `"${s.shop || ''}"`,
        `"${s.technician || ''}"`,
        `"${s.receiptNumber || ''}"`,
        `"${(s.notes || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `vehicle_service_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

window.ExportManager = ExportManager;
