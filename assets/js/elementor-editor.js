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
	
	/**
	 * Populate event_id control options
	 */
	function populateEventOptions(controlView, calendarsValue, tagsValue) {
		// Check if events data is available
		if (typeof ctsElementorData === 'undefined' || !ctsElementorData.events) {
			console.warn('[CTS Elementor] Events data not available');
			return;
		}
		
		// Parse filter arrays
		var calendarIds = calendarsValue ? String(calendarsValue).split(',').map(function(id) { 
			return id.trim(); 
		}).filter(Boolean) : [];
		
		var tagIds = tagsValue ? String(tagsValue).split(',').map(function(id) { 
			return id.trim(); 
		}).filter(Boolean) : [];
		
		console.log('[CTS Elementor] Filtering events - Calendars:', calendarIds, 'Tags:', tagIds);
		
		// Filter events based on selected calendars/tags
		var filteredEvents = ctsElementorData.events.filter(function(event) {
			// Skip automatic option
			if (event.value === 0) return true;
			
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
		
		// Update control model
		controlView.model.set('options', options);
		
		// Re-render control
		controlView.render();
	}
	
	/**
	 * Setup event control population when panel opens
	 */
	function setupEventControl() {
		elementor.hooks.addAction('panel/open_editor/widget', function(panel, model, view) {
			// Only for our widget
			if (model.get('widgetType') !== 'churchtools_suite_events') {
				return;
			}
			
			console.log('[CTS Elementor] ChurchTools Events widget opened');
			
			// Wait for controls to render
			setTimeout(function() {
				var controlsView = panel.getCurrentPageView();
				
				if (!controlsView || !controlsView.children) {
					return;
				}
				
				// Find event_id control
				var eventIdControl = null;
				controlsView.children.each(function(controlView) {
					if (controlView.model.get('name') === 'event_id') {
						eventIdControl = controlView;
					}
				});
				
				if (!eventIdControl) {
					console.warn('[CTS Elementor] event_id control not found');
					return;
				}
				
				console.log('[CTS Elementor] Found event_id control');
				
				// Get settings
				var settings = model.get('settings');
				var calendarsValue = settings.get('calendars');
				var tagsValue = settings.get('tags');
				
				// Initial population
				populateEventOptions(eventIdControl, calendarsValue, tagsValue);
				
				// Listen to calendar/tag changes
				settings.on('change:calendars change:tags', function() {
					console.log('[CTS Elementor] Calendar/Tags changed, re-filtering events');
					var newCalendars = settings.get('calendars');
					var newTags = settings.get('tags');
					populateEventOptions(eventIdControl, newCalendars, newTags);
				});
				
			}, 100);
		});
	}
	
	// Initialize when Elementor is ready
	$(window).on('elementor:init', function() {
		console.log('[CTS Elementor] Elementor initialized, setting up event control');
		setupEventControl();
	});
	
})(jQuery);
