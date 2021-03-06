/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { findThemeFilterTerm } from '../';
import { state } from './fixtures/theme-filters';

describe( 'findThemeFilterTerm()', () => {
	it( 'should return undefined for an inexistent term slug', () => {
		const term = findThemeFilterTerm( state, 'blahg' );
		expect( term ).to.be.undefined;
	} );

	it( 'should return the filter term object for a given term slug', () => {
		const term = findThemeFilterTerm( state, 'blog' );
		expect( term ).to.deep.equal( {
			name: 'Blog',
			description: 'Whether you\'re authoring a personal blog, professional blog, or a business blog — ...'
		} );
	} );

	it( 'should return the filter term object for a given tax:term slug', () => {
		const term = findThemeFilterTerm( state, 'style:bright' );
		expect( term ).to.deep.equal( {
			name: 'Bright',
			description: ''
		} );
	} );
} );
