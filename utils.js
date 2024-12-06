function generateUniqueId() {
    // Simple unique ID generator using current timestamp and a random number
    return 'id-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}


function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}


