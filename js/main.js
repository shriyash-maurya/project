// GrowLoop Student Platform - Main JavaScript

// Global state management
let currentUser = null;
let currentTheme = 'purple';
let marketplaceItems = JSON.parse(localStorage.getItem('marketplaceItems')) || [];
let courses = JSON.parse(localStorage.getItem('courses')) || [];
let events = JSON.parse(localStorage.getItem('events')) || [];
let campusAnnouncements = JSON.parse(localStorage.getItem('campusAnnouncements')) || [];

class GrowLoop {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'home';
        this.currentTheme = 'purple';
        this.pages = {};
        this.adminData = {
            courses: [],
            events: [],
            marketplaceItems: [],
            users: []
        };
        this.init();
    }

    init() {
        this.loadTheme();
        this.checkAuth();
        this.bindEvents();
        this.loadPage('home');
        this.initChatBot();
        this.loadAdminData();
        this.initializeMarketplace();
    }

    // Theme Management
    loadTheme() {
        const savedTheme = localStorage.getItem('growloop_theme') || 'purple';
        this.setTheme(savedTheme);
    }

    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('growloop_theme', theme);
        
        // Update theme-dependent elements
        this.updateThemeElements();
        
        // Update body classes for proper theming
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        document.body.classList.add(`theme-${theme}`);
    }

    updateThemeElements() {
        // Update any theme-dependent styling that can't be handled by CSS variables
        const themeColors = {
            purple: { primary: '#7c3aed', secondary: '#3b82f6' },
            dark: { primary: '#8b5cf6', secondary: '#60a5fa' },
            light: { primary: '#6b7280', secondary: '#9ca3af' },
            blue: { primary: '#2563eb', secondary: '#3b82f6' },
            green: { primary: '#059669', secondary: '#10b981' }
        };
        
        const colors = themeColors[this.currentTheme];
        // Apply any JavaScript-dependent theme changes here
    }

    // Authentication Methods
    checkAuth() {
        const user = localStorage.getItem('growloop_user');
        if (user) {
            this.currentUser = JSON.parse(user);
            this.updateAuthUI();
            
            // Check if user is admin (for demo, admin email is admin@growloop.com)
            if (this.currentUser.email === 'admin@growloop.com') {
                this.currentUser.isAdmin = true;
                localStorage.setItem('growloop_user', JSON.stringify(this.currentUser));
                this.updateAuthUI();
            }
        }
    }

    showAuthModal(mode = 'login') {
        const modal = document.getElementById('authModal');
        const modalTitle = document.getElementById('modalTitle');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');

        modalTitle.textContent = mode === 'login' ? 'Sign In' : 'Sign Up';
        loginForm.classList.toggle('hidden', mode !== 'login');
        registerForm.classList.toggle('hidden', mode !== 'register');

        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.querySelector('.modal-content').classList.add('scale-100', 'opacity-100');
            modal.querySelector('.modal-content').classList.remove('scale-95', 'opacity-0');
        }, 10);
    }

    hideAuthModal() {
        const modal = document.getElementById('authModal');
        const modalContent = modal.querySelector('.modal-content');
        
        modalContent.classList.add('scale-95', 'opacity-0');
        modalContent.classList.remove('scale-100', 'opacity-100');
        
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    }

    login(email, password) {
        // Simulate authentication
        const user = {
            name: email.split('@')[0],
            email: email,
            id: Date.now(),
            joinDate: new Date().toISOString()
        };
        
        // Check if admin
        if (email === 'admin@growloop.com') {
            user.isAdmin = true;
        }
        
        localStorage.setItem('growloop_user', JSON.stringify(user));
        this.currentUser = user;
        this.updateAuthUI();
        this.hideAuthModal();
        this.showNotification('Welcome back!', 'success');
    }

    register(name, email, password) {
        // Simulate registration
        const user = {
            name: name,
            email: email,
            id: Date.now(),
            joinDate: new Date().toISOString()
        };
        
        // Check if admin
        if (email === 'admin@growloop.com') {
            user.isAdmin = true;
        }
        
        localStorage.setItem('growloop_user', JSON.stringify(user));
        this.currentUser = user;
        this.updateAuthUI();
        this.hideAuthModal();
        this.showNotification('Account created successfully!', 'success');
    }

    logout() {
        localStorage.removeItem('growloop_user');
        this.currentUser = null;
        this.updateAuthUI();
        this.showNotification('Logged out successfully', 'info');
    }

    updateAuthUI() {
        const loginBtn = document.getElementById('loginBtn');
        const mobileLoginBtn = document.getElementById('mobileLoginBtn');
        const userMenu = document.getElementById('userMenu');
        const userName = document.getElementById('userName');
        const adminBtn = document.getElementById('adminBtn');

        if (this.currentUser) {
            loginBtn.classList.add('hidden');
            mobileLoginBtn.classList.add('hidden');
            userMenu.classList.remove('hidden');
            userMenu.classList.add('flex');
            userName.textContent = this.currentUser.name;
            
            // Show admin button if user is admin
            if (this.currentUser.isAdmin) {
                adminBtn.classList.remove('hidden');
            } else {
                adminBtn.classList.add('hidden');
            }
        } else {
            loginBtn.classList.remove('hidden');
            mobileLoginBtn.classList.remove('hidden');
            userMenu.classList.add('hidden');
            userMenu.classList.remove('flex');
            adminBtn.classList.add('hidden');
        }
    }

    // Navigation Methods
    loadPage(pageName) {
        this.currentPage = pageName;
        const pageContent = document.getElementById('pageContent');
        
        // Add transition effect
        pageContent.style.opacity = '0';
        pageContent.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            pageContent.innerHTML = this.getPageContent(pageName);
            pageContent.style.opacity = '1';
            pageContent.style.transform = 'translateY(0)';
            pageContent.style.transition = 'all 0.4s ease-out';
            
            // Update active navigation
            this.updateActiveNav(pageName);
            
            // Initialize page-specific functionality
            this.initPageFeatures(pageName);
        }, 200);
    }

    updateActiveNav(pageName) {
        document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === pageName) {
                link.classList.add('active');
            }
        });
    }

    getPageContent(pageName) {
        const pages = {
            home: this.getHomePage(),
            skill_hub: this.getSkillHubPage(),
            career: this.getCareerPage(),
            store: this.getStorePage(),
            journey: this.getJourneyPage(),
            campus: this.getCampusPage(),
            marketplace: this.getMarketplacePage(),
            events: this.getEventsPage()
        };
        
        return pages[pageName] || pages.home;
    }

    // Page Content Methods
    getHomePage() {
        return `
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <!-- Hero Section -->
                <div class="text-center mb-12">
                    <h1 class="text-4xl md:text-6xl font-bold mb-6">
                        <span class="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            Grow Your Future
                        </span>
                    </h1>
                    <p class="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                        Join thousands of students on their journey to success. Learn, grow, and achieve your dreams with GrowLoop.
                    </p>
                    <div class="flex flex-col sm:flex-row gap-4 justify-center">
                        <button class="btn-primary text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300">
                            Start Learning
                        </button>
                        <button class="border-2 border-purple-600 text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-all duration-300">
                            Explore Campus
                        </button>
                    </div>
                </div>

                <!-- Quick Stats -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                    <div class="card-bg rounded-lg p-6 text-center card-hover shadow-md">
                        <div class="text-3xl font-bold text-purple-600 mb-2">25K+</div>
                        <div class="text-gray-600">Active Students</div>
                    </div>
                    <div class="card-bg rounded-lg p-6 text-center card-hover shadow-md">
                        <div class="text-3xl font-bold text-blue-600 mb-2">1.2K+</div>
                        <div class="text-gray-600">Courses Available</div>
                    </div>
                    <div class="card-bg rounded-lg p-6 text-center card-hover shadow-md">
                        <div class="text-3xl font-bold text-green-600 mb-2">500+</div>
                        <div class="text-gray-600">Campus Events</div>
                    </div>
                    <div class="card-bg rounded-lg p-6 text-center card-hover shadow-md">
                        <div class="text-3xl font-bold text-orange-600 mb-2">24/7</div>
                        <div class="text-gray-600">AI Support</div>
                    </div>
                </div>

                <!-- Recent Activity -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    <div class="card-bg rounded-xl p-6 shadow-md">
                        <h2 class="text-xl font-semibold mb-4">Latest Campus News</h2>
                        <div class="space-y-4">
                            <div class="flex items-start space-x-3">
                                <div class="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                                <div>
                                    <h3 class="font-medium">New AI Lab Opening</h3>
                                    <p class="text-sm text-gray-600">State-of-the-art facility for machine learning research</p>
                                    <span class="text-xs text-gray-500">2 hours ago</span>
                                </div>
                            </div>
                            <div class="flex items-start space-x-3">
                                <div class="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                                <div>
                                    <h3 class="font-medium">Tech Career Fair</h3>
                                    <p class="text-sm text-gray-600">Meet top employers this Friday</p>
                                    <span class="text-xs text-gray-500">1 day ago</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card-bg rounded-xl p-6 shadow-md">
                        <h2 class="text-xl font-semibold mb-4">Trending Marketplace</h2>
                        <div class="space-y-4">
                            <div class="flex items-center justify-between">
                                <div>
                                    <h3 class="font-medium">MacBook Pro M3</h3>
                                    <p class="text-sm text-gray-600">Excellent condition</p>
                                </div>
                                <span class="text-purple-600 font-semibold">$1,200</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <div>
                                    <h3 class="font-medium">Calculus Textbook</h3>
                                    <p class="text-sm text-gray-600">Latest edition</p>
                                </div>
                                <span class="text-purple-600 font-semibold">$45</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Features Grid -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div class="card-bg rounded-xl p-6 card-hover shadow-md">
                        <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold mb-2">Smart Learning</h3>
                        <p class="text-gray-600">AI-powered personalized learning paths that adapt to your pace and style.</p>
                    </div>
                    
                    <div class="card-bg rounded-xl p-6 card-hover shadow-md">
                        <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold mb-2">Campus Community</h3>
                        <p class="text-gray-600">Connect with peers, join clubs, and participate in campus events.</p>
                    </div>
                    
                    <div class="card-bg rounded-xl p-6 card-hover shadow-md">
                        <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold mb-2">Student Marketplace</h3>
                        <p class="text-gray-600">Buy, sell, and trade textbooks, electronics, and more with fellow students.</p>
                    </div>
                </div>
            </div>
        `;
    }

    getCampusPage() {
        return `
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div class="mb-8">
                    <h1 class="text-3xl font-bold text-gray-900 mb-4">Campus Life</h1>
                    <p class="text-gray-600">Discover events, clubs, and opportunities on campus</p>
                </div>

                <!-- Campus Stats -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div class="card-bg rounded-lg p-6 text-center shadow-md">
                        <div class="text-2xl font-bold text-purple-600 mb-2">150+</div>
                        <div class="text-gray-600">Student Clubs</div>
                    </div>
                    <div class="card-bg rounded-lg p-6 text-center shadow-md">
                        <div class="text-2xl font-bold text-blue-600 mb-2">50+</div>
                        <div class="text-gray-600">Weekly Events</div>
                    </div>
                    <div class="card-bg rounded-lg p-6 text-center shadow-md">
                        <div class="text-2xl font-bold text-green-600 mb-2">25</div>
                        <div class="text-gray-600">Campus Facilities</div>
                    </div>
                    <div class="card-bg rounded-lg p-6 text-center shadow-md">
                        <div class="text-2xl font-bold text-orange-600 mb-2">12</div>
                        <div class="text-gray-600">Sports Teams</div>
                    </div>
                </div>

                <!-- Featured Clubs -->
                <div class="mb-8">
                    <h2 class="text-2xl font-semibold mb-6">Featured Clubs</h2>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="card-bg rounded-xl p-6 card-hover shadow-md">
                            <div class="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                                <span class="text-white font-bold text-xl">CS</span>
                            </div>
                            <h3 class="font-semibold text-lg mb-2">Computer Science Club</h3>
                            <p class="text-gray-600 text-sm mb-4">Join fellow programmers for hackathons, workshops, and tech talks</p>
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-500">450 members</span>
                                <button class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200 text-sm">
                                    Join Club
                                </button>
                            </div>
                        </div>

                        <div class="card-bg rounded-xl p-6 card-hover shadow-md">
                            <div class="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                                <span class="text-white font-bold text-xl">🎨</span>
                            </div>
                            <h3 class="font-semibold text-lg mb-2">Art & Design Society</h3>
                            <p class="text-gray-600 text-sm mb-4">Express your creativity through various art forms and exhibitions</p>
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-500">280 members</span>
                                <button class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200 text-sm">
                                    Join Club
                                </button>
                            </div>
                        </div>

                        <div class="card-bg rounded-xl p-6 card-hover shadow-md">
                            <div class="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center mb-4">
                                <span class="text-white font-bold text-xl">🌱</span>
                            </div>
                            <h3 class="font-semibold text-lg mb-2">Environmental Club</h3>
                            <p class="text-gray-600 text-sm mb-4">Make a difference through sustainability initiatives and awareness</p>
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-500">320 members</span>
                                <button class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200 text-sm">
                                    Join Club
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Campus Facilities -->
                <div class="card-bg rounded-xl p-6 shadow-md">
                    <h2 class="text-xl font-semibold mb-4">Campus Facilities</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div class="flex items-center p-3 bg-gray-50 rounded-lg">
                            <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                                <span class="text-purple-600">📚</span>
                            </div>
                            <div>
                                <h3 class="font-medium">Central Library</h3>
                                <p class="text-sm text-gray-600">24/7 study spaces</p>
                            </div>
                        </div>
                        <div class="flex items-center p-3 bg-gray-50 rounded-lg">
                            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                <span class="text-blue-600">🏋️</span>
                            </div>
                            <div>
                                <h3 class="font-medium">Fitness Center</h3>
                                <p class="text-sm text-gray-600">Modern equipment</p>
                            </div>
                        </div>
                        <div class="flex items-center p-3 bg-gray-50 rounded-lg">
                            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                <span class="text-green-600">🍽️</span>
                            </div>
                            <div>
                                <h3 class="font-medium">Dining Halls</h3>
                                <p class="text-sm text-gray-600">Multiple cuisines</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getMarketplacePage() {
        return `
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div class="flex justify-between items-center mb-8">
                    <h1 class="text-3xl font-bold text-gray-900 mb-4">Student Marketplace</h1>
                    <div class="flex space-x-4">
                        <button id="buyerModeBtn" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                            Buyer Mode
                        </button>
                        <button id="sellerModeBtn" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200">
                            Seller Mode
                        </button>
                    </div>
                </div>
                
                <!-- Marketplace Mode Selection -->
                <div id="marketplaceModeSelection" class="text-center py-12">
                    <h2 class="text-2xl font-bold mb-6">Choose Your Mode</h2>
                    <div class="flex justify-center space-x-8">
                        <div class="bg-white rounded-xl p-8 shadow-md cursor-pointer hover:shadow-lg transition-all duration-200" onclick="setMarketplaceMode('buyer')">
                            <div class="text-4xl mb-4">🛒</div>
                            <h3 class="text-xl font-semibold mb-2">Buyer</h3>
                            <p class="text-gray-600">Browse and buy items from other students</p>
                        </div>
                        <div class="bg-white rounded-xl p-8 shadow-md cursor-pointer hover:shadow-lg transition-all duration-200" onclick="setMarketplaceMode('seller')">
                            <div class="text-4xl mb-4">💼</div>
                            <h3 class="text-xl font-semibold mb-2">Seller</h3>
                            <p class="text-gray-600">List your items for sale</p>
                        </div>
                    </div>
                </div>
                
                <!-- Buyer Mode -->
                <div id="buyerMode" class="hidden">
                    <div class="mb-6">
                        <input type="text" id="searchMarketplace" placeholder="Search items..." class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent">
                    </div>
                    <div id="marketplaceGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <!-- Items will be loaded here -->
                    </div>
                </div>
                
                <!-- Seller Mode -->
                <div id="sellerMode" class="hidden">
                    <div class="bg-white rounded-xl p-6 shadow-md mb-6">
                        <h2 class="text-xl font-semibold mb-4">List New Item</h2>
                        <form id="sellItemForm" class="space-y-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium mb-2">Item Name</label>
                                    <input type="text" id="itemName" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-2">Price (₹)</label>
                                    <input type="number" id="itemPrice" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent">
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-2">Description</label>
                                <textarea id="itemDescription" rows="3" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"></textarea>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium mb-2">Category</label>
                                    <select id="itemCategory" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent">
                                        <option value="">Select Category</option>
                                        <option value="textbooks">Textbooks</option>
                                        <option value="electronics">Electronics</option>
                                        <option value="furniture">Furniture</option>
                                        <option value="clothing">Clothing</option>
                                        <option value="sports">Sports Equipment</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-2">Condition</label>
                                    <select id="itemCondition" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent">
                                        <option value="">Select Condition</option>
                                        <option value="new">New</option>
                                        <option value="like-new">Like New</option>
                                        <option value="good">Good</option>
                                        <option value="fair">Fair</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-2">Image URL</label>
                                <input type="url" id="itemImage" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent">
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium mb-2">Your Name</label>
                                    <input type="text" id="sellerName" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-2">Mobile Number</label>
                                    <div class="flex">
                                        <span class="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-lg">+91</span>
                                        <input type="tel" id="sellerMobile" pattern="[0-9]{10}" required class="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent">
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-2">Location</label>
                                <input type="text" id="sellerLocation" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent">
                            </div>
                            <button type="submit" class="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium">
                                List Item for Sale
                            </button>
                        </form>
                    </div>
                    
                    <div class="bg-white rounded-xl p-6 shadow-md">
                        <h2 class="text-xl font-semibold mb-4">Your Listed Items</h2>
                        <div id="sellerItems" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <!-- Seller's items will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getEventsPage() {
        return `
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div class="flex justify-between items-center mb-8">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900 mb-4">Campus Events</h1>
                        <p class="text-gray-600">Discover and join exciting events happening on campus</p>
                    </div>
                    ${this.currentUser && this.currentUser.isAdmin ? `
                    <button id="addEvent" class="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium">
                        + Create Event
                    </button>
                    ` : ''}
                </div>

                <!-- Event Categories -->
                <div class="flex flex-wrap gap-4 mb-8">
                    <button class="event-category active bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200">
                        All Events
                    </button>
                    <button class="event-category bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200">
                        Academic
                    </button>
                    <button class="event-category bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200">
                        Social
                    </button>
                    <button class="event-category bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200">
                        Sports
                    </button>
                    <button class="event-category bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200">
                        Career
                    </button>
                </div>

                <!-- Upcoming Events -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div class="space-y-6">
                        <h2 class="text-xl font-semibold">This Week</h2>
                        
                        <div class="event-card rounded-xl p-6 shadow-md">
                            <div class="flex items-start justify-between mb-4">
                                <div class="flex items-center space-x-4">
                                    <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <span class="text-purple-600 font-bold">15</span>
                                    </div>
                                    <div>
                                        <h3 class="font-semibold text-lg">Tech Career Fair</h3>
                                        <p class="text-gray-600 text-sm">Friday, 2:00 PM - 6:00 PM</p>
                                    </div>
                                </div>
                                <span class="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">Career</span>
                            </div>
                            <p class="text-gray-600 mb-4">Meet representatives from top tech companies including Google, Microsoft, and Apple. Bring your resume!</p>
                            <div class="flex items-center justify-between">
                                <div class="flex items-center text-sm text-gray-500">
                                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    </svg>
                                    Student Center
                                </div>
                                <button class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200 text-sm">
                                    Register
                                </button>
                            </div>
                        </div>

                        <div class="event-card rounded-xl p-6 shadow-md">
                            <div class="flex items-start justify-between mb-4">
                                <div class="flex items-center space-x-4">
                                    <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <span class="text-blue-600 font-bold">17</span>
                                    </div>
                                    <div>
                                        <h3 class="font-semibold text-lg">Hackathon 2024</h3>
                                        <p class="text-gray-600 text-sm">Sunday, 9:00 AM - 9:00 PM</p>
                                    </div>
                                </div>
                                <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Academic</span>
                            </div>
                            <p class="text-gray-600 mb-4">24-hour coding competition with amazing prizes. Form teams of up to 4 members.</p>
                            <div class="flex items-center justify-between">
                                <div class="flex items-center text-sm text-gray-500">
                                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    </svg>
                                    Engineering Building
                                </div>
                                <button class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200 text-sm">
                                    Register
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="space-y-6">
                        <h2 class="text-xl font-semibold">Next Week</h2>
                        
                        <div class="event-card rounded-xl p-6 shadow-md">
                            <div class="flex items-start justify-between mb-4">
                                <div class="flex items-center space-x-4">
                                    <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                        <span class="text-green-600 font-bold">22</span>
                                    </div>
                                    <div>
                                        <h3 class="font-semibold text-lg">Spring Festival</h3>
                                        <p class="text-gray-600 text-sm">Friday, 6:00 PM - 11:00 PM</p>
                                    </div>
                                </div>
                                <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Social</span>
                            </div>
                            <p class="text-gray-600 mb-4">Celebrate spring with live music, food trucks, and fun activities for all students.</p>
                            <div class="flex items-center justify-between">
                                <div class="flex items-center text-sm text-gray-500">
                                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    </svg>
                                    Campus Quad
                                </div>
                                <button class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200 text-sm">
                                    Register
                                </button>
                            </div>
                        </div>

                        <div class="event-card rounded-xl p-6 shadow-md">
                            <div class="flex items-start justify-between mb-4">
                                <div class="flex items-center space-x-4">
                                    <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <span class="text-orange-600 font-bold">25</span>
                                    </div>
                                    <div>
                                        <h3 class="font-semibold text-lg">Basketball Championship</h3>
                                        <p class="text-gray-600 text-sm">Monday, 7:00 PM - 9:00 PM</p>
                                    </div>
                                </div>
                                <span class="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">Sports</span>
                            </div>
                            <p class="text-gray-600 mb-4">Cheer for our team in the final championship game. Free entry for all students!</p>
                            <div class="flex items-center justify-between">
                                <div class="flex items-center text-sm text-gray-500">
                                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    </svg>
                                    Sports Arena
                                </div>
                                <button class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200 text-sm">
                                    Get Tickets
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getSkillHubPage() {
        return `
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div class="mb-8">
                    <h1 class="text-3xl font-bold text-gray-900 mb-4">Skill Hub</h1>
                    <p class="text-gray-600">Track your progress and develop new skills</p>
                </div>

                <!-- Progress Overview -->
                <div class="card-bg rounded-xl p-6 mb-8 shadow-md">
                    <h2 class="text-xl font-semibold mb-4">Your Progress</h2>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <div class="flex justify-between mb-2">
                                <span class="text-sm font-medium">JavaScript</span>
                                <span class="text-sm text-gray-500">75%</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div class="progress-bar h-2 rounded-full" style="width: 75%"></div>
                            </div>
                        </div>
                        <div>
                            <div class="flex justify-between mb-2">
                                <span class="text-sm font-medium">React</span>
                                <span class="text-sm text-gray-500">60%</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div class="progress-bar h-2 rounded-full" style="width: 60%"></div>
                            </div>
                        </div>
                        <div>
                            <div class="flex justify-between mb-2">
                                <span class="text-sm font-medium">Python</span>
                                <span class="text-sm text-gray-500">40%</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div class="progress-bar h-2 rounded-full" style="width: 40%"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Skill Categories -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div class="card-bg rounded-xl p-6 card-hover shadow-md">
                        <div class="flex items-center mb-4">
                            <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <span class="text-yellow-600 font-bold">JS</span>
                            </div>
                            <div class="ml-3">
                                <h3 class="font-semibold">JavaScript Fundamentals</h3>
                                <p class="text-sm text-gray-500">12 lessons • 4 hours</p>
                            </div>
                        </div>
                        <p class="text-gray-600 text-sm mb-4">Master the basics of JavaScript programming</p>
                        <button class="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200">
                            Continue Learning
                        </button>
                    </div>

                    <div class="card-bg rounded-xl p-6 card-hover shadow-md">
                        <div class="flex items-center mb-4">
                            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span class="text-blue-600 font-bold">R</span>
                            </div>
                            <div class="ml-3">
                                <h3 class="font-semibold">React Development</h3>
                                <p class="text-sm text-gray-500">18 lessons • 6 hours</p>
                            </div>
                        </div>
                        <p class="text-gray-600 text-sm mb-4">Build modern web applications with React</p>
                        <button class="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200">
                            Start Course
                        </button>
                    </div>

                    <div class="card-bg rounded-xl p-6 card-hover shadow-md">
                        <div class="flex items-center mb-4">
                            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <span class="text-green-600 font-bold">PY</span>
                            </div>
                            <div class="ml-3">
                                <h3 class="font-semibold">Python for Beginners</h3>
                                <p class="text-sm text-gray-500">15 lessons • 5 hours</p>
                            </div>
                        </div>
                        <p class="text-gray-600 text-sm mb-4">Learn Python programming from scratch</p>
                        <button class="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200">
                            Start Course
                        </button>
                    </div>
                </div>

                <!-- Achievements -->
                <div class="mt-8 card-bg rounded-xl p-6 shadow-md">
                    <h2 class="text-xl font-semibold mb-4">Recent Achievements</h2>
                    <div class="flex flex-wrap gap-4">
                        <div class="flex items-center bg-yellow-50 px-4 py-2 rounded-full">
                            <div class="achievement-badge mr-2">🏆</div>
                            <span class="text-sm font-medium">First Course Completed</span>
                        </div>
                        <div class="flex items-center bg-blue-50 px-4 py-2 rounded-full">
                            <div class="achievement-badge mr-2">⭐</div>
                            <span class="text-sm font-medium">7-Day Streak</span>
                        </div>
                        <div class="flex items-center bg-green-50 px-4 py-2 rounded-full">
                            <div class="achievement-badge mr-2">🎯</div>
                            <span class="text-sm font-medium">Quiz Master</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getCareerPage() {
        return `
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div class="mb-8">
                    <h1 class="text-3xl font-bold text-gray-900 mb-4">Career Center</h1>
                    <p class="text-gray-600">Explore opportunities and plan your career path</p>
                </div>

                <!-- Career Path Recommendations -->
                <div class="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white mb-8">
                    <h2 class="text-2xl font-bold mb-4">Recommended for You</h2>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
                            <h3 class="font-semibold mb-2">Frontend Developer</h3>
                            <p class="text-sm opacity-90">Build amazing user interfaces</p>
                            <div class="mt-3 text-xs">Match: 95%</div>
                        </div>
                        <div class="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
                            <h3 class="font-semibold mb-2">Full Stack Developer</h3>
                            <p class="text-sm opacity-90">Master both frontend and backend</p>
                            <div class="mt-3 text-xs">Match: 88%</div>
                        </div>
                        <div class="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
                            <h3 class="font-semibold mb-2">UI/UX Designer</h3>
                            <p class="text-sm opacity-90">Create beautiful user experiences</p>
                            <div class="mt-3 text-xs">Match: 82%</div>
                        </div>
                    </div>
                </div>

                <!-- Job Listings -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                        <h2 class="text-xl font-semibold mb-4">Latest Opportunities</h2>
                        <div class="space-y-4">
                            <div class="card-bg rounded-lg p-6 card-hover shadow-md">
                                <div class="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 class="font-semibold text-lg">Junior Frontend Developer</h3>
                                        <p class="text-gray-600">TechCorp Inc.</p>
                                    </div>
                                    <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Entry Level</span>
                                </div>
                                <p class="text-gray-600 text-sm mb-4">Join our dynamic team and work on cutting-edge web applications...</p>
                                <div class="flex justify-between items-center">
                                    <span class="text-purple-600 font-semibold">$45,000 - $60,000</span>
                                    <button class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200 text-sm">
                                        Apply Now
                                    </button>
                                </div>
                            </div>

                            <div class="card-bg rounded-lg p-6 card-hover shadow-md">
                                <div class="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 class="font-semibold text-lg">React Developer Intern</h3>
                                        <p class="text-gray-600">StartupXYZ</p>
                                    </div>
                                    <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Internship</span>
                                </div>
                                <p class="text-gray-600 text-sm mb-4">Great opportunity to learn and grow with a fast-paced startup...</p>
                                <div class="flex justify-between items-center">
                                    <span class="text-purple-600 font-semibold">$20/hour</span>
                                    <button class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200 text-sm">
                                        Apply Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 class="text-xl font-semibold mb-4">Career Resources</h2>
                        <div class="space-y-4">
                            <div class="card-bg rounded-lg p-6 card-hover shadow-md">
                                <h3 class="font-semibold mb-2">Resume Builder</h3>
                                <p class="text-gray-600 text-sm mb-4">Create a professional resume with our AI-powered builder</p>
                                <button class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                                    Build Resume
                                </button>
                            </div>

                            <div class="card-bg rounded-lg p-6 card-hover shadow-md">
                                <h3 class="font-semibold mb-2">Interview Prep</h3>
                                <p class="text-gray-600 text-sm mb-4">Practice with AI mock interviews and get feedback</p>
                                <button class="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors duration-200">
                                    Start Practice
                                </button>
                            </div>

                            <div class="card-bg rounded-lg p-6 card-hover shadow-md">
                                <h3 class="font-semibold mb-2">Portfolio Reviews</h3>
                                <p class="text-gray-600 text-sm mb-4">Get your portfolio reviewed by industry experts</p>
                                <button class="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors duration-200">
                                    Get Review
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getStorePage() {
        return `
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div class="flex justify-between items-center mb-8">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900 mb-4">Student Store</h1>
                        <p class="text-gray-600">Premium courses and resources to accelerate your learning</p>
                    </div>
                    ${this.currentUser && this.currentUser.isAdmin ? `
                    <button id="addCourse" class="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium">
                        + Add Course
                    </button>
                    ` : ''}
                </div>

                <!-- Categories -->
                <div class="flex flex-wrap gap-4 mb-8">
                    <button class="store-category active bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200">
                        All Courses
                    </button>
                    <button class="store-category bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200">
                        Programming
                    </button>
                    <button class="store-category bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200">
                        Design
                    </button>
                    <button class="store-category bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200">
                        Business
                    </button>
                </div>

                <!-- Course Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="courseGrid">
                    <div class="card-bg rounded-xl overflow-hidden shadow-md card-hover">
                        <div class="h-48 bg-gradient-to-br from-purple-400 to-purple-600"></div>
                        <div class="p-6">
                            <div class="flex justify-between items-start mb-2">
                                <h3 class="font-semibold text-lg">Advanced React Patterns</h3>
                                <span class="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Premium</span>
                            </div>
                            <p class="text-gray-600 text-sm mb-4">Master advanced React concepts and patterns used by top companies</p>
                            <div class="flex items-center justify-between">
                                <div>
                                    <span class="text-2xl font-bold text-purple-600">$49</span>
                                    <span class="text-gray-500 line-through ml-2">$99</span>
                                </div>
                                <button class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200 store-purchase" data-course="react-patterns" data-price="49">
                                    Enroll Now
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="card-bg rounded-xl overflow-hidden shadow-md card-hover">
                        <div class="h-48 bg-gradient-to-br from-blue-400 to-blue-600"></div>
                        <div class="p-6">
                            <div class="flex justify-between items-start mb-2">
                                <h3 class="font-semibold text-lg">Full Stack Development</h3>
                                <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Bestseller</span>
                            </div>
                            <p class="text-gray-600 text-sm mb-4">Complete guide to becoming a full stack developer</p>
                            <div class="flex items-center justify-between">
                                <div>
                                    <span class="text-2xl font-bold text-purple-600">$79</span>
                                    <span class="text-gray-500 line-through ml-2">$149</span>
                                </div>
                                <button class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200 store-purchase" data-course="fullstack" data-price="79">
                                    Enroll Now
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="card-bg rounded-xl overflow-hidden shadow-md card-hover">
                        <div class="h-48 bg-gradient-to-br from-green-400 to-green-600"></div>
                        <div class="p-6">
                            <div class="flex justify-between items-start mb-2">
                                <h3 class="font-semibold text-lg">UI/UX Design Mastery</h3>
                                <span class="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">New</span>
                            </div>
                            <p class="text-gray-600 text-sm mb-4">Learn to create stunning user interfaces and experiences</p>
                            <div class="flex items-center justify-between">
                                <div>
                                    <span class="text-2xl font-bold text-purple-600">$59</span>
                                    <span class="text-gray-500 line-through ml-2">$119</span>
                                </div>
                                <button class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200 store-purchase" data-course="ui-ux" data-price="59">
                                    Enroll Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- My Purchases -->
                ${this.currentUser ? `
                <div class="mt-12 card-bg rounded-xl p-6 shadow-md">
                    <h2 class="text-xl font-semibold mb-4">My Purchases</h2>
                    <div id="purchasedCourses" class="text-gray-500">
                        No courses purchased yet. Start learning today!
                    </div>
                </div>
                ` : ''}
            </div>
        `;
    }

    getJourneyPage() {
        return `
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div class="mb-8">
                    <h1 class="text-3xl font-bold text-gray-900 mb-4">Learning Journey</h1>
                    <p class="text-gray-600">Track your progress and celebrate milestones</p>
                </div>

                <!-- Progress Overview -->
                <div class="card-bg rounded-xl p-6 mb-8 shadow-md">
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div class="text-center">
                            <div class="text-3xl font-bold text-purple-600 mb-2">15</div>
                            <div class="text-gray-600">Days Active</div>
                        </div>
                        <div class="text-center">
                            <div class="text-3xl font-bold text-blue-600 mb-2">8</div>
                            <div class="text-gray-600">Courses Completed</div>
                        </div>
                        <div class="text-center">
                            <div class="text-3xl font-bold text-green-600 mb-2">45</div>
                            <div class="text-gray-600">Hours Learned</div>
                        </div>
                        <div class="text-center">
                            <div class="text-3xl font-bold text-orange-600 mb-2">12</div>
                            <div class="text-gray-600">Badges Earned</div>
                        </div>
                    </div>
                </div>

                <!-- Timeline -->
                <div class="card-bg rounded-xl p-6 shadow-md">
                    <h2 class="text-xl font-semibold mb-6">Recent Activity</h2>
                    <div class="space-y-6">
                        <div class="flex items-start">
                            <div class="flex-shrink-0 w-3 h-3 bg-purple-600 rounded-full mt-2"></div>
                            <div class="ml-4 flex-grow">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <h3 class="font-medium">Completed JavaScript Fundamentals</h3>
                                        <p class="text-gray-600 text-sm">Earned certificate and 100 XP points</p>
                                    </div>
                                    <span class="text-gray-500 text-sm">2 hours ago</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="flex items-start">
                            <div class="flex-shrink-0 w-3 h-3 bg-blue-600 rounded-full mt-2"></div>
                            <div class="ml-4 flex-grow">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <h3 class="font-medium">Started React Development Course</h3>
                                        <p class="text-gray-600 text-sm">Completed introduction and setup</p>
                                    </div>
                                    <span class="text-gray-500 text-sm">1 day ago</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="flex items-start">
                            <div class="flex-shrink-0 w-3 h-3 bg-green-600 rounded-full mt-2"></div>
                            <div class="ml-4 flex-grow">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <h3 class="font-medium">Earned "Quick Learner" Badge</h3>
                                        <p class="text-gray-600 text-sm">Completed 3 lessons in one day</p>
                                    </div>
                                    <span class="text-gray-500 text-sm">3 days ago</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="flex items-start">
                            <div class="flex-shrink-0 w-3 h-3 bg-yellow-600 rounded-full mt-2"></div>
                            <div class="ml-4 flex-grow">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <h3 class="font-medium">Joined GrowLoop Community</h3>
                                        <p class="text-gray-600 text-sm">Welcome to your learning journey!</p>
                                    </div>
                                    <span class="text-gray-500 text-sm">1 week ago</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Goals Section -->
                <div class="mt-8 card-bg rounded-xl p-6 shadow-md">
                    <h2 class="text-xl font-semibold mb-4">Learning Goals</h2>
                    <div class="space-y-4">
                        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <h3 class="font-medium">Complete React Course</h3>
                                <p class="text-gray-600 text-sm">Target: End of this month</p>
                            </div>
                            <div class="text-right">
                                <div class="text-sm text-gray-500 mb-1">Progress</div>
                                <div class="w-24 bg-gray-200 rounded-full h-2">
                                    <div class="progress-bar h-2 rounded-full" style="width: 60%"></div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <h3 class="font-medium">Build Portfolio Website</h3>
                                <p class="text-gray-600 text-sm">Target: Next month</p>
                            </div>
                            <div class="text-right">
                                <div class="text-sm text-gray-500 mb-1">Progress</div>
                                <div class="w-24 bg-gray-200 rounded-full h-2">
                                    <div class="progress-bar h-2 rounded-full" style="width: 25%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Admin Panel Methods
    loadAdminData() {
        // Load admin data from localStorage
        const savedData = localStorage.getItem('growloop_admin_data');
        if (savedData) {
            this.adminData = JSON.parse(savedData);
        }
    }

    saveAdminData() {
        localStorage.setItem('growloop_admin_data', JSON.stringify(this.adminData));
    }

    showAdminPanel() {
        if (!this.currentUser || !this.currentUser.isAdmin) {
            this.showNotification('Access denied. Admin privileges required.', 'error');
            return;
        }

        const modal = document.getElementById('adminModal');
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.querySelector('.modal-content').classList.add('scale-100', 'opacity-100');
            modal.querySelector('.modal-content').classList.remove('scale-95', 'opacity-0');
        }, 10);

        this.loadAdminTab('courses');
    }

    hideAdminPanel() {
        const modal = document.getElementById('adminModal');
        const modalContent = modal.querySelector('.modal-content');
        
        modalContent.classList.add('scale-95', 'opacity-0');
        modalContent.classList.remove('scale-100', 'opacity-100');
        
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    }

    loadAdminTab(tabName) {
        // Update active tab
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.classList.remove('active', 'border-purple-600', 'text-purple-600');
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active', 'border-purple-600', 'text-purple-600');
            }
        });

        const content = document.getElementById('adminContent');
        
        switch(tabName) {
            case 'courses':
                content.innerHTML = this.getAdminCoursesContent();
                break;
            case 'events':
                content.innerHTML = this.getAdminEventsContent();
                break;
            case 'marketplace':
                content.innerHTML = this.getAdminMarketplaceContent();
                break;
            case 'users':
                content.innerHTML = this.getAdminUsersContent();
                break;
            case 'analytics':
                content.innerHTML = this.getAdminAnalyticsContent();
                break;
        }
    }

    getAdminCoursesContent() {
        return `
            <div class="space-y-6">
                <div class="flex justify-between items-center">
                    <h3 class="text-lg font-semibold">Manage Courses</h3>
                    <button id="adminAddCourse" class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200">
                        + Add Course
                    </button>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr class="bg-gray-50">
                                <th class="border border-gray-300 px-4 py-2 text-left">Title</th>
                                <th class="border border-gray-300 px-4 py-2 text-left">Price</th>
                                <th class="border border-gray-300 px-4 py-2 text-left">Category</th>
                                <th class="border border-gray-300 px-4 py-2 text-left">Status</th>
                                <th class="border border-gray-300 px-4 py-2 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="border border-gray-300 px-4 py-2">Advanced React Patterns</td>
                                <td class="border border-gray-300 px-4 py-2">$49</td>
                                <td class="border border-gray-300 px-4 py-2">Programming</td>
                                <td class="border border-gray-300 px-4 py-2">
                                    <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Active</span>
                                </td>
                                <td class="border border-gray-300 px-4 py-2">
                                    <button class="text-blue-600 hover:text-blue-800 mr-2">Edit</button>
                                    <button class="text-red-600 hover:text-red-800">Delete</button>
                                </td>
                            </tr>
                            <tr>
                                <td class="border border-gray-300 px-4 py-2">Full Stack Development</td>
                                <td class="border border-gray-300 px-4 py-2">$79</td>
                                <td class="border border-gray-300 px-4 py-2">Programming</td>
                                <td class="border border-gray-300 px-4 py-2">
                                    <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Active</span>
                                </td>
                                <td class="border border-gray-300 px-4 py-2">
                                    <button class="text-blue-600 hover:text-blue-800 mr-2">Edit</button>
                                    <button class="text-red-600 hover:text-red-800">Delete</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    getAdminEventsContent() {
        return `
            <div class="space-y-6">
                <div class="flex justify-between items-center">
                    <h3 class="text-lg font-semibold">Manage Events</h3>
                    <button id="adminAddEvent" class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200">
                        + Add Event
                    </button>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="border border-gray-300 rounded-lg p-4">
                        <h4 class="font-semibold mb-2">Tech Career Fair</h4>
                        <p class="text-sm text-gray-600 mb-2">Friday, 2:00 PM - 6:00 PM</p>
                        <div class="flex justify-between items-center">
                            <span class="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">Career</span>
                            <div>
                                <button class="text-blue-600 hover:text-blue-800 mr-2 text-sm">Edit</button>
                                <button class="text-red-600 hover:text-red-800 text-sm">Delete</button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="border border-gray-300 rounded-lg p-4">
                        <h4 class="font-semibold mb-2">Hackathon 2024</h4>
                        <p class="text-sm text-gray-600 mb-2">Sunday, 9:00 AM - 9:00 PM</p>
                        <div class="flex justify-between items-center">
                            <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Academic</span>
                            <div>
                                <button class="text-blue-600 hover:text-blue-800 mr-2 text-sm">Edit</button>
                                <button class="text-red-600 hover:text-red-800 text-sm">Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getAdminMarketplaceContent() {
        return `
            <div class="space-y-6">
                <div class="flex justify-between items-center">
                    <h3 class="text-lg font-semibold">Manage Marketplace</h3>
                    <button id="adminAddMarketplace" class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200">
                        + Add Item
                    </button>
                </div>
                
                <div class="text-center text-gray-500 py-8">
                    <p>Marketplace management features coming soon...</p>
                    <p class="text-sm">Monitor student listings and moderate content</p>
                </div>
            </div>
        `;
    }

    getAdminUsersContent() {
        return `
            <div class="space-y-6">
                <h3 class="text-lg font-semibold">User Management</h3>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div class="bg-blue-50 rounded-lg p-4 text-center">
                        <div class="text-2xl font-bold text-blue-600">1,247</div>
                        <div class="text-sm text-gray-600">Total Users</div>
                    </div>
                    <div class="bg-green-50 rounded-lg p-4 text-center">
                        <div class="text-2xl font-bold text-green-600">892</div>
                        <div class="text-sm text-gray-600">Active This Month</div>
                    </div>
                    <div class="bg-purple-50 rounded-lg p-4 text-center">
                        <div class="text-2xl font-bold text-purple-600">156</div>
                        <div class="text-sm text-gray-600">New This Week</div>
                    </div>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr class="bg-gray-50">
                                <th class="border border-gray-300 px-4 py-2 text-left">Name</th>
                                <th class="border border-gray-300 px-4 py-2 text-left">Email</th>
                                <th class="border border-gray-300 px-4 py-2 text-left">Join Date</th>
                                <th class="border border-gray-300 px-4 py-2 text-left">Status</th>
                                <th class="border border-gray-300 px-4 py-2 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="border border-gray-300 px-4 py-2">John Doe</td>
                                <td class="border border-gray-300 px-4 py-2">john@example.com</td>
                                <td class="border border-gray-300 px-4 py-2">2024-01-15</td>
                                <td class="border border-gray-300 px-4 py-2">
                                    <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Active</span>
                                </td>
                                <td class="border border-gray-300 px-4 py-2">
                                    <button class="text-blue-600 hover:text-blue-800 mr-2">View</button>
                                    <button class="text-red-600 hover:text-red-800">Suspend</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    getAdminAnalyticsContent() {
        return `
            <div class="space-y-6">
                <h3 class="text-lg font-semibold">Analytics Dashboard</h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div class="bg-purple-50 rounded-lg p-4 text-center">
                        <div class="text-2xl font-bold text-purple-600">$12,450</div>
                        <div class="text-sm text-gray-600">Revenue This Month</div>
                    </div>
                    <div class="bg-blue-50 rounded-lg p-4 text-center">
                        <div class="text-2xl font-bold text-blue-600">3,247</div>
                        <div class="text-sm text-gray-600">Course Enrollments</div>
                    </div>
                    <div class="bg-green-50 rounded-lg p-4 text-center">
                        <div class="text-2xl font-bold text-green-600">89%</div>
                        <div class="text-sm text-gray-600">Completion Rate</div>
                    </div>
                    <div class="bg-orange-50 rounded-lg p-4 text-center">
                        <div class="text-2xl font-bold text-orange-600">4.8</div>
                        <div class="text-sm text-gray-600">Average Rating</div>
                    </div>
                </div>
                
                <div class="bg-gray-50 rounded-lg p-8 text-center">
                    <h4 class="text-lg font-semibold mb-4">Detailed Analytics</h4>
                    <p class="text-gray-600">Advanced analytics dashboard coming soon...</p>
                    <p class="text-sm text-gray-500 mt-2">Track user engagement, course performance, and revenue metrics</p>
                </div>
            </div>
        `;
    }

    showUploadModal(type = 'course') {
        const modal = document.getElementById('uploadModal');
        const title = document.getElementById('uploadModalTitle');
        
        const titles = {
            course: 'Upload Course',
            event: 'Create Event',
            marketplace: 'Add Marketplace Item',
            announcement: 'Create Announcement'
        };
        
        title.textContent = titles[type] || 'Upload Content';
        
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.querySelector('.modal-content').classList.add('scale-100', 'opacity-100');
            modal.querySelector('.modal-content').classList.remove('scale-95', 'opacity-0');
        }, 10);
    }

    hideUploadModal() {
        const modal = document.getElementById('uploadModal');
        const modalContent = modal.querySelector('.modal-content');
        
        modalContent.classList.add('scale-95', 'opacity-0');
        modalContent.classList.remove('scale-100', 'opacity-100');
        
        setTimeout(() => {
            modal.classList.add('hidden');
            // Reset form
            document.getElementById('uploadForm').reset();
        }, 300);
    }

    handleUpload(formData) {
        const category = formData.get('category');
        const uploadData = {
            id: Date.now(),
            title: formData.get('title'),
            description: formData.get('description'),
            price: formData.get('price'),
            image: formData.get('image'),
            category: category,
            createdAt: new Date().toISOString(),
            createdBy: this.currentUser.id
        };

        // Add to appropriate admin data array
        switch(category) {
            case 'course':
                this.adminData.courses.push(uploadData);
                break;
            case 'event':
                this.adminData.events.push(uploadData);
                break;
            case 'marketplace':
                this.adminData.marketplaceItems.push(uploadData);
                break;
        }

        this.saveAdminData();
        this.hideUploadModal();
        this.showNotification(`${category.charAt(0).toUpperCase() + category.slice(1)} uploaded successfully!`, 'success');
    }

    // Marketplace functionality
    initializeMarketplace() {
        // Load sample data if empty
        if (marketplaceItems.length === 0) {
            marketplaceItems = [
                {
                    id: 1,
                    name: "Engineering Textbooks Set",
                    price: 2500,
                    description: "Complete set of engineering books for first year",
                    category: "textbooks",
                    condition: "good",
                    image: "https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400",
                    seller: {
                        name: "Rahul Sharma",
                        mobile: "9876543210",
                        location: "Hostel Block A"
                    },
                    datePosted: new Date().toISOString()
                },
                {
                    id: 2,
                    name: "Gaming Laptop",
                    price: 45000,
                    description: "High-performance laptop, barely used",
                    category: "electronics",
                    condition: "like-new",
                    image: "https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=400",
                    seller: {
                        name: "Priya Patel",
                        mobile: "9123456789",
                        location: "Off-campus"
                    },
                    datePosted: new Date().toISOString()
                }
            ];
            localStorage.setItem('marketplaceItems', JSON.stringify(marketplaceItems));
        }
    }

    // Event Binding
    bindEvents() {
        // Theme events
        document.getElementById('themeToggle').addEventListener('click', () => {
            const dropdown = document.getElementById('themeDropdown');
            dropdown.classList.toggle('hidden');
        });

        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', () => {
                const theme = option.dataset.theme;
                this.setTheme(theme);
                document.getElementById('themeDropdown').classList.add('hidden');
            });
        });

        // Close theme dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#themeToggle') && !e.target.closest('#themeDropdown')) {
                document.getElementById('themeDropdown').classList.add('hidden');
            }
        });

        // Authentication events
        document.getElementById('loginBtn').addEventListener('click', () => this.showAuthModal('login'));
        document.getElementById('mobileLoginBtn').addEventListener('click', () => this.showAuthModal('login'));
        document.getElementById('closeModal').addEventListener('click', () => this.hideAuthModal());
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        
        // Admin events
        document.getElementById('adminBtn').addEventListener('click', () => this.showAdminPanel());
        document.getElementById('closeAdminModal').addEventListener('click', () => this.hideAdminPanel());
        
        // Modal form switching
        document.getElementById('showRegister').addEventListener('click', () => this.showAuthModal('register'));
        document.getElementById('showLogin').addEventListener('click', () => this.showAuthModal('login'));
        
        // Form submissions
        document.getElementById('loginSubmit').addEventListener('click', () => {
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            if (email && password) {
                this.login(email, password);
            }
        });
        
        document.getElementById('registerSubmit').addEventListener('click', () => {
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            if (name && email && password) {
                this.register(name, email, password);
            }
        });

        // Admin panel events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('admin-tab')) {
                this.loadAdminTab(e.target.dataset.tab);
            }
        });

        // Upload modal events
        document.getElementById('closeUploadModal').addEventListener('click', () => this.hideUploadModal());
        
        document.getElementById('uploadForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            this.handleUpload(formData);
        });

        // Modal close on outside click for admin and upload modals
        document.getElementById('adminModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hideAdminPanel();
            }
        });

        document.getElementById('uploadModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hideUploadModal();
            }
        });

        // Navigation events
        document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                if (page) {
                    this.loadPage(page);
                }
            });
        });

        // Mobile menu toggle
        document.getElementById('mobileMenuBtn').addEventListener('click', () => {
            const mobileMenu = document.getElementById('mobileMenu');
            mobileMenu.classList.toggle('hidden');
        });

        // Modal close on outside click
        document.getElementById('authModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hideAuthModal();
            }
        });
    }

    // Page-specific feature initialization
    initPageFeatures(pageName) {
        if (pageName === 'store') {
            this.initStoreFeatures();
        } else if (pageName === 'marketplace') {
            this.initMarketplaceFeatures();
        } else if (pageName === 'events') {
            this.initEventsFeatures();
        }
    }

    initStoreFeatures() {
        // Store category filtering
        document.querySelectorAll('.store-category').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.store-category').forEach(b => {
                    b.classList.remove('active', 'bg-purple-600', 'text-white');
                    b.classList.add('bg-gray-200', 'text-gray-700');
                });
                btn.classList.add('active', 'bg-purple-600', 'text-white');
                btn.classList.remove('bg-gray-200', 'text-gray-700');
            });
        });

        // Purchase functionality
        document.querySelectorAll('.store-purchase').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!this.currentUser) {
                    this.showAuthModal('login');
                    return;
                }
                
                const course = btn.dataset.course;
                const price = btn.dataset.price;
                this.purchaseCourse(course, price);
            });
        });
        
        // Add course button (admin only)
        const addCourseBtn = document.getElementById('addCourse');
        if (addCourseBtn) {
            addCourseBtn.addEventListener('click', () => this.showUploadModal('course'));
        }
    }

    initMarketplaceFeatures() {
        // Marketplace category filtering
        document.querySelectorAll('.marketplace-category').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.marketplace-category').forEach(b => {
                    b.classList.remove('active', 'bg-purple-600', 'text-white');
                    b.classList.add('bg-gray-200', 'text-gray-700');
                });
                btn.classList.add('active', 'bg-purple-600', 'text-white');
                btn.classList.remove('bg-gray-200', 'text-gray-700');
            });
        });

        // Add marketplace item button
        const addItemBtn = document.getElementById('addMarketplaceItem');
        if (addItemBtn) {
            addItemBtn.addEventListener('click', () => this.showUploadModal('marketplace'));
        }
    }

    initEventsFeatures() {
        // Event category filtering
        document.querySelectorAll('.event-category').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.event-category').forEach(b => {
                    b.classList.remove('active', 'bg-purple-600', 'text-white');
                    b.classList.add('bg-gray-200', 'text-gray-700');
                });
                btn.classList.add('active', 'bg-purple-600', 'text-white');
                btn.classList.remove('bg-gray-200', 'text-gray-700');
            });
        });

        // Add event button (admin only)
        const addEventBtn = document.getElementById('addEvent');
        if (addEventBtn) {
            addEventBtn.addEventListener('click', () => this.showUploadModal('event'));
        }

        // Admin add buttons in admin panel
        document.addEventListener('click', (e) => {
            if (e.target.id === 'adminAddCourse') {
                this.showUploadModal('course');
            } else if (e.target.id === 'adminAddEvent') {
                this.showUploadModal('event');
            } else if (e.target.id === 'adminAddMarketplace') {
                this.showUploadModal('marketplace');
            }
        });
    }

    purchaseCourse(courseId, price) {
        // Simulate purchase
        const purchases = JSON.parse(localStorage.getItem('growloop_purchases') || '[]');
        const purchase = {
            id: courseId,
            price: price,
            date: new Date().toISOString(),
            userId: this.currentUser.id
        };
        
        purchases.push(purchase);
        localStorage.setItem('growloop_purchases', JSON.stringify(purchases));
        
        this.showNotification(`Course purchased successfully for $${price}!`, 'success');
    }

    // Chat Bot functionality
    initChatBot() {
        const chatToggle = document.getElementById('chatToggle');
        const chatWindow = document.getElementById('chatWindow');
        const chatSend = document.getElementById('chatSend');
        const chatInput = document.getElementById('chatInput');

        chatToggle.addEventListener('click', () => {
            chatWindow.classList.toggle('hidden');
        });

        chatSend.addEventListener('click', () => {
            const message = chatInput.value.trim();
            if (message) {
                this.sendChatMessage(message);
                chatInput.value = '';
            }
        });

        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const message = chatInput.value.trim();
                if (message) {
                    this.sendChatMessage(message);
                    chatInput.value = '';
                }
            }
        });
    }

    sendChatMessage(message) {
        const chatMessages = document.getElementById('chatMessages');
        
        // Add user message
        const userMessage = document.createElement('div');
        userMessage.className = 'text-right';
        userMessage.innerHTML = `<div class="bg-purple-600 text-white px-3 py-2 rounded-lg inline-block max-w-xs text-sm">${message}</div>`;
        chatMessages.appendChild(userMessage);

        // Simulate AI response
        setTimeout(() => {
            const responses = [
                "That's a great question! Let me help you with that.",
                "I'd be happy to assist you with your studies.",
                "Here's what I recommend based on your learning progress...",
                "That's an interesting topic! Have you considered exploring...",
                "Great choice! This will definitely help you grow your skills."
            ];
            
            const response = responses[Math.floor(Math.random() * responses.length)];
            const botMessage = document.createElement('div');
            botMessage.className = 'text-left';
            botMessage.innerHTML = `<div class="bg-gray-200 text-gray-800 px-3 py-2 rounded-lg inline-block max-w-xs text-sm">${response}</div>`;
            chatMessages.appendChild(botMessage);
            
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 1000);
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Utility Methods
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full`;
        
        const colors = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            info: 'bg-blue-500 text-white',
            warning: 'bg-yellow-500 text-black'
        };
        
        notification.classList.add(...colors[type].split(' '));
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    initializeAuth();
    initializeChatBot();
    initializeMarketplace();
    loadPage('home');
});

