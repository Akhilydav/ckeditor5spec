/**
 * @file contains the icon picker search form.
 */

import type { Locale } from 'ckeditor5/src/utils';
import type { ButtonView, InputTextView, ButtonExecuteEvent } from 'ckeditor5/src/ui';
import { createLabeledInputText, LabeledFieldView, View } from 'ckeditor5/src/ui';
import type { InputViewInputEvent } from '@ckeditor/ckeditor5-ui/src/input/inputview';
import { createButton } from './viewutils';
import { icons } from 'ckeditor5/src/core';
import HideableView from './hideableview';

export default class IconPickerSearch extends View {
	/**
	 * The labeled search field view.
	 */
	public readonly searchFieldView: LabeledFieldView<InputTextView>;

	/**
	 * The clear button view – clears the search when pressed.
	 */
	public readonly clearButtonView: ButtonView;

	/**
	 * Constructs a new IconPickerSearch.
	 * 
	 * @param locale 
	 *   The locale.
	 */
	public constructor(locale: Locale) {
		super(locale);

		const delayms = 500, t = locale.t;
		let delayTimer: any;

		this.searchFieldView = new LabeledFieldView(locale, createLabeledInputText);
		this.searchFieldView.label = t('Search all icons');
		this.searchFieldView.fieldView.on<InputViewInputEvent>('input', () => {
			const value = this.searchFieldView.fieldView.element?.value;
			if (delayTimer)
				clearTimeout(delayTimer);
			delayTimer = setTimeout(() => this.fire<SearchEvent>('search', value), delayms);
			this.searchFieldView.fieldView.set('value', value);
		});
		this.clearButtonView = createButton(locale, t('Clear search'), icons.cancel, 'ck-button-cancel');
		this.clearButtonView.isVisible = false;
		this.clearButtonView.on<ButtonExecuteEvent>('execute', () => {
			if (delayTimer)
				clearTimeout(delayTimer);
			this.fire<SearchEvent>('search');
			this.searchFieldView.fieldView.set('value', '');
			this.searchFieldView.focus();
		});

		const searchClearButtonContainerView = new HideableView(locale, 'div', [this.clearButtonView]);
		searchClearButtonContainerView.bind('isVisible').to(this.clearButtonView, 'isVisible');

		this.setTemplate({
			tag: 'form',
			attributes: {
				class: ['ck', 'ckeditor5-icons__picker-search']
			},
			children: [this.searchFieldView, searchClearButtonContainerView]
		});
	}
}

/**
 * The event fired when a search change is performed.
 */
export type SearchEvent = {
	name: 'search';
	args: [queryString?: string];
};

/**
 * The event fired when a search change is performed.
 */
export type SearchClearEvent = {
	name: 'searchClear';
	args: [];
};
