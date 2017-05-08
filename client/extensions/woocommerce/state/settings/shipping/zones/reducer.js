/**
 * External dependencies
 */
import { isEqual, unionWith, differenceWith, isEmpty, find, findIndex, isArray, every } from 'lodash';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	WOOCOMMERCE_SHIPPING_METHODS_FETCH_ERROR,
	WOOCOMMERCE_SHIPPING_METHODS_FETCH_SUCCESS,
	WOOCOMMERCE_SHIPPING_SETTINGS_SAVE_SUCCESS,
	WOOCOMMERCE_SHIPPING_ZONE_ADD,
	WOOCOMMERCE_SHIPPING_ZONE_CANCEL,
	WOOCOMMERCE_SHIPPING_ZONE_CLOSE,
	WOOCOMMERCE_SHIPPING_ZONE_EDIT,
	WOOCOMMERCE_SHIPPING_ZONE_LOCATION_ADD,
	WOOCOMMERCE_SHIPPING_ZONE_LOCATION_REMOVE,
	WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_FETCH_ERROR,
	WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_FETCH_SUCCESS,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_ADD,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_CHANGE_TYPE,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_EDIT,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_REMOVE,
	WOOCOMMERCE_SHIPPING_ZONE_METHODS_FETCH_ERROR,
	WOOCOMMERCE_SHIPPING_ZONE_METHODS_FETCH_SUCCESS,
	WOOCOMMERCE_SHIPPING_ZONE_REMOVE,
	WOOCOMMERCE_SHIPPING_ZONES_FETCH_ERROR,
	WOOCOMMERCE_SHIPPING_ZONES_FETCH_SUCCESS,
} from '../../../action-types';

const LOCATION_TYPES = [ 'postcode', 'state', 'country', 'continent' ];

/**
 * Checks if all the zones, shipping methods and zone locations have finished loading from the API.
 * "Finished loading" means that they completed successfully *or* some of them failed, but none are in progress.
 * If all the zones have finished loading, then they are copied into the "zones" key, which
 * is the one that will be modified by UI interactions.
 * @param {Object} state Current state
 * @returns {Object} Updated state (mutated)
 */
const updateZonesIfAllLoaded = ( state ) => {
	if ( state.methodDefinitions &&
		( ! isArray( state.serverZones ) || ( every( state.serverZones, 'locations' ) && every( state.serverZones, 'methods' ) ) ) ) {
		state.zones = state.serverZones;
	}
	return state;
};

