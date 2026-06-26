// js/data.js
// ============================================================
//  ROUTE & PICKUP DATA  —  Macro Rides, Kanpur
//  All coordinates are [lat, lng] (WGS84)
// ============================================================

// A realistic ~6 km driver route in Kanpur (GT Road corridor)
const ROUTE_COORDS = [
  [26.4499, 80.3319],
  [26.4510, 80.3345],
  [26.4522, 80.3372],
  [26.4533, 80.3398],
  [26.4545, 80.3425],
  [26.4558, 80.3452],
  [26.4570, 80.3479],
  [26.4583, 80.3505],
  [26.4596, 80.3532],
  [26.4609, 80.3558],
  [26.4621, 80.3585],
  [26.4634, 80.3611],
  [26.4647, 80.3637],
  [26.4659, 80.3662],
  [26.4670, 80.3688],
  [26.4682, 80.3714],
  [26.4693, 80.3740],
  [26.4704, 80.3765],
  [26.4714, 80.3790],
  [26.4723, 80.3815],
  [26.4732, 80.3840],
  [26.4740, 80.3865],
  [26.4748, 80.3890],
  [26.4755, 80.3914],
  [26.4762, 80.3939],
  [26.4768, 80.3963],
  [26.4773, 80.3988],
  [26.4778, 80.4012],
  [26.4782, 80.4036],
  [26.4785, 80.4060]
];

// 20 pickup points — mix of eligible (near route) and ineligible (far)
const PICKUP_POINTS = [
  // Eligible — within ~350 m of route
  { id: 1,  name: "Panki Power House Gate",        lat: 26.4518, lng: 80.3380, type: "Metro Stop"    },
  { id: 2,  name: "GT Road Bus Stand",             lat: 26.4560, lng: 80.3470, type: "Bus Stand"     },
  { id: 3,  name: "Shyam Nagar Crossing",          lat: 26.4605, lng: 80.3560, type: "Intersection"  },
  { id: 4,  name: "Kidwai Nagar Market",           lat: 26.4640, lng: 80.3630, type: "Market"        },
  { id: 5,  name: "Armapur Estate Gate",           lat: 26.4686, lng: 80.3720, type: "Residential"   },
  { id: 6,  name: "Panki Temple Road",             lat: 26.4508, lng: 80.3350, type: "Temple"        },
  { id: 7,  name: "Civil Lines Flyover Base",      lat: 26.4750, lng: 80.3870, type: "Landmark"      },
  { id: 8,  name: "Chakeri Junction",              lat: 26.4730, lng: 80.3840, type: "Intersection"  },
  { id: 9,  name: "Govind Nagar Metro",            lat: 26.4660, lng: 80.3680, type: "Metro Stop"    },
  { id: 10, name: "IIT Kanpur Gate",               lat: 26.4715, lng: 80.3800, type: "Campus"        },
  { id: 11, name: "Kalyanpur Square",              lat: 26.4695, lng: 80.3745, type: "Intersection"  },
  { id: 12, name: "Barra-8 Market",                lat: 26.4580, lng: 80.3510, type: "Market"        },

  // Ineligible — > 350 m away from route
  { id: 13, name: "Bithoor Ghat",                  lat: 26.5200, lng: 80.3400, type: "Ghat"          },
  { id: 14, name: "Chaubeypur Bazaar",             lat: 26.5000, lng: 80.3100, type: "Market"        },
  { id: 15, name: "Rawatpur Station",              lat: 26.4200, lng: 80.3900, type: "Rail Station"  },
  { id: 16, name: "Pariyar Industrial Area",       lat: 26.5100, lng: 80.4100, type: "Industrial"    },
  { id: 17, name: "Sheoli Village",                lat: 26.4600, lng: 80.2800, type: "Village"       },
  { id: 18, name: "Vikas Nagar Colony",            lat: 26.4100, lng: 80.3600, type: "Residential"   },
  { id: 19, name: "Unnao Border Checkpost",        lat: 26.3900, lng: 80.4900, type: "Checkpoint"    },
  { id: 20, name: "Nawabganj River Bank",          lat: 26.4900, lng: 80.4600, type: "Riverbank"     }
];

// Default settings
const DEFAULT_SETTINGS = {
  bufferRadius:  350,   // metres
  h3Resolution:  9,
  simSpeed:      1,
  route:         ROUTE_COORDS,
  pickups:       PICKUP_POINTS
};
