// Function to check and update the URL and reload the page if needed
function updateURL () {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);

  // Check if the 'temporary-chat' parameter is not present
  if (!params.has('temporary-chat')) {
    // Add the 'temporary-chat=true' parameter
    params.append('temporary-chat', 'true');
    // Update the URL including the path and parameters
    window.location.href = `${url.origin}${url.pathname}?${params}`;
  }
}

// Update the URL when the script is loaded
updateURL();

// Handle the 'New chat' button specifically
function handleButtonClick () {
  setTimeout(updateURL, 2);
}

// Observe changes in the document to reattach event listeners to new buttons
const observer = new MutationObserver(() => {
  document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', handleButtonClick);
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
