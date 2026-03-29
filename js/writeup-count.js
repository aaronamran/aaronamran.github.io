// Writeup counts - update these numbers when adding new content
const writeupCounts = {
	vulnerabilityDisclosures: 9,
	ctfChallenges: {
		hackviser: 26,
		hackthebox: 0,
		overthewire: 1,
		k8slanparty: 0,
		redtigershackit: 0,
		underthewire: 0
	}
};

// Calculate total CTF challenges
function getTotalCTFChallenges() {
	return Object.values(writeupCounts.ctfChallenges).reduce((sum, count) => sum + count, 0);
}

// Update the DOM when page loads
function updateWriteupCounts() {
	const vulnCountElement = document.getElementById('vuln-count');
	const ctfCountElement = document.getElementById('ctf-count');
	
	if (vulnCountElement) {
		vulnCountElement.textContent = writeupCounts.vulnerabilityDisclosures;
	}
	
	if (ctfCountElement) {
		ctfCountElement.textContent = getTotalCTFChallenges();
	}
}

// Run when DOM is ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', updateWriteupCounts);
} else {
	updateWriteupCounts();
}
