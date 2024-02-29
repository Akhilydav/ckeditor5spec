/**
 * @file contains the icon picker root view.
 */

import type { ViewCollection, FocusableView, ButtonExecuteEvent, ButtonView } from 'ckeditor5/src/ui';
import { View, FocusCycler } from 'ckeditor5/src/ui';
import type { Locale, ObservableChangeEvent } from 'ckeditor5/src/utils';
import { FocusTracker, KeystrokeHandler } from 'ckeditor5/src/utils';
import { getValidIconStyle } from '../iconutils';
import type { FontAwesomeStyle, FontAwesomeVersion, CategoryDefinitions, IconDefinition, IconDefinitions, IconName } from '../icontypes';
import IconPickerHeader from './iconpickerheader';
import IconPickerGrid from './iconpickergrid';
import IconPickerFooter from './iconpickerfooter';
import type { CategorySelectionEvent } from './iconpickerheader';
import type { IconSelectionEvent, GridSectionLoadEvent } from './iconpickergrid';
import type { SearchEvent } from './iconpickersearch';
import type { ChangeStyleEvent } from './iconpickerform';

export default class IconPickerView extends View implements FocusableView {
	/**
	 * The name of the currently selected icon.
	 * 
	 * @observable
	 */
	public declare iconName: IconName | null;

	/**
	 * The selected style of the currently selected icon.
	 * 
	 * @observable
	 */
	public declare iconStyle: FontAwesomeStyle | null;

	/**
	 * The definition of the currently selected icon.
	 * 
	 * @observable
	 */
	public declare iconDefinition: IconDefinition | null;

	/**
	 * The current search query.
	 */
	private searchQuery?: string | null;

	/**
	 * The icon picker header view.
	 */
	private readonly headerView: IconPickerHeader;

	/**
	 * The icon picker scrollable grid view.
	 */
	private readonly gridView: IconPickerGrid;

	/**
	 * The icon picker footer view.
	 */
	private readonly footerView: IconPickerFooter;

	/**
	 * The search field input view.
	 */
	private readonly searchFieldView: FocusableView;

	/**
	 * The "Clear search" button view.
	 */
	private readonly searchClearButtonView: ButtonView;

	/**
	 * The items for which to track focus (tab or shift + tab).
	 */
	private readonly items: ViewCollection;

	/**
	 * The focus tracker.
	 */
	private readonly focusTracker: FocusTracker;

	/**
	 * The keystroke handler.
	 */
	private readonly keystrokes: KeystrokeHandler;

