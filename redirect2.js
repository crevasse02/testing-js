(function () {
    // Function to send data to API
    function sendClickData(data) {
        fetch("https://split.esensigroup.com/tracker-api", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
            .then((response) => response.json())
            .then((data) => console.log("Success:", data))
            .catch((error) => console.error("Error:", error));
    }

    function sendViewData(data) {
        fetch("https://split.esensigroup.com/view-api", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
            .then((response) => response.json())
            .then((data) => console.log("Success:", data))
            .catch((error) => console.error("Error:", error));
    }

    function sendBaseViewData(data) {
        fetch("https://split.esensigroup.com/base-view-api", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
            .then((response) => response.json())
            .then((data) => console.log("Success:", data))
            .catch((error) => console.error("Error:", error));
    }

    // Function to send view data on base URL load
    function sendBaseUrlViewData() {
        var baseUrl = window.location.origin; // Get the base URL
        const viewDataKey = "baseUrl_viewDataSent"; // Unique key to track if view data has been sent
        // Remove the protocol (http:// or https://)
        baseUrl = baseUrl.replace(/^https?:\/\//, '');

        // Remove the 'www.' if it exists
        baseUrl = baseUrl.replace(/^www\./, '');
        
        if (!sessionStorage.getItem(viewDataKey)) {
            const viewData = {
                slug: baseUrl, // You can modify this slug as necessary
                token: token,
            };
            sendBaseViewData(viewData);
            sessionStorage.setItem(viewDataKey, "true"); // Mark as sent
        } else {
            console.log("View data already sent for the base URL in this session."); // Debugging line
        }
    }

    // Check if the current URL matches any slug (without protocol) and send an API request if true
    function checkCurrentUrl() {
        const currentPath = window.location.host + window.location.pathname; // Without protocol
        const matchedData = dataMapping.find((data) =>
            currentPath.includes(data.slug)
        );

        if (matchedData) {
            console.log("Matching URL found:", matchedData.slug); // Debugging line

            // Unique key to track if view data has been sent
            const viewDataKey = `${matchedData.slug}_viewDataSent`;
            if (!sessionStorage.getItem(viewDataKey)) {
                const viewData = {
                    slug: matchedData.slug,
                    token: token,
                };
                sendViewData(viewData);
                sessionStorage.setItem(viewDataKey, "true"); // Mark as sent
            } else {
                console.log("View data already sent for this user in this session."); // Debugging line
            }
        } else {
            console.log("No matching URL found."); // Debugging line
        }
    }

    // Function to set up click event listeners
    function setupClickListeners() {
        dataMapping.forEach(({ selector, variant, slug }) => {
            const elements = document.querySelectorAll(selector);

            elements.forEach((element) => {
                // Flag to prevent multiple submissions
                let isSubmitting = false;

                element.addEventListener("click", function () {
                    const currentUrl =
                        window.location.host + window.location.pathname; // Current URL

                    // Validate if the current URL matches the slug
                    if (currentUrl.includes(slug)) {
                        const clickData = {
                            url: currentUrl, // Current URL
                            selector: selector, // Track by the selector from dataMapping
                            variant: variant,
                            token: token,
                        };

                        // If this is a form, handle submission
                        if (element.tagName === "FORM") {
                            element.addEventListener(
                                "submit",
                                function (event) {
                                    event.preventDefault(); // Prevent actual form submission for tracking

                                    if (!isSubmitting) {
                                        // Check if already submitting
                                        isSubmitting = true; // Set the flag to true
                                        sendClickData(clickData); // Send the grouped data
                                        // Uncomment the following line if you want to submit the form after sending the data
                                        // this.submit(); // Submit the form programmatically
                                    } else {
                                        console.log("Form already submitted."); // Debugging line
                                    }
                                }
                            );
                        } else {
                            // Send data to the API for the matched selector
                            if (!isSubmitting) {
                                // Check if already submitting
                                isSubmitting = true; // Set the flag to true
                                sendClickData(clickData);
                            } else {
                                console.log("Button already clicked."); // Debugging line
                            }
                        }
                    } else {
                        console.log("Current URL does not match slug:", slug); // Debugging line
                    }
                });
            });
        });
    }

    // Run setup after the DOM is fully loaded
    document.addEventListener("DOMContentLoaded", function () {
        // Send view data for base URL load
        sendBaseUrlViewData();

        // Check URL and trigger API if matching
        checkCurrentUrl();

        // Set up click listeners
        setupClickListeners();

        // Redirect logic
        setTimeout(function () {
            if (sessionStorage.getItem("hasRedirected")) {
                return;
            }

            const selectedData =
                dataMapping[Math.floor(Math.random() * dataMapping.length)];
            let tempSlugHits = localStorage.getItem(selectedData.slug + "_hits")
                ? parseInt(localStorage.getItem(selectedData.slug + "_hits"))
                : 0;

            tempSlugHits++;
            localStorage.setItem(selectedData.slug + "_hits", tempSlugHits);

            sessionStorage.setItem("hasRedirected", "true");
            const currentUrl = window.location.origin;
            window.location.href = selectedData.slug;
        }, 2000);
    });
})();
