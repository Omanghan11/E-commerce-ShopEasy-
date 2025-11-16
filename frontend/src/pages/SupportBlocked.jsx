import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    FaExclamationTriangle,
    FaTicketAlt,
    FaTimes,
    FaInfoCircle
} from 'react-icons/fa';

function SupportBlocked() {
    const navigate = useNavigate();
    const [blockedInfo, setBlockedInfo] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [ticketCreated, setTicketCreated] = useState(false);
    const [existingTicket, setExistingTicket] = useState(null);
    const [hasOpenTicket, setHasOpenTicket] = useState(false);

    // New ticket form state
    const [newTicket, setNewTicket] = useState({
        subject: 'Account Unblock Request',
        category: 'account_blocked',
        priority: 'high',
        description: '',
        userEmail: '',
        userName: ''
    });

    useEffect(() => {
        const blocked = localStorage.getItem('blockedUser');
        if (blocked) {
            try {
                const info = JSON.parse(blocked);
                setBlockedInfo(info);
                setNewTicket(prev => ({
                    ...prev,
                    userEmail: info.email || '',
                    userName: info.userName || '',
                    description: `I am requesting to unblock my account. Block reason: ${info.blockReason || 'Not specified'}`
                }));

                // Check if user already has an open ticket
                if (info.email) {
                    checkExistingTicket(info.email);
                }
            } catch (error) {
                console.error('Error parsing blocked user info:', error);
                setMessage('Error loading blocked user information');
            }
        } else {
            // If no blocked user info, redirect to login
            navigate('/login');
        }
    }, [navigate]);

    const checkExistingTicket = async (email) => {
        try {
            const response = await fetch(`https://shopeasy-backend-sagk.onrender.com/api/tickets/blocked-user-ticket?email=${encodeURIComponent(email)}`);

            if (response.ok) {
                const data = await response.json();
                if (data.hasOpenTicket) {
                    setHasOpenTicket(true);
                    setExistingTicket(data.ticket);
                }
            } else {
                console.error('Failed to check existing ticket:', response.status);
            }
        } catch (error) {
            console.error('Error checking existing ticket:', error);
            // Don't show error to user for this check, just log it
        }
    };

    // Auto-hide toast
    useEffect(() => {
        if (!message) return;
        const timer = setTimeout(() => setMessage(''), 5000);
        return () => clearTimeout(timer);
    }, [message]);

    const handleCreateTicket = async () => {
        if (!newTicket.userName || !newTicket.userName.trim()) {
            setMessage('Please enter your full name');
            return;
        }

        if (!newTicket.description || !newTicket.description.trim()) {
            setMessage('Please provide additional information');
            return;
        }

        if (!newTicket.userEmail) {
            setMessage('Email is required');
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch('https://shopeasy-backend-sagk.onrender.com/api/tickets/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: 'blocked-user-' + Date.now(), // Temporary ID for blocked users
                    userEmail: newTicket.userEmail,
                    userName: newTicket.userName,
                    subject: newTicket.subject,
                    category: newTicket.category,
                    priority: newTicket.priority,
                    description: newTicket.description,
                    isBlocked: true,
                    blockReason: blockedInfo?.blockReason
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Support ticket created successfully! Our team will review your request.');
                setShowCreateModal(false);
                setTicketCreated(true);
                localStorage.removeItem('blockedUser'); // Clean up
            } else {
                setMessage(data.message || 'Failed to create ticket');
            }
        } catch (error) {
            console.error('Error creating ticket:', error);
            setMessage('Network error: Failed to create ticket');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                        <FaExclamationTriangle className="h-8 w-8 text-red-600" />
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Account Blocked</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Your account has been temporarily blocked. Please contact support for assistance.
                    </p>
                </div>

                {/* Block Information */}
                {blockedInfo && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start">
                            <FaInfoCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
                            <div>
                                <h4 className="text-sm font-medium text-red-800">Block Details</h4>
                                {blockedInfo.blockReason && (
                                    <p className="text-sm text-red-700 mt-1">
                                        <strong>Reason:</strong> {blockedInfo.blockReason}
                                    </p>
                                )}
                                {blockedInfo.blockedAt && (
                                    <p className="text-sm text-red-700 mt-1">
                                        <strong>Blocked on:</strong> {new Date(blockedInfo.blockedAt).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="space-y-4">
                    {!ticketCreated && !hasOpenTicket && (
                        <>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <FaTicketAlt className="w-4 h-4 mr-2" />
                                Request Account Unblock
                            </button>

                            <div className="text-center">
                                <p className="text-sm text-gray-600">
                                    Create a support ticket to appeal the block or get more information.
                                </p>
                            </div>
                        </>
                    )}

                    {hasOpenTicket && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                            <FaTicketAlt className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                            <h3 className="text-lg font-medium text-yellow-800">Existing Ticket Found</h3>
                            <p className="text-sm text-yellow-700 mt-1 mb-3">
                                You already have an open support ticket: #{existingTicket?.ticketId}
                            </p>
                            <p className="text-sm text-yellow-700 mb-3">
                                Status: <span className="font-medium">{existingTicket?.status?.replace('_', ' ')}</span>
                            </p>
                            <p className="text-xs text-yellow-600">
                                You can only have one open ticket at a time. Please wait for your current ticket to be resolved before creating a new one.
                            </p>
                        </div>
                    )}

                    {ticketCreated && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                            <FaTicketAlt className="w-8 h-8 text-green-600 mx-auto mb-2" />
                            <h3 className="text-lg font-medium text-green-800">Ticket Created Successfully</h3>
                            <p className="text-sm text-green-700 mt-1">
                                Our support team will review your request and respond as soon as possible.
                            </p>
                        </div>
                    )}

                    <div className="text-center">
                        <Link
                            to="/login"
                            className="text-sm text-blue-600 hover:text-blue-500"
                        >
                            ← Back to Login
                        </Link>
                    </div>
                </div>
            </div>

            {/* Create Ticket Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Request Account Unblock</h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                            >
                                <FaTimes className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Your Name *</label>
                                <input
                                    type="text"
                                    value={newTicket.userName}
                                    onChange={(e) => setNewTicket({ ...newTicket, userName: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={newTicket.userEmail}
                                    onChange={(e) => setNewTicket({ ...newTicket, userEmail: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                    readOnly
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Information</label>
                                <textarea
                                    value={newTicket.description}
                                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    placeholder="Please provide any additional information about why your account should be unblocked..."
                                />
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                <p className="text-sm text-yellow-800">
                                    <strong>Note:</strong> Our support team will review your request and may ask for additional verification before unblocking your account.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateTicket}
                                disabled={submitting}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                            >
                                {submitting ? 'Creating...' : 'Submit Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Message */}
            {message && (
                <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
                    {message}
                </div>
            )}
        </div>
    );
}

export default SupportBlocked;


