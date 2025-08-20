import { Destination } from "@shared/api";

// In-memory destination storage for development
// In production, this would query PostgreSQL/Supabase
const destinationsData: Destination[] = [
  {
    slug: "jaipur-rajasthan",
    city: "Jaipur",
    state: "Rajasthan",
    top_attractions: ["Amber Fort", "City Palace", "Hawa Mahal"],
    best_time: "October to March (winter season)",
    transport_summary:
      "Well connected by air, rail, and road. Local transport via auto-rickshaws, taxis, and buses.",
    local_foods: ["Dal Baati Churma", "Kachori", "Ghewar"],
    seed_image_url: "/images/destinations/jaipur.jpg",
  },
  {
    slug: "udaipur-rajasthan",
    city: "Udaipur",
    state: "Rajasthan",
    top_attractions: ["City Palace", "Lake Pichola", "Jag Mandir"],
    best_time: "October to March (pleasant weather)",
    transport_summary:
      "Airport and railway station available. Boat rides on lakes, auto-rickshaws for city travel.",
    local_foods: ["Dal Baati", "Gatte ki Sabzi", "Malpua"],
    seed_image_url: "/images/destinations/udaipur.jpg",
  },
  {
    slug: "goa-north",
    city: "Goa",
    state: "Goa",
    top_attractions: ["Baga Beach", "Old Goa Basilica", "Dudhsagar Falls"],
    best_time: "November to February (dry season)",
    transport_summary:
      "Airport at Dabolim. Train connectivity. Bikes, taxis, and buses for local transport.",
    local_foods: ["Fish Curry Rice", "Bebinca", "Vindaloo"],
    seed_image_url: "/images/destinations/goa.jpg",
  },
  {
    slug: "varanasi-up",
    city: "Varanasi",
    state: "Uttar Pradesh",
    top_attractions: ["Ganges Ghats", "Kashi Vishwanath Temple", "Sarnath"],
    best_time: "October to March (cooler months)",
    transport_summary:
      "Airport and major railway junction. Auto-rickshaws, cycle rickshaws, and boats.",
    local_foods: ["Banarasi Paan", "Kachori Sabzi", "Malaiyo"],
    seed_image_url: "/images/destinations/varanasi.jpg",
  },
  {
    slug: "agra-up",
    city: "Agra",
    state: "Uttar Pradesh",
    top_attractions: ["Taj Mahal", "Agra Fort", "Mehtab Bagh"],
    best_time: "October to March (best weather)",
    transport_summary:
      "Well connected by air, rail, and road. Auto-rickshaws and taxis available.",
    local_foods: ["Petha", "Bedai", "Paratha"],
    seed_image_url: "/images/destinations/agra.jpg",
  },
  {
    slug: "delhi-ncr",
    city: "Delhi",
    state: "Delhi",
    top_attractions: ["Red Fort", "Qutub Minar", "Humayun's Tomb"],
    best_time: "October to March (winter season)",
    transport_summary:
      "Major transport hub with metro, buses, auto-rickshaws, and taxis.",
    local_foods: ["Chole Bhature", "Paranthas", "Kulfi"],
    seed_image_url: "/images/destinations/delhi.jpg",
  },
  {
    slug: "mumbai-maharashtra",
    city: "Mumbai",
    state: "Maharashtra",
    top_attractions: ["Gateway of India", "Marine Drive", "Elephanta Caves"],
    best_time: "November to February (pleasant weather)",
    transport_summary:
      "Major airport and railway hub. Local trains, buses, taxis, and auto-rickshaws.",
    local_foods: ["Vada Pav", "Pav Bhaji", "Bhel Puri"],
    seed_image_url: "/images/destinations/mumbai.jpg",
  },
];

