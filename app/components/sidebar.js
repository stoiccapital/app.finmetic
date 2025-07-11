class Sidebar {
    constructor() {
        // Wait for sidebar element to be available
        this.waitForSidebar().then(() => {
            this.sidebar = document.querySelector('.sidebar');
            this.toggleButton = document.createElement('button');
            this.init();
            this.setupEventListeners();
            this.setActiveLink();
        });
    }

    async waitForSidebar() {
        return new Promise(resolve => {
            const checkSidebar = () => {
                if (document.querySelector('.sidebar')) {
                    resolve();
                } else {
                    setTimeout(checkSidebar, 100);
                }
            };
            checkSidebar();
        });
    }

    init() {
        // Create toggle button for mobile
        this.toggleButton.className = 'nav__toggle';
        this.toggleButton.setAttribute('aria-label', 'Toggle Sidebar');
        this.toggleButton.innerHTML = `
            <span class="nav__toggle-line"></span>
            <span class="nav__toggle-line"></span>
            <span class="nav__toggle-line"></span>
        `;
        document.body.appendChild(this.toggleButton);
    }

    setupEventListeners() {
        // Toggle sidebar on mobile
        this.toggleButton.addEventListener('click', () => {
            this.sidebar.classList.toggle('sidebar--active');
            this.toggleButton.classList.toggle('nav__toggle--active');
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 &&
                !this.sidebar.contains(e.target) &&
                !this.toggleButton.contains(e.target) &&
                this.sidebar.classList.contains('sidebar--active')) {
                this.sidebar.classList.remove('sidebar--active');
                this.toggleButton.classList.remove('nav__toggle--active');
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                this.sidebar.classList.remove('sidebar--active');
                this.toggleButton.classList.remove('nav__toggle--active');
            }
        });
    }

    setActiveLink() {
        const currentPath = window.location.pathname;
        const links = this.sidebar.querySelectorAll('.sidebar__link');
        
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (!href) return;

            // Normalize paths for comparison
            let linkPath = href.startsWith('/') ? href : '/app/' + href;
            // Remove trailing slash for consistency
            linkPath = linkPath.replace(/\/$/, '');
            const normalizedCurrentPath = currentPath.replace(/\/$/, '');

            // Check if current path starts with or matches the link path
            if (normalizedCurrentPath === linkPath || 
                normalizedCurrentPath.startsWith(linkPath + '/')) {
                link.classList.add('sidebar__link--active');
                // Ensure parent menu items are also highlighted if needed
                const parentMenuItem = link.closest('.sidebar__menu-item');
                if (parentMenuItem) {
                    parentMenuItem.classList.add('sidebar__menu-item--active');
                }
            }
        });
    }
}

// Initialize sidebar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Sidebar();
}); 