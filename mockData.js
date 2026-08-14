/* ==========================================================================
   Vehicle Service & Repair Tracker - Initial Mock Dataset
   ========================================================================== */

const INITIAL_DATA = {
  vehicles: [
    {
      id: "v1",
      make: "Porsche",
      model: "911 Carrera S",
      year: 2023,
      type: "Gasoline",
      vin: "WP0AA2A91PS291840",
      licensePlate: "911-FAST",
      odometer: 14250,
      annualMileageEst: 6500,
      status: "OK", // OK, DUE, OVERDUE
      image: "assets/images/porsche_911.png",
      purchaseDate: "2023-04-15",
      notes: "Serviced exclusively at Porsche Authorized Dealer."
    },
    {
      id: "v2",
      make: "Tesla",
      model: "Model Y Long Range",
      year: 2022,
      type: "Electric",
      vin: "5YJYGDEF0NF481920",
      licensePlate: "EV-PLUG",
      odometer: 28100,
      annualMileageEst: 12000,
      status: "DUE",
      image: "assets/images/tesla_model_y.png",
      purchaseDate: "2022-09-10",
      notes: "Equipped with FSD Beta & 20-inch Induction Wheels."
    },
    {
      id: "v3",
      make: "Toyota",
      model: "RAV4 Hybrid AWD",
      year: 2021,
      type: "Hybrid",
      vin: "JTMBWRFV5MD091834",
      licensePlate: "HYBRID-8",
      odometer: 42800,
      annualMileageEst: 15000,
      status: "OK",
      image: "assets/images/toyota_rav4.png",
      purchaseDate: "2021-02-20",
      notes: "Daily family commuter & road-trip vehicle."
    }
  ],

  services: [
    {
      id: "s101",
      vehicleId: "v1",
      serviceName: "Porsche 10K Synthetic Maintenance",
      image: "assets/images/oil_change_service.png",
      description: "Mobil 1 0W-40 Synthetic oil replacement, OEM Porsche oil filter, multi-point inspection",
      category: "Routine",
      date: "2024-03-12",
      odometer: 9800,
      cost: 480.00,
      discount: 25.00,
      shop: "Porsche Center West",
      technician: "Marcus Vance",
      notes: "Full synthetic service complete.",
      warrantyCovered: false,
      receiptNumber: "INV-911-4029"
    },
    {
      id: "s102",
      vehicleId: "v1",
      serviceName: "Michelin Pilot Sport Rear Tires",
      image: "assets/images/brake_service.png",
      description: "Mounted & precision high-speed balanced 305/30ZR20 rear performance tires",
      category: "Tires",
      date: "2024-06-25",
      odometer: 12400,
      cost: 920.00,
      discount: 50.00,
      shop: "Apex Performance Tires",
      technician: "Dave Miller",
      notes: "Precision high-speed wheel alignment checked.",
      warrantyCovered: false,
      receiptNumber: "INV-APX-8812"
    },
    {
      id: "s103",
      vehicleId: "v2",
      serviceName: "Tesla HVAC HEPA Air Filter",
      image: "assets/images/oil_change_service.png",
      description: "Replaced dual HEPA filter array & anti-microbial evaporator coil sanitize spray",
      category: "EV System",
      date: "2023-11-05",
      odometer: 16500,
      cost: 140.00,
      discount: 10.00,
      shop: "Tesla Service Center",
      technician: "Mobile Ranger Tim",
      notes: "Replaced dual HEPA filter array and sprayed evaporator cleaner.",
      warrantyCovered: false,
      receiptNumber: "TSL-MOB-3392"
    },
    {
      id: "s104",
      vehicleId: "v2",
      serviceName: "Brake Moisture Test & Tire Rotation",
      image: "assets/images/brake_service.png",
      description: "Brake fluid moisture content test, caliper slider lube, and 4-wheel rotation",
      category: "Routine",
      date: "2024-05-18",
      odometer: 24000,
      cost: 95.00,
      discount: 15.00,
      shop: "Tesla Service Center",
      technician: "Sarah Connor",
      notes: "Brake fluid moisture <1.5%. Rotated 20 inch wheels.",
      warrantyCovered: true,
      receiptNumber: "TSL-SVC-9921"
    },
    {
      id: "s105",
      vehicleId: "v3",
      serviceName: "Toyota 40K Major Hybrid Service",
      image: "assets/images/oil_change_service.png",
      description: "Full engine service, spark plug check, hybrid battery cooling fan screen cleaning",
      category: "Routine",
      date: "2024-02-10",
      odometer: 39500,
      cost: 320.00,
      discount: 20.00,
      shop: "Toyota City Authorized",
      technician: "Kenji Sato",
      notes: "Engine oil change, tire rotation, hybrid battery fan filter cleaned.",
      warrantyCovered: false,
      receiptNumber: "TOY-44810"
    },
    {
      id: "s106",
      vehicleId: "v3",
      serviceName: "Brake Pad Replacement & Rotor Repair",
      image: "assets/images/brake_service.png",
      description: "Front ceramic quiet-stop brake pads & precision rotor resurfacing",
      category: "Repair",
      date: "2024-07-04",
      odometer: 42100,
      cost: 450.00,
      discount: 30.00,
      shop: "BrakeMasters Express",
      technician: "Alex Rivera",
      notes: "Replaced front Ceramic pads and resurfaced rotors.",
      warrantyCovered: false,
      receiptNumber: "BM-1093"
    }
  ],

  reminders: [
    {
      id: "r1",
      vehicleId: "v1",
      taskName: "Brake Fluid Flush (2 Year Interval)",
      category: "Routine",
      dueMileage: 16000,
      dueDate: "2025-04-15",
      estimatedCost: 350.00,
      priority: "Medium"
    },
    {
      id: "r2",
      vehicleId: "v2",
      taskName: "Brake Caliper Cleaning & Lubrication",
      category: "EV System",
      dueMileage: 30000,
      dueDate: "2024-09-01",
      estimatedCost: 180.00,
      priority: "High"
    },
    {
      id: "r3",
      vehicleId: "v3",
      taskName: "Engine & Hybrid Inverter Coolant Replacement",
      category: "Routine",
      dueMileage: 50000,
      dueDate: "2025-02-20",
      estimatedCost: 280.00,
      priority: "Low"
    }
  ],

  fuelLogs: [
    {
      id: "f1",
      vehicleId: "v1",
      date: "2024-07-01",
      odometer: 13800,
      amount: 15.2,
      unit: "Gallons",
      costPerUnit: 4.85,
      totalCost: 73.72,
      calculatedMpg: 22.4,
      location: "Shell Station #491"
    },
    {
      id: "f2",
      vehicleId: "v2",
      date: "2024-07-15",
      odometer: 27500,
      amount: 54.0,
      unit: "kWh",
      costPerUnit: 0.38,
      totalCost: 20.52,
      calculatedMpg: 4.2, // mi/kWh
      location: "Tesla Supercharger"
    },
    {
      id: "f3",
      vehicleId: "v3",
      date: "2024-07-20",
      odometer: 42500,
      amount: 12.8,
      unit: "Gallons",
      costPerUnit: 3.95,
      totalCost: 50.56,
      calculatedMpg: 39.8,
      location: "Chevron Express"
    }
  ],

  parts: [
    {
      id: "p1",
      vehicleId: "v1",
      partName: "Porsche OEM Oil Filter Element",
      partNumber: "9A7-198-405",
      category: "Routine",
      qty: 2,
      price: 34.50,
      vendor: "Suncoast Porsche Parts",
      status: "In Stock"
    },
    {
      id: "p2",
      vehicleId: "v2",
      partName: "Cabin Air HEPA Filters (Pair)",
      partNumber: "TSL-1107081-00-A",
      category: "EV System",
      qty: 1,
      price: 65.00,
      vendor: "Tesla Direct",
      status: "Installed"
    },
    {
      id: "p3",
      vehicleId: "v3",
      partName: "Bosch Ceramic Front Brake Pad Set",
      partNumber: "BC1421",
      category: "Repair",
      qty: 1,
      price: 88.00,
      vendor: "RockAuto Parts",
      status: "In Stock"
    }
  ]
};

window.INITIAL_DATA = INITIAL_DATA;
