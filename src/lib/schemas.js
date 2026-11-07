import {
  UtensilsCrossed, BedDouble, Trees, Landmark, Briefcase, HeartPulse, Building2, Siren,
} from 'lucide-react'

/**
 * One schema per Firestore collection. The generic <CollectionManager> renders the list,
 * the search/filter bar and the create/edit form straight from these definitions, so
 * adding a field is a one-line change here.
 *
 * Field types: text | textarea | number | select | toggle | strings | numbers | objects
 *              | images | image | coords
 */
const STATUS = ['Open', 'Closed', 'Temporarily Closed', 'Seasonal']

const common = {
  description: { key: 'description', label: 'Description', type: 'textarea', width: 'full' },
  location: { key: 'location', label: 'Address / location', type: 'text', width: 'full' },
  rating: { key: 'rating', label: 'Rating (0–5)', type: 'number', step: 0.1, min: 0, max: 5, width: 'third' },
  reviews: { key: 'reviews', label: 'Reviews', type: 'number', min: 0, width: 'third' },
  phone: { key: 'phone', label: 'Phone', type: 'text', width: 'half' },
  email: { key: 'email', label: 'Email', type: 'text', width: 'half' },
  coordinates: { key: 'coordinates', label: 'Map location', type: 'coords', width: 'full' },
  images: { key: 'images', label: 'Photos', type: 'images', width: 'full', folder: 'images' },
}

