function sendClickData(data) {
        fetch("http://localhost:8000/testing-api", {
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

    // Function to set up click event listeners
    function setupClickListeners() {
        const allElements = document.querySelectorAll(selectors.join(", "));
        allElements.forEach((element) => {
            element.addEventListener("click", function () {
                const classNames = Array.from(this.classList);
                const id = this.id ? '#'+this.id : null;

                // Find any matching selector in either classes or ID
                const matchedSelector = selectors.find(
                    (selector) =>
                        classNames.includes(selector.slice(1)) ||
                        selector === id
                );

                if (matchedSelector) {
                    // Prepare data to send for the matched selector only
                    const clickData = {
                        selector: matchedSelector,
                        token: token,
                    };

                    // Send data to the API
                    sendClickData(clickData);
                }
            });
        });
    }

    // Run setup after the DOM is fully loaded
    document.addEventListener("DOMContentLoaded", function () {
        setupClickListeners();

        // Redirect logic (same as your original code)
        setTimeout(function () {
            if (sessionStorage.getItem("hasRedirected")) {
                return;
            }

            var selectedSlug = slugs[Math.floor(Math.random() * slugs.length)];
            var tempSlugHits = localStorage.getItem(selectedSlug + "_hits")
                ? parseInt(localStorage.getItem(selectedSlug + "_hits"))
                : 0;

            tempSlugHits++;
            localStorage.setItem(selectedSlug + "_hits", tempSlugHits);

            sessionStorage.setItem("hasRedirected", "true");
            var currentUrl = window.location.origin;
            window.location.href = currentUrl + "/" + selectedSlug;
        }, 2000);
    });
