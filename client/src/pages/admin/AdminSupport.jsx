import { useState, useEffect } from 'react'
import { MessageSquare, Clock, CheckCircle, AlertCircle, XCircle, Send, User, Package, FileText } from 'lucide-react'
import { supportAPI } from '../../utils/api'
import { toast } from 'react-toastify'

const AdminSupport = () => {
  const [tickets, setTickets] = useState([])
  const [statistics, setStatistics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [filter, setFilter] = useState({ status: '', category: '', priority: '' })
  const [newMessage, setNewMessage] = useState('')
  const [adminNotes, setAdminNotes] = useState('')

  useEffect(() => {
    fetchTickets()
    fetchStatistics()
  }, [filter])

  const fetchTickets = async () => {
    try {
      const response = await supportAPI.getAllTickets(filter)
      setTickets(response.data.tickets)
    } catch (error) {
      console.error('Failed to fetch tickets:', error)
      toast.error('Failed to load tickets')
    }
  }

  const fetchStatistics = async () => {
    try {
      const response = await supportAPI.getStatistics()
      setStatistics(response.data.statistics)
    } catch (error) {
      console.error('Failed to fetch statistics:', error)
    }
  }

  const handleUpdateStatus = async (ticketId, status) => {
    setLoading(true)
    try {
      await supportAPI.updateStatus(ticketId, { status })
      toast.success('Status updated successfully')
      fetchTickets()
      if (selectedTicket && selectedTicket._id === ticketId) {
        const response = await supportAPI.getTicket(ticketId)
        setSelectedTicket(response.data.ticket)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePriority = async (ticketId, priority) => {
    setLoading(true)
    try {
      await supportAPI.updatePriority(ticketId, { priority })
      toast.success('Priority updated successfully')
      fetchTickets()
      if (selectedTicket && selectedTicket._id === ticketId) {
        const response = await supportAPI.getTicket(ticketId)
        setSelectedTicket(response.data.ticket)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update priority')
    } finally {
      setLoading(false)
    }
  }

  const handleAssignToMe = async (ticketId) => {
    setLoading(true)
    try {
      await supportAPI.assignTicket(ticketId)
      toast.success('Ticket assigned to you')
      fetchTickets()
      if (selectedTicket && selectedTicket._id === ticketId) {
        const response = await supportAPI.getTicket(ticketId)
        setSelectedTicket(response.data.ticket)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign ticket')
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
      toast.success('Message sent successfully')
      setNewMessage('')
      
      const response = await supportAPI.getTicket(selectedTicket._id)
      setSelectedTicket(response.data.ticket)
      fetchTickets()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNotes = async () => {
    if (!adminNotes.trim()) {
      toast.error('Please enter notes')
      return
    }

    setLoading(true)
    try {
      await supportAPI.updateNotes(selectedTicket._id, { notes: adminNotes })
      toast.success('Notes saved successfully')
      const response = await supportAPI.getTicket(selectedTicket._id)
      setSelectedTicket(response.data.ticket)
      fetchTickets()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save notes')
    } finally {
      setLoading(false)
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Support Management</h1>
        <p className="text-gray-600 mt-2">Manage customer support tickets and enquiries</p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Tickets</p>
                <p className="text-3xl font-bold mt-1">{statistics.total}</p>
              </div>
              <MessageSquare size={32} className="text-blue-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Open</p>
                <p className="text-3xl font-bold mt-1">{statistics.open}</p>
              </div>
              <Clock size={32} className="text-yellow-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">In Progress</p>
                <p className="text-3xl font-bold mt-1">{statistics.inProgress}</p>
              </div>
              <AlertCircle size={32} className="text-purple-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Resolved</p>
                <p className="text-3xl font-bold mt-1">{statistics.resolved}</p>
              </div>
              <CheckCircle size={32} className="text-green-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-gray-500 to-gray-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-100 text-sm">Closed</p>
                <p className="text-3xl font-bold mt-1">{statistics.closed}</p>
              </div>
              <XCircle size={32} className="text-gray-200" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={filter.priority}
              onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
              className="input-field py-2"
            >
              <option value="">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets List or Detail View */}
      {!selectedTicket ? (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Support Tickets</h2>
          
          {tickets.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">No support tickets found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Ticket</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Subject</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Priority</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-mono text-sm font-medium">{ticket.ticketNumber}</p>
                          <p className="text-xs text-gray-500">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{ticket.user?.name}</p>
                          <p className="text-xs text-gray-500">{ticket.user?.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">{getCategoryLabel(ticket.category)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-900 line-clamp-2">{ticket.subject}</p>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                          {ticket.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedTicket(ticket)}
                          className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Ticket Detail View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-primary-600 hover:text-primary-700 font-medium mb-6"
              >
                ← Back to Tickets
              </button>

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
                  <div className="flex items-center space-x-1">
                    <User size={14} />
                    <span>{selectedTicket.user?.name}</span>
                  </div>
                  <span>•</span>
                  <span>Category: {getCategoryLabel(selectedTicket.category)}</span>
                  <span>•</span>
                  <span>{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                </div>
                {selectedTicket.order && (
                  <div className="flex items-center space-x-1 mt-2 text-sm text-gray-600">
                    <Package size={14} />
                    <span>Order #{selectedTicket.order.orderNumber} - ${selectedTicket.order.totalAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Messages */}
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {selectedTicket.messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.senderRole === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-2xl ${message.senderRole === 'admin' ? 'bg-primary-100' : 'bg-gray-100'} rounded-lg p-4`}>
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
                      placeholder="Type your response..."
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleUpdateStatus(selectedTicket._id, e.target.value)}
                    className="input-field py-2"
                    disabled={loading}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={selectedTicket.priority}
                    onChange={(e) => handleUpdatePriority(selectedTicket._id, e.target.value)}
                    className="input-field py-2"
                    disabled={loading}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <button
                  onClick={() => handleAssignToMe(selectedTicket._id)}
                  disabled={loading}
                  className="w-full btn-secondary"
                >
                  {selectedTicket.assignedTo ? 'Reassign to Me' : 'Assign to Me'}
                </button>
              </div>
            </div>

            {/* Admin Notes */}
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <FileText size={18} />
                <span>Admin Notes</span>
              </h3>
              <textarea
                value={adminNotes || selectedTicket.adminNotes || ''}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add internal notes..."
                rows="4"
                className="input-field mb-3"
              />
              <button
                onClick={handleSaveNotes}
                disabled={loading}
                className="w-full btn-primary"
              >
                Save Notes
              </button>
            </div>

            {/* Customer Info */}
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-4">Customer Information</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <p className="font-medium">{selectedTicket.user?.name}</p>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <p className="font-medium">{selectedTicket.user?.email}</p>
                </div>
                {selectedTicket.assignedTo && (
                  <div>
                    <span className="text-gray-600">Assigned to:</span>
                    <p className="font-medium">{selectedTicket.assignedTo.name}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminSupport
