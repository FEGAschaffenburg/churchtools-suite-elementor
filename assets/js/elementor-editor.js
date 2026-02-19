/**
 * ChurchTools Suite - Elementor Editor Integration
 * 
 * Dynamically populates event_id control with events from wp_localize_script
 * 
 * @package ChurchTools_Suite_Elementor
 * @since   0.6.1
 */

(function($) {
	'use strict';
	
	console.log('[CTS Elementor] Script loaded');
	
	/**
	 * Populate event_id control options
	 */
	function populateEventOptions(controlView, calendarsValue, tagsValue) {
		// Check if events data is available
		if (typeof ctsElementorData === 'undefined' || !ctsElementorData.events) {
			console.warn('[CTS Elementor] Events data not available in JavaScript');
			return;
		}
		
		// Parse filter arrays - handle both string and array formats
		var calendarIds = [];
		if (calendarsValue) {
			if (Array.isArray(calendarsValue)) {
				calendarIds = calendarsValue.map(function(id) { return String(id).trim(); }).filter(Boolean);
			} else {
				calendarIds = String(calendarsValue).split(',').map(function(id) { return id.trim(); }).filter(Boolean);
			}
		}
		
		var tagIds = [];
		if (tagsValue) {
			if (Array.isArray(tagsValue)) {
				tagIds = tagsValue.map(function(id) { return String(id).trim(); }).filter(Boolean);
			} else {
				tagIds = String(tagsValue).split(',').map(function(id) { return id.trim(); }).filter(Boolean);
			}
		}
		
		console.log('[CTS Elementor] Filtering events - Calendars:', calendarIds, 'Tags:', tagIds);
		console.log('[CTS Elementor] Available events:', ctsElementorData.events.length);
		
		// Filter events based on selected calendars/tags
		var filteredEvents = ctsElementorData.events.filter(function(event) {
			// Always include automatic option
			if (event.value === 0 || event.value === '0') {
				return true;
			}
			
			// Check calendar filter
			var calendarMatch = calendarIds.length === 0 || calendarIds.includes(String(event.calendar_id));
			
			// Check tags filter (must have ALL selected tags)
			var tagsMatch = true;
			if (tagIds.length > 0) {
				if (event.tags && event.tags.length > 0) {
					tagsMatch = tagIds.every(function(tagId) {
						return event.tags.includes(tagId);
					});
				} else {
					tagsMatch = false;
				}
			}
			
			return calendarMatch && tagsMatch;
		});
		
		console.log('[CTS Elementor] Filtered to', filteredEvents.length, 'events');
		
		// Build options object
		var options = {};
		filteredEvents.forEach(function(event) {
			options[event.value] = event.label;
		});
		
		console.log('[CTS Elementor] Built options with keys:', Object.keys(options));
		
		// Update control model
		console.log('[CTS Elementor] Updating control options...');
		controlView.model.set('options', options);
		
		// Force re-render of the SELECT2 control
		console.log('[CTS Elementor] Re-rendering control...');
		if (controlView.render && typeof controlView.render === 'function') {
			controlView.render();
		}
		
		// Also update the select2 instance if it exists
		var $select = controlView.$el.find('select');
		if ($select.length && $select.data('select2')) {
			console.log('[CTS Elementor] Re-initializing Select2...');
			$select.select2('destroy');
			$select.empty();
			Object.keys(options).forEach(function(value) {
				$select.append($('<option>', {
					value: value,
					text: options[value]
				}));
			});
			$select.select2();
		}
		
		console.log('[CTS Elementor] Control update complete');
	}
	
	/**
	 * Setup event control population when panel opens
	 */
	function setupEventControl() {
		// Hook 1: When widget is added to canvas
		elementor.hooks.addAction('panel/open_editor/widget', function(panel, model, view) {
			console.log('[CTS Elementor] Widget panel opened, type:', model.get('widgetType'));
			
			// Only for our widget
			if (model.get('widgetType') !== 'churchtools_suite_events') {
				return;
			}
			
			console.log('[CTS Elementor] ChurchTools Events widget panel opened');
			
			// Wait for controls to render
			setTimeout(function() {
				populateControlsInPanel(panel, model);
			}, 100);
		});
		
		// Hook 2: Alternative - try to populate on widget render
		elementor.on('preview:loaded', function() {
			console.log('[CTS Elementor] Preview loaded, checking for widgets');
			// This runs after the preview iframe is ready
		});
	}
	
	/**
	 * Populate controls in the panel
	 */
	function populateControlsInPanel(panel, model) {
		console.log('[CTS Elementor] populateControlsInPanel() called');
		
		var controlsView = panel.getCurrentPageView();
		
		if (!controlsView || !controlsView.children) {
			console.warn('[CTS Elementor] Controls view not ready');
			// Retry after a short delay
			setTimeout(function() {
				populateControlsInPanel(panel, model);
			}, 200);
			return;
		}
		
		console.log('[CTS Elementor] Controls view ready, searching for event_id control...');
		
		// Find event_id control
		var eventIdControl = null;
		controlsView.children.each(function(controlView) {
			var controlName = controlView.model.get('name');
			console.log('[CTS Elementor] Found control:', controlName);
			if (controlName === 'event_id') {
				eventIdControl = controlView;
			}
		});
		
		if (!eventIdControl) {
			console.warn('[CTS Elementor] event_id control not found in panel');
			console.log('[CTS Elementor] Available controls:', controlsView.children.length);
			return;
		}
		
		console.log('[CTS Elementor] ✓ Found event_id control, setting up...');
		
		// Get settings
		var settings = model.get('settings');
		var calendarsValue = settings.get('calendars');
		var tagsValue = settings.get('tags');
		
		console.log('[CTS Elementor] Initial filters - Calendars:', calendarsValue, 'Tags:', tagsValue);
		
		// Initial population
		populateEventOptions(eventIdControl, calendarsValue, tagsValue);
		
		// Remove old listeners to prevent duplicates
		settings.off('change:calendars change:tags');
		
		// Listen to calendar/tag changes
		settings.on('change:calendars change:tags', function() {
			console.log('[CTS Elementor] ===== FILTER CHANGED =====');
			var newCalendars = settings.get('calendars');
			var newTags = settings.get('tags');
			console.log('[CTS Elementor] New Calendars:', newCalendars);
			console.log('[CTS Elementor] New Tags:', newTags);
			
			// Re-populate with new filters
			populateEventOptions(eventIdControl, newCalendars, newTags);
		});
		
		console.log('[CTS Elementor] ✓ Filter change listeners attached');
	}
	
	// Initialize when Elementor is ready
	$(window).on('elementor:init', function() {
		console.log('[CTS Elementor] Elementor initialized, setting up event control');
		console.log('[CTS Elementor] ctsElementorData available:', typeof ctsElementorData !== 'undefined');
		if (typeof ctsElementorData !== 'undefined') {
			console.log('[CTS Elementor] Events loaded:', ctsElementorData.events ? ctsElementorData.events.length : 0);
		}
		setupEventControl();
	});
	
})(jQuery);