export const PLACE_SCHEMAS = {
  restaurants: {
    collection: 'restaurants', label: 'Restaurants', singular: 'restaurant', icon: UtensilsCrossed,
    subtitle: (i) => [i.cuisine, i.type].filter(Boolean).join(' • '),
    filter: 'cuisine', searchKeys: ['name', 'cuisine', 'type', 'location'],
    defaults: { tableOptions: [2, 4, 6, 8], images: [''], specialDishes: [''], tags: [] },
    sections: [
      { title: 'Basics', fields: [
        { key: 'name', label: 'Name', type: 'text', required: true, width: 'full' },
        { key: 'cuisine', label: 'Cuisine', type: 'text', suggest: true, width: 'half' },
        { key: 'type', label: 'Type', type: 'text', suggest: true, width: 'half' },
        common.description, common.location,
        { key: 'openingHours', label: 'Opening hours', type: 'text', width: 'half' },
        { key: 'availability', label: 'Availability', type: 'select', options: ['Available', 'Reservations Required', 'Reserved', 'Not Available'], width: 'half' },
        common.rating, common.reviews,
      ] },
      { title: 'Menu & booking', fields: [
        { key: 'specialDishes', label: 'Special dishes', type: 'strings', placeholder: 'e.g. Kota, Mogodu', width: 'full' },
        { key: 'tableOptions', label: 'Table sizes offered (guests)', type: 'numbers', width: 'full' },
        { key: 'tags', label: 'Tags', type: 'strings', width: 'full' },
      ] },
      { title: 'Media & map', fields: [common.images, common.coordinates] },
    ],
  },

  accommodations: {
    collection: 'accommodations', label: 'Accommodation', singular: 'accommodation', icon: BedDouble,
    subtitle: (i) => [i.type, i.price && `${i.price}`].filter(Boolean).join(' • '),
    filter: 'type', searchKeys: ['name', 'type', 'location'],
    defaults: { amenities: [''], images: [''] },
    sections: [
      { title: 'Basics', fields: [
        { key: 'name', label: 'Name', type: 'text', required: true, width: 'full' },
        { key: 'type', label: 'Type', type: 'text', suggest: true, width: 'half' },
        { key: 'price', label: 'Price (per night)', type: 'text', width: 'half' },
        common.description, common.location,
        { key: 'maxGuests', label: 'Max guests', type: 'number', min: 1, width: 'third' },
        { key: 'availability', label: 'Availability', type: 'text', suggest: true, width: 'third' },
        common.rating, common.reviews,
      ] },
      { title: 'Amenities', fields: [{ key: 'amenities', label: 'Amenities', type: 'strings', width: 'full' }] },
      { title: 'Media & map', fields: [common.images, common.coordinates] },
    ],
  },

  recreation: {
    collection: 'recreation', label: 'Recreation', singular: 'recreation spot', icon: Trees,
    subtitle: (i) => [i.category, i.type].filter(Boolean).join(' • '),
    filter: 'category', searchKeys: ['name', 'category', 'type', 'location'],
    defaults: { status: 'Open', activities: [''], images: [''] },
    sections: [
      { title: 'Basics', fields: [
        { key: 'name', label: 'Name', type: 'text', required: true, width: 'full' },
        { key: 'category', label: 'Category', type: 'text', suggest: true, width: 'half' },
        { key: 'type', label: 'Type', type: 'text', suggest: true, width: 'half' },
        common.description, common.location,
        { key: 'entryFee', label: 'Entry fee', type: 'text', width: 'third' },
        { key: 'duration', label: 'Typical duration', type: 'text', width: 'third' },
        { key: 'ageRestriction', label: 'Age restriction', type: 'text', width: 'third' },
        { key: 'status', label: 'Status', type: 'select', options: STATUS, width: 'third' },
        common.rating, common.reviews,
      ] },
      { title: 'Activities', fields: [{ key: 'activities', label: 'Activities', type: 'strings', width: 'full' }] },
      { title: 'Contact', fields: [common.phone, common.email] },
      { title: 'Media & map', fields: [common.images, common.coordinates] },
    ],
  },

  attractions: {
    collection: 'attractions', label: 'Attractions', singular: 'attraction', icon: Landmark,
    subtitle: (i) => [i.type, i.price].filter(Boolean).join(' • '),
    filter: 'type', searchKeys: ['name', 'type', 'location'],
    defaults: { status: 'Open', features: [''], images: [''] },
    sections: [
      { title: 'Basics', fields: [
        { key: 'name', label: 'Name', type: 'text', required: true, width: 'full' },
        { key: 'type', label: 'Type', type: 'text', suggest: true, width: 'half' },
        { key: 'price', label: 'Price', type: 'text', width: 'half' },
        common.description, common.location,
        { key: 'duration', label: 'Typical duration', type: 'text', width: 'third' },
        { key: 'bestTime', label: 'Best time to visit', type: 'text', width: 'third' },
        { key: 'status', label: 'Status', type: 'select', options: STATUS, width: 'third' },
        common.rating, common.reviews,
      ] },
      { title: 'Highlights', fields: [{ key: 'features', label: 'Features', type: 'strings', width: 'full' }] },
      { title: 'Media & map', fields: [common.images, common.coordinates] },
    ],
  },

  business: {
    collection: 'business', label: 'Business', singular: 'business', icon: Briefcase,
    subtitle: (i) => [i.category, i.type].filter(Boolean).join(' • '),
    filter: 'category', searchKeys: ['name', 'category', 'type', 'location'],
    defaults: { status: 'Open', images: [''], services: [{ name: '', icon: 'default' }], gallery: { images: [''], catalogues: [''], videos: [''] } },
    sections: [
      { title: 'Brand', fields: [
        { key: 'name', label: 'Business name', type: 'text', required: true, width: 'full' },
        { key: 'logo', label: 'Logo', type: 'image', width: 'half', folder: 'business/logos' },
        { key: 'useTextLogo', label: 'Use text instead of a logo', type: 'toggle', width: 'half' },
        { key: 'images', label: 'Cover photos', type: 'images', width: 'full', folder: 'business' },
      ] },
      { title: 'About', fields: [
        common.description,
        { key: 'category', label: 'Category', type: 'text', suggest: true, width: 'half' },
        { key: 'type', label: 'Type', type: 'text', suggest: true, width: 'half' },
        common.rating, common.reviews,
      ] },
      { title: 'Services', fields: [{
        key: 'services', label: 'Services offered', type: 'objects', itemLabel: 'Service', addLabel: 'Add service', width: 'full',
        blank: { name: '', icon: 'default' },
        subfields: [
          { key: 'name', label: 'Service name', width: 'half' },
          { key: 'icon', label: 'Icon', type: 'select', width: 'half',
            options: [['default', 'Default'], ['restaurant', 'Restaurant'], ['medical', 'Medical'], ['education', 'Education'], ['fitness', 'Fitness'], ['beauty', 'Beauty'], ['tech', 'Technology'], ['automotive', 'Automotive'], ['home', 'Home / Real estate']].map(([value, label]) => ({ value, label })) },
        ],
      }] },
      { title: 'Contact', fields: [
        common.phone, common.email, common.location,
        { key: 'hours', label: 'Opening hours', type: 'text', width: 'half' },
        { key: 'status', label: 'Status', type: 'select', options: STATUS, width: 'half' },
        common.coordinates,
      ] },
      { title: 'Gallery', fields: [
        { key: 'gallery.images', label: 'Gallery images', type: 'images', width: 'full', folder: 'business/gallery' },
        { key: 'gallery.catalogues', label: 'Catalogues (PDF / image)', type: 'images', accept: 'image/*,application/pdf', width: 'full', folder: 'business/catalogues' },
        { key: 'gallery.videos', label: 'Videos', type: 'images', accept: 'video/*', width: 'full', folder: 'business/videos' },
      ] },
    ],
  },

  healthcare: {
    collection: 'healthcare', label: 'Healthcare', singular: 'facility', icon: HeartPulse,
    subtitle: (i) => [i.category, i.type].filter(Boolean).join(' • '),
    filter: 'category', searchKeys: ['name', 'category', 'type', 'location'],
    defaults: { status: 'Open', emergency: false, specialties: [''], images: [''] },
    sections: [
      { title: 'Basics', fields: [
        { key: 'name', label: 'Name', type: 'text', required: true, width: 'full' },
        { key: 'category', label: 'Category', type: 'text', suggest: true, width: 'half' },
        { key: 'type', label: 'Type', type: 'text', suggest: true, width: 'half' },
        common.description, common.location,
        { key: 'hours', label: 'Hours', type: 'text', width: 'third' },
        { key: 'status', label: 'Status', type: 'select', options: STATUS, width: 'third' },
        { key: 'insurance', label: 'Insurance / medical aid', type: 'text', width: 'third' },
        { key: 'emergency', label: 'Has emergency services', type: 'toggle', width: 'full' },
        common.rating, common.reviews,
      ] },
      { title: 'Specialties', fields: [{ key: 'specialties', label: 'Specialties', type: 'strings', width: 'full' }] },
      { title: 'Contact', fields: [common.phone, common.email] },
      { title: 'Media & map', fields: [common.images, common.coordinates] },
    ],
  },

  publicservice: {
    collection: 'publicservice', label: 'Public services', singular: 'service', icon: Building2,
    subtitle: (i) => [i.category, i.type].filter(Boolean).join(' • '),
    filter: 'category', searchKeys: ['name', 'category', 'type', 'location'],
    defaults: { status: 'Open', emergency: false, services: [''], images: [''] },
    sections: [
      { title: 'Basics', fields: [
        { key: 'name', label: 'Name', type: 'text', required: true, width: 'full' },
        { key: 'category', label: 'Category', type: 'text', suggest: true, width: 'half' },
        { key: 'type', label: 'Type', type: 'text', suggest: true, width: 'half' },
        common.description, common.location,
        { key: 'hours', label: 'Hours', type: 'text', width: 'third' },
        { key: 'status', label: 'Status', type: 'select', options: STATUS, width: 'third' },
        { key: 'accessibility', label: 'Accessibility', type: 'text', width: 'third' },
        { key: 'emergency', label: 'Emergency service', type: 'toggle', width: 'full' },
        common.rating, common.reviews,
      ] },
      { title: 'Services', fields: [{ key: 'services', label: 'Services provided', type: 'strings', width: 'full' }] },
      { title: 'Contact', fields: [common.phone, common.email, { key: 'website', label: 'Website', type: 'text', width: 'full' }] },
      { title: 'Media & map', fields: [common.images, common.coordinates] },
    ],
  },

  emergency: {
    collection: 'emergency', label: 'Emergency', singular: 'emergency contact', icon: Siren,
    subtitle: (i) => [i.category, i.number].filter(Boolean).join(' • '),
    filter: 'category', searchKeys: ['name', 'category', 'number', 'address'], hasActive: true, noImage: true,
    defaults: { isActive: true, type: 'Public' },
    sections: [
      { title: 'Contact', fields: [
        { key: 'name', label: 'Name', type: 'text', required: true, width: 'full' },
        { key: 'number', label: 'Phone number', type: 'text', required: true, width: 'half' },
        { key: 'category', label: 'Category', type: 'text', suggest: true, extraSuggestions: ['Ambulance', 'Police', 'Fire and Rescue', 'Security', 'Other'], width: 'half' },
        { key: 'type', label: 'Type', type: 'select', options: ['Public', 'Private'], width: 'half' },
        { key: 'isActive', label: 'Active (visible in the app)', type: 'toggle', width: 'half' },
        { key: 'address', label: 'Address', type: 'text', width: 'full' },
        { key: 'description', label: 'Description', type: 'textarea', rows: 3, width: 'full' },
        { key: 'additionalInfo', label: 'Additional info', type: 'textarea', rows: 3, width: 'full' },
      ] },
    ],
  },
}

