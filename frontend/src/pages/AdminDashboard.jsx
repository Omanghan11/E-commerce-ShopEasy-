import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Dialog from '../Components/Dialog';
import { useDialog } from '../hooks/useDialog';
import './AdminDashboard.css';
import {
    FaUsers,
    FaBox,
    FaShoppingCart,
    FaChartBar,
    FaCog,
    FaPlus,
    FaEdit,
    FaTrash,
    FaEye,
    FaSearch,
    FaFilter,
    FaBell,
    FaSignOutAlt,
    FaHome,
    FaStar,
    FaDollarSign,
    FaUserShield,
    FaTimes,
    FaCheck,
    FaExclamationTriangle,
    FaLock,
    FaUnlock,
    FaTicketAlt,
    FaComments,
    FaPaperPlane,
    FaClock,
    FaBars
} from 'react-icons/fa';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { dialog, hideDialog, showConfirm } = useDialog();

    // Enhanced management states
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showBrandModal, setShowBrandModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [editingBrand, setEditingBrand] = useState(null);
    const [newCategory, setNewCategory] = useState({
        name: '',
        description: '',
        image: '',
        parentCategory: '',
        sortOrder: 0,
        seoTitle: '',
        seoDescription: ''
    });
    const [newBrand, setNewBrand] = useState({
        name: '',
        description: '',
        logo: '',
        website: '',
        email: '',
        phone: '',
        categories: [],
        isFeatured: false,
        seoTitle: '',
        seoDescription: ''
    });
    const [showNotifications, setShowNotifications] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Data states
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalTickets: 0,
        openTickets: 0
    });
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [analyticsData, setAnalyticsData] = useState({
        salesData: [],
        revenueData: [],
        categoryData: [],
        topProducts: []
    });
    const [productsPagination, setProductsPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalProducts: 0
    });

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showErrorDialog, setShowErrorDialog] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [newProduct, setNewProduct] = useState({
        name: '',
        category: '',
        price: '',
        stock: '',
        description: '',
        brand: '',
        currency: 'INR'
    });
    const [selectedImages, setSelectedImages] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewingProduct, setViewingProduct] = useState(null);
    const [replaceImages, setReplaceImages] = useState(false);

    // User management states
    const [showUserViewModal, setShowUserViewModal] = useState(false);
    const [showUserEditModal, setShowUserEditModal] = useState(false);
    const [showUserAddModal, setShowUserAddModal] = useState(false);
    const [viewingUser, setViewingUser] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [newUser, setNewUser] = useState({
        fullName: '',
        email: '',
        phone: '',
        role: 'user'
    });
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [blockingUser, setBlockingUser] = useState(null);
    const [blockReason, setBlockReason] = useState('');

    // Ticket management states
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [ticketReply, setTicketReply] = useState('');

    // Discount and Coupon management states
    const [discounts, setDiscounts] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [showDiscountModal, setShowDiscountModal] = useState(false);
    const [showCouponModal, setShowCouponModal] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState(null);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [newDiscount, setNewDiscount] = useState({
        name: '',
        description: '',
        discountType: 'percentage',
        discountValue: '',
        targetType: 'all',
        targetIds: [],
        startDate: '',
        endDate: '',
        minOrderAmount: '',
        maxDiscountAmount: '',
        isActive: true,
        usageLimit: ''
    });
    const [newCoupon, setNewCoupon] = useState({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: '',
        minOrderAmount: '',
        maxDiscountAmount: '',
        usageLimit: '',
        userUsageLimit: '',
        startDate: '',
        endDate: '',
        isActive: true,
        applicableProducts: [],
        applicableCategories: []
    });

    // Product selection states for discounts/coupons
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [selectAllProducts, setSelectAllProducts] = useState(false);
    const [filteredProducts, setFilteredProducts] = useState([]);

    // Active discounts and coupons states
    const [activeDiscounts, setActiveDiscounts] = useState({ discountMap: {}, activeDiscounts: [] });
    const [activeCoupons, setActiveCoupons] = useState({ couponMap: {}, activeCoupons: [] });

    // Order management states
    const [showOrderViewModal, setShowOrderViewModal] = useState(false);
    const [showOrderEditModal, setShowOrderEditModal] = useState(false);
    const [viewingOrder, setViewingOrder] = useState(null);
    const [editingOrder, setEditingOrder] = useState(null);
    const [orderSearchTerm, setOrderSearchTerm] = useState('');

    // Product filter states
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [productFilters, setProductFilters] = useState({
        category: '',
        status: '',
        lowStock: false
    });

    // Static categories list for backward compatibility
    const staticCategories = [
        'Electronics', 'Mobile', 'Laptops', 'Fashion', 'Books',
        'HomeKitchen', 'Grocery', 'SportsOutdoors', 'BeautyHealth',
        'Automotive', 'ToysGames'
    ];

    // Function to fetch all products for discount/coupon forms
    const fetchAllProducts = async (searchTerm = '') => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
            const searchParam = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : '';
            const response = await fetch(`https://shopeasy-backend-sagk.onrender.com/api/admin/products?limit=10000${searchParam}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const productsData = await response.json();
                console.log('All products data:', productsData);
                setAllProducts(productsData.products || productsData);
                return productsData.products || productsData;
            } else {
                console.error('Failed to fetch all products:', response.status, response.statusText);
                return [];
            }
        } catch (error) {
            console.error('Error fetching all products:', error);
            return [];
        }
    };

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');

            // Fetch stats, users, products, orders, tickets, notifications, analytics, categories, brands, discounts, coupons
            const [statsRes, usersRes, productsRes, ordersRes, ticketsRes, notificationsRes, analyticsRes, categoriesRes, brandsRes, discountsRes, couponsRes] = await Promise.all([
                fetch('https://shopeasy-backend-sagk.onrender.com/api/admin/stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('https://shopeasy-backend-sagk.onrender.com/api/admin/users', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`https://shopeasy-backend-sagk.onrender.com/api/admin/products?page=${currentPage}&limit=20`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('https://shopeasy-backend-sagk.onrender.com/api/admin/orders', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('https://shopeasy-backend-sagk.onrender.com/api/admin/tickets', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('https://shopeasy-backend-sagk.onrender.com/api/admin/notifications', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('https://shopeasy-backend-sagk.onrender.com/api/admin/analytics', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('https://shopeasy-backend-sagk.onrender.com/api/categories/admin?limit=1000', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('https://shopeasy-backend-sagk.onrender.com/api/brands/admin', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('https://shopeasy-backend-sagk.onrender.com/api/admin/discounts', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('https://shopeasy-backend-sagk.onrender.com/api/admin/coupons', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData);
            }

            if (usersRes.ok) {
                const usersData = await usersRes.json();
                setUsers(usersData);
            }

            if (productsRes.ok) {
                const productsData = await productsRes.json();
                setProducts(productsData.products || productsData);
                if (productsData.totalProducts !== undefined) {
                    setProductsPagination({
                        currentPage: productsData.currentPage,
                        totalPages: productsData.totalPages,
                        totalProducts: productsData.totalProducts,
                        hasNextPage: productsData.hasNextPage,
                        hasPrevPage: productsData.hasPrevPage
                    });
                }
            }

            if (ordersRes.ok) {
                const ordersData = await ordersRes.json();
                setOrders(ordersData);
            }

            if (ticketsRes.ok) {
                const ticketsData = await ticketsRes.json();
                setTickets(ticketsData.tickets || ticketsData);
            }

            if (notificationsRes.ok) {
                const notificationsData = await notificationsRes.json();
                setNotifications(notificationsData);
            }

            if (analyticsRes.ok) {
                const analyticsData = await analyticsRes.json();
                setAnalyticsData(analyticsData);
            }

            if (categoriesRes.ok) {
                const categoriesData = await categoriesRes.json();
                console.log('Categories data:', categoriesData);
                setCategories(categoriesData.categories || categoriesData);
            } else {
                console.error('Failed to fetch categories:', categoriesRes.status, categoriesRes.statusText);
                // Try to fetch from public endpoint as fallback
                try {
                    const publicCategoriesRes = await fetch('https://shopeasy-backend-sagk.onrender.com/api/categories');
                    if (publicCategoriesRes.ok) {
                        const publicCategoriesData = await publicCategoriesRes.json();
                        console.log('Public categories data:', publicCategoriesData);
                        setCategories(publicCategoriesData);
                    }
                } catch (error) {
                    console.error('Failed to fetch public categories:', error);
                }
            }

            if (brandsRes.ok) {
                const brandsData = await brandsRes.json();
                setBrands(brandsData.brands || brandsData);
            }

            if (discountsRes.ok) {
                const discountsData = await discountsRes.json();
                setDiscounts(discountsData.discounts || discountsData);
            } else {
                console.error('Failed to fetch discounts:', discountsRes.status, discountsRes.statusText);
            }

            if (couponsRes.ok) {
                const couponsData = await couponsRes.json();
                setCoupons(couponsData.coupons || couponsData);
            } else {
                console.error('Failed to fetch coupons:', couponsRes.status, couponsRes.statusText);
            }

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    }, [currentPage]);

    // Check admin authentication
    useEffect(() => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
            const userStr = localStorage.getItem('user') || sessionStorage.getItem('user') || '{}';
            let user = {};

            try {
                user = JSON.parse(userStr);
            } catch (parseError) {
                console.error('Error parsing user data:', parseError);
                user = {};
            }

            if (!token || user.role !== 'admin') {
                navigate('/login');
                return;
            }

            fetchDashboardData();
            fetchAllProducts();
            fetchActiveDiscounts();
            fetchActiveCoupons();
        } catch (error) {
            console.error('Error in admin authentication check:', error);
            setError('Authentication error');
            navigate('/login');
        }
    }, [navigate, fetchDashboardData]);

    const refreshProducts = async (page = currentPage, search = searchTerm, filters = productFilters) => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
            const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
            const categoryParam = filters.category ? `&category=${encodeURIComponent(filters.category)}` : '';
            const statusParam = filters.status ? `&status=${encodeURIComponent(filters.status)}` : '';
            const lowStockParam = filters.lowStock ? '&lowStock=true' : '';
            
            const response = await fetch(`https://shopeasy-backend-sagk.onrender.com/api/admin/products?page=${page}&limit=20${searchParam}${categoryParam}${statusParam}${lowStockParam}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const productsData = await response.json();
                setProducts(productsData.products || productsData);
                if (productsData.totalProducts !== undefined) {
                    setProductsPagination({
                        currentPage: productsData.currentPage,
                        totalPages: productsData.totalPages,
                        totalProducts: productsData.totalProducts,
                        hasNextPage: productsData.hasNextPage,
                        hasPrevPage: productsData.hasPrevPage
                    });
                }
            }
        } catch (err) {
            console.error('Error refreshing products:', err);
        }
    };

    // Handle product search
    const handleProductSearch = (searchValue) => {
        setSearchTerm(searchValue);
        setCurrentPage(1); // Reset to first page when searching
        refreshProducts(1, searchValue, productFilters);
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        refreshProducts(newPage, searchTerm, productFilters);
    };

    // Handle product filters
    const handleFilterChange = (filterType, value) => {
        const newFilters = { ...productFilters, [filterType]: value };
        setProductFilters(newFilters);
        setCurrentPage(1);
        refreshProducts(1, searchTerm, newFilters);
    };

    const clearFilters = () => {
        const clearedFilters = { category: '', status: '', lowStock: false };
        setProductFilters(clearedFilters);
        setCurrentPage(1);
        refreshProducts(1, searchTerm, clearedFilters);
    };

    const hasActiveFilters = productFilters.category || productFilters.status || productFilters.lowStock;

    const showSuccessMessage = (message) => {
        setSuccessMessage(message);
        setShowSuccessDialog(true);
    };

    const showErrorMessage = (message) => {
        setErrorMessage(message);
        setShowErrorDialog(true);
    };

    // User Management Functions
    const handleViewUser = (user) => {
        setViewingUser(user);
        setShowUserViewModal(true);
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setNewUser({
            fullName: user.fullName || user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            role: user.role || 'user'
        });
        setShowUserEditModal(true);
    };

    const handleUpdateUser = async () => {
        if (!newUser.fullName || !newUser.email) {
            showSuccessMessage('Please fill in all required fields');
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
            const response = await fetch(`https://shopeasy-backend-sagk.onrender.com/api/admin/users/${editingUser.id || editingUser._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newUser)
            });

            const responseData = await response.json();

            if (response.ok) {
                showSuccessMessage('User updated successfully!');
                setShowUserEditModal(false);
                setEditingUser(null);
                setNewUser({ fullName: '', email: '', phone: '', role: 'user' });
                refreshUsers();
            } else {
                showSuccessMessage(responseData.message || 'Failed to update user');
            }
        } catch (error) {
            console.error('Error updating user:', error);
            showSuccessMessage('Network error: Failed to update user');
        } finally {
            setSubmitting(false);
        }
    };

    const handleBlockUser = (user, currentStatus) => {
        if (currentStatus === 'blocked') {
            // Directly unblock
            handleUnblockUser(user.id || user._id);
        } else {
            // Show block modal for reason
            setBlockingUser(user);
            setShowBlockModal(true);
        }
    };

    const handleUnblockUser = async (userId) => {
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
            const response = await fetch(`https://shopeasy-backend-sagk.onrender.com/api/admin/users/${userId}/unblock`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const responseData = await response.json();

            if (response.ok) {
                showSuccessMessage('User unblocked successfully!');
                refreshUsers();
            } else {
                showSuccessMessage(responseData.message || 'Failed to unblock user');
            }
        } catch (error) {
            console.error('Error unblocking user:', error);
            showSuccessMessage('Network error: Failed to unblock user');
        } finally {
            setSubmitting(false);
        }
    };

    const handleConfirmBlock = async () => {
        if (!blockReason.trim()) {
            showSuccessMessage('Please provide a reason for blocking this user');
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
            const response = await fetch(`https://shopeasy-backend-sagk.onrender.com/api/admin/users/${blockingUser.id || blockingUser._id}/block`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ reason: blockReason })
            });

            const responseData = await response.json();

            if (response.ok) {
                showSuccessMessage('User blocked successfully!');
                setShowBlockModal(false);
                setBlockingUser(null);
                setBlockReason('');
                refreshUsers();
            } else {
                showSuccessMessage(responseData.message || 'Failed to block user');
            }
        } catch (error) {
            console.error('Error blocking user:', error);
            showSuccessMessage('Network error: Failed to block user');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        showConfirm(
            'Are you sure you want to delete this user? This action cannot be undone.',
            () => deleteUser(userId),
            'Delete User'
        );
    };

    const deleteUser = async (userId) => {

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
            const response = await fetch(`https://shopeasy-backend-sagk.onrender.com/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const responseData = await response.json();

            if (response.ok) {
                showSuccessMessage('User deleted successfully!');
                refreshUsers();
            } else {
                showSuccessMessage(responseData.message || 'Failed to delete user');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            showSuccessMessage('Network error: Failed to delete user');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddUser = async () => {
        if (!newUser.fullName || !newUser.email) {
            showSuccessMessage('Please fill in all required fields (Name and Email)');
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
            const response = await fetch('https://shopeasy-backend-sagk.onrender.com/api/admin/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newUser)
            });

            const responseData = await response.json();

            if (response.ok) {
                showSuccessMessage(`User created successfully! Temporary password: ${responseData.tempPassword}`);
                setShowUserAddModal(false);
                setNewUser({ fullName: '', email: '', phone: '', role: 'user' });
                refreshUsers();
            } else {
                showSuccessMessage(responseData.message || 'Failed to create user');
            }
        } catch (error) {
            console.error('Error creating user:', error);
            showSuccessMessage('Network error: Failed to create user');
        } finally {
            setSubmitting(false);
        }
    };

    const refreshUsers = async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
            const response = await fetch('https://shopeasy-backend-sagk.onrender.com/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const usersData = await response.json();
                setUsers(usersData);
            }
        } catch (err) {
            console.error('Error refreshing users:', err);
        }
    };

    // Discount Management Functions
    const refreshDiscounts = async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
            const response = await fetch('https://shopeasy-backend-sagk.onrender.com/api/admin/discounts', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const discountsData = await response.json();
                setDiscounts(discountsData.discounts || discountsData);
            }
        } catch (err) {
            console.error('Error refreshing discounts:', err);
        }
    };

    const handleAddDiscount = async () => {
        if (!newDiscount.name || !newDiscount.discountValue || !newDiscount.startDate || !newDiscount.endDate) {
            showSuccessMessage('Please fill in all required fields');
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
            const response = await fetch('https://shopeasy-backend-sagk.onrender.com/api/admin/discounts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newDiscount)
            });

            const responseData = await response.json();

            if (response.ok) {
                showSuccessMessage('Discount created successfully!');
                setShowDiscountModal(false);
                setNewDiscount({
                    name: '',
                    description: '',
                    discountType: 'percentage',
                    discountValue: '',
                    targetType: 'all',
                    targetIds: [],
                    startDate: '',
                    endDate: '',
                    minOrderAmount: '',
                    maxDiscountAmount: '',
                    isActive: true,
                    usageLimit: ''
                });
                refreshDiscounts();
            } else {
                showSuccessMessage(responseData.message || 'Failed to create discount');
            }
        } catch (error) {
            console.error('Error creating discount:', error);
            showSuccessMessage('Network error: Failed to create discount');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditDiscount = async (discount) => {
        setEditingDiscount(discount);
        setNewDiscount({
            name: discount.name,
            description: discount.description || '',
            discountType: discount.discountType,
            discountValue: discount.discountValue.toString(),
            targetType: discount.targetType,
            targetIds: discount.targetIds || [],
            startDate: new Date(discount.startDate).toISOString().split('T')[0],
            endDate: new Date(discount.endDate).toISOString().split('T')[0],
            minOrderAmount: discount.minOrderAmount?.toString() || '',
            maxDiscountAmount: discount.maxDiscountAmount?.toString() || '',
            isActive: discount.isActive,
            usageLimit: discount.usageLimit?.toString() || ''
        });
        // Initialize product search
        await handleDiscountProductSearch('');
        setShowDiscountModal(true);
    };

    const handleUpdateDiscount = async () => {
        if (!newDiscount.name || !newDiscount.discountValue || !newDiscount.startDate || !newDiscount.endDate) {
            showSuccessMessage('Please fill in all required fields');
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
            const response = await fetch(`https://shopeasy-backend-sagk.onrender.com/api/admin/discounts/${editingDiscount._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newDiscount)
            });

            const responseData = await response.json();

            if (response.ok) {
                showSuccessMessage('Discount updated successfully!');
                setShowDiscountModal(false);
                setEditingDiscount(null);
                setNewDiscount({
                    name: '',
                    description: '',
                    discountType: 'percentage',
                    discountValue: '',
                    targetType: 'all',
                    targetIds: [],
                    startDate: '',
                    endDate: '',
                    minOrderAmount: '',
                    maxDiscountAmount: '',
                    isActive: true,
                    usageLimit: ''
                });
                refreshDiscounts();
            } else {
                showSuccessMessage(responseData.message || 'Failed to update discount');
            }
        } catch (error) {
            console.error('Error updating discount:', error);
            showSuccessMessage('Network error: Failed to update discount');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteDiscount = async (discountId) => {
        showConfirm(
            'Are you sure you want to delete this discount? This action cannot be undone.',
            () => deleteDiscount(discountId),
            'Delete Discount'
        );
    };

    const deleteDiscount = async (discountId) => {

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
            const response = await fetch(`https://shopeasy-backend-sagk.onrender.com/api/admin/discounts/${discountId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const responseData = await response.json();

            if (response.ok) {
                showSuccessMessage('Discount deleted successfully!');
                refreshDiscounts();
            } else {
                showSuccessMessage(responseData.message || 'Failed to delete discount');
            }
        } catch (error) {
            console.error('Error deleting discount:', error);
            showSuccessMessage('Network error: Failed to delete discount');
        } finally {
            setSubmitting(false);
        }
    };

    // Toggle discount visibility
    const handleToggleDiscountVisibility = async (discountId, currentStatus) => {
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
            const response = await fetch(`https://shopeasy-backend-sagk.onrender.com/api/admin/discounts/${discountId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isActive: !currentStatus })
            });

            const responseData = await response.json();

            if (response.ok) {
                showSuccessMessage(`Discount ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
                refreshDiscounts();
            } else {
                showSuccessMessage(responseData.message || 'Failed to update discount status');
            }
        } catch (error) {
            console.error('Error toggling discount visibility:', error);
            showSuccessMessage('Network error: Failed to update discount status');
        } finally {
            setSubmitting(false);
        }
    };

    // Coupon Management Functions
    const refreshCoupons = async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
            const response = await fetch('https://shopeasy-backend-sagk.onrender.com/api/admin/coupons', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const couponsData = await response.json();
                setCoupons(couponsData.coupons || couponsData);
            }
        } catch (err) {
            console.error('Error refreshing coupons:', err);
        }
    };

    const generateCouponCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setNewCoupon({ ...newCoupon, code: result });
    };

    const handleAddCoupon = async () => {
        if (!newCoupon.code || !newCoupon.discountValue || !newCoupon.startDate || !newCoupon.endDate) {
            showSuccessMessage('Please fill in all required fields');
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
            const response = await fetch('https://shopeasy-backend-sagk.onrender.com/api/admin/coupons', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newCoupon)
            });

            const responseData = await response.json();

            if (response.ok) {
                showSuccessMessage('Coupon created successfully!');
                setShowCouponModal(false);
                setNewCoupon({
                    code: '',
                    description: '',
                    discountType: 'percentage',
                    discountValue: '',
                    minOrderAmount: '',
                    maxDiscountAmount: '',
                    usageLimit: '',
                    userUsageLimit: '',
                    startDate: '',
                    endDate: '',
                    isActive: true,
                    applicableProducts: [],
                    applicableCategories: []
                });
                refreshCoupons();
            } else {
                showSuccessMessage(responseData.message || 'Failed to create coupon');
            }
        } catch (error) {
            console.error('Error creating coupon:', error);
            showSuccessMessage('Network error: Failed to create coupon');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditCoupon = async (coupon) => {
        setEditingCoupon(coupon);
        setNewCoupon({
            code: coupon.code,
            description: coupon.description || '',
            discountType: coupon.discountType,
            discountValue: coupon.discountValue.toString(),
            minOrderAmount: coupon.minOrderAmount?.toString() || '',
            maxDiscountAmount: coupon.maxDiscountAmount?.toString() || '',
            usageLimit: coupon.usageLimit?.toString() || '',
            userUsageLimit: coupon.userUsageLimit?.toString() || '',
            startDate: new Date(coupon.startDate).toISOString().split('T')[0],
            endDate: new Date(coupon.endDate).toISOString().split('T')[0],
            isActive: coupon.isActive,
            applicableProducts: coupon.applicableProducts || [],
            applicableCategories: coupon.applicableCategories || []
        });
        // Initialize product search
        await handleDiscountProductSearch('');
        setShowCouponModal(true);
    };

    const handleUpdateCoupon = async () => {
        if (!newCoupon.code || !newCoupon.discountValue || !newCoupon.startDate || !newCoupon.endDate) {
            showSuccessMessage('Please fill in all required fields');
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
            const response = await fetch(`https://shopeasy-backend-sagk.onrender.com/api/admin/coupons/${editingCoupon._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newCoupon)
            });

            const responseData = await response.json();

            if (response.ok) {
                showSuccessMessage('Coupon updated successfully!');
                setShowCouponModal(false);
                setEditingCoupon(null);
                setNewCoupon({
                    code: '',
                    description: '',
                    discountType: 'percentage',
                    discountValue: '',
                    minOrderAmount: '',
                    maxDiscountAmount: '',
                    usageLimit: '',
                    userUsageLimit: '',
                    startDate: '',
                    endDate: '',
                    isActive: true,
                    applicableProducts: [],
                    applicableCategories: []
                });
                refreshCoupons();
            } else {
                showSuccessMessage(responseData.message || 'Failed to update coupon');
            }
        } catch (error) {
            console.error('Error updating coupon:', error);
            showSuccessMessage('Network error: Failed to update coupon');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteCoupon = async (couponId) => {
        showConfirm(
            'Are you sure you want to delete this coupon? This action cannot be undone.',
            () => deleteCoupon(couponId),
            'Delete Coupon'
        );
    };

    const deleteCoupon = async (couponId) => {

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
            const response = await fetch(`https://shopeasy-backend-sagk.onrender.com/api/admin/coupons/${couponId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const responseData = await response.json();

            if (response.ok) {
                showSuccessMessage('Coupon deleted successfully!');
                refreshCoupons();
            } else {
                showSuccessMessage(responseData.message || 'Failed to delete coupon');
            }
        } catch (error) {
            console.error('Error deleting coupon:', error);
            showSuccessMessage('Network error: Failed to delete coupon');
        } finally {
            setSubmitting(false);
        }
    };

    // Toggle coupon visibility
    const handleToggleCouponVisibility = async (couponId, currentStatus) => {
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
            const response = await fetch(`https://shopeasy-backend-sagk.onrender.com/api/admin/coupons/${couponId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isActive: !currentStatus })
            });

            const responseData = await response.json();

            if (response.ok) {
                showSuccessMessage(`Coupon ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
                refreshCoupons();
            } else {
                showSuccessMessage(responseData.message || 'Failed to update coupon status');
            }
        } catch (error) {
            console.error('Error toggling coupon visibility:', error);
            showSuccessMessage('Network error: Failed to update coupon status');
        } finally {
            setSubmitting(false);
        }
    };

    // Ticket Management Functions
    const refreshTickets = async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
            const response = await fetch('https://shopeasy-backend-sagk.onrender.com/api/admin/tickets', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const ticketsData = await response.json();
                setTickets(ticketsData.tickets || ticketsData);
            }
        } catch (err) {
            console.error('Error refreshing tickets:', err);
        }
    };

    const handleViewTicket = async (ticket) => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
            const response = await fetch(`https://shopeasy-backend-sagk.onrender.com/api/admin/tickets/${ticket._id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setSelectedTicket(data);
                setShowTicketModal(true);
            }
        } catch (error) {
            console.error('Error fetching ticket details:', error);
            showSuccessMessage('Failed to load ticket details');
        }
    };

    const handleTicketStatusChange = async (ticketId, newStatus) => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
            const response = await fetch(`https://shopeasy-backend-sagk.onrender.com/api/admin/tickets/${ticketId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                showSuccessMessage('Ticket status updated successfully!');
                refreshTickets();
                if (selectedTicket && selectedTicket._id === ticketId) {
                    setSelectedTicket(prev => ({ ...prev, status: newStatus }));
                }
            } else {
                showSuccessMessage('Failed to update ticket status');
            }
        } catch (error) {
            console.error('Error updating ticket status:', error);
            showSuccessMessage('Network error: Failed to update ticket status');
        }
    };

    const handleTicketReply = async () => {
        if (!ticketReply.trim()) {
            showSuccessMessage('Please enter a reply message');
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
            const response = await fetch(`https://shopeasy-backend-sagk.onrender.com/api/admin/tickets/${selectedTicket._id}/reply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message: ticketReply })
            });

            const data = await response.json();

            if (response.ok) {
                setSelectedTicket(prev => ({
                    ...prev,
                    messages: [...prev.messages, data.newMessage]
                }));
                setTicketReply('');
                showSuccessMessage('Reply sent successfully!');
                refreshTickets();
            } else {
                showSuccessMessage(data.message || 'Failed to send reply');
            }
        } catch (error) {
            console.error('Error sending reply:', error);
            showSuccessMessage('Network error: Failed to send reply');
        } finally {
            setSubmitting(false);
        }
    };

    // Order Management Functions
    const handleViewOrder = async (orderId) => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
            const response = await fetch(`https://shopeasy-backend-sagk.onrender.com/api/admin/orders/${orderId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setViewingOrder(data);
                setShowOrderViewModal(true);
            } else {
                showSuccessMessage('Failed to load order details');
            }
        } catch (error) {
            console.error('Error viewing order:', error);
            showSuccessMessage('Failed to load order details');
        }
    };

    const handleEditOrder = async (orderId) => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
            const response = await fetch(`https://shopeasy-backend-sagk.onrender.com/api/admin/orders/${orderId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setEditingOrder(data);
                setShowOrderEditModal(true);
            } else {
                showSuccessMessage('Failed to load order details');
            }
        } catch (error) {
            console.error('Error loading order for edit:', error);
            showSuccessMessage('Failed to load order details');
        }
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
            const response = await fetch(`https://shopeasy-backend-sagk.onrender.com/api/admin/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await response.json();

            if (response.ok) {
                showSuccessMessage('Order status updated successfully!');
                setShowOrderEditModal(false);
                setEditingOrder(null);
                fetchDashboardData(); // Refresh orders
            } else {
                showSuccessMessage(data.message || 'Failed to update order status');
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            showSuccessMessage('Network error: Failed to update order status');
        } finally {
            setSubmitting(false);
        }
    };

    // Handle view product
    const handleViewProduct = async (productId) => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
            const response = await fetch(`https://shopeasy-backend-sagk.onrender.com/api/admin/products/${productId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const productData = await response.json();
                console.log('Product data received:', productData);
                console.log('Product images:', productData.images);
                setViewingProduct(productData);
                setShowViewModal(true);
            } else {
                showSuccessMessage('Failed to load product details');
            }
        } catch (error) {
            console.error('Error viewing product:', error);
            showSuccessMessage('Failed to load product details');
        }
    };

    // Handle edit product
    const handleEditProduct = async (productId) => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
            const response = await fetch(`https://shopeasy-backend-sagk.onrender.com/api/admin/products/${productId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const productData = await response.json();
                setEditingProduct(productData);
                setNewProduct({
                    name: productData.name,
                    category: productData.category,
                    price: productData.price.toString(),
                    stock: productData.stock.toString(),
                    description: productData.description || '',
                    brand: productData.brand || '',
                    currency: productData.currency || 'INR'
                });
                setShowEditModal(true);
            } else {
                showSuccessMessage('Failed to load product details');
            }
        } catch (error) {
            console.error('Error loading product for edit:', error);
            showSuccessMessage('Failed to load product details');
        }
    };

    // Handle update product
    const handleUpdateProduct = async () => {
        if (!newProduct.name || !newProduct.category || !newProduct.price || !newProduct.stock || !newProduct.brand || !newProduct.description) {
            showSuccessMessage('Please fill in all required fields (Name, Category, Brand, Price, Stock, Description)');
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');

            const formData = new FormData();
            formData.append('name', newProduct.name);
            formData.append('category', newProduct.category);
            formData.append('price', parseFloat(newProduct.price));
            formData.append('stock', parseInt(newProduct.stock));
            formData.append('description', newProduct.description);
            formData.append('brand', newProduct.brand);
            formData.append('currency', newProduct.currency);
            formData.append('replaceImages', replaceImages.toString());

            // Add selected images if any
            selectedImages.forEach((image, index) => {
                if (image) {
                    formData.append('images', image);
                }
            });

            const response = await fetch(`https://shopeasy-backend-sagk.onrender.com/api/admin/products/${editingProduct?.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const responseData = await response.json();

            if (response.ok) {
                showSuccessMessage('Product updated successfully!');
                setShowEditModal(false);
                setEditingProduct(null);
                setNewProduct({
                    name: '',
                    category: '',
                    price: '',
                    stock: '',
                    description: '',
                    brand: '',
                    currency: 'INR'
                });
                setSelectedImages([]);
                setReplaceImages(false);
                refreshProducts();
            } else {
                showSuccessMessage(responseData.message || 'Failed to update product');
            }
        } catch (error) {
            console.error('Error updating product:', error);
            showSuccessMessage('Network error: Failed to update product');
        } finally {
            setSubmitting(false);
        }
    };

    // Handle delete product
    const handleDeleteProduct = async (productId) => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
            const response = await fetch(`https://shopeasy-backend-sagk.onrender.com/api/admin/products/${productId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const responseData = await response.json();

            if (response.ok) {
                showSuccessMessage('Product deleted successfully!');
                refreshProducts();
            } else {
                showSuccessMessage(responseData.message || 'Failed to delete product');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            showSuccessMessage('Network error: Failed to delete product');
        }
    };

    // Handle add product
    const handleAddProduct = async () => {
        console.log('Validation check - newProduct:', newProduct);
        console.log('Field values:', {
            name: newProduct.name,
            category: newProduct.category,
            price: newProduct.price,
            stock: newProduct.stock,
            brand: newProduct.brand,
            description: newProduct.description
        });

        if (!newProduct.name || !newProduct.category || !newProduct.price || !newProduct.stock || !newProduct.brand || !newProduct.description) {
            console.log('Validation failed - missing fields');
            showErrorMessage('Please fill in all required fields (Name, Category, Brand, Price, Stock, Description)');
            return;
        }

        console.log('Validation passed - proceeding with API call');

        if (parseFloat(newProduct.price) <= 0) {
            showErrorMessage('Price must be greater than 0');
            return;
        }

        if (parseInt(newProduct.stock) < 0) {
            showErrorMessage('Stock cannot be negative');
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');

            const formData = new FormData();
            formData.append('name', newProduct.name);
            formData.append('category', newProduct.category);
            formData.append('price', parseFloat(newProduct.price));
            formData.append('stock', parseInt(newProduct.stock));
            formData.append('description', newProduct.description);
            formData.append('brand', newProduct.brand);
            formData.append('currency', newProduct.currency);

            // Add selected images
            selectedImages.forEach((image, index) => {
                if (image) {
                    formData.append('images', image);
                }
            });

            const response = await fetch('https://shopeasy-backend-sagk.onrender.com/api/products/admin', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const responseData = await response.json();

            if (response.ok) {
                showSuccessMessage('Product added successfully!');
                setShowAddModal(false);
                setNewProduct({
                    name: '',
                    category: '',
                    price: '',
                    stock: '',
                    description: '',
                    brand: '',
                    currency: 'INR'
                });
                setSelectedImages([]);
                refreshProducts();
            } else {
                showErrorMessage(responseData.message || 'Failed to add product');
            }
        } catch (error) {
            console.error('Error adding product:', error);
            showErrorMessage('Network error: Failed to add product');
        } finally {
            setSubmitting(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('user');
        navigate('/login');
    };

    // Category handlers
    const handleAddCategory = async () => {
        if (!newCategory.name) {
            showErrorMessage('Category name is required');
            return;
        }

        try {
            setSubmitting(true);
            const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');

            const response = await fetch('https://shopeasy-backend-sagk.onrender.com/api/categories/admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newCategory)
            });

            if (response.ok) {
                showSuccessMessage('Category added successfully!');
                setShowCategoryModal(false);
                setNewCategory({
                    name: '',
                    description: '',
                    image: '',
                    parentCategory: '',
                    sortOrder: 0,
                    seoTitle: '',
                    seoDescription: ''
                });
                refreshCategories();
            } else {
                const errorData = await response.json();
                showErrorMessage(errorData.message || 'Failed to add category');
            }
        } catch (error) {
            console.error('Error adding category:', error);
            showErrorMessage('Error adding category');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditCategory = async () => {
        if (!editingCategory || !editingCategory.name) {
            showErrorMessage('Category name is required');
            return;
        }

        try {
            setSubmitting(true);
            const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');

            const response = await fetch(`https://shopeasy-backend-sagk.onrender.com/api/categories/admin/${editingCategory._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editingCategory)
            });

            if (response.ok) {
                showSuccessMessage('Category updated successfully!');
                setShowCategoryModal(false);
                setEditingCategory(null);
                refreshCategories();
            } else {
                const errorData = await response.json();
                showErrorMessage(errorData.message || 'Failed to update category');
            }
        } catch (error) {
            console.error('Error updating category:', error);
            showErrorMessage('Error updating category');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');

            const response = await fetch(`https://shopeasy-backend-sagk.onrender.com/api/categories/admin/${categoryId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                showSuccessMessage('Category deleted successfully!');
                refreshCategories();
            } else {
                const errorData = await response.json();
                showErrorMessage(errorData.message || 'Failed to delete category');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            showErrorMessage('Error deleting category');
        }
    };

    const refreshCategories = async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
            const response = await fetch('https://shopeasy-backend-sagk.onrender.com/api/categories/admin', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setCategories(data.categories || data);
            }
        } catch (error) {
            console.error('Error refreshing categories:', error);
        }
    };

    // Brand handlers
    const handleAddBrand = async () => {
        if (!newBrand.name) {
            showErrorMessage('Brand name is required');
            return;
        }

        try {
            setSubmitting(true);
            const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');

            const response = await fetch('https://shopeasy-backend-sagk.onrender.com/api/brands/admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newBrand)
            });

            if (response.ok) {
                showSuccessMessage('Brand added successfully!');
                setShowBrandModal(false);
                setNewBrand({
                    name: '',
                    description: '',
                    logo: '',
                    website: '',
                    email: '',
                    phone: '',
                    categories: [],
                    isFeatured: false,
                    seoTitle: '',
                    seoDescription: ''
                });
                refreshBrands();
            } else {
                const errorData = await response.json();
                showErrorMessage(errorData.message || 'Failed to add brand');
            }
        } catch (error) {
            console.error('Error adding brand:', error);
            showErrorMessage('Error adding brand');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditBrand = async () => {
        if (!editingBrand || !editingBrand.name) {
            showErrorMessage('Brand name is required');
            return;
        }

        try {
            setSubmitting(true);
            const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');

            const response = await fetch(`https://shopeasy-backend-sagk.onrender.com/api/brands/admin/${editingBrand._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editingBrand)
            });

            if (response.ok) {
                showSuccessMessage('Brand updated successfully!');
                setShowBrandModal(false);
                setEditingBrand(null);
                refreshBrands();
            } else {
                const errorData = await response.json();
                showErrorMessage(errorData.message || 'Failed to update brand');
            }
        } catch (error) {
            console.error('Error updating brand:', error);
            showErrorMessage('Error updating brand');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteBrand = async (brandId) => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');

            const response = await fetch(`https://shopeasy-backend-sagk.onrender.com/api/brands/admin/${brandId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                showSuccessMessage('Brand deleted successfully!');
                refreshBrands();
            } else {
                const errorData = await response.json();
                showErrorMessage(errorData.message || 'Failed to delete brand');
            }
        } catch (error) {
            console.error('Error deleting brand:', error);
            showErrorMessage('Error deleting brand');
        }
    };

    const refreshBrands = async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
            const response = await fetch('https://shopeasy-backend-sagk.onrender.com/api/brands/admin', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setBrands(data.brands || data);
            }
        } catch (error) {
            console.error('Error refreshing brands:', error);
        }
    };

    // Product selection functions for discounts/coupons

    // Product selection functions for discounts/coupons
    const handleDiscountProductSearch = async (searchTerm) => {
        setProductSearchTerm(searchTerm);
        const products = await fetchAllProducts(searchTerm);
        setFilteredProducts(products);
    };

    const handleSelectAllProducts = (checked) => {
        setSelectAllProducts(checked);
        if (checked) {
            const allProductIds = filteredProducts.map(product => product._id);
            setSelectedProducts(allProductIds);
        } else {
            setSelectedProducts([]);
        }
    };

    const handleProductSelection = (productId, checked) => {
        if (checked) {
            setSelectedProducts(prev => [...prev, productId]);
        } else {
            setSelectedProducts(prev => prev.filter(id => id !== productId));
            setSelectAllProducts(false);
        }
    };

    // Fetch active discounts and coupons
    const fetchActiveDiscounts = async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
            const response = await fetch('https://shopeasy-backend-sagk.onrender.com/api/admin/active-discounts', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setActiveDiscounts(data);
            }
        } catch (error) {
            console.error('Error fetching active discounts:', error);
        }
    };

    const fetchActiveCoupons = async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
            const response = await fetch('https://shopeasy-backend-sagk.onrender.com/api/admin/active-coupons', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setActiveCoupons(data);
            }
        } catch (error) {
            console.error('Error fetching active coupons:', error);
        }
    };

    const sidebarItems = [
        { id: 'dashboard', label: 'Dashboard', icon: FaHome },
        { id: 'products', label: 'Products', icon: FaBox },
        { id: 'categories', label: 'Categories', icon: FaFilter },
        { id: 'brands', label: 'Brands', icon: FaStar },
        { id: 'users', label: 'Users', icon: FaUsers },
        { id: 'orders', label: 'Orders', icon: FaShoppingCart },
        { id: 'tickets', label: 'Support Tickets', icon: FaTicketAlt },
        { id: 'discounts', label: 'Discounts & Coupons', icon: FaDollarSign },
        { id: 'analytics', label: 'Analytics', icon: FaChartBar },
        { id: 'settings', label: 'Settings', icon: FaCog },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-600 text-xl mb-4">⚠️ Error</div>
                    <p className="text-red-700 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        Reload Page
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
            {/* Enhanced Sidebar */}
            <div className="w-72 bg-white shadow-xl border-r border-gray-200 flex flex-col h-screen">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 flex-shrink-0">
                    <h1 className="text-2xl font-bold text-white">ShopEasy Admin</h1>
                    <p className="text-blue-100 text-sm mt-1">Management Dashboard</p>
                </div>

                <nav className="flex-1 overflow-y-auto mt-6 px-4 pb-4">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center px-4 py-3 mb-2 text-left rounded-lg transition-all duration-200 ${activeTab === item.id
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md transform scale-105'
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                                    }`}
                            >
                                <Icon className="w-5 h-5 mr-3" />
                                {item.label}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-gray-200 flex-shrink-0">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                        <FaSignOutAlt className="w-4 h-4 mr-2" />
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Enhanced Header */}
                <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 capitalize bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                {activeTab}
                            </h2>
                            <p className="text-gray-600 mt-1">Manage your {activeTab} efficiently</p>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors duration-200 relative"
                                >
                                    <FaBell className="w-5 h-5" />
                                    {notifications.length > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                                            {notifications.length}
                                        </span>
                                    )}
                                </button>

                                {showNotifications && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
                                        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                                            <h3 className="font-semibold text-gray-800">Notifications</h3>
                                        </div>
                                        <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="text-center py-4 text-gray-500">
                                                    <FaBell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                    <p className="text-sm">No new notifications</p>
                                                </div>
                                            ) : (
                                                notifications.map((notification) => (
                                                    <NotificationItem
                                                        key={notification.id}
                                                        color={
                                                            notification.type === 'success' ? 'green' :
                                                                notification.type === 'warning' ? 'yellow' :
                                                                    notification.type === 'error' ? 'red' : 'blue'
                                                        }
                                                        title={notification.title}
                                                        message={notification.message}
                                                        time={new Date(notification.timestamp).toLocaleString()}
                                                    />
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-lg">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                                    <FaUserShield className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800">Admin User</p>
                                    <p className="text-xs text-gray-500">Administrator</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 p-6 overflow-y-auto">
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {activeTab === 'dashboard' && <DashboardContent stats={stats} orders={orders} products={products} />}
                    {activeTab === 'products' && (
                        <ProductsContent
                            products={products}
                            showAddModal={showAddModal}
                            setShowAddModal={setShowAddModal}
                            searchTerm={searchTerm}
                            setSearchTerm={handleProductSearch}
                            setSelectedItem={setSelectedItem}
                            setShowDeleteModal={setShowDeleteModal}
                            refreshProducts={refreshProducts}
                            productsPagination={productsPagination}
                            handlePageChange={handlePageChange}
                            showSuccessMessage={showSuccessMessage}
                            handleViewProduct={handleViewProduct}
                            handleEditProduct={handleEditProduct}
                            handleDeleteProduct={handleDeleteProduct}
                            categories={categories.length > 0 ? categories.map(cat => cat.name) : staticCategories}
                            brands={brands}
                            newProduct={newProduct}
                            setNewProduct={setNewProduct}
                            selectedImages={selectedImages}
                            setSelectedImages={setSelectedImages}
                            submitting={submitting}
                            handleAddProduct={handleAddProduct}
                            activeDiscounts={activeDiscounts}
                            activeCoupons={activeCoupons}
                            showConfirm={showConfirm}
                            productFilters={productFilters}
                            handleFilterChange={handleFilterChange}
                            clearFilters={clearFilters}
                            hasActiveFilters={hasActiveFilters}
                            showFilterDropdown={showFilterDropdown}
                            setShowFilterDropdown={setShowFilterDropdown}
                        />
                    )}
                    {activeTab === 'categories' && (
                        <CategoriesContent
                            categories={categories}
                            showCategoryModal={showCategoryModal}
                            setShowCategoryModal={setShowCategoryModal}
                            editingCategory={editingCategory}
                            setEditingCategory={setEditingCategory}
                            newCategory={newCategory}
                            setNewCategory={setNewCategory}
                            handleAddCategory={handleAddCategory}
                            handleEditCategory={handleEditCategory}
                            handleDeleteCategory={handleDeleteCategory}
                            showSuccessMessage={showSuccessMessage}
                            refreshCategories={refreshCategories}
                            activeDiscounts={activeDiscounts}
                            activeCoupons={activeCoupons}
                        />
                    )}
                    {activeTab === 'brands' && (
                        <BrandsContent
                            brands={brands}
                            showBrandModal={showBrandModal}
                            setShowBrandModal={setShowBrandModal}
                            editingBrand={editingBrand}
                            setEditingBrand={setEditingBrand}
                            newBrand={newBrand}
                            setNewBrand={setNewBrand}
                            handleAddBrand={handleAddBrand}
                            handleEditBrand={handleEditBrand}
                            handleDeleteBrand={handleDeleteBrand}
                            showSuccessMessage={showSuccessMessage}
                            refreshBrands={refreshBrands}
                            categories={staticCategories}
                        />
                    )}
                    {activeTab === 'users' && (
                        <UsersContent
                            users={users}
                            userSearchTerm={userSearchTerm}
                            setUserSearchTerm={setUserSearchTerm}
                            handleViewUser={handleViewUser}
                            handleEditUser={handleEditUser}
                            handleBlockUser={handleBlockUser}
                            handleDeleteUser={handleDeleteUser}
                            setShowUserAddModal={setShowUserAddModal}
                            submitting={submitting}
                        />
                    )}
                    {activeTab === 'orders' && <OrdersContent orders={orders} onViewOrder={handleViewOrder} onEditOrder={handleEditOrder} searchTerm={orderSearchTerm} setSearchTerm={setOrderSearchTerm} />}
                    {activeTab === 'tickets' && (
                        <TicketsContent
                            tickets={tickets}
                            handleViewTicket={handleViewTicket}
                            handleTicketStatusChange={handleTicketStatusChange}
                        />
                    )}
                    {activeTab === 'discounts' && (
                        <DiscountManagementContent
                            discounts={discounts}
                            coupons={coupons}
                            showDiscountModal={showDiscountModal}
                            setShowDiscountModal={setShowDiscountModal}
                            showCouponModal={showCouponModal}
                            setShowCouponModal={setShowCouponModal}
                            editingDiscount={editingDiscount}
                            setEditingDiscount={setEditingDiscount}
                            editingCoupon={editingCoupon}
                            setEditingCoupon={setEditingCoupon}
                            newDiscount={newDiscount}
                            setNewDiscount={setNewDiscount}
                            newCoupon={newCoupon}
                            setNewCoupon={setNewCoupon}
                            handleAddDiscount={handleAddDiscount}
                            handleUpdateDiscount={handleUpdateDiscount}
                            handleDeleteDiscount={handleDeleteDiscount}
                            handleEditDiscount={handleEditDiscount}
                            handleToggleDiscountVisibility={handleToggleDiscountVisibility}
                            handleAddCoupon={handleAddCoupon}
                            handleUpdateCoupon={handleUpdateCoupon}
                            handleDeleteCoupon={handleDeleteCoupon}
                            handleEditCoupon={handleEditCoupon}
                            handleToggleCouponVisibility={handleToggleCouponVisibility}
                            generateCouponCode={generateCouponCode}
                            submitting={submitting}
                            categories={categories}
                            products={allProducts}
                            filteredProducts={filteredProducts}
                            selectedProducts={selectedProducts}
                            selectAllProducts={selectAllProducts}
                            productSearchTerm={productSearchTerm}
                            handleDiscountProductSearch={handleDiscountProductSearch}
                            handleSelectAllProducts={handleSelectAllProducts}
                            handleProductSelection={handleProductSelection}
                        />
                    )}
                    {activeTab === 'analytics' && <AnalyticsContent stats={stats} orders={orders} analyticsData={analyticsData} />}
                    {activeTab === 'settings' && <SettingsContent />}
                </main>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <DeleteModal
                    item={selectedItem}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={() => {
                        // Handle delete logic here
                        setShowDeleteModal(false);
                        setSelectedItem(null);
                    }}
                />
            )}

            {/* View Product Modal */}
            {showViewModal && viewingProduct && (
                <ViewProductModal
                    product={viewingProduct}
                    onClose={() => {
                        setShowViewModal(false);
                        setViewingProduct(null);
                    }}
                />
            )}

            {/* User Modals */}
            {showUserViewModal && viewingUser && (
                <UserViewModal
                    user={viewingUser}
                    onClose={() => {
                        setShowUserViewModal(false);
                        setViewingUser(null);
                    }}
                />
            )}

            {showUserEditModal && editingUser && (
                <UserEditModal
                    user={editingUser}
                    newUser={newUser}
                    setNewUser={setNewUser}
                    submitting={submitting}
                    onClose={() => {
                        setShowUserEditModal(false);
                        setEditingUser(null);
                        setNewUser({ fullName: '', email: '', phone: '', role: 'user' });
                    }}
                    onUpdate={handleUpdateUser}
                />
            )}

            {showUserAddModal && (
                <UserAddModal
                    newUser={newUser}
                    setNewUser={setNewUser}
                    submitting={submitting}
                    onClose={() => {
                        setShowUserAddModal(false);
                        setNewUser({ fullName: '', email: '', phone: '', role: 'user' });
                    }}
                    onAdd={handleAddUser}
                />
            )}

            {showBlockModal && blockingUser && (
                <BlockUserModal
                    user={blockingUser}
                    blockReason={blockReason}
                    setBlockReason={setBlockReason}
                    submitting={submitting}
                    onClose={() => {
                        setShowBlockModal(false);
                        setBlockingUser(null);
                        setBlockReason('');
                    }}
                    onConfirm={handleConfirmBlock}
                />
            )}

            {/* Ticket Modal */}
            {showTicketModal && selectedTicket && (
                <TicketModal
                    ticket={selectedTicket}
                    ticketReply={ticketReply}
                    setTicketReply={setTicketReply}
                    submitting={submitting}
                    onClose={() => {
                        setShowTicketModal(false);
                        setSelectedTicket(null);
                        setTicketReply('');
                    }}
                    onStatusChange={handleTicketStatusChange}
                    onSendReply={handleTicketReply}
                />
            )}

            {/* Edit Product Modal */}
            {showEditModal && editingProduct && (
                <EditProductModal
                    product={editingProduct}
                    newProduct={newProduct}
                    setNewProduct={setNewProduct}
                    selectedImages={selectedImages}
                    setSelectedImages={setSelectedImages}
                    categories={categories}
                    submitting={submitting}
                    replaceImages={replaceImages}
                    setReplaceImages={setReplaceImages}
                    onClose={() => {
                        setShowEditModal(false);
                        setEditingProduct(null);
                        setNewProduct({
                            name: '',
                            category: '',
                            price: '',
                            stock: '',
                            description: '',
                            brand: '',
                            currency: 'INR'
                        });
                        setSelectedImages([]);
                        setReplaceImages(false);
                    }}
                    onUpdate={handleUpdateProduct}
                />
            )}

            {/* Order View Modal */}
            {showOrderViewModal && viewingOrder && (
                <OrderViewModal
                    order={viewingOrder}
                    onClose={() => {
                        setShowOrderViewModal(false);
                        setViewingOrder(null);
                    }}
                />
            )}

            {/* Order Edit Modal */}
            {showOrderEditModal && editingOrder && (
                <OrderEditModal
                    order={editingOrder}
                    onClose={() => {
                        setShowOrderEditModal(false);
                        setEditingOrder(null);
                    }}
                    onUpdateStatus={handleUpdateOrderStatus}
                    submitting={submitting}
                />
            )}

            {/* Success Dialog */}
            {showSuccessDialog && (
                <SuccessDialog
                    message={successMessage}
                    onClose={() => setShowSuccessDialog(false)}
                />
            )}

            {/* Error Dialog */}
            {showErrorDialog && (
                <ErrorDialog
                    message={errorMessage}
                    onClose={() => setShowErrorDialog(false)}
                />
            )}

            {/* Confirmation Dialog */}
            <Dialog
                isOpen={dialog.isOpen}
                onClose={hideDialog}
                onConfirm={dialog.onConfirm}
                title={dialog.title}
                message={dialog.message}
                type={dialog.type}
                confirmText={dialog.confirmText}
                cancelText={dialog.cancelText}
                showCancel={dialog.showCancel}
            />
        </div>
    );
};