// Theme functionality
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'purple';
    applyTheme(savedTheme);
    
    // Theme toggle functionality
    const themeToggle = document.getElementById('themeToggle');
    const themeDropdown = document.getElementById('themeDropdown');
    
    themeToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        themeDropdown.classList.toggle('hidden');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        themeDropdown.classList.add('hidden');
    });
    
    // Theme option handlers
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', (e) => {
            const theme = e.currentTarget.dataset.theme;
            applyTheme(theme);
            themeDropdown.classList.add('hidden');
        });
    });
}

function applyTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Update body classes for proper theming
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${theme}`);
}

// Page loading functionality
function loadPage(page) {
    const pageContent = document.getElementById('pageContent');
    let content = '';
    
    switch(page) {
        case 'home':
            content = `
                <div class="max-w-6xl mx-auto px-4 py-8">
                    <div class="text-center mb-12">
                        <h1 class="text-4xl md:text-6xl font-bold mb-6">
                            <span class="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                Grow Your Future
                            </span>
                        </h1>
                        <p class="text-xl text-gray-600 mb-8">
                            Join thousands of students on their journey to success. Learn, grow, and achieve your dreams with GrowLoop.
                        </p>
                        <div class="flex flex-col sm:flex-row gap-4 justify-center">
                            <button class="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors duration-200">
                                Start Learning
                            </button>
                            <button class="border-2 border-purple-600 text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors duration-200">
                                Explore Campus
                            </button>
                        </div>
                    </div>
                    
                    <!-- Features Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div class="bg-white rounded-xl p-6 shadow-md card-hover">
                            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                </svg>
                            </div>
                            <h3 class="text-xl font-semibold mb-2">Smart Learning</h3>
                            <p class="text-gray-600">AI-powered personalized learning paths that adapt to your pace and style.</p>
                        </div>
                        
                        <div class="bg-white rounded-xl p-6 shadow-md card-hover">
                            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                </svg>
                            </div>
                            <h3 class="text-xl font-semibold mb-2">Campus Community</h3>
                            <p class="text-gray-600">Connect with peers, join clubs, and participate in campus events.</p>
                        </div>
                        
                        <div class="bg-white rounded-xl p-6 shadow-md card-hover">
                            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                                </svg>
                            </div>
                            <h3 class="text-xl font-semibold mb-2">Student Marketplace</h3>
                            <p class="text-gray-600">Buy, sell, and trade textbooks, electronics, and more with fellow students.</p>
                        </div>
                    </div>
                </div>
            `;
            break;
        case 'skill_hub':
            content = `
                <div class="max-w-6xl mx-auto px-4 py-8">
                    <h1 class="text-3xl font-bold mb-8">Skill Hub</h1>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div class="bg-white rounded-xl p-6 shadow-md card-hover">
                            <div class="flex items-center mb-4">
                                <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <span class="text-yellow-600 font-bold">JS</span>
                                </div>
                                <div class="ml-3">
                                    <h3 class="font-semibold">JavaScript Fundamentals</h3>
                                    <p class="text-sm text-gray-500">12 lessons • 4 hours</p>
                                </div>
                            </div>
                            <p class="text-gray-600 text-sm mb-4">Master the basics of JavaScript programming</p>
                            <button class="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200">
                                Start Learning
                            </button>
                        </div>
                        
                        <div class="bg-white rounded-xl p-6 shadow-md card-hover">
                            <div class="flex items-center mb-4">
                                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <span class="text-blue-600 font-bold">R</span>
                                </div>
                                <div class="ml-3">
                                    <h3 class="font-semibold">React Development</h3>
                                    <p class="text-sm text-gray-500">18 lessons • 6 hours</p>
                                </div>
                            </div>
                            <p class="text-gray-600 text-sm mb-4">Build modern web applications with React</p>
                            <button class="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200">
                                Start Learning
                            </button>
                        </div>
                        
                        <div class="bg-white rounded-xl p-6 shadow-md card-hover">
                            <div class="flex items-center mb-4">
                                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <span class="text-green-600 font-bold">PY</span>
                                </div>
                                <div class="ml-3">
                                    <h3 class="font-semibold">Python for Beginners</h3>
                                    <p class="text-sm text-gray-500">15 lessons • 5 hours</p>
                                </div>
                            </div>
                            <p class="text-gray-600 text-sm mb-4">Learn Python programming from scratch</p>
                            <button class="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200">
                                Start Learning
                            </button>
                        </div>
                    </div>
                </div>
            `;
            break;
        case 'career':
            content = `
                <div class="max-w-6xl mx-auto px-4 py-8">
                    <h1 class="text-3xl font-bold mb-8">Career Center</h1>
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <h2 class="text-xl font-semibold mb-4">Latest Opportunities</h2>
                            <div class="space-y-4">
                                <div class="bg-white rounded-lg p-6 shadow-md card-hover">
                                    <div class="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 class="font-semibold text-lg">Frontend Developer</h3>
                                            <p class="text-gray-600">TechCorp Inc.</p>
                                        </div>
                                        <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Entry Level</span>
                                    </div>
                                    <p class="text-gray-600 text-sm mb-4">Join our dynamic team and work on cutting-edge web applications...</p>
                                    <div class="flex justify-between items-center">
                                        <span class="text-purple-600 font-semibold">₹4,50,000 - ₹6,00,000</span>
                                        <button class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200">
                                            Apply Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <h2 class="text-xl font-semibold mb-4">Career Resources</h2>
                            <div class="space-y-4">
                                <div class="bg-white rounded-lg p-6 shadow-md card-hover">
                                    <h3 class="font-semibold mb-2">Resume Builder</h3>
                                    <p class="text-gray-600 text-sm mb-4">Create a professional resume with our AI-powered builder</p>
                                    <button class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                                        Build Resume
                                    </button>
                                </div>
                                
                                <div class="bg-white rounded-lg p-6 shadow-md card-hover">
                                    <h3 class="font-semibold mb-2">Interview Prep</h3>
                                    <p class="text-gray-600 text-sm mb-4">Practice with AI mock interviews and get feedback</p>
                                    <button class="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors duration-200">
                                        Start Practice
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            break;
        case 'store':
            content = `
                <div class="max-w-6xl mx-auto px-4 py-8">
                    <div class="flex justify-between items-center mb-8">
                        <h1 class="text-3xl font-bold">Student Store</h1>
                        ${currentUser && currentUser.isAdmin ? `
                            <button onclick="openUploadModal('course')" class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200">
                                Add Course
                            </button>
                        ` : ''}
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div class="bg-white rounded-xl p-6 shadow-md card-hover">
                            <img src="https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=400" alt="Course" class="w-full h-48 object-cover rounded-lg mb-4">
                            <h3 class="font-semibold text-lg mb-2">Advanced JavaScript</h3>
                            <p class="text-gray-600 text-sm mb-4">Master modern JavaScript concepts and frameworks</p>
                            <div class="flex justify-between items-center">
                                <span class="text-2xl font-bold text-purple-600">₹2,999</span>
                                <button class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200">
                                    Enroll Now
                                </button>
                            </div>
                        </div>
                        
                        <div class="bg-white rounded-xl p-6 shadow-md card-hover">
                            <img src="https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=400" alt="Course" class="w-full h-48 object-cover rounded-lg mb-4">
                            <h3 class="font-semibold text-lg mb-2">Python for Beginners</h3>
                            <p class="text-gray-600 text-sm mb-4">Start your programming journey with Python</p>
                            <div class="flex justify-between items-center">
                                <span class="text-2xl font-bold text-purple-600">₹1,999</span>
                                <button class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200">
                                    Enroll Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            break;
        case 'journey':
            content = `
                <div class="max-w-6xl mx-auto px-4 py-8">
                    <h1 class="text-3xl font-bold mb-8">Learning Journey</h1>
                    <div class="bg-white rounded-xl p-6 shadow-md mb-8">
                        <h2 class="text-xl font-semibold mb-4">Your Progress</h2>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <div class="flex justify-between mb-2">
                                    <span class="text-sm font-medium">JavaScript</span>
                                    <span class="text-sm text-gray-500">75%</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-2">
                                    <div class="bg-purple-600 h-2 rounded-full" style="width: 75%"></div>
                                </div>
                            </div>
                            <div>
                                <div class="flex justify-between mb-2">
                                    <span class="text-sm font-medium">React</span>
                                    <span class="text-sm text-gray-500">60%</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-2">
                                    <div class="bg-blue-600 h-2 rounded-full" style="width: 60%"></div>
                                </div>
                            </div>
                            <div>
                                <div class="flex justify-between mb-2">
                                    <span class="text-sm font-medium">Python</span>
                                    <span class="text-sm text-gray-500">40%</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-2">
                                    <div class="bg-green-600 h-2 rounded-full" style="width: 40%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-xl p-6 shadow-md">
                        <h2 class="text-xl font-semibold mb-4">Recent Achievements</h2>
                        <div class="flex flex-wrap gap-4">
                            <div class="flex items-center bg-yellow-50 px-4 py-2 rounded-full">
                                <span class="mr-2">🏆</span>
                                <span class="text-sm font-medium">First Course Completed</span>
                            </div>
                            <div class="flex items-center bg-blue-50 px-4 py-2 rounded-full">
                                <span class="mr-2">⭐</span>
                                <span class="text-sm font-medium">7-Day Streak</span>
                            </div>
                            <div class="flex items-center bg-green-50 px-4 py-2 rounded-full">
                                <span class="mr-2">🎯</span>
                                <span class="text-sm font-medium">Quiz Master</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            break;
        case 'marketplace':
            content = `
                <div class="max-w-6xl mx-auto px-4 py-8">
                    <div class="flex justify-between items-center mb-8">
                        <h1 class="text-3xl font-bold">Student Marketplace</h1>
                        <div class="flex space-x-4">
                            <button id="buyerModeBtn" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                                Buyer Mode
                            </button>
                            <button id="sellerModeBtn" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200">
                                Seller Mode
                            </button>
                        </div>
                    </div>
                    
                    <!-- Marketplace Mode Selection -->
                    <div id="marketplaceModeSelection" class="text-center py-12">
                        <h2 class="text-2xl font-bold mb-6">Choose Your Mode</h2>
                        <div class="flex justify-center space-x-8">
                            <div class="bg-white rounded-xl p-8 shadow-md cursor-pointer hover:shadow-lg transition-all duration-200" onclick="setMarketplaceMode('buyer')">
                                <div class="text-4xl mb-4">🛒</div>
                                <h3 class="text-xl font-semibold mb-2">Buyer</h3>
                                <p class="text-gray-600">Browse and buy items from other students</p>
                            </div>
                            <div class="bg-white rounded-xl p-8 shadow-md cursor-pointer hover:shadow-lg transition-all duration-200" onclick="setMarketplaceMode('seller')">
                                <div class="text-4xl mb-4">💼</div>
                                <h3 class="text-xl font-semibold mb-2">Seller</h3>
                                <p class="text-gray-600">List your items for sale</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Buyer Mode -->
                    <div id="buyerMode" class="hidden">
                        <div class="mb-6">
                            <input type="text" id="searchMarketplace" placeholder="Search items..." class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent">
                        </div>
                        <div id="marketplaceGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <!-- Items will be loaded here -->
                        </div>
                    </div>
                    
                    <!-- Seller Mode -->
                    <div id="sellerMode" class="hidden">
                        <div class="bg-white rounded-xl p-6 shadow-md mb-6">
                            <h2 class="text-xl font-semibold mb-4">List New Item</h2>
                            <form id="sellItemForm" class="space-y-4">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium mb-2">Item Name</label>
                                        <input type="text" id="itemName" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium mb-2">Price (₹)</label>
                                        <input type="number" id="itemPrice" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent">
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-2">Description</label>
                                    <textarea id="itemDescription" rows="3" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"></textarea>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium mb-2">Category</label>
                                        <select id="itemCategory" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent">
                                            <option value="">Select Category</option>
                                            <option value="textbooks">Textbooks</option>
                                            <option value="electronics">Electronics</option>
                                            <option value="furniture">Furniture</option>
                                            <option value="clothing">Clothing</option>
                                            <option value="sports">Sports Equipment</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium mb-2">Condition</label>
                                        <select id="itemCondition" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent">
                                            <option value="">Select Condition</option>
                                            <option value="new">New</option>
                                            <option value="like-new">Like New</option>
                                            <option value="good">Good</option>
                                            <option value="fair">Fair</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-2">Image URL</label>
                                    <input type="url" id="itemImage" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent">
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium mb-2">Your Name</label>
                                        <input type="text" id="sellerName" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium mb-2">Mobile Number</label>
                                        <div class="flex">
                                            <span class="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-lg">+91</span>
                                            <input type="tel" id="sellerMobile" pattern="[0-9]{10}" required class="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent">
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-2">Location</label>
                                    <input type="text" id="sellerLocation" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent">
                                </div>
                                <button type="submit" class="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium">
                                    List Item for Sale
                                </button>
                            </form>
                        </div>
                        
                        <div class="bg-white rounded-xl p-6 shadow-md">
                            <h2 class="text-xl font-semibold mb-4">Your Listed Items</h2>
                            <div id="sellerItems" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <!-- Seller's items will be loaded here -->
                            </div>
                        </div>
                    </div>
                </div>
            `;
            break;
        case 'campus':
            content = `
                <div class="max-w-6xl mx-auto px-4 py-8">
                    <h1 class="text-3xl font-bold mb-8">Campus Life</h1>
                    
                    <!-- Campus Stats -->
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div class="bg-white rounded-xl p-6 shadow-md text-center">
                            <div class="text-3xl font-bold text-purple-600 mb-2">2,500+</div>
                            <div class="text-gray-600">Students</div>
                        </div>
                        <div class="bg-white rounded-xl p-6 shadow-md text-center">
                            <div class="text-3xl font-bold text-blue-600 mb-2">50+</div>
                            <div class="text-gray-600">Clubs</div>
                        </div>
                        <div class="bg-white rounded-xl p-6 shadow-md text-center">
                            <div class="text-3xl font-bold text-green-600 mb-2">15</div>
                            <div class="text-gray-600">Facilities</div>
                        </div>
                        <div class="bg-white rounded-xl p-6 shadow-md text-center">
                            <div class="text-3xl font-bold text-orange-600 mb-2">100+</div>
                            <div class="text-gray-600">Events/Year</div>
                        </div>
                    </div>
                    
                    <!-- Campus Facilities -->
                    <div class="bg-white rounded-xl p-6 shadow-md mb-8">
                        <h2 class="text-xl font-semibold mb-4">Campus Facilities</h2>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div class="text-center p-4">
                                <div class="text-4xl mb-3">📚</div>
                                <h3 class="font-semibold mb-2">Library</h3>
                                <p class="text-gray-600 text-sm">24/7 access with digital resources</p>
                            </div>
                            <div class="text-center p-4">
                                <div class="text-4xl mb-3">🏋️</div>
                                <h3 class="font-semibold mb-2">Gym & Sports</h3>
                                <p class="text-gray-600 text-sm">Modern fitness center and sports complex</p>
                            </div>
                            <div class="text-center p-4">
                                <div class="text-4xl mb-3">🍽️</div>
                                <h3 class="font-semibold mb-2">Cafeteria</h3>
                                <p class="text-gray-600 text-sm">Multiple dining options and food courts</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Student Clubs -->
                    <div class="bg-white rounded-xl p-6 shadow-md">
                        <h2 class="text-xl font-semibold mb-4">Student Clubs</h2>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div class="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200">
                                <h3 class="font-semibold mb-2">Tech Club</h3>
                                <p class="text-gray-600 text-sm mb-3">Programming competitions and workshops</p>
                                <span class="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded">150 members</span>
                            </div>
                            <div class="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200">
                                <h3 class="font-semibold mb-2">Drama Society</h3>
                                <p class="text-gray-600 text-sm mb-3">Theater performances and acting workshops</p>
                                <span class="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">80 members</span>
                            </div>
                            <div class="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200">
                                <h3 class="font-semibold mb-2">Music Club</h3>
                                <p class="text-gray-600 text-sm mb-3">Concerts and music competitions</p>
                                <span class="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">120 members</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            break;
        case 'events':
            content = `
                <div class="max-w-6xl mx-auto px-4 py-8">
                    <div class="flex justify-between items-center mb-8">
                        <h1 class="text-3xl font-bold">Campus Events</h1>
                        ${currentUser && currentUser.isAdmin ? `
                            <button onclick="openUploadModal('event')" class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200">
                                Create Event
                            </button>
                        ` : ''}
                    </div>
                    
                    <!-- Event Categories -->
                    <div class="flex flex-wrap gap-2 mb-6">
                        <button class="event-filter active bg-purple-600 text-white px-4 py-2 rounded-lg" data-category="all">All Events</button>
                        <button class="event-filter bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300" data-category="academic">Academic</button>
                        <button class="event-filter bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300" data-category="cultural">Cultural</button>
                        <button class="event-filter bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300" data-category="sports">Sports</button>
                        <button class="event-filter bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300" data-category="workshop">Workshop</button>
                    </div>
                    
                    <div id="eventsGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <!-- Events will be loaded here -->
                    </div>
                </div>
            `;
            break;
    }
    
    pageContent.innerHTML = content;
    
    // Add page transition effect
    pageContent.classList.add('page-transition');
    
    // Initialize page-specific functionality
    if (page === 'marketplace') {
        initializeMarketplacePage();
    } else if (page === 'events') {
        loadEvents();
        initializeEventFilters();
    } else if (page === 'skill_hub') {
        loadCourses();
    }
}

// Marketplace functionality
function initializeMarketplace() {
    // Load sample data if empty
    if (marketplaceItems.length === 0) {
        marketplaceItems = [
            {
                id: 1,
                name: "Engineering Textbooks Set",
                price: 2500,
                description: "Complete set of engineering books for first year",
                category: "textbooks",
                condition: "good",
                image: "https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400",
                seller: {
                    name: "Rahul Sharma",
                    mobile: "9876543210",
                    location: "Hostel Block A"
                },
                datePosted: new Date().toISOString()
            },
            {
                id: 2,
                name: "Gaming Laptop",
                price: 45000,
                description: "High-performance laptop, barely used",
                category: "electronics",
                condition: "like-new",
                image: "https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=400",
                seller: {
                    name: "Priya Patel",
                    mobile: "9123456789",
                    location: "Off-campus"
                },
                datePosted: new Date().toISOString()
            }
        ];
        localStorage.setItem('marketplaceItems', JSON.stringify(marketplaceItems));
    }
}

function initializeMarketplacePage() {
    // Mode selection handlers
    document.getElementById('buyerModeBtn').addEventListener('click', () => setMarketplaceMode('buyer'));
    document.getElementById('sellerModeBtn').addEventListener('click', () => setMarketplaceMode('seller'));
    
    // Sell item form handler
    document.getElementById('sellItemForm').addEventListener('submit', handleSellItem);
    
    // Search functionality
    document.getElementById('searchMarketplace').addEventListener('input', filterMarketplaceItems);
}

function setMarketplaceMode(mode) {
    document.getElementById('marketplaceModeSelection').classList.add('hidden');
    document.getElementById('buyerMode').classList.add('hidden');
    document.getElementById('sellerMode').classList.add('hidden');
    
    if (mode === 'buyer') {
        document.getElementById('buyerMode').classList.remove('hidden');
        loadMarketplaceItems();
    } else {
        document.getElementById('sellerMode').classList.remove('hidden');
        loadSellerItems();
    }
}

function loadMarketplaceItems() {
    const grid = document.getElementById('marketplaceGrid');
    grid.innerHTML = '';
    
    marketplaceItems.forEach(item => {
        const itemCard = `
            <div class="bg-white rounded-xl p-6 shadow-md card-hover">
                <img src="${item.image}" alt="${item.name}" class="w-full h-48 object-cover rounded-lg mb-4">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-semibold text-lg">${item.name}</h3>
                    <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">${item.condition}</span>
                </div>
                <p class="text-gray-600 text-sm mb-4">${item.description}</p>
                <div class="flex justify-between items-center mb-4">
                    <span class="text-2xl font-bold text-purple-600">₹${item.price.toLocaleString()}</span>
                    <span class="text-xs text-gray-500">${item.category}</span>
                </div>
                <div class="border-t pt-4">
                    <div class="text-sm text-gray-600 mb-2">
                        <strong>Seller:</strong> ${item.seller.name}<br>
                        <strong>Location:</strong> ${item.seller.location}
                    </div>
                    <button onclick="contactSeller('${item.seller.mobile}', '${item.seller.name}', '${item.name}')" 
                            class="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200">
                        Contact Seller
                    </button>
                </div>
            </div>
        `;
        grid.innerHTML += itemCard;
    });
}

function handleSellItem(e) {
    e.preventDefault();
    
    const newItem = {
        id: Date.now(),
        name: document.getElementById('itemName').value,
        price: parseInt(document.getElementById('itemPrice').value),
        description: document.getElementById('itemDescription').value,
        category: document.getElementById('itemCategory').value,
        condition: document.getElementById('itemCondition').value,
        image: document.getElementById('itemImage').value || 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
        seller: {
            name: document.getElementById('sellerName').value,
            mobile: document.getElementById('sellerMobile').value,
            location: document.getElementById('sellerLocation').value
        },
        datePosted: new Date().toISOString()
    };
    
    marketplaceItems.push(newItem);
    localStorage.setItem('marketplaceItems', JSON.stringify(marketplaceItems));
    
    // Reset form
    document.getElementById('sellItemForm').reset();
    
    // Reload seller items
    loadSellerItems();
    
    showNotification('Item listed successfully!', 'success');
}

function loadSellerItems() {
    const container = document.getElementById('sellerItems');
    const userItems = marketplaceItems.filter(item => 
        currentUser && item.seller.name === currentUser.name
    );
    
    if (userItems.length === 0) {
        container.innerHTML = '<p class="text-gray-600 text-center py-8">You haven\'t listed any items yet.</p>';
        return;
    }
    
    container.innerHTML = userItems.map(item => `
        <div class="bg-gray-50 rounded-lg p-4">
            <img src="${item.image}" alt="${item.name}" class="w-full h-32 object-cover rounded-lg mb-3">
            <h4 class="font-semibold mb-1">${item.name}</h4>
            <p class="text-purple-600 font-bold">₹${item.price.toLocaleString()}</p>
            <button onclick="removeItem(${item.id})" class="mt-2 text-red-600 text-sm hover:text-red-700">
                Remove Item
            </button>
        </div>
    `).join('');
}

function contactSeller(mobile, name, itemName) {
    const message = `Hi ${name}, I'm interested in your ${itemName} listed on GrowLoop marketplace.`;
    const whatsappUrl = `https://wa.me/91${mobile}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

function removeItem(itemId) {
    if (confirm('Are you sure you want to remove this item?')) {
        marketplaceItems = marketplaceItems.filter(item => item.id !== itemId);
        localStorage.setItem('marketplaceItems', JSON.stringify(marketplaceItems));
        loadSellerItems();
        showNotification('Item removed successfully!', 'success');
    }
}

function filterMarketplaceItems() {
    const searchTerm = document.getElementById('searchMarketplace').value.toLowerCase();
    const filteredItems = marketplaceItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm) ||
        item.category.toLowerCase().includes(searchTerm)
    );
    
    const grid = document.getElementById('marketplaceGrid');
    grid.innerHTML = '';
    
    filteredItems.forEach(item => {
        const itemCard = `
            <div class="bg-white rounded-xl p-6 shadow-md card-hover">
                <img src="${item.image}" alt="${item.name}" class="w-full h-48 object-cover rounded-lg mb-4">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-semibold text-lg">${item.name}</h3>
                    <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">${item.condition}</span>
                </div>
                <p class="text-gray-600 text-sm mb-4">${item.description}</p>
                <div class="flex justify-between items-center mb-4">
                    <span class="text-2xl font-bold text-purple-600">₹${item.price.toLocaleString()}</span>
                    <span class="text-xs text-gray-500">${item.category}</span>
                </div>
                <div class="border-t pt-4">
                    <div class="text-sm text-gray-600 mb-2">
                        <strong>Seller:</strong> ${item.seller.name}<br>
                        <strong>Location:</strong> ${item.seller.location}
                    </div>
                    <button onclick="contactSeller('${item.seller.mobile}', '${item.seller.name}', '${item.name}')" 
                            class="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200">
                        Contact Seller
                    </button>
                </div>
            </div>
        `;
        grid.innerHTML += itemCard;
    });
}

// Events functionality
function loadEvents() {
    if (events.length === 0) {
        events = [
            {
                id: 1,
                title: "Tech Symposium 2024",
                description: "Annual technology conference with industry experts",
                category: "academic",
                date: "2024-02-15",
                time: "10:00 AM",
                location: "Main Auditorium",
                image: "https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=400",
                registrations: 245
            },
            {
                id: 2,
                title: "Cultural Night",
                description: "Showcase of student talents in music, dance, and drama",
                category: "cultural",
                date: "2024-02-20",
                time: "6:00 PM",
                location: "Open Air Theatre",
                image: "https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=400",
                registrations: 180
            }
        ];
        localStorage.setItem('events', JSON.stringify(events));
    }
    
    displayEvents(events);
}

function displayEvents(eventsToShow) {
    const grid = document.getElementById('eventsGrid');
    if (!grid) return;
    
    grid.innerHTML = eventsToShow.map(event => `
        <div class="bg-white rounded-xl p-6 shadow-md card-hover">
            <img src="${event.image}" alt="${event.title}" class="w-full h-48 object-cover rounded-lg mb-4">
            <div class="flex justify-between items-start mb-2">
                <h3 class="font-semibold text-lg">${event.title}</h3>
                <span class="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded">${event.category}</span>
            </div>
            <p class="text-gray-600 text-sm mb-4">${event.description}</p>
            <div class="space-y-2 text-sm text-gray-600 mb-4">
                <div class="flex items-center">
                    <span class="font-medium mr-2">📅</span>
                    ${new Date(event.date).toLocaleDateString()} at ${event.time}
                </div>
                <div class="flex items-center">
                    <span class="font-medium mr-2">📍</span>
                    ${event.location}
                </div>
                <div class="flex items-center">
                    <span class="font-medium mr-2">👥</span>
                    ${event.registrations} registered
                </div>
            </div>
            <button onclick="registerForEvent(${event.id})" class="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200">
                Register Now
            </button>
        </div>
    `).join('');
}

function initializeEventFilters() {
    document.querySelectorAll('.event-filter').forEach(filter => {
        filter.addEventListener('click', (e) => {
            // Update active filter
            document.querySelectorAll('.event-filter').forEach(f => {
                f.classList.remove('active', 'bg-purple-600', 'text-white');
                f.classList.add('bg-gray-200', 'text-gray-700');
            });
            e.target.classList.add('active', 'bg-purple-600', 'text-white');
            e.target.classList.remove('bg-gray-200', 'text-gray-700');
            
            // Filter events
            const category = e.target.dataset.category;
            const filteredEvents = category === 'all' ? events : events.filter(event => event.category === category);
            displayEvents(filteredEvents);
        });
    });
}

function registerForEvent(eventId) {
    if (!currentUser) {
        showNotification('Please login to register for events', 'error');
        return;
    }
    
    const event = events.find(e => e.id === eventId);
    if (event) {
        event.registrations++;
        localStorage.setItem('events', JSON.stringify(events));
        showNotification(`Successfully registered for ${event.title}!`, 'success');
        loadEvents(); // Refresh the display
    }
}

// Courses functionality
function loadCourses() {
    if (courses.length === 0) {
        courses = [
            {
                id: 1,
                title: "Advanced JavaScript",
                description: "Master modern JavaScript concepts and frameworks",
                price: 49,
                image: "https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=400",
                instructor: "John Doe",
                duration: "8 weeks",
                level: "Advanced"
            },
            {
                id: 2,
                title: "Python for Beginners",
                description: "Start your programming journey with Python",
                price: 39,
                image: "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=400",
                instructor: "Jane Smith",
                duration: "6 weeks",
                level: "Beginner"
            }
        ];
        localStorage.setItem('courses', JSON.stringify(courses));
    }
    
    displayCourses();
}

function displayCourses() {
    const container = document.querySelector('#pageContent .grid');
    if (!container) return;
    
    container.innerHTML = courses.map(course => `
        <div class="bg-white rounded-xl p-6 shadow-md card-hover">
            <img src="${course.image}" alt="${course.title}" class="w-full h-48 object-cover rounded-lg mb-4">
            <div class="flex justify-between items-start mb-2">
                <h3 class="font-semibold text-lg">${course.title}</h3>
                <span class="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">${course.level}</span>
            </div>
            <p class="text-gray-600 text-sm mb-4">${course.description}</p>
            <div class="space-y-1 text-sm text-gray-600 mb-4">
                <div><strong>Instructor:</strong> ${course.instructor}</div>
                <div><strong>Duration:</strong> ${course.duration}</div>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-2xl font-bold text-purple-600">$${course.price}</span>
                <button onclick="enrollInCourse(${course.id})" class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200">
                    Enroll Now
                </button>
            </div>
        </div>
    `).join('');
}

function enrollInCourse(courseId) {
    if (!currentUser) {
        showNotification('Please login to enroll in courses', 'error');
        return;
    }
    
    const course = courses.find(c => c.id === courseId);
    if (course) {
        showNotification(`Successfully enrolled in ${course.title}!`, 'success');
    }
}

// Authentication functionality
function initializeAuth() {
    // Check for saved user
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUIForLoggedInUser();
    }
    
    // Login form handler
    document.getElementById('loginSubmit').addEventListener('click', handleLogin);
    document.getElementById('registerSubmit').addEventListener('click', handleRegister);
    
    // Modal toggle handlers
    document.getElementById('showRegister').addEventListener('click', showRegisterForm);
    document.getElementById('showLogin').addEventListener('click', showLoginForm);
    
    // Login button handlers
    document.getElementById('loginBtn').addEventListener('click', openAuthModal);
    document.getElementById('mobileLoginBtn').addEventListener('click', openAuthModal);
    
    // Logout handler
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // Modal close handlers
    document.getElementById('closeModal').addEventListener('click', closeAuthModal);
    document.getElementById('authModal').addEventListener('click', (e) => {
        if (e.target.id === 'authModal') closeAuthModal();
    });
}

function openAuthModal() {
    document.getElementById('authModal').classList.remove('hidden');
    setTimeout(() => {
        document.querySelector('#authModal .modal-content').classList.add('show');
    }, 10);
}

function closeAuthModal() {
    document.querySelector('#authModal .modal-content').classList.remove('show');
    setTimeout(() => {
        document.getElementById('authModal').classList.add('hidden');
    }, 300);
}

function showLoginForm() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('modalTitle').textContent = 'Sign In';
}

function showRegisterForm() {
    document.getElementById('registerForm').classList.remove('hidden');
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('modalTitle').textContent = 'Sign Up';
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    // Check for admin credentials
    if (email === 'admin@growloop.com') {
        currentUser = {
            name: 'Admin User',
            email: email,
            isAdmin: true
        };
    } else {
        // Check existing users
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (!user) {
            showNotification('Invalid credentials', 'error');
            return;
        }
        
        currentUser = {
            name: user.name,
            email: user.email,
            isAdmin: false
        };
    }
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateUIForLoggedInUser();
    closeAuthModal();
    showNotification('Login successful!', 'success');
}

function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    if (!name || !email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.email === email)) {
        showNotification('User already exists', 'error');
        return;
    }
    
    // Add new user
    const newUser = { name, email, password };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Auto login
    currentUser = {
        name: name,
        email: email,
        isAdmin: false
    };
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateUIForLoggedInUser();
    closeAuthModal();
    showNotification('Registration successful!', 'success');
}

function updateUIForLoggedInUser() {
    document.getElementById('loginBtn').classList.add('hidden');
    document.getElementById('mobileLoginBtn').classList.add('hidden');
    document.getElementById('userMenu').classList.remove('hidden');
    document.getElementById('userName').textContent = currentUser.name;
    
    if (currentUser.isAdmin) {
        document.getElementById('adminBtn').classList.remove('hidden');
        document.getElementById('adminBtn').addEventListener('click', openAdminModal);
    }
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    
    document.getElementById('loginBtn').classList.remove('hidden');
    document.getElementById('mobileLoginBtn').classList.remove('hidden');
    document.getElementById('userMenu').classList.add('hidden');
    document.getElementById('adminBtn').classList.add('hidden');
    
    showNotification('Logged out successfully', 'success');
    loadPage('home');
}

// Admin functionality
function openAdminModal() {
    document.getElementById('adminModal').classList.remove('hidden');
    setTimeout(() => {
        document.querySelector('#adminModal .modal-content').classList.add('show');
    }, 10);
    loadAdminContent('courses');
}

function closeAdminModal() {
    document.querySelector('#adminModal .modal-content').classList.remove('show');
    setTimeout(() => {
        document.getElementById('adminModal').classList.add('hidden');
    }, 300);
}

function loadAdminContent(tab) {
    const content = document.getElementById('adminContent');
    
    // Update active tab
    document.querySelectorAll('.admin-tab').forEach(t => {
        t.classList.remove('active', 'border-purple-600', 'text-purple-600');
        t.classList.add('text-gray-600');
    });
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active', 'border-purple-600', 'text-purple-600');
    
    switch(tab) {
        case 'courses':
            content.innerHTML = `
                <div class="space-y-6">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-semibold">Manage Courses</h3>
                        <button onclick="openUploadModal('course')" class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                            Add Course
                        </button>
                    </div>
                    <div id="adminCoursesList" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        ${courses.map(course => `
                            <div class="border border-gray-200 rounded-lg p-4">
                                <img src="${course.image}" alt="${course.title}" class="w-full h-32 object-cover rounded-lg mb-3">
                                <h4 class="font-semibold">${course.title}</h4>
                                <p class="text-gray-600 text-sm">${course.description}</p>
                                <div class="flex justify-between items-center mt-3">
                                    <span class="font-bold text-purple-600">$${course.price}</span>
                                    <button onclick="deleteCourse(${course.id})" class="text-red-600 text-sm hover:text-red-700">Delete</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            break;
        case 'events':
            content.innerHTML = `
                <div class="space-y-6">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-semibold">Manage Events</h3>
                        <button onclick="openUploadModal('event')" class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                            Create Event
                        </button>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        ${events.map(event => `
                            <div class="border border-gray-200 rounded-lg p-4">
                                <img src="${event.image}" alt="${event.title}" class="w-full h-32 object-cover rounded-lg mb-3">
                                <h4 class="font-semibold">${event.title}</h4>
                                <p class="text-gray-600 text-sm">${event.description}</p>
                                <div class="flex justify-between items-center mt-3">
                                    <span class="text-sm text-gray-500">${event.registrations} registered</span>
                                    <button onclick="deleteEvent(${event.id})" class="text-red-600 text-sm hover:text-red-700">Delete</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            break;
        case 'marketplace':
            content.innerHTML = `
                <div class="space-y-6">
                    <h3 class="text-lg font-semibold">Marketplace Items</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        ${marketplaceItems.map(item => `
                            <div class="border border-gray-200 rounded-lg p-4">
                                <img src="${item.image}" alt="${item.name}" class="w-full h-32 object-cover rounded-lg mb-3">
                                <h4 class="font-semibold">${item.name}</h4>
                                <p class="text-gray-600 text-sm">₹${item.price.toLocaleString()}</p>
                                <p class="text-gray-500 text-xs">Seller: ${item.seller.name}</p>
                                <button onclick="deleteMarketplaceItem(${item.id})" class="mt-2 text-red-600 text-sm hover:text-red-700">Delete</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            break;
        case 'users':
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            content.innerHTML = `
                <div class="space-y-6">
                    <h3 class="text-lg font-semibold">Registered Users</h3>
                    <div class="bg-white rounded-lg border border-gray-200">
                        <table class="w-full">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-900">Name</th>
                                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-900">Email</th>
                                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200">
                                ${users.map((user, index) => `
                                    <tr>
                                        <td class="px-4 py-3 text-sm text-gray-900">${user.name}</td>
                                        <td class="px-4 py-3 text-sm text-gray-600">${user.email}</td>
                                        <td class="px-4 py-3 text-sm">
                                            <button onclick="deleteUser(${index})" class="text-red-600 hover:text-red-700">Delete</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            break;
        case 'analytics':
            content.innerHTML = `
                <div class="space-y-6">
                    <h3 class="text-lg font-semibold">Platform Analytics</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="bg-purple-100 rounded-lg p-6 text-center">
                            <div class="text-3xl font-bold text-purple-600">${courses.length}</div>
                            <div class="text-purple-700">Total Courses</div>
                        </div>
                        <div class="bg-blue-100 rounded-lg p-6 text-center">
                            <div class="text-3xl font-bold text-blue-600">${events.length}</div>
                            <div class="text-blue-700">Total Events</div>
                        </div>
                        <div class="bg-green-100 rounded-lg p-6 text-center">
                            <div class="text-3xl font-bold text-green-600">${marketplaceItems.length}</div>
                            <div class="text-green-700">Marketplace Items</div>
                        </div>
                    </div>
                    <div class="bg-white rounded-lg border border-gray-200 p-6">
                        <h4 class="font-semibold mb-4">Revenue Overview</h4>
                        <div class="space-y-3">
                            <div class="flex justify-between">
                                <span>Course Sales</span>
                                <span class="font-semibold">$${courses.reduce((sum, course) => sum + course.price, 0)}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Event Registrations</span>
                                <span class="font-semibold">${events.reduce((sum, event) => sum + event.registrations, 0)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            break;
    }
}

// Upload modal functionality
function openUploadModal(type) {
    document.getElementById('uploadModal').classList.remove('hidden');
    document.getElementById('uploadModalTitle').textContent = `Upload ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    
    setTimeout(() => {
        document.querySelector('#uploadModal .modal-content').classList.add('show');
    }, 10);
}

function closeUploadModal() {
    document.querySelector('#uploadModal .modal-content').classList.remove('show');
    setTimeout(() => {
        document.getElementById('uploadModal').classList.add('hidden');
    }, 300);
}

// Handle upload form submission
document.getElementById('uploadForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const title = document.getElementById('uploadTitle').value;
    const description = document.getElementById('uploadDescription').value;
    const price = document.getElementById('uploadPrice').value;
    const category = document.getElementById('uploadCategory').value;
    const image = document.getElementById('uploadImage').value;
    
    const newItem = {
        id: Date.now(),
        title: title,
        name: title, // For marketplace compatibility
        description: description,
        price: parseInt(price) || 0,
        image: image || 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
        dateCreated: new Date().toISOString()
    };
    
    if (category === 'course') {
        newItem.instructor = 'Admin';
        newItem.duration = '4 weeks';
        newItem.level = 'Intermediate';
        courses.push(newItem);
        localStorage.setItem('courses', JSON.stringify(courses));
    } else if (category === 'event') {
        newItem.date = new Date().toISOString().split('T')[0];
        newItem.time = '10:00 AM';
        newItem.location = 'Campus';
        newItem.registrations = 0;
        events.push(newItem);
        localStorage.setItem('events', JSON.stringify(events));
    }
    
    // Reset form and close modal
    document.getElementById('uploadForm').reset();
    closeUploadModal();
    
    // Refresh admin content
    loadAdminContent(category === 'course' ? 'courses' : 'events');
    
    showNotification(`${category.charAt(0).toUpperCase() + category.slice(1)} uploaded successfully!`, 'success');
});

// Delete functions
function deleteCourse(courseId) {
    if (confirm('Are you sure you want to delete this course?')) {
        courses = courses.filter(course => course.id !== courseId);
        localStorage.setItem('courses', JSON.stringify(courses));
        loadAdminContent('courses');
        showNotification('Course deleted successfully!', 'success');
    }
}

function deleteEvent(eventId) {
    if (confirm('Are you sure you want to delete this event?')) {
        events = events.filter(event => event.id !== eventId);
        localStorage.setItem('events', JSON.stringify(events));
        loadAdminContent('events');
        showNotification('Event deleted successfully!', 'success');
    }
}

function deleteMarketplaceItem(itemId) {
    if (confirm('Are you sure you want to delete this item?')) {
        marketplaceItems = marketplaceItems.filter(item => item.id !== itemId);
        localStorage.setItem('marketplaceItems', JSON.stringify(marketplaceItems));
        loadAdminContent('marketplace');
        showNotification('Item deleted successfully!', 'success');
    }
}

function deleteUser(userIndex) {
    if (confirm('Are you sure you want to delete this user?')) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        users.splice(userIndex, 1);
        localStorage.setItem('users', JSON.stringify(users));
        loadAdminContent('users');
        showNotification('User deleted successfully!', 'success');
    }
}

// Initialize admin modal handlers
document.getElementById('closeAdminModal').addEventListener('click', closeAdminModal);
document.getElementById('closeUploadModal').addEventListener('click', closeUploadModal);

// Admin tab handlers
document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
        loadAdminContent(e.target.dataset.tab);
    });
});

// Chat bot functionality
function initializeChatBot() {
    const chatToggle = document.getElementById('chatToggle');
    const chatWindow = document.getElementById('chatWindow');
    const chatInput = document.getElementById('chatInput');
    const chatSend = document.getElementById('chatSend');
    const chatMessages = document.getElementById('chatMessages');
    
    chatToggle.addEventListener('click', () => {
        chatWindow.classList.toggle('hidden');
    });
    
    chatSend.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    
    function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;
        
        // Add user message
        addMessage(message, 'user');
        chatInput.value = '';
        
        // Simulate AI response
        setTimeout(() => {
            const response = generateAIResponse(message);
            addMessage(response, 'bot');
        }, 1000);
    }
    
    function addMessage(message, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `text-sm ${sender === 'user' ? 'text-right' : 'text-left'}`;
        messageDiv.innerHTML = `
            <div class="${sender === 'user' ? 'bg-purple-600 text-white ml-8' : 'bg-gray-200 text-gray-800 mr-8'} rounded-lg px-3 py-2 inline-block">
                ${message}
            </div>
        `;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function generateAIResponse(message) {
        const responses = {
            'hello': 'Hi there! How can I help you with your studies today?',
            'courses': 'We have many great courses available! Check out our Skill Hub for programming, design, and more.',
            'help': 'I can help you with course recommendations, study tips, campus information, and more. What would you like to know?',
            'campus': 'Our campus has great facilities including a modern library, gym, cafeteria, and various student clubs.',
            'events': 'Check out our Events page for upcoming workshops, cultural nights, and academic seminars!',
            'marketplace': 'The Student Marketplace is perfect for buying and selling textbooks, electronics, and other items with fellow students.'
        };
        
        const lowerMessage = message.toLowerCase();
        for (const [key, response] of Object.entries(responses)) {
            if (lowerMessage.includes(key)) {
                return response;
            }
        }
        
        return "That's an interesting question! I'm here to help with your academic journey. Try asking about courses, campus life, or events.";
    }
}

// Utility functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg text-white font-medium transform transition-all duration-300 translate-x-full ${
        type === 'success' ? 'bg-green-600' : 
        type === 'error' ? 'bg-red-600' : 
        'bg-blue-600'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GrowLoop();
});