export const PLACE_ORDER = ['restaurants', 'accommodations', 'recreation', 'attractions', 'business', 'healthcare', 'publicservice', 'emergency']

/* ── Soweto page ─────────────────────────────────────────── */
export const XPLORE_MENU_SCHEMA = {
  collection: 'xplore-menu', label: 'Xplore menu', singular: 'menu item', icon: null, noImage: true, hasActive: true,
  subtitle: (i) => `Order ${i.order ?? '—'}${i.color ? ` • ${i.color}` : ''}`,
  searchKeys: ['title', 'color', 'icon'], titleKey: 'title',
  defaults: { order: 1, isActive: true },
  sections: [{ title: 'Menu item', fields: [
    { key: 'title', label: 'Title', type: 'text', required: true, width: 'full' },
    { key: 'icon', label: 'Icon name', type: 'text', hint: 'Ionicons / MaterialCommunityIcons name used by the app', width: 'half' },
    { key: 'color', label: 'Colour', type: 'text', hint: 'Hex, e.g. #E8600A', width: 'half' },
    { key: 'order', label: 'Order', type: 'number', min: 0, width: 'half' },
    { key: 'isActive', label: 'Active', type: 'toggle', width: 'half' },
  ] }],
}

/* ── Transport ───────────────────────────────────────────── */
export const TRANSPORT_MODES = [
  { key: 'bus', label: 'Bus' },
  { key: 'train', label: 'Train' },
  { key: 'taxi', label: 'Taxi' },
]
export const TRANSPORT_STATUS = ['On Time', 'Delayed', 'Suspended']

