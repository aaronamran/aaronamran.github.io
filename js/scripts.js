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

document.getElementById("showPortfolio").addEventListener("click", function () {
	document.getElementById("portfolioContainer").style.display = "block";
	document.getElementById("resumeContainer").style.display = "none";
	document.querySelectorAll(".portfolio-nav-item").forEach(function (item) {
		item.style.display = "block";
	});
	document.querySelectorAll(".resume-nav-item").forEach(function (item) {
		item.style.display = "none";
	});
	document.getElementById("showPortfolio").classList.add("active-button");
	document.getElementById("showResume").classList.remove("active-button");
	document.getElementById("navText").textContent = "Portfolio";
});

document.getElementById("showResume").addEventListener("click", function () {
	document.getElementById("portfolioContainer").style.display = "none";
	document.getElementById("resumeContainer").style.display = "block";
	document.querySelectorAll(".portfolio-nav-item").forEach(function (item) {
		item.style.display = "none";
	});
	document.querySelectorAll(".resume-nav-item").forEach(function (item) {
		item.style.display = "block";
	});
	document.getElementById("showResume").classList.add("active-button");
	document.getElementById("showPortfolio").classList.remove("active-button");
	document.getElementById("navText").textContent = "Resume";
});

// Initially show only the Portfolio container and hide resume nav items
document.getElementById("portfolioContainer").style.display = "block";
document.getElementById("resumeContainer").style.display = "none";
document.querySelectorAll(".portfolio-nav-item").forEach(function (item) {
	item.style.display = "block";
});
document.querySelectorAll(".resume-nav-item").forEach(function (item) {
	item.style.display = "none";
});
document.getElementById("showPortfolio").classList.add("active-button");
document.getElementById("navText").textContent = "Portfolio";
