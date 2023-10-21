jQuery(document).ready(function() {
    jQuery.get("/views/headers/header.html", function(data) {
        jQuery("#header").html(data);
        jQuery.getScript("/views/headers/searchDropdownSelection.js", function() {
            initSearchDropdown();
        });
        jQuery.getScript("/views/headers/accessibilityToolbar.js", function() {
            initAccessibilityToolbar();
        });
    });
});