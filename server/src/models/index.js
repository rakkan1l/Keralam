import { Place } from './Place.js';
import { Business } from './Business.js';
import { Stay } from './Stay.js';
import { Event } from './Event.js';
import { Dish } from './Dish.js';

export { User } from './User.js';
export { District } from './District.js';
export { Category } from './Category.js';
export { TransportNode } from './TransportNode.js';
export { RouteStop } from './RouteStop.js';
export { SafetyNotice } from './SafetyNotice.js';
export { EmergencyContact } from './EmergencyContact.js';
export { Review } from './Review.js';
export { CommunityUpdate } from './CommunityUpdate.js';
export { Report } from './Report.js';
export { UserList } from './UserList.js';
export { Trip } from './Trip.js';
export { ItineraryItem } from './ItineraryItem.js';
export { Translation } from './Translation.js';
export { AnalyticsEvent } from './AnalyticsEvent.js';
export { KnowledgeNote } from './KnowledgeNote.js';
export { Place, Business, Stay, Event, Dish };

/** Map a user-facing target type to its model. */
export const TARGET_MODELS = { place: Place, business: Business, stay: Stay, event: Event, dish: Dish };