export class DestinationService {
  // Common abbreviations and aliases for Indian cities
  private static readonly CITY_ALIASES: Record<string, string> = {
    hyd: "hyderabad",
    blr: "bengaluru",
    bangalore: "bengaluru",
    calcutta: "kolkata",
    bombay: "mumbai",
    madras: "chennai",
    pune: "pune",
    del: "delhi",
    ncr: "delhi",
    "new delhi": "delhi",
    gurgaon: "delhi",
    noida: "delhi",
    cochin: "kochi",
    trivandrum: "kochi",
    thiruvananthapuram: "kochi",
    mysuru: "mysore",
    udupi: "mysore",
    shimoga: "mysore",
    kodaikanal: "ooty",
    munnar: "ooty",
    darjeeling: "shimla",
    manali: "shimla",
    dehradun: "rishikesh",
    haridwar: "rishikesh",
    pushkar: "jaipur",
    jodhpur: "jaipur",
    bikaner: "jaipur",
    "mount abu": "udaipur",
    chittorgarh: "udaipur",
    panaji: "goa",
    margao: "goa",
    calangute: "goa",
    anjuna: "goa",
    vasco: "goa",
    hampi: "mysore",
    coorg: "mysore",
    mahabalipuram: "chennai",
    pondicherry: "chennai",
    kanyakumari: "madurai",
    rameswaram: "madurai",
    tirupati: "chennai",
    vijayawada: "hyderabad",
    visakhapatnam: "hyderabad",
    vizag: "hyderabad",
    aurangabad: "mumbai",
    nashik: "pune",
    lonavala: "pune",
    mahabaleshwar: "pune",
    chandigarh: "delhi",
    ludhiana: "amritsar",
    jalandhar: "amritsar",
    pathankot: "amritsar",
    srinagar: "leh",
    jammu: "leh",
    
    kasol: "shimla",
    spiti: "leh",
    dharamshala: "shimla",
    mcleodganj: "shimla",
  };

  /**
   * Get destination snippet for LLM context (max 150-300 tokens)
   * Returns concise information for RAG
   */
  static getDestinationSnippet(destinationQuery: string): string {
    // Normalize the destination query
    const normalizedQuery = destinationQuery.toLowerCase().trim();

    // Check for aliases first
    const aliasMatch = this.CITY_ALIASES[normalizedQuery];
    const searchQuery = aliasMatch || normalizedQuery;

    // Try to find matching destination
    let matchedDestination: Destination | null = null;

    // First try exact city match
    for (const dest of destinationsData) {
      if (
        dest.city.toLowerCase() === searchQuery ||
        dest.city.toLowerCase().includes(searchQuery) ||
        searchQuery.includes(dest.city.toLowerCase())
      ) {
        matchedDestination = dest;
        break;
      }
    }

    // If no exact match, try state or partial match
    if (!matchedDestination) {
      for (const dest of destinationsData) {
        if (
          dest.state.toLowerCase().includes(searchQuery) ||
          searchQuery.includes(dest.state.toLowerCase()) ||
          dest.slug
            .toLowerCase()
            .includes(searchQuery.replace(/[^a-z0-9]/g, ""))
        ) {
          matchedDestination = dest;
          break;
        }
      }
    }

    if (!matchedDestination) {
      // Return generic India snippet if no specific destination found
      return `DESTINATION: India (General)
• Popular destinations include Delhi, Mumbai, Jaipur, Agra, Goa, Kerala
• Best time: October to March for most regions
• Transport: Domestic flights, trains, buses, auto-rickshaws
• Currency: Indian Rupee (INR)
• Budget ranges: Low (₹2000-5000/day), Medium (₹5000-15000/day), High (₹15000+/day)`;
    }

    // Build concise snippet (max 150-300 tokens)
    const snippet = `DESTINATION: ${matchedDestination.city}, ${matchedDestination.state}
• Top attractions: ${matchedDestination.top_attractions.join(", ")}
• Best time to visit: ${matchedDestination.best_time}
• Transport: ${this.truncateText(matchedDestination.transport_summary, 80)}
• Local foods: ${matchedDestination.local_foods.slice(0, 3).join(", ")}
• Budget guide: Low (₹3000-8000/day), Medium (₹8000-20000/day), High (₹20000+/day)`;

    return snippet;
  }

  /**
   * Get all available destinations for validation
   */
  static getAllDestinations(): Destination[] {
    return destinationsData;
  }

  /**
   * Search destinations by query
   */
  static searchDestinations(query: string): Destination[] {
    const normalizedQuery = query.toLowerCase().trim();

    return destinationsData.filter(
      (dest) =>
        dest.city.toLowerCase().includes(normalizedQuery) ||
        dest.state.toLowerCase().includes(normalizedQuery) ||
        dest.top_attractions.some((attr) =>
          attr.toLowerCase().includes(normalizedQuery),
        ),
    );
  }

  /**
   * Truncate text to specified length
   */
  private static truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  }

  /**
   * Add new destination (for future use)
   */
  static addDestination(destination: Destination): void {
    destinationsData.push(destination);
  }
}