	/**
	 * Constructs a new IconPickerView.
	 * 
	 * @param locale
	 *   The locale.
	 * @param faVersion
	 *   The version of Font Awesome being used.
	 * @param faCategories
	 *   The Font Awesome category definitions.
	 * @param faIcons
	 *   The Font Awesome icon definitions.
	 * @param faStyles
	 *   The enabled Font Awesome icon styles.
	 * @param recommendedIcons
	 *   The icons to display in the recommended category.
	 */
	public constructor(locale: Locale, faVersion: FontAwesomeVersion, faCategories: CategoryDefinitions, faIcons: IconDefinitions, faStyles: FontAwesomeStyle[], recommendedIcons: IconName[] | null | undefined) {
		super(locale);

		this.set('iconName', null);
		this.set('iconStyle', null);
		this.set('iconDefinition', null);

		this.headerView = new IconPickerHeader(locale, faVersion, faCategories, faStyles, recommendedIcons);
		this.gridView = new IconPickerGrid(locale, faVersion);
		this.footerView = new IconPickerFooter(locale, faVersion, faStyles);
		this.searchFieldView = this.footerView.searchView.searchFieldView.fieldView;
		this.searchClearButtonView = this.footerView.searchView.clearButtonView;

		this.items = this.createCollection();
		this.focusTracker = new FocusTracker();
		this.keystrokes = new KeystrokeHandler();

		new FocusCycler({
			focusables: this.items,
			focusTracker: this.focusTracker,
			keystrokeHandler: this.keystrokes,
			actions: {
				focusPrevious: 'shift + tab',
				focusNext: 'tab'
			}
		});

		this.setTemplate({
			tag: 'div',
			attributes: {
				class: ['ck', 'ckeditor5-icons__picker'],
				// Avoid focus loss when the user clicks the area of the grid that is not a button.
				// https://github.com/ckeditor/ckeditor5/pull/12319#issuecomment-1231779819
				tabindex: '-1'
			},
			children: [this.headerView, this.gridView, this.footerView]
		});

		this.items.add(this.headerView);

		// === Events generated by the different subviews are handled here. ===


		// Handles the category change event from the header.
		this.listenTo<CategorySelectionEvent>(this.headerView, 'execute', (_eventInfo, categoryName, categoryDefinition) => {
			this.iconName = null;
			this.iconDefinition = null;
			this.gridView.refresh(faIcons, categoryName, categoryDefinition);
			this.footerView.refresh();
			this._stopTrackingFooterForm();
			if (categoryName === '_brands') {
				this.footerView.styleFilterView.buttonView.isVisible = false;
				this._stopTracking(this.footerView.styleFilterView.buttonView);
			} else
				this.footerView.styleFilterView.buttonView.isVisible = true;
			this.searchQuery = null;
		});

		// Handles the icon selection event from the grid.
		this.listenTo<IconSelectionEvent>(this.gridView, 'execute', (_eventInfo, iconName, iconDefinition) => {
			if (!iconName || !iconDefinition)
				this._clearSelectedIcon();
			else {
				this.iconName = iconName;
				this.iconStyle = getValidIconStyle(iconDefinition, this.iconStyle);
				this.iconDefinition = iconDefinition;
				this.footerView.refresh();
				this._startTrackingFooterForm();
			}
		});

		// Tracks the "Show more" button in the grid view.
		this.listenTo<GridSectionLoadEvent>(this.gridView, 'gridSectionLoad', (_eventInfo, gridFocusable, expandButtonVisible) => {
			if (gridFocusable)
				this._startTracking(this.gridView, this.items.getIndex(this.headerView) + 1);
			else this._stopTracking(this.gridView);
			if (this.gridView.allCategoryFilterView.buttonView.isVisible)
				this._startTracking(this.gridView.allCategoryFilterView.buttonView, this.items.getIndex(this.headerView) + 1);
			else this._stopTracking(this.gridView.allCategoryFilterView.buttonView);
			if (expandButtonVisible)
				this._startTracking(this.gridView.expandButtonView, this.items.getIndex(this.gridView) + 1);
			else this._stopTracking(this.gridView.expandButtonView);
		});

		// Handles the search event.
		this.listenTo<SearchEvent>(this.footerView, 'search', (_eventInfo, newSearchQuery) => {
			if (this.iconName) {
				this.iconName = null;
				this.iconDefinition = null;
				this.footerView.refresh();
				this._stopTrackingFooterForm();
			}
			if (newSearchQuery) {
				this.gridView.refresh(faIcons, '_all', faCategories['_all']!, newSearchQuery);
				this.headerView.set('categoryAttributionName', '_search');
				this.headerView.categoryDropdownView.buttonView.isVisible = false;
				this._stopTracking(this.headerView);
				this.searchClearButtonView.isVisible = true;
				this._startTracking(this.searchClearButtonView, this.items.getIndex(this.searchFieldView) + 1);
				this.footerView.styleFilterView.buttonView.isVisible = true;
				this._startTracking(this.footerView.styleFilterView.buttonView);
				this.searchQuery = newSearchQuery;
			} else {
				this._startTracking(this.headerView, 0);
				this.headerView.fire<CategorySelectionEvent>('execute', this.headerView.categoryName!, this.headerView.categoryDefinition!);
				this.searchClearButtonView.isVisible = false;
				this._stopTracking(this.searchClearButtonView);
				this.headerView.categoryDropdownView.buttonView.isVisible = true;
			}
		});

		this.listenTo<ObservableChangeEvent>(this.gridView, 'change:styleFilter', () => {
			if (this.searchQuery)
				this.gridView.refresh(faIcons, '_all', faCategories['_all']!, this.searchQuery);
			else this.gridView.refresh(faIcons);
		});

		// Handles the icon style change event.
		this.listenTo<ChangeStyleEvent>(this.footerView, 'changeStyle', (_eventInfo, iconStyle) => {
			this.set('iconStyle', iconStyle);
			this.footerView.refresh();
		});

		// Handles the icon insert cancel event.
		this.on('cancel', _eventInfo => this._clearSelectedIcon(true));

		// Fires the icon insert cancel event if the Escape key is pressed with an icon selected.
		// If an icon is not selected or Escape is pressed twice, the default behavior is to close the icon picker.
		this.keystrokes.set('Esc', (_data, cancel) => {
			if (this.iconName) {
				this._clearSelectedIcon(true);
				cancel();
			} else if (this.items.has(this.searchClearButtonView)) {
				this.searchClearButtonView.fire<ButtonExecuteEvent>('execute'); // Escape key mimics a press of "Clear search".
				cancel();
			}
		});

		// Binds values that need to be avaliable in the different subviews so they remain in sync with the main view.
		this.gridView.bind('iconName').to(this);
		this.gridView.bind('categoryName', 'categoryDefinition').to(this.headerView);
		this.gridView.bind('styleFilter').to(this.footerView);
		this.footerView.bind('iconName', 'iconStyle', 'iconDefinition').to(this);

		// Ensures the `execute` and `cancel` events of the icon picker view fires when someone confirms an icon insert.
		this.footerView.on('execute', () => {
			this.fire<InsertIconEvent>('execute', this.iconName!, this.iconStyle!);
			this._clearSelectedIcon();
		});
		this.footerView.delegate('cancel').to(this);

		// Fires the initial event to populate the grid view.
		if (faCategories['_recommended'])
			this.headerView.fire<CategorySelectionEvent>('execute', '_recommended', faCategories['_recommended']);
		else this.headerView.fire<CategorySelectionEvent>('execute', '_all', faCategories['_all']!);
	}

