jQuery(document).ready(function() {
    jQuery.get("/views/headers/footer.html", function(data) {
        jQuery("#footer").html(data);
    });
});