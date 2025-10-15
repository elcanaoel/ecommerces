import { useState, useEffect } from 'react'
import { MessageSquare, Plus, Clock, CheckCircle, AlertCircle, XCircle, Send, Package, ChevronRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supportAPI, ordersAPI } from '../utils/api'
import { toast } from 'react-toastify'

const CustomerCare = () => {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [filter, setFilter] = useState({ status: '', category: '' })
  const [newMessage, setNewMessage] = useState('')
  
  // Form state
  const [formData, setFormData] = useState({
    category: 'enquiry',
    subject: '',
    description: '',
    orderId: '',
    priority: 'medium'
  })

  useEffect(() => {
    fetchTickets()
    fetchOrders()
  }, [filter])

  const fetchTickets = async () => {
    try {
      const response = await supportAPI.getMyTickets(filter)
      setTickets(response.data.tickets)
    } catch (error) {
      console.error('Failed to fetch tickets:', error)
      toast.error('Failed to load tickets')
    }
  }

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getUserOrders()
      setOrders(response.data.orders)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    }
  }

  const handleCreateTicket = async (e) => {
    e.preventDefault()
    
    if (!formData.subject.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      await supportAPI.createTicket(formData)
      toast.success('Support ticket created successfully!')
      setShowCreateForm(false)
      setFormData({
        category: 'enquiry',
        subject: '',
        description: '',
        orderId: '',
        priority: 'medium'
      })
      fetchTickets()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create ticket')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    if (!newMessage.trim()) {
      toast.error('Please enter a message')
      return
    }

    setLoading(true)
    try {
      await supportAPI.addMessage(selectedTicket._id, { message: newMessage })
      toast.success('Message sent successfully!')
      setNewMessage('')
      
      // Refresh ticket details
      const response = await supportAPI.getTicket(selectedTicket._id)
      setSelectedTicket(response.data.ticket)
      fetchTickets()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  const handleCloseTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to close this ticket?')) {
      return
    }

    try {
      await supportAPI.closeTicket(ticketId)
      toast.success('Ticket closed successfully')
      setSelectedTicket(null)
      fetchTickets()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to close ticket')
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <Clock className="text-yellow-500" size={20} />
      case 'in_progress':
        return <AlertCircle className="text-blue-500" size={20} />
      case 'resolved':
        return <CheckCircle className="text-green-500" size={20} />
      case 'closed':
        return <XCircle className="text-gray-500" size={20} />
      default:
        return null
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'resolved':
        return 'bg-green-100 text-green-800'
      case 'closed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryLabel = (category) => {
    const labels = {
      enquiry: 'Enquiry',
      complaint: 'Complaint',
      request: 'Request',
      order_issue: 'Order Issue',
      other: 'Other'
    }
    return labels[category] || category
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Care</h1>
          <p className="text-gray-600 mt-2">Get help with your orders, enquiries, and complaints</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>New Ticket</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="input-field py-2"
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filter.category}
              onChange={(e) => setFilter({ ...filter, category: e.target.value })}
              className="input-field py-2"
            >
              <option value="">All Categories</option>
              <option value="enquiry">Enquiry</option>
              <option value="complaint">Complaint</option>
              <option value="request">Request</option>
              <option value="order_issue">Order Issue</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      {!selectedTicket ? (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">My Support Tickets</h2>
          
          {tickets.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">No support tickets yet</p>
              <p className="text-sm text-gray-400 mt-2">Create a ticket to get help from our support team</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket._id}
                  onClick={() => setSelectedTicket(ticket)}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary-500 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-mono text-sm text-gray-600">{ticket.ticketNumber}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                          {ticket.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">{getCategoryLabel(ticket.category)}</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{ticket.subject}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{ticket.description}</p>
                      {ticket.order && (
                        <div className="flex items-center space-x-1 mt-2 text-sm text-gray-500">
                          <Package size={14} />
                          <span>Order #{ticket.order.orderNumber}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                        <span>{new Date(ticket.createdAt).toLocaleString()}</span>
                        <span>•</span>
                        <span>{ticket.messages.length} message{ticket.messages.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <ChevronRight className="text-gray-400" size={20} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Ticket Details View */
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setSelectedTicket(null)}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              ← Back to Tickets
            </button>
            {selectedTicket.status !== 'closed' && (
              <button
                onClick={() => handleCloseTicket(selectedTicket._id)}
                className="btn-secondary text-sm"
              >
                Close Ticket
              </button>
            )}
          </div>

          {/* Ticket Header */}
          <div className="border-b border-gray-200 pb-6 mb-6">
            <div className="flex items-center space-x-3 mb-3">
              <span className="font-mono text-lg font-bold text-gray-900">{selectedTicket.ticketNumber}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTicket.status)}`}>
                {selectedTicket.status.replace('_', ' ').toUpperCase()}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                {selectedTicket.priority.toUpperCase()}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedTicket.subject}</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Category: {getCategoryLabel(selectedTicket.category)}</span>
              <span>•</span>
              <span>Created: {new Date(selectedTicket.createdAt).toLocaleString()}</span>
              {selectedTicket.order && (
                <>
                  <span>•</span>
                  <span>Order #{selectedTicket.order.orderNumber}</span>
                </>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
            {selectedTicket.messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.senderRole === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-2xl ${message.senderRole === 'user' ? 'bg-primary-100' : 'bg-gray-100'} rounded-lg p-4`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-semibold text-sm">
                      {message.sender.name}
                    </span>
                    {message.senderRole === 'admin' && (
                      <span className="px-2 py-0.5 bg-primary-600 text-white text-xs rounded-full">Admin</span>
                    )}
                    <span className="text-xs text-gray-500">
                      {new Date(message.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-800 whitespace-pre-wrap">{message.message}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Reply Form */}
          {selectedTicket.status !== 'closed' && (
            <form onSubmit={handleSendMessage} className="border-t border-gray-200 pt-6">
              <div className="flex space-x-4">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  rows="3"
                  className="input-field flex-1"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary h-fit flex items-center space-x-2"
                >
                  <Send size={18} />
                  <span>Send</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Create Ticket Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Support Ticket</h2>
            
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="enquiry">Enquiry</option>
                  <option value="complaint">Complaint</option>
                  <option value="request">Request</option>
                  <option value="order_issue">Order Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {formData.category === 'order_issue' && (
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Related Order (Optional)</label>
                  <select
                    value={formData.orderId}
                    onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select an order</option>
                    {orders.map((order) => (
                      <option key={order._id} value={order._id}>
                        Order #{order.orderNumber} - ${order.totalAmount.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-gray-700 font-medium mb-2">Subject *</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Brief description of your issue"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide detailed information about your issue"
                  rows="5"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="input-field"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn-primary disabled:bg-gray-400"
                >
                  {loading ? 'Creating...' : 'Create Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerCare
