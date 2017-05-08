/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_SHIPPING_METHODS_FETCH_ERROR,
	WOOCOMMERCE_SHIPPING_METHODS_FETCH_SUCCESS,
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
import * as api from '../../../helpers/api';

export const fetchServerData = () => ( dispatch, getState ) => {
	// TODO: Prevent duplicate requests on subsequent fetchServerData calls
	const state = getState();
	api.get( 'shipping/zones', state )
		.then( ( zones ) => {
			dispatch( { type: WOOCOMMERCE_SHIPPING_ZONES_FETCH_SUCCESS, zones } );
			zones.forEach( ( { id } ) => {
				if ( id ) { // No need to fetch locations from "Rest of the world" zone (id=0)
					api.get( `shipping/zones/${ id }/locations`, state )
						.then( ( locations ) => dispatch( { type: WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_FETCH_SUCCESS, id, locations } ) )
						.catch( ( error ) => dispatch( { type: WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_FETCH_ERROR, error } ) );
				}
				api.get( `shipping/zones/${ id }/methods`, state )
					.then( ( methods ) => dispatch( { type: WOOCOMMERCE_SHIPPING_ZONE_METHODS_FETCH_SUCCESS, id, methods } ) )
					.catch( ( error ) => dispatch( { type: WOOCOMMERCE_SHIPPING_ZONE_METHODS_FETCH_ERROR, error } ) );
			} );
		} )
		.catch( ( error ) => dispatch( { type: WOOCOMMERCE_SHIPPING_ZONES_FETCH_ERROR, error } ) );
	api.get( 'shipping_methods', state )
		.then( ( methods ) => dispatch( { type: WOOCOMMERCE_SHIPPING_METHODS_FETCH_SUCCESS, methods } ) )
		.catch( ( error ) => dispatch( { type: WOOCOMMERCE_SHIPPING_METHODS_FETCH_ERROR, error } ) );
};

export const submitChanges = () => ( /* dispatch, getState */ ) => {
	// TODO: Not implemented yet
};

export const addShippingZone = () => ( { type: WOOCOMMERCE_SHIPPING_ZONE_ADD } );

export const editShippingZone = ( index ) => ( { type: WOOCOMMERCE_SHIPPING_ZONE_EDIT, index } );

export const cancelEditingShippingZone = () => ( { type: WOOCOMMERCE_SHIPPING_ZONE_CANCEL } );

export const closeEditingShippingZone = () => ( { type: WOOCOMMERCE_SHIPPING_ZONE_CLOSE } );

export const removeShippingZone = ( index ) => ( { type: WOOCOMMERCE_SHIPPING_ZONE_REMOVE, index } );

export const addLocationToShippingZone = ( locationType, locationCode ) => ( {
	type: WOOCOMMERCE_SHIPPING_ZONE_LOCATION_ADD,
	locationType,
	locationCode
} );

export const removeLocationFromShippingZone = ( locationType, locationCode ) => ( {
	type: WOOCOMMERCE_SHIPPING_ZONE_LOCATION_REMOVE,
	locationType,
	locationCode
} );

export const addShippingMethod = () => ( { type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_ADD } );

export const changeShippingMethodType = ( index, newType ) => ( { type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_CHANGE_TYPE, index, newType } );

export const editShippingMethod = ( index, field, value ) => ( { type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_EDIT, index, field, value } );

export const removeShippingMethod = ( index ) => ( { type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_REMOVE, index } );