// Notification Item Component
const NotificationItem = ({ color, title, message, time }) => (
    <div className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors duration-200">
        <div className={`w-2 h-2 bg-${color}-500 rounded-full mt-2 flex-shrink-0`}></div>
        <div className="flex-1">
            <p className="text-sm text-gray-800 font-medium">{title}</p>
            {message && <p className="text-xs text-gray-600 mt-1">{message}</p>}
            <p className="text-xs text-gray-500 mt-1">{time}</p>
        </div>
    </div>
);

// Dashboard Content Component
const DashboardContent = ({ stats, orders, products }) => (
    <div className="space-y-8">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
                title="Total Users"
                value={stats.totalUsers}
                icon={FaUsers}
                color="blue"
                trend="+12%"
            />
            <StatsCard
                title="Total Products"
                value={stats.totalProducts}
                icon={FaBox}
                color="green"
                trend="+8%"
            />
            <StatsCard
                title="Total Orders"
                value={stats.totalOrders}
                icon={FaShoppingCart}
                color="yellow"
                trend="-3%"
                trendDown={true}
            />
            <StatsCard
                title="Total Revenue"
                value={`₹${stats.totalRevenue?.toLocaleString() || 0}`}
                icon={FaDollarSign}
                color="purple"
                trend="+15%"
            />
            <StatsCard
                title="Support Tickets"
                value={stats.totalTickets || 0}
                icon={FaTicketAlt}
                color="indigo"
                trend={`${stats.openTickets || 0} open`}
            />
        </div>

        {/* Enhanced Activity Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <RecentOrdersCard orders={orders} />
            <LowStockCard products={products} />
        </div>
    </div>
);

// Enhanced Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color, trend, trendDown }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-600 font-medium">{title}</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{typeof value === 'number' ? value.toLocaleString() : value}</p>
            </div>
            <div className={`bg-${color}-100 p-4 rounded-full`}>
                <Icon className={`w-8 h-8 text-${color}-600`} />
            </div>
        </div>
        <div className="mt-4 flex items-center">
            <span className={`text-sm font-medium ${trendDown ? 'text-red-500' : 'text-green-500'}`}>
                {trendDown ? '↘' : '↗'} {trend}
            </span>
            <span className="text-gray-500 text-sm ml-2">from last month</span>
        </div>
    </div>
);

// Recent Orders Card Component
const RecentOrdersCard = ({ orders = [] }) => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
        </div>
        <div className="p-6">
            <div className="space-y-4">
                {orders.slice(0, 3).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <FaShoppingCart className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-800">Order #{order.id.slice(-6)}</p>
                                <p className="text-sm text-gray-500">{order.customer}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-medium text-gray-800">₹{order.total?.toLocaleString()}</p>
                            <p className="text-sm text-green-600">{order.status}</p>
                        </div>
                    </div>
                ))}
                {orders.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <FaShoppingCart className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p>No orders yet</p>
                    </div>
                )}
            </div>
        </div>
    </div>
);

// Low Stock Products Card Component
const LowStockCard = ({ products = [] }) => {
    const lowStockProducts = products.filter(product => product?.stock <= 10);

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Low Stock Products</h3>
            </div>
            <div className="p-6">
                <div className="space-y-4">
                    {lowStockProducts.slice(0, 3).map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <FaBox className="w-4 h-4 text-red-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800">{product.name}</p>
                                    <p className="text-sm text-gray-500">{product.category}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-medium text-red-600">{product.stock} left</p>
                                <p className="text-sm text-red-600">Low Stock</p>
                            </div>
                        </div>
                    ))}
                    {lowStockProducts.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <FaBox className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p>All products are well stocked</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Enhanced Product Selection Component for Discounts/Coupons
const ProductSelectionComponent = ({
    allProducts,
    filteredProducts,
    selectedProducts,
    selectAllProducts,
    productSearchTerm,
    onProductSearch,
    onSelectAll,
    onProductSelect
}) => {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700">Select Products</h4>
                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={selectAllProducts}
                        onChange={(e) => onSelectAll(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">Select All ({filteredProducts.length})</span>
                </div>
            </div>

            <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                    type="text"
                    placeholder="Search products..."
                    value={productSearchTerm}
                    onChange={(e) => onProductSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredProducts.length > 0 ? (
                    <div className="p-2 space-y-2">
                        {filteredProducts.map((product) => (
                            <label key={product._id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedProducts.includes(product._id)}
                                    onChange={(e) => onProductSelect(product._id, e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-900 truncate">{product.name}</div>
                                    <div className="text-xs text-gray-500">₹{product.price} • {product.category}</div>
                                </div>
                            </label>
                        ))}
                    </div>
                ) : (
                    <div className="p-4 text-center text-gray-500 text-sm">
                        {productSearchTerm ? 'No products found matching your search' : 'No products available'}
                    </div>
                )}
            </div>

            {selectedProducts.length > 0 && (
                <div className="text-sm text-blue-600">
                    {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
                </div>
            )}
        </div>
    );
};

// Component to display active discounts/coupons
const DiscountBadge = ({ discounts, coupons, type = 'product', id }) => {
    const productDiscounts = discounts?.discountMap?.products?.[id] || [];
    const categoryDiscounts = discounts?.discountMap?.categories?.[id] || [];
    const allDiscounts = discounts?.discountMap?.all || [];
    const productCoupons = coupons?.couponMap?.products?.[id] || [];
    const categoryCoupons = coupons?.couponMap?.categories?.[id] || [];

    const activeDiscounts = type === 'product'
        ? [...productDiscounts, ...allDiscounts]
        : [...categoryDiscounts, ...allDiscounts];
    const activeCoupons = type === 'product' ? productCoupons : categoryCoupons;

    if (activeDiscounts.length === 0 && activeCoupons.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-1 mt-1">
            {activeDiscounts.map((discount, index) => (
                <span key={`discount-${index}`} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {discount.discountType === 'percentage' ? `${discount.discountValue}% OFF` : `₹${discount.discountValue} OFF`}
                </span>
            ))}
            {activeCoupons.map((coupon, index) => (
                <span key={`coupon-${index}`} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {coupon.code}: {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                </span>
            ))}
        </div>
    );
};

// Products Content Component
const ProductsContent = ({ products, showAddModal, setShowAddModal, searchTerm, setSearchTerm, setSelectedItem, setShowDeleteModal, refreshProducts, productsPagination, handlePageChange, showSuccessMessage, handleViewProduct, handleEditProduct, handleDeleteProduct, categories, newProduct, setNewProduct, selectedImages, setSelectedImages, submitting, handleAddProduct, activeDiscounts, activeCoupons, showConfirm, productFilters, handleFilterChange, clearFilters, hasActiveFilters, showFilterDropdown, setShowFilterDropdown }) => {
    // No local filtering - search is handled by backend
    
    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showFilterDropdown && !event.target.closest('.filter-dropdown-container')) {
                setShowFilterDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showFilterDropdown, setShowFilterDropdown]);



    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                        />
                    </div>
                    <div className="relative filter-dropdown-container">
                        <button 
                            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                            className={`flex items-center px-4 py-3 border rounded-lg transition-colors duration-200 ${
                                hasActiveFilters 
                                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                    : 'border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            <FaFilter className="w-4 h-4 mr-2" />
                            Filter
                            {hasActiveFilters && (
                                <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                                    {[productFilters.category, productFilters.status, productFilters.lowStock].filter(Boolean).length}
                                </span>
                            )}
                        </button>

                        {/* Filter Dropdown */}
                        {showFilterDropdown && (
                            <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                                <div className="p-4 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                                        {hasActiveFilters && (
                                            <button
                                                onClick={clearFilters}
                                                className="text-sm text-blue-600 hover:text-blue-800"
                                            >
                                                Clear All
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4 space-y-4">
                                    {/* Category Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Category
                                        </label>
                                        <select
                                            value={productFilters.category}
                                            onChange={(e) => handleFilterChange('category', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">All Categories</option>
                                            {categories.map((cat) => (
                                                <option key={cat._id || cat.name} value={cat.name}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Status Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Status
                                        </label>
                                        <select
                                            value={productFilters.status}
                                            onChange={(e) => handleFilterChange('status', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">All Status</option>
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>

                                    {/* Low Stock Filter */}
                                    <div>
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={productFilters.lowStock}
                                                onChange={(e) => handleFilterChange('lowStock', e.target.checked)}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <span className="text-sm font-medium text-gray-700">
                                                Low Stock Only (≤10 items)
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                                    <button
                                        onClick={() => setShowFilterDropdown(false)}
                                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                    <FaPlus className="w-4 h-4 mr-2" />
                    Add Product
                </button>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {(products || []).map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50 transition-colors duration-200">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg mr-4 flex items-center justify-center">
                                            <FaBox className="w-5 h-5 text-gray-500" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                            <div className="text-sm text-gray-500">ID: {product.id}</div>
                                            <DiscountBadge
                                                discounts={activeDiscounts}
                                                coupons={activeCoupons}
                                                type="product"
                                                id={product._id}
                                            />
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                        {product.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{product.price?.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`text-sm font-medium ${product.stock > 10 ? 'text-green-600' :
                                        product.stock > 0 ? 'text-yellow-600' : 'text-red-600'
                                        }`}>
                                        {product.stock}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <FaStar className="w-4 h-4 text-yellow-400 mr-1" />
                                        <span className="text-sm text-gray-900">{product.rating}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {product.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleViewProduct(product.id)}
                                            className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                            title="View Product"
                                        >
                                            <FaEye className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleEditProduct(product.id)}
                                            className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded-lg transition-colors duration-200"
                                            title="Edit Product"
                                        >
                                            <FaEdit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                showConfirm(
                                                    'Are you sure you want to delete this product? This action cannot be undone.',
                                                    () => handleDeleteProduct(product.id),
                                                    'Delete Product'
                                                );
                                            }}
                                            className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                            title="Delete Product"
                                        >
                                            <FaTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Enhanced Pagination */}
                {productsPagination && productsPagination.totalProducts > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                        <div className="text-sm text-gray-700">
                            Showing {((productsPagination.currentPage - 1) * 20) + 1} to {Math.min(productsPagination.currentPage * 20, productsPagination.totalProducts)} of {productsPagination.totalProducts} products
                        </div>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => handlePageChange(productsPagination.currentPage - 1)}
                                disabled={!productsPagination.hasPrevPage}
                                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>

                            <div className="flex items-center space-x-1">
                                {[...Array(Math.min(5, productsPagination.totalPages))].map((_, index) => {
                                    const pageNum = Math.max(1, productsPagination.currentPage - 2) + index;
                                    if (pageNum <= productsPagination.totalPages) {
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`px-3 py-1 text-sm border rounded-md ${pageNum === productsPagination.currentPage
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'border-gray-300 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    }
                                    return null;
                                })}
                            </div>

                            <button
                                onClick={() => handlePageChange(productsPagination.currentPage + 1)}
                                disabled={!productsPagination.hasNextPage}
                                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Enhanced Add Product Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-gray-900">Add New Product</h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="text-gray-400 hover:text-gray-600 p-1"
                            >
                                <FaTimes className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Basic Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                                    <input
                                        type="text"
                                        placeholder="Enter product name"
                                        value={newProduct.name}
                                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                                    <select
                                        value={newProduct.category}
                                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(category => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹) *</label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={newProduct.price}
                                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={newProduct.stock}
                                        onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                    placeholder="Enter product description"
                                    value={newProduct.description}
                                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                ></textarea>
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Product Images (Up to 4 images)</label>
                                <div className="space-y-3">
                                    {[0, 1, 2, 3].map((index) => (
                                        <div key={index} className="flex items-center space-x-3">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    const newImages = [...selectedImages];
                                                    newImages[index] = file;
                                                    setSelectedImages(newImages);
                                                }}
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            {selectedImages[index] && (
                                                <span className="text-sm text-green-600">✓ Selected</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    Select up to 4 images. Supported formats: JPG, PNG, GIF, WebP. Max size: 5MB each.
                                </p>
                            </div>

                            {/* Brand and Currency */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                                    <input
                                        type="text"
                                        placeholder="Enter brand name"
                                        value={newProduct.brand}
                                        onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                                    <select
                                        value={newProduct.currency}
                                        onChange={(e) => setNewProduct({ ...newProduct, currency: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="INR">INR (₹)</option>
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-8">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddProduct}
                                disabled={submitting}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50"
                            >
                                {submitting ? 'Adding...' : 'Add Product'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Users Content Component
const UsersContent = ({
    users = [],
    userSearchTerm,
    setUserSearchTerm,
    handleViewUser,
    handleEditUser,
    handleBlockUser,
    handleDeleteUser,
    setShowUserAddModal,
    submitting
}) => {
    const filteredUsers = users.filter(user =>
        user.fullName?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(userSearchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={userSearchTerm}
                            onChange={(e) => setUserSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                        />
                    </div>
                </div>

                <button
                    onClick={() => setShowUserAddModal(true)}
                    className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg"
                >
                    <FaPlus className="w-4 h-4 mr-2" />
                    Add User
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map((user) => (
                            <tr key={user.id || user._id} className="hover:bg-gray-50 transition-colors duration-200">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mr-4">
                                            <span className="text-white font-medium text-lg">
                                                {(user.fullName || user.name || 'U').charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{user.fullName || user.name}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                            {user.phone && <div className="text-sm text-gray-500">{user.phone}</div>}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.status === 'blocked' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                        {user.status === 'blocked' ? 'Blocked' : 'Active'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleViewUser(user)}
                                            className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                            title="View Details"
                                        >
                                            <FaEye className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleEditUser(user)}
                                            className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded-lg transition-colors duration-200"
                                            title="Edit User"
                                        >
                                            <FaEdit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleBlockUser(user, user.status)}
                                            disabled={submitting}
                                            className={`p-2 rounded-lg transition-colors duration-200 ${user.status === 'blocked'
                                                ? 'text-green-600 hover:text-green-900 hover:bg-green-50'
                                                : 'text-orange-600 hover:text-orange-900 hover:bg-orange-50'
                                                }`}
                                            title={user.status === 'blocked' ? 'Unblock User' : 'Block User'}
                                        >
                                            {user.status === 'blocked' ? <FaUnlock className="w-4 h-4" /> : <FaLock className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user.id || user._id)}
                                            disabled={submitting}
                                            className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                            title="Delete User"
                                        >
                                            <FaTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredUsers.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        {userSearchTerm ? 'No users found matching your search.' : 'No users found.'}
                    </div>
                )}
            </div>
        </div>
    );
};

// Orders Content Component
const OrdersContent = ({ orders = [], onViewOrder, onEditOrder, searchTerm, setSearchTerm }) => {
    const [statusFilter, setStatusFilter] = useState('All Status');

    // Filter orders based on search term and status
    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'All Status' ||
            order.status.toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option>All Status</option>
                        <option>Pending</option>
                        <option>Paid</option>
                        <option>Shipped</option>
                        <option>Completed</option>
                        <option>Cancelled</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-200">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id.slice(-8)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customer}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{order.total?.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                            order.status === 'paid' ? 'bg-yellow-100 text-yellow-800' :
                                                order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                        }`}>
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => onViewOrder(order.id)}
                                            className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                            title="View Order Details"
                                        >
                                            <FaEye className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onEditOrder(order.id)}
                                            className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded-lg transition-colors duration-200"
                                            title="Edit Order Status"
                                        >
                                            <FaEdit className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Analytics Content Component
const AnalyticsContent = ({ stats, orders, analyticsData }) => {
    // Calculate real analytics from all data
    const allOrdersData = analyticsData.allOrdersData || {};
    const avgOrderValue = allOrdersData.avgOrderValue ? allOrdersData.avgOrderValue.toFixed(0) :
        (orders.length > 0 ? (stats.totalRevenue / orders.length).toFixed(0) : 0);
    const conversionRate = stats.totalUsers > 0 ? ((allOrdersData.totalOrders || orders.length) / stats.totalUsers * 100).toFixed(1) : 0;
    const customerRetention = stats.totalUsers > 0 ? Math.min(((allOrdersData.totalOrders || orders.length) / stats.totalUsers * 100), 100).toFixed(0) : 0;

    // Prepare chart data
    const salesChartData = analyticsData.salesData || [];
    const revenueChartData = analyticsData.revenueData || [];
    const categoryData = analyticsData.categoryData || [];
    const topProducts = analyticsData.topProducts || [];
    const dailyTrends = analyticsData.dailyTrends || [];

    // Helper function to calculate dynamic chart height based on values
    const calculateChartHeight = (value, dataArray, minHeight = 10, maxHeight = 90) => {
        if (!dataArray.length) return minHeight;

        const values = dataArray.map(d => d.totalSales || d.totalRevenue || d.revenue || 0);
        const maxValue = Math.max(...values);
        const minValue = Math.min(...values);
        const range = maxValue - minValue;

        if (range === 0) return 50; // If all values are the same

        // Normalize the value and scale it
        const normalizedValue = (value - minValue) / range;
        const scaledHeight = minHeight + (normalizedValue * (maxHeight - minHeight));

        return Math.max(scaledHeight, minHeight);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Sales Chart */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Sales Overview (Last 30 Days)</h3>
                    <div className="h-64">
                        {salesChartData.length > 0 ? (
                            <div className="h-full">
                                {/* Y-axis scale indicators */}
                                <div className="flex h-48 relative">
                                    <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400 pr-2">
                                        <span>₹{Math.max(...salesChartData.map(d => d.totalSales)).toLocaleString()}</span>
                                        <span>₹{Math.round(Math.max(...salesChartData.map(d => d.totalSales)) * 0.5).toLocaleString()}</span>
                                        <span>₹0</span>
                                    </div>
                                    <div className="flex items-end justify-between h-full flex-1 ml-12 px-2 overflow-x-auto">
                                        {salesChartData.slice(-15).map((data, index) => (
                                            <div key={index} className="flex flex-col items-center flex-shrink-0 mx-1 min-w-[30px]">
                                                <div
                                                    className="bg-blue-500 rounded-t w-full transition-all duration-300 hover:bg-blue-600 relative group"
                                                    style={{
                                                        height: `${calculateChartHeight(data.totalSales, salesChartData)}%`,
                                                        minHeight: '8px',
                                                        width: '24px'
                                                    }}
                                                    title={`₹${data.totalSales.toLocaleString()} (${data.orderCount} orders)`}
                                                >
                                                    {/* Value label on hover */}
                                                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                        ₹{data.totalSales.toLocaleString()}
                                                    </div>
                                                </div>
                                                <span className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-left whitespace-nowrap">
                                                    {new Date(data._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-4 text-center">
                                    <p className="text-sm text-gray-600">
                                        Total (30 days): ₹{salesChartData.reduce((sum, data) => sum + data.totalSales, 0).toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        All Time: ₹{(allOrdersData.totalRevenue || stats.totalRevenue).toLocaleString()} ({allOrdersData.totalOrders || orders.length} orders)
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                    <FaChartBar className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                                    <p className="text-gray-600 font-medium">No Sales Data</p>
                                    <p className="text-sm text-gray-400">No sales in the last 30 days</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Revenue Chart */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Revenue Trends (All Time)</h3>
                    <div className="h-64">
                        {revenueChartData.length > 0 ? (
                            <div className="h-full">
                                {/* Y-axis scale indicators */}
                                <div className="flex h-48 relative">
                                    <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400 pr-2">
                                        <span>₹{Math.max(...revenueChartData.map(d => d.totalRevenue)).toLocaleString()}</span>
                                        <span>₹{Math.round(Math.max(...revenueChartData.map(d => d.totalRevenue)) * 0.5).toLocaleString()}</span>
                                        <span>₹0</span>
                                    </div>
                                    <div className="flex items-end justify-between h-full flex-1 ml-12 px-2 overflow-x-auto">
                                        {revenueChartData.slice(-12).map((data, index) => (
                                            <div key={index} className="flex flex-col items-center flex-shrink-0 mx-1 min-w-[40px]">
                                                <div
                                                    className="bg-green-500 rounded-t w-full transition-all duration-300 hover:bg-green-600 relative group"
                                                    style={{
                                                        height: `${calculateChartHeight(data.totalRevenue, revenueChartData)}%`,
                                                        minHeight: '8px',
                                                        width: '32px'
                                                    }}
                                                    title={`₹${data.totalRevenue.toLocaleString()} (${data.orderCount} orders)`}
                                                >
                                                    {/* Value label on hover */}
                                                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                        ₹{data.totalRevenue.toLocaleString()}
                                                    </div>
                                                </div>
                                                <span className="text-xs text-gray-500 mt-2 whitespace-nowrap">
                                                    {new Date(data._id.year, data._id.month - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-4 text-center">
                                    <p className="text-sm text-gray-600">
                                        Last 12 months: ₹{revenueChartData.slice(-12).reduce((sum, data) => sum + data.totalRevenue, 0).toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        All Time Total: ₹{revenueChartData.reduce((sum, data) => sum + data.totalRevenue, 0).toLocaleString()} ({revenueChartData.length} months)
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                    <FaChartBar className="w-12 h-12 text-green-400 mx-auto mb-2" />
                                    <p className="text-gray-600 font-medium">No Revenue Data</p>
                                    <p className="text-sm text-gray-400">No revenue data available</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Category Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Top Categories (All Time)</h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {categoryData.length} total categories
                        </span>
                    </div>
                    <div className="space-y-4">
                        {categoryData.length > 0 ? categoryData.slice(0, 5).map((category, index) => {
                            const totalCategorySales = categoryData.reduce((sum, cat) => sum + cat.totalSales, 0);
                            const percentage = totalCategorySales > 0 ? (category.totalSales / totalCategorySales) * 100 : 0;
                            const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-red-500'];

                            return (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className={`w-4 h-4 rounded-full ${colors[index]} mr-3 flex-shrink-0`}></div>
                                            <div className="min-w-0 flex-1">
                                                <span className="text-sm font-medium text-gray-700 truncate block">
                                                    {category._id || 'Uncategorized'}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {percentage.toFixed(1)}% of total sales
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0 ml-4">
                                            <p className="text-sm font-semibold text-gray-900">₹{category.totalSales.toLocaleString()}</p>
                                            <p className="text-xs text-gray-500">{category.itemCount} items sold</p>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${colors[index]} transition-all duration-500`}
                                            style={{ width: `${Math.max(percentage, 2)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="text-center py-8">
                                <FaChartBar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-600 font-medium">No Category Data</p>
                                <p className="text-sm text-gray-400">No orders with categorized products found</p>
                            </div>
                        )}
                    </div>
                    {categoryData.length > 5 && (
                        <div className="mt-4 text-center">
                            <p className="text-xs text-gray-500">
                                Showing top 5 of {categoryData.length} categories
                            </p>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Top Products (All Time)</h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            By revenue
                        </span>
                    </div>
                    <div className="space-y-4">
                        {topProducts.length > 0 ? topProducts.slice(0, 5).map((product, index) => {
                            const maxRevenue = Math.max(...topProducts.map(p => p.totalRevenue));
                            const percentage = maxRevenue > 0 ? (product.totalRevenue / maxRevenue) * 100 : 0;
                            const rankColors = ['bg-yellow-500', 'bg-gray-400', 'bg-orange-500', 'bg-blue-500', 'bg-green-500'];

                            return (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center min-w-0 flex-1">
                                            <div className={`w-8 h-8 ${rankColors[index]} rounded-full flex items-center justify-center mr-3 flex-shrink-0`}>
                                                <span className="text-xs font-bold text-white">#{index + 1}</span>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-gray-700 truncate">
                                                    {product.name || 'Unknown Product'}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {product.category || 'Uncategorized'} • {product.totalSold} units sold
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0 ml-4">
                                            <p className="text-sm font-semibold text-gray-900">₹{product.totalRevenue.toLocaleString()}</p>
                                            <p className="text-xs text-gray-500">
                                                ₹{(product.totalRevenue / product.totalSold).toFixed(0)} avg
                                            </p>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${rankColors[index]} transition-all duration-500`}
                                            style={{ width: `${Math.max(percentage, 5)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="text-center py-8">
                                <FaChartBar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-600 font-medium">No Product Data</p>
                                <p className="text-sm text-gray-400">No orders with products found</p>
                            </div>
                        )}
                    </div>
                    {topProducts.length > 5 && (
                        <div className="mt-4 text-center">
                            <p className="text-xs text-gray-500">
                                Showing top 5 of {topProducts.length} products
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Comprehensive Analytics Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Complete Business Analytics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center">
                        <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                            <FaShoppingCart className="w-8 h-8 text-blue-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-800">{allOrdersData.totalOrders || orders.length}</p>
                        <p className="text-sm text-gray-600">Total Orders</p>
                        <p className="text-xs text-gray-500 mt-1">All time</p>
                    </div>
                    <div className="text-center">
                        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                            <FaDollarSign className="w-8 h-8 text-green-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-800">₹{(allOrdersData.totalRevenue || stats.totalRevenue).toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Total Revenue</p>
                        <p className="text-xs text-gray-500 mt-1">All time</p>
                    </div>
                    <div className="text-center">
                        <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                            <FaChartBar className="w-8 h-8 text-purple-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-800">₹{avgOrderValue}</p>
                        <p className="text-sm text-gray-600">Avg Order Value</p>
                        <p className="text-xs text-gray-500 mt-1">Per order</p>
                    </div>
                    <div className="text-center">
                        <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                            <FaBox className="w-8 h-8 text-orange-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-800">{categoryData.reduce((sum, cat) => sum + cat.itemCount, 0)}</p>
                        <p className="text-sm text-gray-600">Items Sold</p>
                        <p className="text-xs text-gray-500 mt-1">All categories</p>
                    </div>
                </div>
            </div>

            {/* Daily Trends Chart */}
            {dailyTrends.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Order Trends (Last 7 Days)</h3>
                    <div className="h-48">
                        <div className="flex h-32 relative">
                            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400 pr-2">
                                <span>{Math.max(...dailyTrends.map(d => d.orderCount))}</span>
                                <span>{Math.round(Math.max(...dailyTrends.map(d => d.orderCount)) * 0.5)}</span>
                                <span>0</span>
                            </div>
                            <div className="flex items-end justify-between h-full flex-1 ml-8 px-2">
                                {dailyTrends.map((data, index) => (
                                    <div key={index} className="flex flex-col items-center flex-1 mx-1">
                                        <div
                                            className="bg-purple-500 rounded-t w-full transition-all duration-300 hover:bg-purple-600 relative group"
                                            style={{
                                                height: `${calculateChartHeight(data.orderCount, dailyTrends.map(d => ({ totalSales: d.orderCount })))}%`,
                                                minHeight: '8px'
                                            }}
                                            title={`${data.orderCount} orders - ₹${data.revenue.toLocaleString()}`}
                                        >
                                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                {data.orderCount} orders
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-500 mt-2">
                                            {new Date(data._id).toLocaleDateString('en-US', { weekday: 'short' })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="mt-4 text-center">
                            <p className="text-sm text-gray-600">
                                Total Orders: {dailyTrends.reduce((sum, data) => sum + data.orderCount, 0)} |
                                Revenue: ₹{dailyTrends.reduce((sum, data) => sum + data.revenue, 0).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Enhanced Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Conversion Rate</p>
                            <p className="text-2xl font-bold text-gray-800">{conversionRate}%</p>
                            <p className="text-xs text-gray-500 mt-1">Orders/Users ratio</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full">
                            <FaChartBar className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Avg Order Value</p>
                            <p className="text-2xl font-bold text-gray-800">₹{avgOrderValue}</p>
                            <p className="text-xs text-gray-500 mt-1">Per order average</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                            <FaDollarSign className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Total Orders</p>
                            <p className="text-2xl font-bold text-gray-800">{allOrdersData.totalOrders || orders.length}</p>
                            <p className="text-xs text-gray-500 mt-1">All time orders</p>
                        </div>
                        <div className="bg-orange-100 p-3 rounded-full">
                            <FaShoppingCart className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Total Revenue</p>
                            <p className="text-2xl font-bold text-gray-800">₹{(allOrdersData.totalRevenue || stats.totalRevenue).toLocaleString()}</p>
                            <p className="text-xs text-gray-500 mt-1">All time revenue</p>
                        </div>
                        <div className="bg-purple-100 p-3 rounded-full">
                            <FaDollarSign className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SettingsContent = () => (
    <div className="space-y-8">
        {/* General Settings */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">General Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                    <input type="text" defaultValue="ShopEasy" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                    <input type="email" defaultValue="admin@shopeasy.com" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
            </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Security Settings</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <input type="password" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <input type="password" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
            </div>
            <button className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200">
                Update Password
            </button>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
            <button className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg">
                Save All Settings
            </button>
        </div>
    </div>
);

// Delete Modal Component
const DeleteModal = ({ item, onClose, onConfirm }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <FaExclamationTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Delete {item?.name || 'Item'}</h3>
            <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete this item? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
                <button
                    onClick={onClose}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                    Delete
                </button>
            </div>
        </div>
    </div>
);

// View Product Modal Component
const ViewProductModal = ({ product, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Product Details</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
                    <FaTimes className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-6">
                {/* Product Images */}
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Product Images</h4>
                    {product.images && product.images.length > 0 ? (
                        <div>
                            <p className="text-xs text-gray-500 mb-3">Images Array ({product.images.length} images):</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                {product.images.map((image, index) => {
                                    // Images are now simple strings
                                    const imagePath = image;
                                    let imageUrl;
                                    if (imagePath.startsWith('http')) {
                                        imageUrl = imagePath;
                                    } else if (imagePath.startsWith('/uploads')) {
                                        imageUrl = `https://shopeasy-backend-sagk.onrender.com${imagePath}`;
                                    } else if (imagePath.startsWith('/images')) {
                                        // Existing products served from frontend public directory
                                        imageUrl = `http://localhost:5173${imagePath}`;
                                    } else {
                                        imageUrl = `https://shopeasy-backend-sagk.onrender.com/uploads/products/${imagePath}`;
                                    }
                                    console.log(`Image ${index + 1} URL:`, imageUrl);
                                    console.log(`Image ${index + 1} raw path:`, image);
                                    return (
                                        <div key={index} className="relative">
                                            <img
                                                src={imageUrl}
                                                alt={`${product.name} ${index + 1}`}
                                                className="w-full h-24 object-cover rounded-lg border"
                                                onError={(e) => {
                                                    console.error('Image failed to load:', imageUrl);
                                                    e.target.src = 'https://via.placeholder.com/300x300?text=Image+Not+Found';
                                                }}
                                                onLoad={() => console.log('Image loaded successfully:', imageUrl)}
                                            />
                                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg">
                                                <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-100">
                                                    {index + 1} (Test)
                                                </a>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : null}

                    {product.imageUrl && (
                        <div>
                            <p className="text-xs text-gray-500 mb-3">Main Image (imageUrl field):</p>
                            <div className="mb-4">
                                {(() => {
                                    // Use imageUrl if available, otherwise use first image from images array
                                    const mainImage = product.imageUrl || (product.images && product.images[0]) || '';
                                    let mainImageUrl;

                                    if (mainImage.startsWith('http')) {
                                        mainImageUrl = mainImage;
                                    } else if (mainImage.startsWith('/images')) {
                                        mainImageUrl = `http://localhost:5173${mainImage}`;
                                    } else if (mainImage.startsWith('/uploads')) {
                                        mainImageUrl = `https://shopeasy-backend-sagk.onrender.com${mainImage}`;
                                    } else if (mainImage) {
                                        mainImageUrl = `https://shopeasy-backend-sagk.onrender.com/uploads/products/${mainImage}`;
                                    } else {
                                        mainImageUrl = 'https://via.placeholder.com/300x300?text=No+Image';
                                    }

                                    return (
                                        <img
                                            src={mainImageUrl}
                                            alt={product.name}
                                            className="w-32 h-32 object-cover rounded-lg border"
                                            onError={(e) => {
                                                console.error('Main image failed to load:', mainImageUrl);
                                                e.target.src = 'https://via.placeholder.com/300x300?text=Main+Image+Not+Found';
                                            }}
                                            onLoad={() => console.log('Main image loaded successfully:', mainImageUrl)}
                                        />
                                    );
                                })()}
                            </div>
                        </div>
                    )}

                    {(!product.images || product.images.length === 0) && !product.imageUrl && (
                        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                            <p>No images available for this product</p>
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <p className="mt-1 text-sm text-gray-900">{product.name}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <p className="mt-1 text-sm text-gray-900">{product.category}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Price</label>
                        <p className="mt-1 text-sm text-gray-900">{product.currency} {product.price}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Stock</label>
                        <p className="mt-1 text-sm text-gray-900">{product.stock}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Brand</label>
                        <p className="mt-1 text-sm text-gray-900">{product.brand || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Rating</label>
                        <p className="mt-1 text-sm text-gray-900">{product.rating}/5</p>
                    </div>
                </div>

                {product.description && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <p className="mt-1 text-sm text-gray-900">{product.description}</p>
                    </div>
                )}
            </div>

            <div className="flex justify-end mt-6">
                <button
                    onClick={onClose}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                    Close
                </button>
            </div>
        </div>
    </div>
);

// Edit Product Modal Component
const EditProductModal = ({ product, newProduct, setNewProduct, selectedImages, setSelectedImages, categories, submitting, replaceImages, setReplaceImages, onClose, onUpdate }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Edit Product</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
                    <FaTimes className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                        <input
                            type="text"
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                        <select
                            value={newProduct.category}
                            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select Category</option>
                            {categories.map(category => (
                                <option key={category._id} value={category.name}>{category.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                        <input
                            type="number"
                            value={newProduct.price}
                            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Stock *</label>
                        <input
                            type="number"
                            value={newProduct.stock}
                            onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                </div>

                {/* Image Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Update Images (Optional)</label>

                    {/* Replace Images Checkbox */}
                    <div className="mb-3">
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={replaceImages}
                                onChange={(e) => setReplaceImages(e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-600">Replace all existing images (unchecked = add to existing)</span>
                        </label>
                    </div>

                    <div className="space-y-3">
                        {[0, 1, 2, 3].map((index) => (
                            <input
                                key={index}
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    const newImages = [...selectedImages];
                                    newImages[index] = file;
                                    setSelectedImages(newImages);
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        {replaceImages ? 'New images will replace all existing images.' : 'New images will be added to existing images.'}
                    </p>
                </div>
            </div>

            <div className="flex justify-end space-x-3 mt-8">
                <button
                    onClick={onClose}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                    Cancel
                </button>
                <button
                    onClick={onUpdate}
                    disabled={submitting}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50"
                >
                    {submitting ? 'Updating...' : 'Update Product'}
                </button>
            </div>
        </div>
    </div>
);

// Order View Modal Component
const OrderViewModal = ({ order, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <FaTimes className="w-5 h-5" />
                </button>
            </div>

            <div className="p-6 space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-3">Order Information</h3>
                        <div className="space-y-2 text-sm">
                            <p><span className="font-medium">Order ID:</span> #{order.id.slice(-8)}</p>
                            <p><span className="font-medium">Status:</span>
                                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                        order.status === 'paid' ? 'bg-yellow-100 text-yellow-800' :
                                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                'bg-gray-100 text-gray-800'
                                    }`}>
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                            </p>
                            <p><span className="font-medium">Total:</span> ₹{order.total?.toLocaleString()}</p>
                            <p><span className="font-medium">Created:</span> {new Date(order.createdAt).toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                        <div className="space-y-2 text-sm">
                            <p><span className="font-medium">Name:</span> {order.customer}</p>
                            <p><span className="font-medium">Email:</span> {order.customerEmail}</p>
                            {order.customerPhone && <p><span className="font-medium">Phone:</span> {order.customerPhone}</p>}
                        </div>
                    </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Shipping Address</h3>
                    <p className="text-sm text-gray-700">{order.shippingAddress}</p>
                </div>

                {/* Order Items */}
                <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {order.items.map((item, index) => (
                                    <tr key={index}>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center">
                                                {item.product.imageUrl && (
                                                    <img
                                                        src={item.product.imageUrl}
                                                        alt={item.product.name}
                                                        className="w-10 h-10 rounded object-cover mr-3"
                                                    />
                                                )}
                                                <span className="text-sm font-medium text-gray-900">{item.product.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">{item.product.category}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900">₹{item.price?.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">₹{item.subtotal?.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// Order Edit Modal Component
const OrderEditModal = ({ order, onClose, onUpdateStatus, submitting }) => {
    const [selectedStatus, setSelectedStatus] = useState(order.status);

    const statusOptions = [
        { value: 'pending', label: 'Pending', color: 'gray' },
        { value: 'paid', label: 'Paid', color: 'yellow' },
        { value: 'shipped', label: 'Shipped', color: 'blue' },
        { value: 'completed', label: 'Completed', color: 'green' },
        { value: 'cancelled', label: 'Cancelled', color: 'red' }
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Edit Order Status</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <FaTimes className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">Order #{order.id.slice(-8)}</h3>
                        <p className="text-sm text-gray-600">Customer: {order.customer}</p>
                        <p className="text-sm text-gray-600">Total: ₹{order.total?.toLocaleString()}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Order Status</label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-800">
                            <strong>Note:</strong> Changing the order status will notify the customer via email (if implemented).
                        </p>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onUpdateStatus(order.id, selectedStatus)}
                        disabled={submitting || selectedStatus === order.status}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? 'Updating...' : 'Update Status'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Success Dialog Component
const SuccessDialog = ({ message, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full">
                <FaCheck className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Success!</h3>
            <p className="text-gray-600 text-center mb-6">
                {message}
            </p>
            <div className="flex justify-center">
                <button
                    onClick={onClose}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                    OK
                </button>
            </div>
        </div>
    </div>
);

// Error Dialog Component
const ErrorDialog = ({ message, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <FaExclamationTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Error!</h3>
            <p className="text-gray-600 text-center mb-6">
                {message}
            </p>
            <div className="flex justify-center">
                <button
                    onClick={onClose}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                    OK
                </button>
            </div>
        </div>
    </div>
);

// User View Modal Component
const UserViewModal = ({ user, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                    <FaTimes className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-6">
                {/* User Avatar and Basic Info */}
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xl">
                            {(user.fullName || user.name || 'U').charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900">{user.fullName || user.name}</h3>
                        <p className="text-gray-600">{user.email}</p>
                        {user.phone && <p className="text-gray-600">{user.phone}</p>}
                    </div>
                </div>

                {/* User Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                            {user.role}
                        </span>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${user.status === 'blocked' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                            {user.status === 'blocked' ? 'Blocked' : 'Active'}
                        </span>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
                        <p className="text-gray-900">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                        <p className="text-gray-900">{user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}</p>
                    </div>
                </div>

                {/* Block Information */}
                {user.status === 'blocked' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start">
                            <FaExclamationTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
                            <div className="flex-1">
                                <h4 className="text-sm font-medium text-red-800 mb-2">User Blocked</h4>
                                {user.blockReason && (
                                    <div className="mb-2">
                                        <span className="text-xs font-medium text-red-700">Reason:</span>
                                        <p className="text-sm text-red-700 mt-1">{user.blockReason}</p>
                                    </div>
                                )}
                                {user.blockedAt && (
                                    <div>
                                        <span className="text-xs font-medium text-red-700">Blocked on:</span>
                                        <p className="text-sm text-red-700">{new Date(user.blockedAt).toLocaleString()}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Addresses */}
                {user.addresses && user.addresses.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Addresses</label>
                        <div className="space-y-3">
                            {user.addresses.map((address, index) => (
                                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-sm font-medium text-gray-900 capitalize">{address.type}</span>
                                        {address.isDefault && (
                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Default</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600">{address.fullName}</p>
                                    <p className="text-sm text-gray-600">{address.phone}</p>
                                    <p className="text-sm text-gray-600">
                                        {address.addressLine1}
                                        {address.addressLine2 && `, ${address.addressLine2}`}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {address.city}, {address.state} - {address.pincode}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-end mt-8">
                <button
                    onClick={onClose}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                    Close
                </button>
            </div>
        </div>
    </div>
);

// User Edit Modal Component
const UserEditModal = ({ user, newUser, setNewUser, submitting, onClose, onUpdate }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit User</h2>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                    <FaTimes className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                        <input
                            type="text"
                            value={newUser.fullName}
                            onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter full name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                        <input
                            type="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter email address"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <input
                            type="tel"
                            value={newUser.phone}
                            onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter phone number"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                        <select
                            value={newUser.role}
                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex justify-end space-x-3 mt-8">
                <button
                    onClick={onClose}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                    Cancel
                </button>
                <button
                    onClick={onUpdate}
                    disabled={submitting}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50"
                >
                    {submitting ? 'Updating...' : 'Update User'}
                </button>
            </div>
        </div>
    </div>
);

// User Add Modal Component
const UserAddModal = ({ newUser, setNewUser, submitting, onClose, onAdd }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add New User</h2>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                    <FaTimes className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                        <input
                            type="text"
                            value={newUser.fullName}
                            onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter full name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                        <input
                            type="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter email address"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <input
                            type="tel"
                            value={newUser.phone}
                            onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter phone number"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                        <select
                            value={newUser.role}
                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <FaExclamationTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                        <div>
                            <h4 className="text-sm font-medium text-yellow-800">Important Note</h4>
                            <p className="text-sm text-yellow-700 mt-1">
                                A temporary password will be generated for this user. Make sure to share it securely with them.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end space-x-3 mt-8">
                <button
                    onClick={onClose}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                    Cancel
                </button>
                <button
                    onClick={onAdd}
                    disabled={submitting}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50"
                >
                    {submitting ? 'Creating...' : 'Create User'}
                </button>
            </div>
        </div>
    </div>
);

// Block User Modal Component
const BlockUserModal = ({ user, blockReason, setBlockReason, submitting, onClose, onConfirm }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Block User</h2>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                    <FaTimes className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-4">
                {/* User Info */}
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                            {(user.fullName || user.name || 'U').charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <div className="font-medium text-gray-900">{user.fullName || user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                </div>

                {/* Warning */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <FaExclamationTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
                        <div>
                            <h4 className="text-sm font-medium text-red-800">Warning</h4>
                            <p className="text-sm text-red-700 mt-1">
                                This user will be blocked from accessing the platform and will not be able to log in.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Block Reason */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason for blocking *
                    </label>
                    <textarea
                        value={blockReason}
                        onChange={(e) => setBlockReason(e.target.value)}
                        placeholder="Please provide a detailed reason for blocking this user..."
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        This reason will be logged and may be shown to the user.
                    </p>
                </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
                <button
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    disabled={submitting || !blockReason.trim()}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {submitting ? 'Blocking...' : 'Block User'}
                </button>
            </div>
        </div>
    </div>
);

// Tickets Content Component
const TicketsContent = ({ tickets = [], handleViewTicket, handleTicketStatusChange }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'bg-blue-100 text-blue-800';
            case 'in_progress': return 'bg-yellow-100 text-yellow-800';
            case 'waiting_for_user': return 'bg-orange-100 text-orange-800';
            case 'resolved': return 'bg-green-100 text-green-800';
            case 'closed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'low': return 'bg-green-100 text-green-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'urgent': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Support Tickets</h2>
                    <p className="text-gray-600">Manage customer support requests</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {tickets.map((ticket) => (
                            <tr key={ticket._id} className="hover:bg-gray-50 transition-colors duration-200">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">#{ticket.ticketId}</div>
                                        <div className="text-sm text-gray-500">{ticket.subject}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">{ticket.userName}</div>
                                        <div className="text-sm text-gray-500">{ticket.userEmail}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                                        {ticket.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                                        {ticket.priority}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {ticket.category.replace('_', ' ')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {new Date(ticket.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleViewTicket(ticket)}
                                            className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                            title="View Details"
                                        >
                                            <FaEye className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleViewTicket(ticket)}
                                            className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded-lg transition-colors duration-200"
                                            title="Reply"
                                        >
                                            <FaComments className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {tickets.length === 0 && (
                    <div className="text-center py-12">
                        <FaTicketAlt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets yet</h3>
                        <p className="text-gray-600">Support tickets will appear here when users create them</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Ticket Modal Component
const TicketModal = ({ ticket, ticketReply, setTicketReply, submitting, onClose, onStatusChange, onSendReply }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{ticket.subject}</h2>
                    <p className="text-sm text-gray-500">Ticket #{ticket.ticketId} • {ticket.userName} ({ticket.userEmail})</p>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                    <FaTimes className="w-5 h-5" />
                </button>
            </div>

            {/* Ticket Info */}
            <div className="p-6 border-b border-gray-200 bg-gray-50">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                        <span className="text-sm text-gray-500">Status</span>
                        <select
                            value={ticket.status}
                            onChange={(e) => onStatusChange(ticket._id, e.target.value)}
                            className="block w-full mt-1 text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="waiting_for_user">Waiting for User</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>
                    <div>
                        <span className="text-sm text-gray-500">Priority</span>
                        <p className="font-medium">{ticket.priority}</p>
                    </div>
                    <div>
                        <span className="text-sm text-gray-500">Category</span>
                        <p className="font-medium">{ticket.category.replace('_', ' ')}</p>
                    </div>
                    <div>
                        <span className="text-sm text-gray-500">Created</span>
                        <p className="font-medium">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <span className="text-sm text-gray-500">Last Activity</span>
                        <p className="font-medium">{new Date(ticket.lastActivity).toLocaleDateString()}</p>
                    </div>
                </div>

                {ticket.isBlocked && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center">
                            <FaExclamationTriangle className="w-4 h-4 text-red-600 mr-2" />
                            <span className="text-sm font-medium text-red-800">Blocked User Ticket</span>
                        </div>
                        {ticket.blockReason && (
                            <p className="text-sm text-red-700 mt-1">Block Reason: {ticket.blockReason}</p>
                        )}
                    </div>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {ticket.messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${msg.sender === 'admin'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                            }`}>
                            <div className="flex items-center space-x-2 mb-1">
                                <span className="text-xs font-medium">{msg.senderName}</span>
                                <span className="text-xs opacity-75">
                                    {new Date(msg.timestamp).toLocaleString()}
                                </span>
                            </div>
                            <p className="text-sm">{msg.message}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Reply Section */}
            {ticket.status !== 'closed' && (
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                    <div className="flex space-x-3">
                        <textarea
                            value={ticketReply}
                            onChange={(e) => setTicketReply(e.target.value)}
                            placeholder="Type your reply..."
                            rows={3}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                        <button
                            onClick={onSendReply}
                            disabled={submitting || !ticketReply.trim()}
                            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FaPaperPlane className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    </div>
);

















// Categories Content Component
const CategoriesContent = ({
    categories,
    showCategoryModal,
    setShowCategoryModal,
    editingCategory,
    setEditingCategory,
    newCategory,
    setNewCategory,
    handleAddCategory,
    handleEditCategory,
    handleDeleteCategory,
    showSuccessMessage,
    refreshCategories,
    activeDiscounts,
    activeCoupons
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleEdit = (category) => {
        setEditingCategory({ ...category });
        setShowCategoryModal(true);
    };

    const handleAdd = () => {
        setEditingCategory(null);
        setNewCategory({
            name: '',
            description: '',
            image: '',
            parentCategory: '',
            sortOrder: 0,
            seoTitle: '',
            seoDescription: ''
        });
        setShowCategoryModal(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Categories Management</h1>
                    <p className="text-gray-600">Manage product categories</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                    <FaPlus className="w-4 h-4" />
                    <span>Add Category</span>
                </button>
            </div>

            {/* Search */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Categories Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Description
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Products
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredCategories.map((category) => (
                                <tr key={category._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {category.image && (
                                                <img
                                                    src={category.image}
                                                    alt={category.name}
                                                    className="w-10 h-10 rounded-lg object-cover mr-3"
                                                />
                                            )}
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {category.name}
                                                    {category.productCount !== undefined && (
                                                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                            {category.productCount} products
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {category.slug}
                                                </div>
                                                <DiscountBadge
                                                    discounts={activeDiscounts}
                                                    coupons={activeCoupons}
                                                    type="category"
                                                    id={category._id}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 max-w-xs truncate">
                                            {category.description || 'No description'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {category.productCount || 0}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${category.isActive
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}>
                                            {category.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEdit(category)}
                                                className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                                title="Edit"
                                            >
                                                <FaEdit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCategory(category._id)}
                                                className="text-red-600 hover:text-red-900 p-1 rounded"
                                                title="Delete"
                                            >
                                                <FaTrash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredCategories.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <FaFilter className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No categories found</p>
                    </div>
                )}
            </div>

            {/* Category Modal */}
            {showCategoryModal && (
                <CategoryModal
                    category={editingCategory || newCategory}
                    setCategory={editingCategory ? setEditingCategory : setNewCategory}
                    onSave={editingCategory ? handleEditCategory : handleAddCategory}
                    onClose={() => {
                        setShowCategoryModal(false);
                        setEditingCategory(null);
                    }}
                    isEditing={!!editingCategory}
                    categories={categories}
                />
            )}
        </div>
    );
};

// Brands Content Component
const BrandsContent = ({
    brands,
    showBrandModal,
    setShowBrandModal,
    editingBrand,
    setEditingBrand,
    newBrand,
    setNewBrand,
    handleAddBrand,
    handleEditBrand,
    handleDeleteBrand,
    showSuccessMessage,
    refreshBrands,
    categories
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredBrands = brands.filter(brand =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (brand.description && brand.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (brand.email && brand.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleEdit = (brand) => {
        setEditingBrand({ ...brand });
        setShowBrandModal(true);
    };

    const handleAdd = () => {
        setEditingBrand(null);
        setNewBrand({
            name: '',
            description: '',
            logo: '',
            website: '',
            email: '',
            phone: '',
            categories: [],
            isFeatured: false,
            seoTitle: '',
            seoDescription: ''
        });
        setShowBrandModal(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Brands Management</h1>
                    <p className="text-gray-600">Manage product brands</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                    <FaPlus className="w-4 h-4" />
                    <span>Add Brand</span>
                </button>
            </div>

            {/* Search */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search brands..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Brands Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Brand
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contact
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Products
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredBrands.map((brand) => (
                                <tr key={brand._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {brand.logo && (
                                                <img
                                                    src={brand.logo}
                                                    alt={brand.name}
                                                    className="w-10 h-10 rounded-lg object-cover mr-3"
                                                />
                                            )}
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {brand.name}
                                                    {brand.isFeatured && (
                                                        <FaStar className="inline w-3 h-3 text-yellow-500 ml-1" />
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {brand.slug}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">
                                            {brand.email && (
                                                <div>{brand.email}</div>
                                            )}
                                            {brand.phone && (
                                                <div className="text-gray-500">{brand.phone}</div>
                                            )}
                                            {brand.website && (
                                                <a
                                                    href={brand.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    Website
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {brand.productCount || 0}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col space-y-1">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${brand.isActive
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}>
                                                {brand.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                            {brand.isFeatured && (
                                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                    Featured
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEdit(brand)}
                                                className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                                title="Edit"
                                            >
                                                <FaEdit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteBrand(brand._id)}
                                                className="text-red-600 hover:text-red-900 p-1 rounded"
                                                title="Delete"
                                            >
                                                <FaTrash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredBrands.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <FaStar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No brands found</p>
                    </div>
                )}
            </div>

            {/* Brand Modal */}
            {showBrandModal && (
                <BrandModal
                    brand={editingBrand || newBrand}
                    setBrand={editingBrand ? setEditingBrand : setNewBrand}
                    onSave={editingBrand ? handleEditBrand : handleAddBrand}
                    onClose={() => {
                        setShowBrandModal(false);
                        setEditingBrand(null);
                    }}
                    isEditing={!!editingBrand}
                    categories={categories}
                />
            )}
        </div>
    );
};

// Category Modal Component
const CategoryModal = ({ category, setCategory, onSave, onClose, isEditing, categories }) => {
    const parentCategories = categories.filter(cat => !cat.parentCategory && cat._id !== category._id);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {isEditing ? 'Edit Category' : 'Add New Category'}
                    </h2>
                </div>

                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name *
                            </label>
                            <input
                                type="text"
                                value={category.name}
                                onChange={(e) => setCategory({ ...category, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Category name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Parent Category
                            </label>
                            <select
                                value={category.parentCategory || ''}
                                onChange={(e) => setCategory({ ...category, parentCategory: e.target.value || null })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">No Parent (Top Level)</option>
                                {parentCategories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            value={category.description}
                            onChange={(e) => setCategory({ ...category, description: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Category description"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Image URL
                            </label>
                            <input
                                type="url"
                                value={category.image}
                                onChange={(e) => setCategory({ ...category, image: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sort Order
                            </label>
                            <input
                                type="number"
                                value={category.sortOrder}
                                onChange={(e) => setCategory({ ...category, sortOrder: parseInt(e.target.value) || 0 })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-3">SEO Settings</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    SEO Title
                                </label>
                                <input
                                    type="text"
                                    value={category.seoTitle}
                                    onChange={(e) => setCategory({ ...category, seoTitle: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="SEO title (max 60 characters)"
                                    maxLength={60}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {category.seoTitle?.length || 0}/60 characters
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    SEO Description
                                </label>
                                <textarea
                                    value={category.seoDescription}
                                    onChange={(e) => setCategory({ ...category, seoDescription: e.target.value })}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="SEO description (max 160 characters)"
                                    maxLength={160}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {category.seoDescription?.length || 0}/160 characters
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSave}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        {isEditing ? 'Update' : 'Create'} Category
                    </button>
                </div>
            </div>
        </div>
    );
};

// Brand Modal Component
const BrandModal = ({ brand, setBrand, onSave, onClose, isEditing, categories }) => {
    const handleCategoryChange = (categoryName, checked) => {
        const updatedCategories = checked
            ? [...(brand.categories || []), categoryName]
            : (brand.categories || []).filter(cat => cat !== categoryName);
        setBrand({ ...brand, categories: updatedCategories });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {isEditing ? 'Edit Brand' : 'Add New Brand'}
                    </h2>
                </div>

                <div className="p-6 space-y-6">
                    {/* Basic Information */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    value={brand.name}
                                    onChange={(e) => setBrand({ ...brand, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Brand name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Logo URL
                                </label>
                                <input
                                    type="url"
                                    value={brand.logo}
                                    onChange={(e) => setBrand({ ...brand, logo: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="https://example.com/logo.jpg"
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                value={brand.description}
                                onChange={(e) => setBrand({ ...brand, description: e.target.value })}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Brand description"
                            />
                        </div>

                        <div className="mt-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={brand.isFeatured}
                                    onChange={(e) => setBrand({ ...brand, isFeatured: e.target.checked })}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">Featured Brand</span>
                            </label>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Contact Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={brand.email}
                                    onChange={(e) => setBrand({ ...brand, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="contact@brand.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    value={brand.phone}
                                    onChange={(e) => setBrand({ ...brand, phone: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="+1 (555) 123-4567"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Website
                                </label>
                                <input
                                    type="url"
                                    value={brand.website}
                                    onChange={(e) => setBrand({ ...brand, website: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="https://www.brand.com"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Categories */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Categories</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {categories.map((category) => (
                                <label key={category._id || category} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={(brand.categories || []).includes(category.name || category)}
                                        onChange={(e) => handleCategoryChange(category.name || category, e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">{category.name || category}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* SEO Settings */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">SEO Settings</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    SEO Title
                                </label>
                                <input
                                    type="text"
                                    value={brand.seoTitle}
                                    onChange={(e) => setBrand({ ...brand, seoTitle: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="SEO title (max 60 characters)"
                                    maxLength={60}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {brand.seoTitle?.length || 0}/60 characters
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    SEO Description
                                </label>
                                <textarea
                                    value={brand.seoDescription}
                                    onChange={(e) => setBrand({ ...brand, seoDescription: e.target.value })}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="SEO description (max 160 characters)"
                                    maxLength={160}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {brand.seoDescription?.length || 0}/160 characters
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSave}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        {isEditing ? 'Update' : 'Create'} Brand
                    </button>
                </div>
            </div>
        </div>
    );
};

// Discount Management Content Component
const DiscountManagementContent = ({
    discounts,
    coupons,
    showDiscountModal,
    setShowDiscountModal,
    showCouponModal,
    setShowCouponModal,
    editingDiscount,
    setEditingDiscount,
    editingCoupon,
    setEditingCoupon,
    newDiscount,
    setNewDiscount,
    newCoupon,
    setNewCoupon,
    handleAddDiscount,
    handleUpdateDiscount,
    handleDeleteDiscount,
    handleEditDiscount,
    handleToggleDiscountVisibility,
    handleAddCoupon,
    handleUpdateCoupon,
    handleDeleteCoupon,
    handleEditCoupon,
    handleToggleCouponVisibility,
    generateCouponCode,
    submitting,
    categories,
    products,
    filteredProducts,
    selectedProducts,
    selectAllProducts,
    productSearchTerm,
    handleDiscountProductSearch,
    handleSelectAllProducts,
    handleProductSelection
}) => {
    const [activeDiscountTab, setActiveDiscountTab] = useState('discounts');
    const [discountProductSearch, setDiscountProductSearch] = useState('');
    const [discountCategorySearch, setDiscountCategorySearch] = useState('');
    const [couponProductSearch, setCouponProductSearch] = useState('');
    const [couponCategorySearch, setCouponCategorySearch] = useState('');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Discounts & Coupons Management</h2>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveDiscountTab('discounts')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${activeDiscountTab === 'discounts'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Discounts
                    </button>
                    <button
                        onClick={() => setActiveDiscountTab('coupons')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${activeDiscountTab === 'coupons'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Coupons
                    </button>
                </nav>
            </div>

            {/* Content */}
            {activeDiscountTab === 'discounts' && (
                <div className="space-y-4">
                    {/* Discounts Header */}
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900">Discounts</h3>
                        <button
                            onClick={async () => {
                                setEditingDiscount(null);
                                setNewDiscount({
                                    name: '',
                                    description: '',
                                    discountType: 'percentage',
                                    discountValue: '',
                                    targetType: 'all',
                                    targetIds: [],
                                    startDate: '',
                                    endDate: '',
                                    minOrderAmount: '',
                                    maxDiscountAmount: '',
                                    isActive: true,
                                    usageLimit: ''
                                });
                                // Initialize product search
                                await handleDiscountProductSearch('');
                                setShowDiscountModal(true);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                        >
                            <FaPlus />
                            <span>Add Discount</span>
                        </button>
                    </div>

                    {/* Discounts Table */}
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Value
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Target
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status (Toggle)
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Valid Until
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {discounts.map((discount) => (
                                    <tr key={discount._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{discount.name}</div>
                                            <div className="text-sm text-gray-500">{discount.description}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {discount.discountType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {discount.discountType === 'percentage' ? `${discount.discountValue}%` : `₹${discount.discountValue}`}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div>
                                                <div className="font-medium">
                                                    {discount.targetType === 'all' ? 'All Products' :
                                                        discount.targetType === 'category' ? 'Categories' : 'Products'}
                                                </div>
                                                {discount.targetIds && discount.targetIds.length > 0 && (
                                                    <div className="text-xs text-gray-500">
                                                        {discount.targetIds.length} selected
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleToggleDiscountVisibility(discount._id, discount.isActive)}
                                                    disabled={submitting}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${discount.isActive ? 'bg-green-600' : 'bg-gray-200'
                                                        } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${discount.isActive ? 'translate-x-6' : 'translate-x-1'
                                                            }`}
                                                    />
                                                </button>
                                                <span className={`text-xs font-medium ${discount.isActive ? 'text-green-800' : 'text-gray-500'}`}>
                                                    {discount.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(discount.endDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleEditDiscount(discount)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteDiscount(discount._id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {discounts.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No discounts found. Create your first discount to get started.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeDiscountTab === 'coupons' && (
                <div className="space-y-4">
                    {/* Coupons Header */}
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900">Coupons</h3>
                        <button
                            onClick={async () => {
                                setEditingCoupon(null);
                                setNewCoupon({
                                    code: '',
                                    description: '',
                                    discountType: 'percentage',
                                    discountValue: '',
                                    minOrderAmount: '',
                                    maxDiscountAmount: '',
                                    usageLimit: '',
                                    userUsageLimit: '',
                                    startDate: '',
                                    endDate: '',
                                    isActive: true,
                                    applicableProducts: [],
                                    applicableCategories: []
                                });
                                // Initialize product search
                                await handleDiscountProductSearch('');
                                setShowCouponModal(true);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                        >
                            <FaPlus />
                            <span>Add Coupon</span>
                        </button>
                    </div>

                    {/* Coupons Table */}
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Code
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Value
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Usage
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Applicable To
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status (Toggle)
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Valid Until
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {coupons.map((coupon) => (
                                    <tr key={coupon._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{coupon.code}</div>
                                            <div className="text-sm text-gray-500">{coupon.description}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                {coupon.discountType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {coupon.usedCount || 0} / {coupon.usageLimit || '∞'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div>
                                                {(!coupon.applicableCategories || coupon.applicableCategories.length === 0) &&
                                                    (!coupon.applicableProducts || coupon.applicableProducts.length === 0) ? (
                                                    <span className="text-green-600 font-medium">All Products</span>
                                                ) : (
                                                    <div className="space-y-1">
                                                        {coupon.applicableCategories && coupon.applicableCategories.length > 0 && (
                                                            <div className="text-xs">
                                                                <span className="font-medium">Categories:</span> {coupon.applicableCategories.length}
                                                            </div>
                                                        )}
                                                        {coupon.applicableProducts && coupon.applicableProducts.length > 0 && (
                                                            <div className="text-xs">
                                                                <span className="font-medium">Products:</span> {coupon.applicableProducts.length}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleToggleCouponVisibility(coupon._id, coupon.isActive)}
                                                    disabled={submitting}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${coupon.isActive ? 'bg-green-600' : 'bg-gray-200'
                                                        } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${coupon.isActive ? 'translate-x-6' : 'translate-x-1'
                                                            }`}
                                                    />
                                                </button>
                                                <span className={`text-xs font-medium ${coupon.isActive ? 'text-green-800' : 'text-gray-500'}`}>
                                                    {coupon.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(coupon.endDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleEditCoupon(coupon)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCoupon(coupon._id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {coupons.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No coupons found. Create your first coupon to get started.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Enhanced Product Selection Component */}
            <div className="hidden">
                {/* This component will be used in discount/coupon modals */}
                <ProductSelectionComponent
                    allProducts={products}
                    filteredProducts={filteredProducts}
                    selectedProducts={selectedProducts}
                    selectAllProducts={selectAllProducts}
                    productSearchTerm={productSearchTerm}
                    onProductSearch={handleDiscountProductSearch}
                    onSelectAll={handleSelectAllProducts}
                    onProductSelect={handleProductSelection}
                />
            </div>

            {/* Discount Modal */}
            {showDiscountModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                {editingDiscount ? 'Edit Discount' : 'Add New Discount'}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowDiscountModal(false);
                                    setEditingDiscount(null);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Discount Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={newDiscount.name}
                                        onChange={(e) => setNewDiscount({ ...newDiscount, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g., Summer Sale"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Discount Type *
                                    </label>
                                    <select
                                        value={newDiscount.discountType}
                                        onChange={(e) => setNewDiscount({ ...newDiscount, discountType: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="percentage">Percentage</option>
                                        <option value="fixed">Fixed Amount</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Discount Value *
                                    </label>
                                    <input
                                        type="number"
                                        value={newDiscount.discountValue}
                                        onChange={(e) => setNewDiscount({ ...newDiscount, discountValue: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder={newDiscount.discountType === 'percentage' ? '10' : '100'}
                                        min="0"
                                        max={newDiscount.discountType === 'percentage' ? '100' : undefined}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Target Type
                                    </label>
                                    <select
                                        value={newDiscount.targetType}
                                        onChange={(e) => setNewDiscount({ ...newDiscount, targetType: e.target.value, targetIds: [] })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="all">All Products</option>
                                        <option value="category">Specific Categories</option>
                                        <option value="product">Specific Products</option>
                                    </select>
                                </div>

                                {/* Category Selection */}
                                {newDiscount.targetType === 'category' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Select Categories ({categories ? categories.length : 0} available)
                                        </label>
                                        <input
                                            type="text"
                                            value={discountCategorySearch}
                                            onChange={(e) => setDiscountCategorySearch(e.target.value)}
                                            placeholder="Search categories..."
                                            className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        />
                                        <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2 space-y-2">
                                            {categories && categories.length > 0 ? categories
                                                .filter(category => {
                                                    if (!discountCategorySearch) return true;
                                                    return category.name.toLowerCase().includes(discountCategorySearch.toLowerCase());
                                                })
                                                .map((category) => {
                                                    const categoryId = category._id || category.id;
                                                    const isSelected = newDiscount.targetIds.includes(categoryId);
                                                    return (
                                                        <label
                                                            key={categoryId}
                                                            className={`flex items-center p-2 rounded cursor-pointer transition-colors ${isSelected
                                                                ? 'bg-blue-50 border border-blue-200'
                                                                : 'hover:bg-gray-50 border border-transparent'
                                                                }`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={(e) => {
                                                                    const checked = e.target.checked;
                                                                    setNewDiscount(prev => ({
                                                                        ...prev,
                                                                        targetIds: checked
                                                                            ? [...prev.targetIds, categoryId]
                                                                            : prev.targetIds.filter(id => id !== categoryId)
                                                                    }));
                                                                }}
                                                                className="mr-3 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                            />
                                                            <span className="text-sm text-gray-700">{category.name}</span>
                                                        </label>
                                                    );
                                                }) : (
                                                <p className="text-sm text-gray-500 p-2">No categories available</p>
                                            )}
                                        </div>
                                        {newDiscount.targetIds.length > 0 && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                {newDiscount.targetIds.length} categories selected
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Product Selection */}
                                {newDiscount.targetType === 'product' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Select Products ({products ? products.length : 0} available)
                                        </label>
                                        <input
                                            type="text"
                                            value={discountProductSearch}
                                            onChange={(e) => setDiscountProductSearch(e.target.value)}
                                            placeholder="Search products..."
                                            className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        />
                                        <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2 space-y-1">
                                            {products && products.length > 0 ? (() => {
                                                const filteredProducts = products.filter(product => {
                                                    if (!discountProductSearch) return true;
                                                    return product.name.toLowerCase().includes(discountProductSearch.toLowerCase());
                                                });

                                                // Check for duplicate IDs
                                                const ids = filteredProducts.map(p => p._id || p.id);
                                                const uniqueIds = new Set(ids);
                                                if (ids.length !== uniqueIds.size) {
                                                    console.error('DUPLICATE PRODUCT IDs FOUND!', {
                                                        totalProducts: ids.length,
                                                        uniqueProducts: uniqueIds.size,
                                                        products: filteredProducts,
                                                        sampleProduct: filteredProducts[0]
                                                    });
                                                }

                                                return filteredProducts.map((product) => {
                                                    const productId = product._id || product.id;
                                                    const isSelected = newDiscount.targetIds.includes(productId);
                                                    return (
                                                        <label
                                                            key={productId}
                                                            className={`flex items-center p-2 rounded cursor-pointer transition-colors ${isSelected
                                                                ? 'bg-blue-50 border border-blue-200'
                                                                : 'hover:bg-gray-50 border border-transparent'
                                                                }`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={(e) => {
                                                                    e.stopPropagation();
                                                                    const checked = e.target.checked;
                                                                    console.log('Discount Product Checkbox:', {
                                                                        productName: product.name,
                                                                        productId: productId,
                                                                        checked: checked,
                                                                        currentTargetIds: newDiscount.targetIds
                                                                    });
                                                                    setNewDiscount(prev => {
                                                                        const newTargetIds = checked
                                                                            ? [...prev.targetIds, productId]
                                                                            : prev.targetIds.filter(id => id !== productId);
                                                                        console.log('New targetIds:', newTargetIds);
                                                                        return {
                                                                            ...prev,
                                                                            targetIds: newTargetIds
                                                                        };
                                                                    });
                                                                }}
                                                                className="mr-3 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                            />
                                                            <div className="flex-1">
                                                                <span className="text-sm text-gray-700">{product.name}</span>
                                                                <span className="text-xs text-gray-500 ml-2">₹{product.price}</span>
                                                            </div>
                                                        </label>
                                                    );
                                                });
                                            })() : (
                                                <p className="text-sm text-gray-500 p-2">No products available</p>
                                            )}
                                        </div>
                                        {newDiscount.targetIds.length > 0 && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                {newDiscount.targetIds.length} products selected
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Start Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={newDiscount.startDate}
                                        onChange={(e) => setNewDiscount({ ...newDiscount, startDate: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        End Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={newDiscount.endDate}
                                        onChange={(e) => setNewDiscount({ ...newDiscount, endDate: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Min Order Amount
                                    </label>
                                    <input
                                        type="number"
                                        value={newDiscount.minOrderAmount}
                                        onChange={(e) => setNewDiscount({ ...newDiscount, minOrderAmount: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Max Discount Amount
                                    </label>
                                    <input
                                        type="number"
                                        value={newDiscount.maxDiscountAmount}
                                        onChange={(e) => setNewDiscount({ ...newDiscount, maxDiscountAmount: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="No limit"
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={newDiscount.description}
                                    onChange={(e) => setNewDiscount({ ...newDiscount, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Discount description"
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={newDiscount.isActive}
                                    onChange={(e) => setNewDiscount({ ...newDiscount, isActive: e.target.checked })}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">Active</span>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowDiscountModal(false);
                                    setEditingDiscount(null);
                                }}
                                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={editingDiscount ? handleUpdateDiscount : handleAddDiscount}
                                disabled={submitting}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                            >
                                {submitting ? 'Saving...' : (editingDiscount ? 'Update' : 'Create')} Discount
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Coupon Modal */}
            {showCouponModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                {editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowCouponModal(false);
                                    setEditingCoupon(null);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Coupon Code *
                                    </label>
                                    <div className="flex space-x-2">
                                        <input
                                            type="text"
                                            value={newCoupon.code}
                                            onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="SAVE10"
                                        />
                                        <button
                                            onClick={generateCouponCode}
                                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
                                        >
                                            Generate
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Discount Type *
                                    </label>
                                    <select
                                        value={newCoupon.discountType}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="percentage">Percentage</option>
                                        <option value="fixed">Fixed Amount</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Discount Value *
                                    </label>
                                    <input
                                        type="number"
                                        value={newCoupon.discountValue}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder={newCoupon.discountType === 'percentage' ? '10' : '100'}
                                        min="0"
                                        max={newCoupon.discountType === 'percentage' ? '100' : undefined}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Usage Limit
                                    </label>
                                    <input
                                        type="number"
                                        value={newCoupon.usageLimit}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, usageLimit: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Unlimited"
                                        min="1"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Start Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={newCoupon.startDate}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, startDate: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        End Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={newCoupon.endDate}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, endDate: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Min Order Amount
                                    </label>
                                    <input
                                        type="number"
                                        value={newCoupon.minOrderAmount}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, minOrderAmount: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Max Discount Amount
                                    </label>
                                    <input
                                        type="number"
                                        value={newCoupon.maxDiscountAmount}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, maxDiscountAmount: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="No limit"
                                        min="0"
                                    />
                                </div>
                            </div>

                            {/* Applicable Categories */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Applicable Categories ({categories ? categories.length : 0} available)
                                </label>
                                <input
                                    type="text"
                                    value={couponCategorySearch}
                                    onChange={(e) => setCouponCategorySearch(e.target.value)}
                                    placeholder="Search categories..."
                                    className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                                <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2 space-y-1">
                                    {categories && categories.length > 0 ? categories
                                        .filter(category => {
                                            if (!couponCategorySearch) return true;
                                            return category.name.toLowerCase().includes(couponCategorySearch.toLowerCase());
                                        })
                                        .map((category) => {
                                            const categoryId = category._id || category.id;
                                            const isSelected = newCoupon.applicableCategories.includes(categoryId);
                                            return (
                                                <label
                                                    key={categoryId}
                                                    className={`flex items-center p-2 rounded cursor-pointer transition-colors ${isSelected
                                                        ? 'bg-blue-50 border border-blue-200'
                                                        : 'hover:bg-gray-50 border border-transparent'
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={(e) => {
                                                            const checked = e.target.checked;
                                                            setNewCoupon(prev => ({
                                                                ...prev,
                                                                applicableCategories: checked
                                                                    ? [...prev.applicableCategories, categoryId]
                                                                    : prev.applicableCategories.filter(id => id !== categoryId)
                                                            }));
                                                        }}
                                                        className="mr-3 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm text-gray-700">{category.name}</span>
                                                </label>
                                            );
                                        }) : (
                                        <p className="text-sm text-gray-500 p-2">No categories available</p>
                                    )}
                                </div>
                                {newCoupon.applicableCategories.length > 0 && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        {newCoupon.applicableCategories.length} categories selected
                                    </p>
                                )}
                            </div>

                            {/* Applicable Products */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Applicable Products ({products ? products.length : 0} available)
                                </label>
                                <input
                                    type="text"
                                    value={couponProductSearch}
                                    onChange={(e) => setCouponProductSearch(e.target.value)}
                                    placeholder="Search products..."
                                    className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                                <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2 space-y-2">
                                    {products && products.length > 0 ? products
                                        .filter(product => {
                                            if (!couponProductSearch) return true;
                                            return product.name.toLowerCase().includes(couponProductSearch.toLowerCase());
                                        })
                                        .map((product) => {
                                            const productId = product._id || product.id;
                                            const isSelected = newCoupon.applicableProducts.includes(productId);
                                            return (
                                                <label
                                                    key={productId}
                                                    className={`flex items-center p-2 rounded cursor-pointer transition-colors ${isSelected
                                                        ? 'bg-blue-50 border border-blue-200'
                                                        : 'hover:bg-gray-50 border border-transparent'
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={(e) => {
                                                            const checked = e.target.checked;
                                                            setNewCoupon(prev => ({
                                                                ...prev,
                                                                applicableProducts: checked
                                                                    ? [...prev.applicableProducts, productId]
                                                                    : prev.applicableProducts.filter(id => id !== productId)
                                                            }));
                                                        }}
                                                        className="mr-3 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                    />
                                                    <div className="flex-1">
                                                        <span className="text-sm text-gray-700">{product.name}</span>
                                                        <span className="text-xs text-gray-500 ml-2">₹{product.price}</span>
                                                    </div>
                                                </label>
                                            );
                                        }) : (
                                        <p className="text-sm text-gray-500 p-2">No products available</p>
                                    )}
                                </div>
                                {newCoupon.applicableProducts.length > 0 && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        {newCoupon.applicableProducts.length} products selected
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={newCoupon.description}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Coupon description"
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={newCoupon.isActive}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, isActive: e.target.checked })}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">Active</span>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowCouponModal(false);
                                    setEditingCoupon(null);
                                }}
                                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={editingCoupon ? handleUpdateCoupon : handleAddCoupon}
                                disabled={submitting}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                            >
                                {submitting ? 'Saving...' : (editingCoupon ? 'Update' : 'Create')} Coupon
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;


