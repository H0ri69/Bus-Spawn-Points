/**
 * BL1 Company Bus Timetable Data
 * 
 * Structure:
 *   direction → dayType → array of connection objects
 *   Each connection has a time for every stop on that route.
 *   `isYellow: true` means the service runs only on working Saturdays and Sundays.
 *
 * Direction "toBlucina":  Brno Úzká → Brno Komárov → Blučina
 * Direction "toBrno":     Blučina → Brno Mariánské nám. → Brno Úzká
 */

const STOPS = {
  toBlucina: ["Brno Úzká", "Brno Komárov", "Blučina"],
  toBrno: ["Blučina", "Brno Mariánské nám.", "Brno Úzká"]
};

const TIMETABLE = {
  toBlucina: {
    weekday: [
      { "Brno Úzká": "5:10",  "Brno Komárov": "5:15",  "Blučina": "5:35"  },
      { "Brno Úzká": "5:25",  "Brno Komárov": "5:30",  "Blučina": "5:50"  },
      { "Brno Úzká": "6:05",  "Brno Komárov": "6:10",  "Blučina": "6:30"  },
      { "Brno Úzká": "6:20",  "Brno Komárov": "6:25",  "Blučina": "6:45"  },
      { "Brno Úzká": "7:05",  "Brno Komárov": "7:10",  "Blučina": "7:30"  },
      { "Brno Úzká": "7:20",  "Brno Komárov": "7:25",  "Blučina": "7:45"  },
      { "Brno Úzká": "8:20",  "Brno Komárov": "8:25",  "Blučina": "8:45"  },
      { "Brno Úzká": "9:30",  "Brno Komárov": "9:35",  "Blučina": "9:55"  },
      { "Brno Úzká": "10:15", "Brno Komárov": "10:20", "Blučina": "10:40" },
      { "Brno Úzká": "11:30", "Brno Komárov": "11:35", "Blučina": "11:55" },
      { "Brno Úzká": "12:45", "Brno Komárov": "12:50", "Blučina": "13:10" },
      { "Brno Úzká": "15:40", "Brno Komárov": "15:45", "Blučina": "16:05" },
      { "Brno Úzká": "16:15", "Brno Komárov": "16:20", "Blučina": "16:40" },
      { "Brno Úzká": "16:40", "Brno Komárov": "16:45", "Blučina": "17:05" },
      { "Brno Úzká": "17:15", "Brno Komárov": "17:20", "Blučina": "17:40" },
      { "Brno Úzká": "19:50", "Brno Komárov": "19:55", "Blučina": "20:15" }
    ],
    weekend: [
      { "Brno Úzká": "5:10",  "Brno Komárov": "5:15",  "Blučina": "5:35",  isYellow: false },
      { "Brno Úzká": "5:25",  "Brno Komárov": "5:28",  "Blučina": "5:50",  isYellow: true  },
      { "Brno Úzká": "6:00",  "Brno Komárov": "6:05",  "Blučina": "6:25",  isYellow: false },
      { "Brno Úzká": "11:20", "Brno Komárov": "11:25", "Blučina": "11:45", isYellow: false },
      { "Brno Úzká": "16:20", "Brno Komárov": "16:25", "Blučina": "16:45", isYellow: false },
      { "Brno Úzká": "17:15", "Brno Komárov": "17:20", "Blučina": "17:40", isYellow: true  },
      { "Brno Úzká": "17:20", "Brno Komárov": "17:25", "Blučina": "17:45", isYellow: false }
    ]
  },
  toBrno: {
    weekday: [
      { "Blučina": "5:35",  "Brno Mariánské nám.": "5:50",  "Brno Úzká": "6:00"  },
      { "Blučina": "5:50",  "Brno Mariánské nám.": "6:05",  "Brno Úzká": "6:15"  },
      { "Blučina": "6:35",  "Brno Mariánské nám.": "6:50",  "Brno Úzká": "7:00"  },
      { "Blučina": "6:50",  "Brno Mariánské nám.": "7:05",  "Brno Úzká": "7:15"  },
      { "Blučina": "7:50",  "Brno Mariánské nám.": "8:05",  "Brno Úzká": "8:15"  },
      { "Blučina": "9:05",  "Brno Mariánské nám.": "9:20",  "Brno Úzká": "9:30"  },
      { "Blučina": "9:50",  "Brno Mariánské nám.": "10:05", "Brno Úzká": "10:15" },
      { "Blučina": "11:05", "Brno Mariánské nám.": "11:20", "Brno Úzká": "11:30" },
      { "Blučina": "12:15", "Brno Mariánské nám.": "12:30", "Brno Úzká": "12:40" },
      { "Blučina": "15:10", "Brno Mariánské nám.": "15:25", "Brno Úzká": "15:35" },
      { "Blučina": "15:45", "Brno Mariánské nám.": "16:00", "Brno Úzká": "16:10" },
      { "Blučina": "16:10", "Brno Mariánské nám.": "16:25", "Brno Úzká": "16:35" },
      { "Blučina": "16:45", "Brno Mariánské nám.": "17:00", "Brno Úzká": "17:10" },
      { "Blučina": "18:15", "Brno Mariánské nám.": "18:30", "Brno Úzká": "18:40" },
      { "Blučina": "18:20", "Brno Mariánské nám.": "18:35", "Brno Úzká": "18:45" },
      { "Blučina": "20:15", "Brno Mariánské nám.": "20:30", "Brno Úzká": "20:45" }
    ],
    weekend: [
      { "Blučina": "5:35",  "Brno Mariánské nám.": "5:50",  "Brno Úzká": "6:00",  isYellow: false },
      { "Blučina": "5:50",  "Brno Mariánské nám.": "6:02",  "Brno Úzká": "6:10",  isYellow: true  },
      { "Blučina": "6:25",  "Brno Mariánské nám.": "6:40",  "Brno Úzká": "6:50",  isYellow: false },
      { "Blučina": "12:15", "Brno Mariánské nám.": "12:30", "Brno Úzká": "12:40", isYellow: false },
      { "Blučina": "16:45", "Brno Mariánské nám.": "17:00", "Brno Úzká": "17:10", isYellow: false },
      { "Blučina": "18:15", "Brno Mariánské nám.": "18:30", "Brno Úzká": "18:40", isYellow: true  },
      { "Blučina": "18:25", "Brno Mariánské nám.": "18:40", "Brno Úzká": "18:50", isYellow: false }
    ]
  }
};

