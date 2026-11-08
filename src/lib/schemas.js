import {
  UtensilsCrossed, BedDouble, Trees, Landmark, Briefcase, HeartPulse, Building2, Siren,
  Newspaper, CalendarDays, Megaphone,
} from 'lucide-react'
import { fmtDate, fmtDateTime, nowLocal, toDateLoose } from './utils'

/**
 * One schema per Firestore collection. The generic <CollectionManager> renders the list,
 * the search/filter bar and the create/edit form straight from these definitions, so
 * adding a field is a one-line change here.
 *
 * Field types: text | textarea | number | select | toggle | strings | numbers | objects
 *              | images | image | coords | datetime | gradient
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

/* ── Community: news, events, announcements ──────────────── */

/* Sample content for the one-click "Load sample …" buttons. Dates are relative to today
 * so events always look upcoming and announcements never look expired. */
const daysFromNow = (d, h = 0, m = 0) => { const x = new Date(); x.setDate(x.getDate() + d); x.setHours(h, m, 0, 0); return x }

export const NEWS_SEED = () => [
  { title: 'New Rea Vaya feeder routes announced for Orlando and Meadowlands', summary: 'Commuters in Orlando East and Meadowlands will get faster links to the Soweto trunk route from next month.', body: 'The City of Johannesburg has confirmed two new feeder routes that will connect Orlando East and Meadowlands to the Rea Vaya trunk line.\n\nOfficials say the routes are expected to cut average commute times by up to 20 minutes during peak hours.\n\nPublic consultation sessions will be held at local community halls over the coming weeks.', category: 'Municipal', source: 'City of Johannesburg', isFeatured: true, publishedAt: daysFromNow(-1, 9) },
  { title: 'Vilakazi Street businesses report a surge in weekend tourism', summary: 'Restaurants, galleries and tour operators say visitor numbers are well up on last year.', body: 'Owners along Vilakazi Street say weekend footfall has grown steadily, with many visitors coming from abroad and from other provinces.\n\nLocal guides are now offering extended heritage walks that include stops at the Hector Pieterson Memorial and Freedom Square.', category: 'Business', source: 'Soweto Tourism Forum', publishedAt: daysFromNow(-2, 14) },
  { title: 'Youth coding bootcamp opens applications in Pimville', summary: 'Free 12-week programme for learners aged 18–25, no prior experience required.', body: 'A community-led tech hub in Pimville has opened applications for its next coding bootcamp.\n\nParticipants will learn web development, receive mentorship from industry volunteers and get help with CV and interview preparation.\n\nApplications close at the end of the month.', category: 'Community', source: 'Pimville Tech Hub', publishedAt: daysFromNow(-3, 11) },
  { title: 'Clinic hours extended at Chris Hani Baragwanath Hospital outpatients', summary: 'Selected outpatient services will now run later on weekdays.', body: 'The hospital has extended hours for selected outpatient services to reduce waiting times.\n\nPatients are encouraged to bring their ID and clinic cards, and to arrive early for chronic medication collection.', category: 'Local News', source: 'Gauteng Health', publishedAt: daysFromNow(-5, 8, 30) },
  { title: 'Neighbourhood safety patrols launched in Dobsonville', summary: 'Residents and community policing forum volunteers begin evening patrols this week.', body: 'The Dobsonville Community Policing Forum has launched coordinated evening patrols in partnership with local police.\n\nResidents are asked to report suspicious activity through the official hotline rather than confronting anyone directly.', category: 'Safety', source: 'Dobsonville CPF', publishedAt: daysFromNow(-6, 17) },
  { title: 'Soweto Theatre announces its new season line-up', summary: 'Dance, jazz and spoken-word performances from local and visiting artists.', body: 'Soweto Theatre has unveiled a season packed with live music, dance and theatre.\n\nTickets are on sale now, with discounted rates for students and pensioners.', category: 'Events', source: 'Soweto Theatre', publishedAt: daysFromNow(-8, 10) },
].map((n) => ({ ...n, isActive: true, isFeatured: !!n.isFeatured }))