export const TRANSPORT_SCHEMA = {
  collection: 'transport', label: 'Routes', singular: 'route', icon: null, noImage: true, hasActive: true,
  titleKey: 'routeName',
  subtitle: (i) => [i.operator, i.frequency, i.fare].filter(Boolean).join(' • '),
  searchKeys: ['routeName', 'operator', 'origin', 'destination'],
  defaults: { mode: 'bus', status: 'On Time', isActive: true, departures: [''], stops: [''] },
  sections: [
    { title: 'Route', fields: [
      { key: 'routeName', label: 'Route name', type: 'text', required: true, width: 'full' },
      { key: 'mode', label: 'Mode', type: 'select', options: TRANSPORT_MODES.map((m) => ({ value: m.key, label: m.label })), width: 'third' },
      { key: 'operator', label: 'Operator', type: 'text', suggest: true, width: 'third' },
      { key: 'status', label: 'Status', type: 'select', options: TRANSPORT_STATUS, width: 'third' },
      { key: 'origin', label: 'Origin', type: 'text', required: true, width: 'half' },
      { key: 'destination', label: 'Destination', type: 'text', required: true, width: 'half' },
      { key: 'frequency', label: 'Frequency', type: 'text', hint: 'e.g. Every 15 min', width: 'third' },
      { key: 'fare', label: 'Fare', type: 'text', hint: 'e.g. R14.50', width: 'third' },
      { key: 'days', label: 'Runs on', type: 'text', hint: 'e.g. Mon–Fri', width: 'third' },
      { key: 'notice', label: 'Service notice (optional)', type: 'text', hint: 'Shown on the route card in the app, e.g. “Delays due to cable theft”', width: 'full' },
      { key: 'isActive', label: 'Active (visible in the app)', type: 'toggle', width: 'full' },
    ] },
    { title: 'Timetable', fields: [
      { key: 'departures', label: 'Departure times', type: 'strings', inputType: 'time', placeholder: '05:30', addLabel: 'Add departure', width: 'full' },
    ] },
    { title: 'Stops', fields: [
      { key: 'stops', label: 'Stops along the route (in order)', type: 'strings', placeholder: 'Stop name', addLabel: 'Add stop', width: 'full' },
    ] },
  ],
}

