/* ==========================================================================
   Vehicle Service & Repair Tracker - Main Application Controller
   ========================================================================== */

const STORAGE_KEY = 'VEHICLE_TRACKER_STATE_V1';

const App = {
  state: {
    vehicles: [],
    services: [],
    reminders: [],
    fuelLogs: [],
    parts: [],
    selectedVehicleId: 'ALL',
    activeTab: 'dashboard'
  },

  init() {
    this.loadState();
    this.bindEvents();
    this.render();
  },

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.state = JSON.parse(saved);
        if (!this.state.selectedVehicleId) this.state.selectedVehicleId = 'ALL';
        if (!this.state.activeTab) this.state.activeTab = 'dashboard';
      } else {
        // Load initial mock dataset
        this.state.vehicles = JSON.parse(JSON.stringify(window.INITIAL_DATA.vehicles));
        this.state.services = JSON.parse(JSON.stringify(window.INITIAL_DATA.services));
        this.state.reminders = JSON.parse(JSON.stringify(window.INITIAL_DATA.reminders));
        this.state.fuelLogs = JSON.parse(JSON.stringify(window.INITIAL_DATA.fuelLogs));
        this.state.parts = JSON.parse(JSON.stringify(window.INITIAL_DATA.parts));
        this.saveState();
      }
    } catch (e) {
      console.error("Error loading state:", e);
      this.state.vehicles = window.INITIAL_DATA.vehicles;
      this.state.services = window.INITIAL_DATA.services;
      this.state.reminders = window.INITIAL_DATA.reminders;
      this.state.fuelLogs = window.INITIAL_DATA.fuelLogs;
      this.state.parts = window.INITIAL_DATA.parts;
    }
  },

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error("Error saving state:", e);
    }
  },

  resetDemoData() {
    if (confirm("Reset to factory demo dataset? All current custom edits will be restored.")) {
      localStorage.removeItem(STORAGE_KEY);
      this.loadState();
      this.render();
    }
  },

  bindEvents() {
    // Navigation Items
    document.querySelectorAll('.nav-item[data-tab]').forEach(item => {
      item.addEventListener('click', (e) => {
        const tab = e.currentTarget.getAttribute('data-tab');
        this.switchTab(tab);
      });
    });

    // Vehicle Selector Dropdown
    const dropdown = document.getElementById('vehicleDropdown');
    if (dropdown) {
      dropdown.addEventListener('change', (e) => {
        this.selectVehicle(e.target.value);
      });
    }

    // Modal forms event listeners
    document.getElementById('addVehicleForm')?.addEventListener('submit', (e) => VehicleManager.addVehicle(e));
    document.getElementById('logServiceForm')?.addEventListener('submit', (e) => ServiceManager.addService(e));
    document.getElementById('addReminderForm')?.addEventListener('submit', (e) => ServiceManager.addReminder(e));
    document.getElementById('logFuelForm')?.addEventListener('submit', (e) => FuelManager.addFuelLog(e));
    document.getElementById('addPartForm')?.addEventListener('submit', (e) => PartsManager.addPart(e));

    // Filters & Search
    document.getElementById('serviceSearchInput')?.addEventListener('input', () => ServiceManager.renderServices(this.state));
    document.getElementById('serviceCategoryFilter')?.addEventListener('change', () => ServiceManager.renderServices(this.state));
  },

  switchTab(tabName) {
    this.state.activeTab = tabName;
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.getAttribute('data-tab') === tabName);
    });

    document.querySelectorAll('.page-tab').forEach(page => {
      page.classList.toggle('active', page.id === `tab-${tabName}`);
    });

    this.renderCurrentTab();
  },

  selectVehicle(vehicleId) {
    this.state.selectedVehicleId = vehicleId;
    this.saveState();
    this.render();
  },

  render() {
    // Render topbar selector
    VehicleManager.renderDropdown(this.state);
    
    // Update reminder badge counter
    const reminderBadge = document.getElementById('reminderNavBadge');
    if (reminderBadge) {
      reminderBadge.textContent = this.state.reminders.length;
      reminderBadge.style.display = this.state.reminders.length > 0 ? 'inline-block' : 'none';
    }

    this.renderCurrentTab();
  },

  renderCurrentTab() {
    const tab = this.state.activeTab;

    // Render Dashboard KPIs & Analytics
    AnalyticsEngine.render(this.state);

    if (tab === 'dashboard') {
      VehicleManager.renderGarage(this.state);
      ServiceManager.renderServices(this.state);
      ServiceManager.renderReminders(this.state);
    } else if (tab === 'garage') {
      VehicleManager.renderGarage(this.state);
    } else if (tab === 'services') {
      ServiceManager.renderServices(this.state);
    } else if (tab === 'reminders') {
      ServiceManager.renderReminders(this.state);
    } else if (tab === 'fuel') {
      FuelManager.render(this.state);
    } else if (tab === 'parts') {
      PartsManager.render(this.state);
    } else if (tab === 'analytics') {
      AnalyticsEngine.render(this.state);
    } else if (tab === 'passbook') {
      ExportManager.renderPassbook(this.state);
    }
  },

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    // Populate vehicle select dropdown inside modal if available
    const vehSelects = modal.querySelectorAll('select[name="vehicleId"]');
    vehSelects.forEach(select => {
      select.innerHTML = this.state.vehicles.map(v => 
        `<option value="${v.id}" ${v.id === this.state.selectedVehicleId ? 'selected' : ''}>${v.year} ${v.make} ${v.model}</option>`
      ).join('');
    });

    // Set today date as default in date fields
    const dateInputs = modal.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
      if (!input.value) {
        input.value = new Date().toISOString().split('T')[0];
      }
    });

    modal.classList.add('active');
  },

  openLogServiceModal(vehicleId) {
    if (vehicleId) {
      this.state.selectedVehicleId = vehicleId;
    }
    this.openModal('logServiceModal');
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
    }
  },

  openYellowTrackerModal(type = 'services') {
    const select = document.getElementById('yellowTableTypeSelect');
    if (select) select.value = type;
    this.renderYellowTable(type);
    this.openModal('yellowTrackerModal');
  },

  renderYellowTable(type = 'services') {
    const headerEl = document.getElementById('yellowTableHeader');
    const bodyEl = document.getElementById('yellowTableBody');
    const titleEl = document.getElementById('yellowModalTitle');
    if (!headerEl || !bodyEl) return;

    if (type === 'catering') {
      if (titleEl) titleEl.textContent = 'Total Food';
      headerEl.innerHTML = `
        <tr>
          <th>Food Name</th>
          <th>Food Image</th>
          <th>Food Description</th>
          <th>Food Category</th>
          <th>Food Price</th>
          <th>Food Discount</th>
        </tr>
      `;
      const foodItems = [
        {
          name: "Royal Chicken Biryani",
          image: "assets/images/oil_change_service.png",
          desc: "The Royal Hydrabadi Chicken Biryani",
          cat: "Biryani",
          price: 300.0,
          discount: 2.0
        },
        {
          name: "Idli Dosa",
          image: "assets/images/brake_service.png",
          desc: "Special Idli Dosa with chutney",
          cat: "Veg",
          price: 200.0,
          discount: 1.0
        },
        {
          name: "Chicken Fried Rice",
          image: "assets/images/toyota_rav4.png",
          desc: "Delicious Chicken Fried rice with sauce",
          cat: "Chicken",
          price: 400.0,
          discount: 2.0
        }
      ];

      bodyEl.innerHTML = foodItems.map(item => `
        <tr>
          <td style="font-weight: 600;">${item.name}</td>
          <td><img class="yellow-thumb-img" src="${item.image}" alt="${item.name}"></td>
          <td>${item.desc}</td>
          <td>${item.cat}</td>
          <td>${item.price.toFixed(1)}</td>
          <td>${item.discount.toFixed(1)}</td>
        </tr>
      `).join('');

    } else if (type === 'vehicles') {
      if (titleEl) titleEl.textContent = 'Total Vehicles';
      headerEl.innerHTML = `
        <tr>
          <th>Vehicle Name</th>
          <th>Vehicle Image</th>
          <th>Vehicle Description</th>
          <th>Vehicle Category</th>
          <th>Vehicle Price</th>
          <th>Vehicle Discount</th>
        </tr>
      `;
      bodyEl.innerHTML = this.state.vehicles.map(v => `
        <tr>
          <td style="font-weight: 600;">${v.year} ${v.make} ${v.model}</td>
          <td><img class="yellow-thumb-img" src="${v.image}" alt="${v.make}"></td>
          <td>${v.type} Powertrain, Odometer: ${v.odometer.toLocaleString()} mi (${v.notes || 'No notes'})</td>
          <td><span class="yellow-badge">${v.type}</span></td>
          <td>${(v.make === 'Porsche' ? 125000 : (v.make === 'Tesla' ? 52000 : 34000)).toFixed(1)}</td>
          <td>${(v.make === 'Porsche' ? 150.0 : (v.make === 'Tesla' ? 80.0 : 45.0)).toFixed(1)}</td>
        </tr>
      `).join('');

    } else if (type === 'parts') {
      if (titleEl) titleEl.textContent = 'Total Spare Parts';
      headerEl.innerHTML = `
        <tr>
          <th>Part Name</th>
          <th>Part Image</th>
          <th>Part Description</th>
          <th>Part Category</th>
          <th>Part Price</th>
          <th>Part Discount</th>
        </tr>
      `;
      bodyEl.innerHTML = this.state.parts.map(p => `
        <tr>
          <td style="font-weight: 600;">${p.partName}</td>
          <td><img class="yellow-thumb-img" src="${p.image || 'assets/images/oil_change_service.png'}" alt="${p.partName}"></td>
          <td>${p.description || p.vendor} (P/N: ${p.partNumber || 'OEM'})</td>
          <td><span class="yellow-badge">${p.category}</span></td>
          <td>${Number(p.price).toFixed(1)}</td>
          <td>${Number(p.discount || 0).toFixed(1)}</td>
        </tr>
      `).join('');

    } else { // services
      if (titleEl) titleEl.textContent = 'Total Services';
      headerEl.innerHTML = `
        <tr>
          <th>Service Name</th>
          <th>Service Image</th>
          <th>Service Description</th>
          <th>Service Category</th>
          <th>Service Price</th>
          <th>Service Discount</th>
        </tr>
      `;
      bodyEl.innerHTML = this.state.services.map(s => `
        <tr>
          <td style="font-weight: 600;">${s.serviceName}</td>
          <td><img class="yellow-thumb-img" src="${s.image || 'assets/images/oil_change_service.png'}" alt="${s.serviceName}"></td>
          <td>${s.description || s.notes || 'Vehicle Maintenance'} (${s.shop || 'Shop'})</td>
          <td><span class="yellow-badge">${s.category}</span></td>
          <td>${Number(s.cost).toFixed(1)}</td>
          <td>${Number(s.discount || 0).toFixed(1)}</td>
        </tr>
      `).join('');
    }
  }
};

window.App = App;

// Run Application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