export const EVENTS_SEED = () => [
  { title: 'Soweto Heritage Walk', category: 'Heritage', date: daysFromNow(3, 9), location: 'Hector Pieterson Memorial, Orlando West', description: 'A guided walk through Soweto’s historic sites with local storytellers.\n\nWear comfortable shoes and bring water. The walk takes about three hours.', price: 'R120', organizer: 'Soweto Heritage Trust' },
  { title: 'Vilakazi Street Food Market', category: 'Food & Market', date: daysFromNow(5, 10), location: 'Vilakazi Street, Orlando West', description: 'Street food, craft stalls and live acoustic sets all day.\n\nFamily friendly with plenty of seating.', price: 'Free', organizer: 'Vilakazi Traders Association' },
  { title: 'Jazz at the Theatre', category: 'Music & Culture', date: daysFromNow(9, 19, 30), location: 'Soweto Theatre, Jabulani', description: 'An evening of live jazz featuring emerging and established Soweto artists.\n\nDoors open at 18:30.', price: 'R150', organizer: 'Soweto Theatre' },
  { title: 'Community Soccer Day', category: 'Sports', date: daysFromNow(12, 8), location: 'Orlando Stadium', description: 'Open five-a-side tournament for all ages. Register your team at the gate.\n\nRefreshments on sale.', price: 'R20 per team', organizer: 'Orlando Sports Council' },
  { title: 'Township Clean-up Drive', category: 'Community', date: daysFromNow(16, 8, 30), location: 'Kliptown Open Square', description: 'Join neighbours for a morning clean-up. Gloves and bags provided.\n\nBreakfast for all volunteers.', price: 'Free', organizer: 'Kliptown Youth Programme' },
  { title: 'Youth Day Remembrance Concert', category: 'Music & Culture', date: daysFromNow(-10, 15), location: 'Freedom Charter Square, Kliptown', description: 'An afternoon of music and poetry honouring the youth of 1976.', price: 'Free', organizer: 'City of Johannesburg' },
].map((e) => ({ ...e, isActive: true }))

export const ANNOUNCEMENTS_SEED = () => [
  { title: 'Planned water interruption', message: 'Johannesburg Water will carry out maintenance in parts of Meadowlands. Expect low pressure or no water from 09:00 to 16:00. Please store water in advance.', type: 'warning', pinned: true, link: '', linkLabel: '', startsAt: null, expiresAt: daysFromNow(3, 18) },
  { title: 'Load reduction notice', message: 'Check the latest schedule for your area and plan ahead. Keep devices charged and have a backup light ready.', type: 'urgent', pinned: false, expiresAt: daysFromNow(2, 23, 59) },
  { title: 'Free health screening this Saturday', message: 'Blood pressure, glucose and HIV testing at Orlando Community Centre from 08:00 to 14:00. Everyone is welcome.', type: 'info', pinned: false, expiresAt: daysFromNow(6, 15) },
  { title: 'Library membership drive', message: 'Sign up for free at any Soweto public library and get access to books, study spaces and free Wi-Fi.', type: 'success', pinned: false, link: 'https://www.joburg.org.za', linkLabel: 'Learn more', expiresAt: null },
].map((a) => ({ ...a, isActive: true, publishedAt: new Date() }))
export const NEWS_SCHEMA = {
  collection: 'news', label: 'News', singular: 'article', icon: Newspaper, titleKey: 'title', hasActive: true,
  sortBy: { key: 'publishedAt', dir: 'desc' }, filter: 'category', searchKeys: ['title', 'summary', 'category', 'source'],
  subtitle: (i) => [i.category, i.source, fmtDate(i.publishedAt)].filter(Boolean).join(' • '),
  badge: (i) => (i.isFeatured ? { text: 'Featured', tone: 'brand' } : null),
  defaults: () => ({ isActive: true, isFeatured: false, publishedAt: nowLocal() }),
  sections: [
    { title: 'Story', fields: [
      { key: 'title', label: 'Headline', type: 'text', required: true, width: 'full' },
      { key: 'summary', label: 'Summary', type: 'textarea', rows: 2, hint: 'One or two lines shown in lists', width: 'full' },
      { key: 'body', label: 'Full article', type: 'textarea', rows: 10, hint: 'Blank line = new paragraph', width: 'full' },
    ] },
    { title: 'Details', fields: [
      { key: 'category', label: 'Category', type: 'text', suggest: true, extraSuggestions: ['Local News', 'Municipal', 'Community', 'Business', 'Safety', 'Events'], width: 'third' },
      { key: 'source', label: 'Source', type: 'text', width: 'third' },
      { key: 'publishedAt', label: 'Published', type: 'datetime', width: 'third' },
      { key: 'isFeatured', label: 'Featured (big card at the top of the News screen)', type: 'toggle', width: 'full' },
      { key: 'isActive', label: 'Active (visible in the app)', type: 'toggle', width: 'full' },
    ] },
    { title: 'Cover image', fields: [{ key: 'imageUrl', label: 'Image', type: 'image', folder: 'news', width: 'full' }] },
  ],
}