export const TRANSPORT_SEED = [
  { mode: 'bus', routeName: 'Soweto — Johannesburg CBD', operator: 'Metrobus 615', origin: 'Baragwanath', destination: 'Park Station', frequency: 'Every 15 min', fare: 'R14.50', status: 'On Time', departures: ['05:00', '05:20', '05:40', '06:00', '06:20', '06:40', '07:00'], stops: ['Baragwanath', 'Chris Hani Rd', 'Nasrec', 'Crown City', 'Park Station'] },
  { mode: 'bus', routeName: 'Orlando — Soweto Theatre', operator: 'Rea Vaya T1', origin: 'Orlando Stadium', destination: 'Thokoza Park', frequency: 'Every 10 min', fare: 'R13.00', status: 'On Time', departures: ['05:30', '05:40', '05:50', '06:00', '06:10'], stops: ['Orlando Stadium', 'Vilakazi St', 'Soweto Theatre', 'Thokoza Park'] },
  { mode: 'train', routeName: 'Naledi — Johannesburg Line', operator: 'Metrorail', origin: 'Naledi', destination: 'Park Station', frequency: 'Every 30 min', fare: 'R9.50', status: 'Delayed', departures: ['06:00', '06:30', '07:00', '07:30'], stops: ['Naledi', 'Dube', 'New Canada', 'Ellis Park', 'Park Station'] },
  { mode: 'train', routeName: 'Merafong Line', operator: 'Metrorail', origin: 'Randfontein', destination: 'Johannesburg', frequency: 'Every 45 min', fare: 'R11.00', status: 'On Time', departures: ['05:15', '06:00', '06:45'], stops: ['Randfontein', 'Westonaria', 'Soweto', 'Johannesburg'] },
].map((r, i) => ({ ...r, isActive: true, order: i + 1 }))

/* ── Townships ───────────────────────────────────────────── */
export const TOWNSHIP_SCHEMA = {
  collection: 'homescreen', label: 'Townships', singular: 'township', icon: null, noImage: true, hasActive: true,
  titleKey: 'name', only: (d) => d.type === 'township', idFromName: true,
  subtitle: (i) => [i.area, i.established && `Est. ${i.established}`].filter(Boolean).join(' • '),
  searchKeys: ['name', 'area', 'tagline'],
  defaults: { type: 'township', isActive: true, colorFrom: '#E8600A', colorTo: '#A63A06', history: [], landmarks: [], people: [], facts: [], aliases: [] },
  sections: [
    { title: 'Identity', fields: [
      { key: 'name', label: 'Township name', type: 'text', required: true, width: 'half' },
      { key: 'area', label: 'Area', type: 'text', hint: 'e.g. Orlando East & Orlando West', width: 'half' },
      { key: 'tagline', label: 'Tagline', type: 'text', width: 'full' },
      { key: 'established', label: 'Established', type: 'text', width: 'third' },
      { key: 'namedAfter', label: 'Named after', type: 'text', width: 'third' },
      { key: 'order', label: 'Order on home screen', type: 'number', min: 0, width: 'third' },
      { key: 'aliases', label: 'Also known as (search matches)', type: 'strings', placeholder: 'e.g. Orlando East', width: 'full' },
      { key: 'isActive', label: 'Active (visible in the app)', type: 'toggle', width: 'full' },
    ] },
    { title: 'Look', fields: [
      { key: 'colors', label: 'Card colours', type: 'gradient', width: 'full' },
      { key: 'imageUrl', label: 'Cover image (optional)', type: 'image', folder: 'townships', width: 'full' },
    ] },
    { title: 'About', fields: [{ key: 'overview', label: 'Overview', type: 'textarea', rows: 6, width: 'full' }] },
    { title: 'History timeline', fields: [{
      key: 'history', label: 'Timeline', type: 'objects', itemLabel: 'Event', addLabel: 'Add event', width: 'full',
      subfields: [{ key: 'year', label: 'Year / period', width: 'third' }, { key: 'text', label: 'What happened', type: 'textarea', width: 'full' }],
    }] },
    { title: 'Local legends', fields: [{
      key: 'people', label: 'People', type: 'objects', itemLabel: 'Person', addLabel: 'Add person', width: 'full',
      subfields: [{ key: 'name', label: 'Name', width: 'half' }, { key: 'role', label: 'Known for', width: 'half' }, { key: 'note', label: 'Note', type: 'textarea', width: 'full' }],
    }] },
    { title: 'Landmarks', fields: [{
      key: 'landmarks', label: 'Landmarks', type: 'objects', itemLabel: 'Landmark', addLabel: 'Add landmark', width: 'full',
      subfields: [{ key: 'name', label: 'Name', width: 'half' }, { key: 'icon', label: 'Icon (MaterialCommunityIcons)', width: 'half' }, { key: 'text', label: 'Description', type: 'textarea', width: 'full' }],
    }] },
    { title: 'Fun facts', fields: [{ key: 'facts', label: 'Facts', type: 'strings', multiline: true, addLabel: 'Add fact', width: 'full' }] },
  ],
}
