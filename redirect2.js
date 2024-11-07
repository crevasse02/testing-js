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
            let baseUrl = window.location.origin; // Get the base URL
            const viewDataKey = "baseUrl_viewDataSent"; // Unique key to track if view data has been sent

						// Check if baseUrl is a valid string and contains the protocol
						if (baseUrl && typeof baseUrl === "string") {
								// Remove the protocol (http:// or https://) if it exists
								baseUrl = baseUrl.replace(/^https?:\/\//, '');

								// Optionally remove the 'www.' if it exists
								baseUrl = baseUrl.replace(/^www\./, '');
						}

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
                const viewDataKey = matchedData.slug + '_viewDataSent';
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
                    let isFormSubmitting = false;
                    let isClickSubmitting = false;

                    const sendData = () => {
                        const currentUrl = window.location.host + window.location.pathname;

                        // Validate if the current URL matches the slug
                        if (currentUrl.includes(slug)) {
                            const clickData = {
                                url: currentUrl,
                                selector: selector,
                                variant: variant,
                                token: token,
                            };
                            sendClickData(clickData); // Send data to API
                            console.log("Data sent to API:", clickData);
                        } else {
                            console.log("Current URL does not match slug:", slug);
                        }
                    };

                    if (element.tagName === "FORM") {
                        document.addEventListener('wpcf7mailsent', (event) => {
                            if (event.srcElement.matches(selector) && !isFormSubmitting) {
                                isFormSubmitting = true;
                                sendData(); // Send data for successful form submission
                                console.log("Form sent successfully, data sent.");
                            }
                        });

                        document.addEventListener('wpcf7invalid', (event) => {
                            if (event.srcElement.matches(selector)) {
                                console.log("Form submission invalid, data not sent.");
                            }
                        });
                    } else {
                        element.addEventListener("click", () => {
                            if (!isClickSubmitting) {
                                isClickSubmitting = true;
                                sendData(); // Send data for click
                                console.log("Non-form element clicked, data sent.");
                            } else {
                                console.log("Element already clicked.");
                            }
                        });
                    }
                });
            });
        }

        // Run setup after the DOM is fully loaded
        document.addEventListener("DOMContentLoaded", function () {
            sendBaseUrlViewData();
            checkCurrentUrl();
            setupClickListeners();

            // Redirect logic
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

            setTimeout(() => {
                window.location.href = selectedData.slug;
            }, 1000); // 1000ms = 1 second
        });
    })();