	/**
	 * Starts tracking a view's focus.
	 * 
	 * @param view
	 *   The view to start tracking.
	 * @param index
	 *   The index at which to track the view (should match the order it appears in the interface).
	 */
	private _startTracking(view: View, index?: number) {
		if (!this.items.has(view)) {
			this.items.add(view, index);
			this.focusTracker.add(view.element!);
		}
	}

	/**
	 * Stops tracking a view's focus.
	 * 
	 * @param view
	 *   The view to stop tracking.
	 */
	private _stopTracking(view: View) {
		if (this.items.has(view)) {
			this.items.remove(view);
			this.focusTracker.remove(view.element!);
		}
	}

	private _startTrackingFooterForm() {
		this._stopTracking(this.footerView.styleFilterView.buttonView);
		this._stopTracking(this.searchFieldView);
		if (this.searchQuery)
			this._stopTracking(this.searchClearButtonView);
		this._startTracking(this.footerView.formView.styleDropdownView.buttonView);
		this._startTracking(this.footerView.formView.submitButtonView);
		this._startTracking(this.footerView.formView.cancelButtonView);
	}

	private _stopTrackingFooterForm() {
		this._stopTracking(this.footerView.formView.styleDropdownView.buttonView);
		this._stopTracking(this.footerView.formView.submitButtonView);
		this._stopTracking(this.footerView.formView.cancelButtonView);
		this._startTracking(this.searchFieldView);
		if (this.searchQuery)
			this._startTracking(this.searchClearButtonView);
		this._startTracking(this.footerView.styleFilterView.buttonView);
	}

	/**
	 * Clears the selected icon.
	 * 
	 * @param refocus
	 *   Whether to refocus away from the form if necessary.
	 */
	private _clearSelectedIcon(refocus: boolean = false) {
		if (refocus && this.focusTracker.isFocused && this.focusTracker.focusedElement?.parentElement === this.footerView.formView.element)
			this.gridView.focus();
		this.iconName = null;
		this.iconDefinition = null;
		this.footerView.refresh();
		this._stopTrackingFooterForm();
	}

	/**
	 * @inheritdoc
	 */
	public override render() {
		super.render();

		this.focusTracker.add(this.headerView.element!);

		// Start listening for the keystrokes coming from #element.
		this.keystrokes.listenTo(this.element!);
	}

	/**
	 * @inheritdoc
	 */
	public override destroy() {
		super.destroy();

		this.focusTracker.destroy();
		this.keystrokes.destroy();
	}

	/**
	 * Focuses the first focusable in `items`.
	 */
	public focus() {
		if (this.items.has(this.searchFieldView))
			this.searchFieldView.focus();
		else this.headerView.focus();
	}
}

/**
 * The event fired when "Insert" is clicked to insert the icon.
 */
export type InsertIconEvent = {
	name: 'execute';
	args: [iconName: IconName, iconStyle: FontAwesomeStyle];
};