/**
 * Parse a time string "H:MM" or "HH:MM" into total minutes since midnight.
 */
function parseTime(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Format total minutes since midnight back to "H:MM" string.
 */
function formatTime(totalMinutes) {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return `${h}:${m.toString().padStart(2, "0")}`;
}

/**
 * Get the current day type: "weekday" or "weekend".
 */
function getDayType(date = new Date()) {
  const day = date.getDay();
  return (day === 0 || day === 6) ? "weekend" : "weekday";
}

/**
 * Get connections for a given direction and day type.
 * Optionally filter by fromStop and toStop.
 */
function getConnections(direction, dayType, fromStop = null, toStop = null) {
  const connections = TIMETABLE[direction]?.[dayType] || [];
  const stops = STOPS[direction];

  if (!fromStop || !toStop) return connections;

  const fromIndex = stops.indexOf(fromStop);
  const toIndex = stops.indexOf(toStop);
  if (fromIndex === -1 || toIndex === -1 || fromIndex >= toIndex) return [];

  return connections;
}

/**
 * Find the next N connections departing after a given time.
 */
function getNextConnections(direction, dayType, fromStop, afterMinutes, count = 3) {
  const connections = TIMETABLE[direction]?.[dayType] || [];
  const upcoming = connections.filter(conn => {
    const depTime = parseTime(conn[fromStop]);
    return depTime >= afterMinutes;
  });
  return upcoming.slice(0, count);
}