export const EVENTS_SCHEMA = {
  collection: 'events', label: 'Events', singular: 'event', icon: CalendarDays, titleKey: 'title', hasActive: true,
  sortBy: { key: 'date', dir: 'desc' }, filter: 'category', searchKeys: ['title', 'location', 'category', 'organizer'],
  subtitle: (i) => [fmtDateTime(i.date), i.location].filter(Boolean).join(' • '),
  badge: (i) => { const d = toDateLoose(i.date); if (!d) return null; const past = d < new Date(new Date().setHours(0, 0, 0, 0)); return { text: past ? 'Past' : 'Upcoming', tone: past ? 'gray' : 'green' } },
  defaults: () => ({ isActive: true }),
  sections: [
    { title: 'Event', fields: [
      { key: 'title', label: 'Title', type: 'text', required: true, width: 'full' },
      { key: 'category', label: 'Category', type: 'text', suggest: true, extraSuggestions: ['Music & Culture', 'Sports', 'Food & Market', 'Community', 'Heritage'], width: 'half' },
      { key: 'date', label: 'Starts', type: 'datetime', required: true, hint: 'The time is shown in the app unless it is exactly 00:00', width: 'half' },
      { key: 'location', label: 'Location', type: 'text', width: 'full' },
      { key: 'description', label: 'Description', type: 'textarea', rows: 6, hint: 'Blank line = new paragraph', width: 'full' },
      { key: 'price', label: 'Price', type: 'text', hint: 'e.g. Free, R50', width: 'half' },
      { key: 'organizer', label: 'Organizer', type: 'text', width: 'half' },
      { key: 'isActive', label: 'Active (visible in the app)', type: 'toggle', width: 'full' },
    ] },
    { title: 'Cover image', fields: [{ key: 'imageUrl', label: 'Image', type: 'image', folder: 'events', width: 'full' }] },
  ],
}

export const ANNOUNCEMENT_TYPES = [
  { value: 'info', label: 'Notice' }, { value: 'success', label: 'Good news' },
  { value: 'warning', label: 'Warning' }, { value: 'urgent', label: 'Urgent' },
]
export const ANNOUNCEMENTS_SCHEMA = {
  collection: 'announcements', label: 'Announcements', singular: 'announcement', icon: Megaphone, titleKey: 'title', hasActive: true, noImage: true,
  sortBy: { key: 'publishedAt', dir: 'desc' }, filter: 'type', searchKeys: ['title', 'message'],
  subtitle: (i) => [i.message, i.expiresAt && `expires ${fmtDate(i.expiresAt)}`].filter(Boolean).join(' • '),
  badge: (i) => {
    const t = i.type || 'info'
    return { text: `${i.pinned ? '📌 ' : ''}${ANNOUNCEMENT_TYPES.find((x) => x.value === t)?.label || t}`, tone: { info: 'teal', success: 'green', warning: 'amber', urgent: 'red' }[t] || 'gray' }
  },
  defaults: () => ({ isActive: true, pinned: false, type: 'info', publishedAt: nowLocal() }),
  sections: [
    { title: 'Announcement', fields: [
      { key: 'title', label: 'Title', type: 'text', required: true, width: 'full' },
      { key: 'message', label: 'Message', type: 'textarea', rows: 5, required: true, width: 'full' },
      { key: 'type', label: 'Type', type: 'select', options: ANNOUNCEMENT_TYPES, hint: 'Controls the colour and icon in the app', width: 'half' },
      { key: 'pinned', label: 'Pinned (always shown first)', type: 'toggle', width: 'half' },
      { key: 'link', label: 'Link (optional)', type: 'text', placeholder: 'https://…', width: 'half' },
      { key: 'linkLabel', label: 'Link button text', type: 'text', placeholder: 'Learn more', width: 'half' },
    ] },
    { title: 'Schedule', fields: [
      { key: 'publishedAt', label: 'Published', type: 'datetime', width: 'third' },
      { key: 'startsAt', label: 'Show from (optional)', type: 'datetime', width: 'third' },
      { key: 'expiresAt', label: 'Hide after (optional)', type: 'datetime', hint: 'Expired announcements disappear from the app automatically', width: 'third' },
      { key: 'isActive', label: 'Active (visible in the app)', type: 'toggle', width: 'full' },
    ] },
  ],
}