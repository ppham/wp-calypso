/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import FoldableCard from 'components/foldable-card';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import FormInputValidation from 'components/forms/form-input-validation';
import InfoPopover from 'components/info-popover';
import ExternalLink from 'components/external-link';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getJetpackSettingsSaveError, getJetpackSettingsSaveRequestStatus } from 'state/selectors';
import FormSettingExplanation from 'components/forms/form-setting-explanation';

const SpamFilteringSettings = ( {
	fields,
	dirtyFields,
	hasAkismetKeyError,
	isRequestingSettings,
	isSavingSettings,
	onChangeField,
	currentAkismetKey,
	translate
} ) => {
	const {
		wordpress_api_key,
		akismet: akismetActive
	} = fields;
	const isStoredKey = wordpress_api_key === currentAkismetKey;
	const isDirty = includes( dirtyFields, 'wordpress_api_key' );
	const inTransition = isRequestingSettings || isSavingSettings;
	const isValidKey = ( wordpress_api_key && isStoredKey ) ||
		( wordpress_api_key && isDirty && isStoredKey && ! hasAkismetKeyError );
	const isInvalidKey = isDirty && hasAkismetKeyError && ! isStoredKey;
	let validationText,
		className,
		header = translate( 'Your site needs an Antispam key.' );
	if ( ! inTransition && isValidKey ) {
		validationText = translate( 'Your Antispam key is valid.' );
		className = 'is-valid';
		header = translate( 'Your site is protected from spam.' );
	}
	if ( ! inTransition && isInvalidKey ) {
		validationText = translate( 'There\'s a problem with your Antispam API key.' );
		className = 'is-error';
	}
	return (
		<FoldableCard header={ header } className="site-settings__spam-filtering site-settings__foldable-card">
			<FormFieldset>
				<div className="spam-filtering-settings__info-link-container site-settings__info-link-container">
					<InfoPopover >
						<ExternalLink
							target="_blank"
							icon
							href={ 'https://jetpack.com/features/security/spam-filtering/' }
						>
							{ translate( 'Learn more about spam filtering.' ) }
						</ExternalLink>
					</InfoPopover>
				</div>
				<div className="site-settings__child-settings">
					<FormLabel htmlFor="wordpress_api_key">{ translate( 'Your API Key' ) }</FormLabel>
					<FormTextInput
						name="wordpress_api_key"
						className={ className }
						value={ wordpress_api_key }
						disabled={ inTransition || ! akismetActive }
						onChange={ onChangeField( 'wordpress_api_key' ) }
					/>
					{
						( isValidKey || isInvalidKey ) && ! inTransition && (
							<FormInputValidation isError={ isInvalidKey } text={ validationText } />
						)
					}
					{
						( ! wordpress_api_key || isInvalidKey || ! isValidKey ) && (
							<FormSettingExplanation>
								{ translate(
									'If you don\'t already have an API key, then' +
									' {{link}}get your API key here{{/link}},' +
									' and you\'ll be guided through the process of getting one in a new window.',
									{
										components: {
											link: (
												<ExternalLink icon
													href="https://akismet.com/wordpress/"
													target="_blank" />
											)
										}
									}
								) }
							</FormSettingExplanation>
						)
					}
				</div>
			</FormFieldset>
		</FoldableCard>
	);
};

SpamFilteringSettings.propTypes = {
	hasAkismetKeyError: PropTypes.bool,
	isSavingSettings: PropTypes.bool,
	isRequestingSettings: PropTypes.bool,
	dirtyFields: PropTypes.array,
	fields: PropTypes.object,
	settings: PropTypes.object
};

export default connect(
	( state ) => {
		const selectedSiteId = getSelectedSiteId( state );
		const jetpackSettingsSaveError = getJetpackSettingsSaveError( state, selectedSiteId );
		const jetpackSettingsSaveStatus = getJetpackSettingsSaveRequestStatus( state, selectedSiteId );
		const hasAkismetKeyError = jetpackSettingsSaveStatus &&
			jetpackSettingsSaveStatus === 'error' &&
			( includes( jetpackSettingsSaveError, 'wordpress_api_key' ) ||
				includes( jetpackSettingsSaveError, 'wordpress_api_key' ) );
		return {
			hasAkismetKeyError
		};
	}
)( localize( SpamFilteringSettings ) );
