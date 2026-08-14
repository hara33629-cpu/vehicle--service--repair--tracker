/* ==========================================================================
   Analytics Engine Component - SVG Chart Engine & KPI Metrics
   ========================================================================== */

const AnalyticsEngine = {
  render(state) {
    this.renderKPIs(state);
    this.renderCategoryChart(state);
    this.renderMonthlyTrendChart(state);
  },

  renderKPIs(state) {
    let filteredServices = state.services;
    let filteredFuel = state.fuelLogs;

    if (state.selectedVehicleId !== 'ALL') {
      filteredServices = filteredServices.filter(s => s.vehicleId === state.selectedVehicleId);
      filteredFuel = filteredFuel.filter(f => f.vehicleId === state.selectedVehicleId);
    }

    // Total Service Spend
    const totalServiceCost = filteredServices.reduce((sum, s) => sum + Number(s.cost || 0), 0);
    // Total Fuel Spend
    const totalFuelCost = filteredFuel.reduce((sum, f) => sum + Number(f.totalCost || 0), 0);
    const grandTotal = totalServiceCost + totalFuelCost;

    // Average cost per service
    const avgServiceCost = filteredServices.length > 0 ? (totalServiceCost / filteredServices.length) : 0;

    // Calculate total miles driven across fleet / vehicle
    let totalMilesDriven = 0;
    if (state.selectedVehicleId === 'ALL') {
      totalMilesDriven = state.vehicles.reduce((sum, v) => sum + v.odometer, 0);
    } else {
      const v = state.vehicles.find(veh => veh.id === state.selectedVehicleId);
      totalMilesDriven = v ? v.odometer : 0;
    }

    const costPerMile = totalMilesDriven > 0 ? (grandTotal / totalMilesDriven) : 0;

    // Update DOM
    const kpiTotalSpent = document.getElementById('kpiTotalSpent');
    const kpiAvgService = document.getElementById('kpiAvgService');
    const kpiFuelSpent = document.getElementById('kpiFuelSpent');
    const kpiCostPerMile = document.getElementById('kpiCostPerMile');

    if (kpiTotalSpent) kpiTotalSpent.textContent = `$${grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    if (kpiAvgService) kpiAvgService.textContent = `$${avgServiceCost.toFixed(2)}`;
    if (kpiFuelSpent) kpiFuelSpent.textContent = `$${totalFuelCost.toFixed(2)}`;
    if (kpiCostPerMile) kpiCostPerMile.textContent = `$${costPerMile.toFixed(3)} / mi`;
  },

  renderCategoryChart(state) {
    const containers = document.querySelectorAll('#categoryChartContainer');
    if (containers.length === 0) return;

    let filtered = state.services;
    if (state.selectedVehicleId !== 'ALL') {
      filtered = filtered.filter(s => s.vehicleId === state.selectedVehicleId);
    }

    // Group costs by category
    const categories = {
      'Routine': 0,
      'Repair': 0,
      'Tires': 0,
      'EV System': 0,
      'Detailing': 0
    };

    filtered.forEach(s => {
      if (categories[s.category] !== undefined) {
        categories[s.category] += Number(s.cost || 0);
      } else {
        categories['Routine'] += Number(s.cost || 0);
      }
    });

    const totalCost = Object.values(categories).reduce((a, b) => a + b, 0);

    if (totalCost === 0) {
      containers.forEach(el => el.innerHTML = `<div style="color: var(--text-muted); padding: 40px; text-align: center;">No service expense data available yet.</div>`);
      return;
    }

    const colors = {
      'Routine': '#06b6d4',
      'Repair': '#ef4444',
      'Tires': '#f59e0b',
      'EV System': '#8b5cf6',
      'Detailing': '#10b981'
    };

    // Calculate SVG Donut Slices
    let cumulativePercent = 0;
    const slices = Object.entries(categories).map(([cat, val]) => {
      const percent = val / totalCost;
      const startAngle = cumulativePercent * 360;
      cumulativePercent += percent;
      const endAngle = cumulativePercent * 360;

      return {
        cat,
        val,
        percent,
        color: colors[cat] || '#94a3b8',
        startAngle,
        endAngle
      };
    });

    // Helper for polar coordinates to cartesian
    function getCoordinates(angleInDegrees) {
      const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
      return {
        x: 100 + (70 * Math.cos(angleInRadians)),
        y: 100 + (70 * Math.sin(angleInRadians))
      };
    }

    let pathsSvg = '';
    slices.forEach(slice => {
      if (slice.percent === 0) return;
      if (slice.percent > 0.999) {
        pathsSvg += `<circle cx="100" cy="100" r="70" fill="none" stroke="${slice.color}" stroke-width="32" />`;
        return;
      }
      const start = getCoordinates(slice.startAngle);
      const end = getCoordinates(slice.endAngle);
      const largeArcFlag = slice.percent > 0.5 ? 1 : 0;

      const d = [
        `M ${start.x} ${start.y}`,
        `A 70 70 0 ${largeArcFlag} 1 ${end.x} ${end.y}`
      ].join(' ');

      pathsSvg += `<path d="${d}" fill="none" stroke="${slice.color}" stroke-width="32" />`;
    });

    const legendHtml = slices.map(s => `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; font-size: 13px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="width: 12px; height: 12px; border-radius: 3px; background: ${s.color}; display: inline-block;"></span>
          <span style="color: var(--text-primary); font-weight: 500;">${s.cat}</span>
        </div>
        <div style="font-weight: 600; color: var(--text-secondary);">
          $${s.val.toFixed(0)} (${(s.percent * 100).toFixed(0)}%)
        </div>
      </div>
    `).join('');

    const htmlContent = `
      <div style="display: flex; align-items: center; gap: 24px; width: 100%; height: 100%;">
        <div style="position: relative; width: 180px; height: 180px; flex-shrink: 0;">
          <svg viewBox="0 0 200 200" style="width: 100%; height: 100%; transform: rotate(-90deg);">
            ${pathsSvg}
          </svg>
          <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
            <span style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Total</span>
            <span style="font-size: 18px; font-family: var(--font-display); font-weight: 700; color: #fff;">$${totalCost.toFixed(0)}</span>
          </div>
        </div>
        <div style="flex: 1;">
          ${legendHtml}
        </div>
      </div>
    `;

    containers.forEach(el => el.innerHTML = htmlContent);
  },

  renderMonthlyTrendChart(state) {
    const containers = document.querySelectorAll('#monthlyTrendChartContainer');
    if (containers.length === 0) return;

    let filtered = state.services;
    if (state.selectedVehicleId !== 'ALL') {
      filtered = filtered.filter(s => s.vehicleId === state.selectedVehicleId);
    }

    // Generate last 6 calendar months
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const last6Months = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = `${monthNames[d.getMonth()]}`;
      last6Months.push({ key, label, total: 0 });
    }

    // Sum service costs into monthly buckets
    filtered.forEach(s => {
      if (!s.date) return;
      const monthKey = s.date.substring(0, 7);
      const bucket = last6Months.find(m => m.key === monthKey);
      if (bucket) {
        bucket.total += Number(s.cost || 0);
      }
    });

    const maxVal = Math.max(...last6Months.map(m => m.total), 500);

    const barsHtml = last6Months.map(m => {
      const heightPercent = Math.max(10, Math.min(100, (m.total / maxVal) * 100));
      return `
        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 8px;">
          <span style="font-size: 11px; color: var(--accent-cyan); font-weight: 600;">$${m.total.toFixed(0)}</span>
          <div style="width: 100%; max-width: 36px; height: ${heightPercent}%; background: linear-gradient(180deg, var(--accent-cyan), rgba(6, 182, 212, 0.2)); border-radius: 6px 6px 0 0; transition: var(--transition);"></div>
          <span style="font-size: 12px; color: var(--text-secondary); font-weight: 500;">${m.label}</span>
        </div>
      `;
    }).join('');

    const htmlContent = `
      <div style="display: flex; align-items: flex-end; gap: 16px; width: 100%; height: 200px; padding-top: 20px;">
        ${barsHtml}
      </div>
    `;

    containers.forEach(el => el.innerHTML = htmlContent);
  }
};

window.AnalyticsEngine = AnalyticsEngine;
