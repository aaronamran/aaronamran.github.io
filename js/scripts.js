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
let currentCategory = "all";

// Helper: Highlight search term in a string (case-insensitive)
function highlightText(text, searchText) {
	if (!searchText) return text;
	// Escape regex special chars in searchText
	const escaped = searchText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const regex = new RegExp(escaped, "gi");
	return text.replace(regex, (match) => `<mark>${match}</mark>`);
}

function filterProjects(category, searchText = "") {
	currentCategory = category || currentCategory;
	searchText = searchText.toLowerCase();

	const cards = document.getElementsByClassName("project-card");
	for (let i = 0; i < cards.length; i++) {
		const card = cards[i];
		// Category filter
		const matchesCategory =
			currentCategory === "all" || card.className.indexOf(currentCategory) > -1;

		// Get elements
		const titleElem = card.querySelector("h3");
		const descElem = card.querySelector("div.project-info > div:last-child");
		const subheadingElem = card.querySelector(".subheading");

		// Get text
		const title = titleElem?.textContent || "";
		const desc = descElem?.textContent || "";
		const subheading = subheadingElem?.textContent || "";

		// Search filter
		const matchesSearch =
			title.toLowerCase().includes(searchText) ||
			desc.toLowerCase().includes(searchText) ||
			subheading.toLowerCase().includes(searchText);

		if (matchesCategory && matchesSearch) {
			addClass(card, "show");
			// Highlight matches
			if (searchText) {
				if (titleElem) titleElem.innerHTML = highlightText(title, searchText);
				if (descElem) descElem.innerHTML = highlightText(desc, searchText);
				if (subheadingElem)
					subheadingElem.innerHTML = highlightText(subheading, searchText);
			} else {
				// Remove highlights (reset to original text)
				if (titleElem) titleElem.innerHTML = title;
				if (descElem) descElem.innerHTML = desc;
				if (subheadingElem) subheadingElem.innerHTML = subheading;
			}
		} else {
			removeClass(card, "show");
			// Remove highlights if card is hidden
			if (titleElem) titleElem.innerHTML = title;
			if (descElem) descElem.innerHTML = desc;
			if (subheadingElem) subheadingElem.innerHTML = subheading;
		}
	}

	// Change quote text based on category
	// const quote = document.getElementById("quoteText");
	// if (!quote) return;
	// if (category === "cybersecurity") {
	// 	quote.textContent =
	// 		"Cybersecurity = Offensive Security x Defensive Security x Malware Analysis";
	// } else if (category === "information-technology") {
	// 	quote.textContent =
	// 		"Information Technology = System Administration x Networking x Cloud Computing";
	// } else if (category === "computer-science") {
	// 	quote.textContent =
	// 		"Computer Science = Operating Systems x Data Structures & Algorithms x Software Engineering";
	// } else if (category === "machine-learning") {
	// 	quote.textContent =
	// 		"Machine Learning = Core Models x Applied ML x Autonomous Agents";
	// } else if (category === "electronics") {
	// 	quote.textContent =
	// 		"Electronics = PCB & Circuit Design x Microcontrollers x Robotics";
	// } else {
	// 	quote.textContent =
	// 		"Homelab Projects = Building x Connecting x Breaking x Troubleshooting x Understanding";
	// }
}

// Listen for radio button changes
document.addEventListener("DOMContentLoaded", function () {
	// Initial filter
	filterProjects("all", "");

	// Radio buttons
	const radios = document.querySelectorAll(
		'#radioButtonContainer input[type="radio"]'
	);
	radios.forEach((radio) => {
		radio.addEventListener("change", function () {
			const searchText = document.getElementById("project-search").value || "";
			filterProjects(this.value, searchText);
		});
	});

	// Search input
	const searchInput = document.getElementById("project-search");
	if (searchInput) {
		searchInput.addEventListener("input", function () {
			filterProjects(currentCategory, this.value);
			// Show/hide clear button
			document.getElementById("clear-search").style.display = this.value
				? "block"
				: "none";
		});
	}

	// Clear button
	const clearBtn = document.getElementById("clear-search");
	if (clearBtn && searchInput) {
		clearBtn.addEventListener("click", function () {
			searchInput.value = "";
			filterProjects(currentCategory, "");
			searchInput.focus();
			clearBtn.style.display = "none";
		});
		// Hide clear button initially
		clearBtn.style.display = "none";
	}
});

// Show filtered elements
function addClass(element, name) {
	var i, arr1, arr2;
	arr1 = element.className.split(" ");
	arr2 = name.split(" ");
	for (i = 0; i < arr2.length; i++) {
		if (arr1.indexOf(arr2[i]) == -1) {
			element.className += " " + arr2[i];
		}
	}
}

// Hide elements that are not selected
function removeClass(element, name) {
	var i, arr1, arr2;
	arr1 = element.className.split(" ");
	arr2 = name.split(" ");
	for (i = 0; i < arr2.length; i++) {
		while (arr1.indexOf(arr2[i]) > -1) {
			arr1.splice(arr1.indexOf(arr2[i]), 1);
		}
	}
	element.className = arr1.join(" ");
}

// Add active class to the current control button (highlight it)
var btnContainer = document.getElementById("radioButtonContainer");
if (btnContainer) {
	var btns = btnContainer.getElementsByClassName("btn");
	for (var i = 0; i < btns.length; i++) {
		btns[i].addEventListener("click", function () {
			var current = document.getElementsByClassName("active");
			if (current && current[0]) {
				current[0].className = current[0].className.replace(" active", "");
			}
			this.className += " active";
		});
	}
}

// Copy-to-clipboard for the Google dork code block
function initDorkCopy() {
	const btn = document.getElementById('copyDorkBtn');
	const code = document.getElementById('dorkCode');
	if (!btn || !code) return;

	// Avoid attaching multiple handlers
	if (btn._dorkInitialized) return;
	btn._dorkInitialized = true;

	const originalText = btn.textContent;
	const originalClass = btn.className;

	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(code.textContent.trim());
		} catch (e) {
			// fallback
			const ta = document.createElement('textarea');
			ta.value = code.textContent.trim();
			document.body.appendChild(ta);
			ta.select();
			try {
				document.execCommand('copy');
			} catch (err) {}
			ta.remove();
		}

		// Update button text/state instead of showing separate indicator
		btn.textContent = 'Copied!';
		btn.className = originalClass + ' btn-success';

		// Revert after 5 seconds
		setTimeout(() => {
			btn.textContent = originalText;
			btn.className = originalClass;
		}, 5000);
	}

	btn.addEventListener('click', handleCopy);
}

// Run on initial page load
document.addEventListener('DOMContentLoaded', function () {
	initDorkCopy();
});

// Expose for SPA loader to call after injecting article content
window.initDorkCopy = initDorkCopy;