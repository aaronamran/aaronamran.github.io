/*!
 * Start Bootstrap - Resume v7.0.6 (https://startbootstrap.com/theme/resume)
 * Copyright 2013-2023 Start Bootstrap
 * Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-resume/blob/master/LICENSE)
 */
//
// Scripts
//

window.addEventListener("DOMContentLoaded", (event) => {
	// Activate Bootstrap scrollspy on the main nav element
	const sideNav = document.body.querySelector("#sideNav");
	if (sideNav) {
		new bootstrap.ScrollSpy(document.body, {
			target: "#sideNav",
			rootMargin: "0px 0px -40%",
		});
	}

	// Collapse responsive navbar when toggler is visible
	const navbarToggler = document.body.querySelector(".navbar-toggler");
	const responsiveNavItems = [].slice.call(
		document.querySelectorAll("#navbarResponsive .nav-link")
	);
	responsiveNavItems.map(function (responsiveNavItem) {
		responsiveNavItem.addEventListener("click", () => {
			if (window.getComputedStyle(navbarToggler).display !== "none") {
				navbarToggler.click();
			}
		});
	});
});

// for Projects section
function filterProjects(category, categoryName, elem) {
	var projects = document.querySelectorAll(".project-card");
	var dropdownItems = document.querySelectorAll(
		".dropdown-menu .dropdown-item"
	);
	var dropdownButton = document.getElementById("categoryDropdown");

	// Remove active class from all dropdown items
	dropdownItems.forEach(function (item) {
		item.classList.remove("active-project-button");
	});

	// If an element is provided, add the active class to it
	if (elem) {
		elem.classList.add("active-project-button");
	}

	// Update the dropdown button text
	dropdownButton.textContent = categoryName;

	// Show or hide projects based on the selected category
	projects.forEach(function (project) {
		// Trim any extra spaces from the attribute value
		var projectCategory = project.getAttribute("data-category").trim();

		if (category === "all" || projectCategory === category) {
			// Use 'flex' to preserve your d-flex layout
			project.style.display = "flex";
		} else {
			project.style.display = "none";
		}
	});
}

// Set default filter to 'all' when the page loads
document.addEventListener("DOMContentLoaded", function () {
	filterProjects("all", "All");
});