export default createReducer( {}, {
	[ WOOCOMMERCE_SHIPPING_ZONE_ADD ]: ( state ) => {
		return { ...state,
			currentlyEditingZone: {
				id: null,
				locations: [],
				methods: [],
			},
			currentlyEditingZoneIndex: -1,
		};
	},

	[ WOOCOMMERCE_SHIPPING_ZONE_EDIT ]: ( state, { index } ) => {
		return { ...state,
			currentlyEditingZone: state.zones[ index ],
			currentlyEditingZoneIndex: index,
		};
	},

	[ WOOCOMMERCE_SHIPPING_ZONE_REMOVE ]: ( state, { index } ) => {
		// TODO: Protect { id: 0 } (Rest of the World)
		return { ...state,
			currentlyEditingZone: null,
			zones: [ ...state.zones.slice( 0, index ), ...state.zones.slice( index + 1 ) ],
		};
	},

	[ WOOCOMMERCE_SHIPPING_ZONE_CANCEL ]: ( state ) => {
		return { ...state,
			currentlyEditingZone: null,
		};
	},

	[ WOOCOMMERCE_SHIPPING_ZONE_CLOSE ]: ( state ) => {
		// TODO: Keep "Rest Of The World" last always
		if ( ! state.currentlyEditingZone ) {
			return state;
		}
		const zones = [ ...state.zones ];
		if ( -1 === state.currentlyEditingZoneIndex ) {
			zones.push( state.currentlyEditingZone );
		} else {
			zones[ state.currentlyEditingZoneIndex ] = state.currentlyEditingZone;
		}
		return { ...state,
			zones,
			currentlyEditingZone: null,
		};
	},

	[ WOOCOMMERCE_SHIPPING_ZONE_LOCATION_ADD ]: ( state, { locationType, locationCode } ) => {
		// TODO: ZIP codes
		// TODO: Get the list of continents / countries / states from somewhere (new endpoint?)
		if ( ! state.currentlyEditingZone || ! LOCATION_TYPES.includes( locationType ) ) {
			return state;
		}
		const location = { type: locationType, code: locationCode };
		const newLocations = unionWith( state.currentlyEditingZone.locations, [ location ], isEqual );
		return { ...state,
			currentlyEditingZone: { ...state.currentlyEditingZone,
				locations: newLocations,
			},
		};
	},

	[ WOOCOMMERCE_SHIPPING_ZONE_LOCATION_REMOVE ]: ( state, { locationType, locationCode } ) => {
		// TODO: when removing a country, remove all its states?
		if ( ! state.currentlyEditingZone || ! LOCATION_TYPES.includes( locationType ) ) {
			return state;
		}
		const location = { type: locationType, code: locationCode };
		const newLocations = differenceWith( state.currentlyEditingZone.locations, [ location ], isEqual );
		return { ...state,
			currentlyEditingZone: { ...state.currentlyEditingZone,
				locations: newLocations,
			},
		};
	},

	[ WOOCOMMERCE_SHIPPING_ZONE_METHOD_ADD ]: ( state ) => {
		if ( isEmpty( state.methodDefinitions ) || ! state.currentlyEditingZone ) {
			return state;
		}
		const currentMethods = state.currentlyEditingZone.methods;
		return { ...state,
			currentlyEditingZone: { ...state.currentlyEditingZone,
				methods: [ ...currentMethods, state.methodDefinitions[ 0 ] ],
			},
		};
	},

	[ WOOCOMMERCE_SHIPPING_ZONE_METHOD_CHANGE_TYPE ]: ( state, { index, newType } ) => {
		if ( ! state.currentlyEditingZone ) {
			return state;
		}
		const { methods } = state.currentlyEditingZone;
		if ( methods[ index ].type === newType ) {
			return state;
		}
		const newMethodDefinition = find( state.methodDefinitions, { id: newType } );
		return { ...state,
			currentlyEditingZone: { ...state.currentlyEditingZone,
				methods: [ ...methods.slice( 0, index ), newMethodDefinition, ...methods.slice( index + 1 ) ],
			},
		};
	},

	[ WOOCOMMERCE_SHIPPING_ZONE_METHOD_EDIT ]: ( state, { index, field, value } ) => {
		if ( ! state.currentlyEditingZone ) {
			return state;
		}
		const { methods } = state.currentlyEditingZone;
		const method = methods[ index ];
		const newMethodDefinition = { ...method,
			[ field ]: value,
		};
		return { ...state,
			currentlyEditingZone: { ...state.currentlyEditingZone,
				methods: [ ...methods.slice( 0, index ), newMethodDefinition, ...methods.slice( index + 1 ) ],
			},
		};
	},

	[ WOOCOMMERCE_SHIPPING_ZONE_METHOD_REMOVE ]: ( state, { index } ) => {
		if ( ! state.currentlyEditingZone ) {
			return state;
		}
		const { methods } = state.currentlyEditingZone;
		return { ...state,
			currentlyEditingZone: { ...state.currentlyEditingZone,
				methods: [ ...methods.slice( 0, index ), ...methods.slice( index + 1 ) ],
			},
		};
	},

	[ WOOCOMMERCE_SHIPPING_METHODS_FETCH_ERROR ]: ( state, { error } ) => {
		return updateZonesIfAllLoaded( { ...state,
			methodDefinitions: { error },
		} );
	},

	[ WOOCOMMERCE_SHIPPING_METHODS_FETCH_SUCCESS ]: ( state, { methods } ) => {
		return updateZonesIfAllLoaded( { ...state,
			methodDefinitions: methods,
		} );
	},

	[ WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_FETCH_ERROR ]: ( state, { id, error } ) => {
		const { serverZones } = state;
		const index = findIndex( serverZones, { id } );
		if ( -1 === index ) {
			return state;
		}
		const zone = { ...serverZones[ index ],
			locations: { error },
		};
		return updateZonesIfAllLoaded( { ...state,
			serverZones: [ ...serverZones.slice( 0, index ), zone, ...serverZones.slice( index + 1 ) ],
		} );
	},

	[ WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_FETCH_SUCCESS ]: ( state, { id, locations } ) => {
		const { serverZones } = state;
		const index = findIndex( serverZones, { id } );
		if ( -1 === index ) {
			return state;
		}
		const zone = { ...serverZones[ index ],
			locations,
		};
		return updateZonesIfAllLoaded( { ...state,
			serverZones: [ ...serverZones.slice( 0, index ), zone, ...serverZones.slice( index + 1 ) ],
		} );
	},

	[ WOOCOMMERCE_SHIPPING_ZONE_METHODS_FETCH_ERROR ]: ( state, { id, error } ) => {
		const { serverZones } = state;
		const index = findIndex( serverZones, { id } );
		if ( -1 === index ) {
			return state;
		}
		const zone = { ...serverZones[ index ],
			methods: { error },
		};
		return updateZonesIfAllLoaded( { ...state,
			serverZones: [ ...serverZones.slice( 0, index ), zone, ...serverZones.slice( index + 1 ) ],
		} );
	},

	[ WOOCOMMERCE_SHIPPING_ZONE_METHODS_FETCH_SUCCESS ]: ( state, { id, methods } ) => {
		const { serverZones } = state;
		const index = findIndex( serverZones, { id } );
		if ( -1 === index ) {
			return state;
		}
		const zone = { ...serverZones[ index ],
			methods,
		};
		return updateZonesIfAllLoaded( { ...state,
			serverZones: [ ...serverZones.slice( 0, index ), zone, ...serverZones.slice( index + 1 ) ],
		} );
	},

	[ WOOCOMMERCE_SHIPPING_ZONES_FETCH_ERROR ]: ( state, { error } ) => {
		return updateZonesIfAllLoaded( { ...state,
			serverZones: { error },
		} );
	},

	[ WOOCOMMERCE_SHIPPING_ZONES_FETCH_SUCCESS ]: ( state, { zones } ) => {
		return updateZonesIfAllLoaded( { ...state,
			serverZones: zones,
		} );
	},

	[ WOOCOMMERCE_SHIPPING_SETTINGS_SAVE_SUCCESS ]: ( state ) => {
		return { ...state,
			currentlyEditingZone: null,
			serverZones: state.zones,
		};
	},
} );
