import { useState, useEffect } from 'react'
import { Eye, X, Package, Truck, CheckCircle, Clock, DollarSign } from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import { ordersAPI, paymentRequestsAPI } from '../../utils/api'
import { toast } from 'react-toastify'

const AdminOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')
  const [updateData, setUpdateData] = useState({
    status: '',
    paymentVerified: false,
    notes: '',
    trackingNumber: '',
    statusNote: ''
  })
  const [showPaymentFeeModal, setShowPaymentFeeModal] = useState(false)
  const [paymentFeeData, setPaymentFeeData] = useState({
    amount: '',
    reason: '',
    description: ''
  })

  useEffect(() => {
    fetchOrders()
  }, [filterStatus])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = filterStatus ? { status: filterStatus } : {}
      const response = await ordersAPI.getAllOrders(params)
      setOrders(response.data)
    } catch (error) {
      toast.error('Failed to load orders')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewOrder = (order) => {
    setSelectedOrder(order)
    setUpdateData({
      status: order.status,
      paymentVerified: order.paymentVerified,
      notes: order.notes || '',
      trackingNumber: order.trackingNumber || '',
      statusNote: ''
    })
    setShowModal(true)
  }

  const handleUpdateOrder = async (e) => {
    e.preventDefault()

    try {
      await ordersAPI.update(selectedOrder._id, updateData)
      toast.success('Order updated successfully')
      setShowModal(false)
      fetchOrders()
    } catch (error) {
      toast.error('Failed to update order')
      console.error(error)
    }
  }

  const handleOpenPaymentFeeModal = (order) => {
    setSelectedOrder(order)
    setPaymentFeeData({
      amount: '',
      reason: '',
      description: ''
    })
    setShowPaymentFeeModal(true)
  }

  const handleSendPaymentFee = async (e) => {
    e.preventDefault()

    if (!paymentFeeData.amount || parseFloat(paymentFeeData.amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    if (!paymentFeeData.reason.trim()) {
      toast.error('Please provide a reason')
      return
    }

    try {
      await paymentRequestsAPI.create({
        orderId: selectedOrder._id,
        amount: parseFloat(paymentFeeData.amount),
        reason: paymentFeeData.reason,
        description: paymentFeeData.description
      })
      toast.success('Payment fee request sent to user')
      setShowPaymentFeeModal(false)
      setPaymentFeeData({ amount: '', reason: '', description: '' })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send payment request')
      console.error(error)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-indigo-100 text-indigo-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      confirmed: CheckCircle,
      processing: Package,
      shipped: Truck,
      delivered: CheckCircle,
      cancelled: X
    }
    return icons[status] || Clock
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600 mt-2">Manage customer orders and payments</p>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">Filter by Status</label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-field max-w-xs"
        >
          <option value="">All Orders</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Order #</th>
                <th className="text-left py-3 px-4">Customer</th>
                <th className="text-left py-3 px-4">Items</th>
                <th className="text-left py-3 px-4">Amount</th>
                <th className="text-left py-3 px-4">Crypto</th>
                <th className="text-left py-3 px-4">Payment</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{order.orderNumber}</td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium">{order.user?.name}</p>
                      <p className="text-sm text-gray-500">{order.user?.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">{order.items.length}</td>
                  <td className="py-3 px-4 font-semibold">${order.totalAmount.toFixed(2)}</td>
                  <td className="py-3 px-4">{order.cryptocurrency}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      order.paymentVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.paymentVerified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="text-blue-600 hover:text-blue-700"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      {(order.status === 'delivered' || order.status === 'confirmed' || order.status === 'shipped') && (
                        <button
                          onClick={() => handleOpenPaymentFeeModal(order)}
                          className="text-green-600 hover:text-green-700"
                          title="Send Payment Fee"
                        >
                          <DollarSign size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {orders.length === 0 && (
            <p className="text-center text-gray-500 py-8">No orders found</p>
          )}
        </div>
      )}

      {/* Order Detail Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Order Details - {selectedOrder.orderNumber}</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Customer Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold mb-3">Customer Information</h3>
                  <p><strong>Name:</strong> {selectedOrder.user?.name}</p>
                  <p><strong>Email:</strong> {selectedOrder.user?.email}</p>
                </div>

                {/* Shipping Address */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold mb-3">Shipping Address</h3>
                  <p>{selectedOrder.shippingAddress.fullName}</p>
                  <p>{selectedOrder.shippingAddress.address}</p>
                  <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
                  <p>{selectedOrder.shippingAddress.country}</p>
                  <p><strong>Phone:</strong> {selectedOrder.shippingAddress.phone}</p>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-bold mb-3">Payment Information</h3>
                <p><strong>Cryptocurrency:</strong> {selectedOrder.cryptocurrency}</p>
                <p className="text-sm break-all"><strong>Wallet Address:</strong> {selectedOrder.walletAddress}</p>
                {selectedOrder.transactionHash && (
                  <p className="text-sm break-all"><strong>Transaction Hash:</strong> {selectedOrder.transactionHash}</p>
                )}
                <p><strong>Total Amount:</strong> ${selectedOrder.totalAmount.toFixed(2)}</p>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="font-bold mb-3">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item._id} className="flex justify-between bg-gray-50 p-3 rounded">
                      <span>{item.name} x {item.quantity}</span>
                      <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status History */}
              {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold mb-3">Order Timeline</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Complete history: {selectedOrder.statusHistory.length} {selectedOrder.statusHistory.length === 1 ? 'update' : 'updates'} (newest first)
                  </p>
                  <div className="space-y-3">
                    {[...selectedOrder.statusHistory].reverse().map((history, index) => {
                      const StatusIcon = getStatusIcon(history.status)
                      const isLatest = index === 0
                      return (
                        <div key={index} className={`flex items-start space-x-3 p-3 rounded-lg ${isLatest ? 'bg-green-50 border-2 border-green-200' : 'bg-gray-50'}`}>
                          <div className={`p-2 rounded-full ${getStatusColor(history.status)}`}>
                            <StatusIcon size={16} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold capitalize">{history.status}</span>
                                {isLatest && (
                                  <span className="px-2 py-0.5 bg-green-600 text-white text-xs font-semibold rounded">
                                    Current
                                  </span>
                                )}
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(history.timestamp).toLocaleString()}
                              </span>
                            </div>
                            {history.note && <p className="text-sm text-gray-600 mt-1">{history.note}</p>}
                            {history.updatedBy && (
                              <p className="text-xs text-gray-500 mt-1">
                                Updated by: {history.updatedBy.name || history.updatedBy.email}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Update Form */}
              <form onSubmit={handleUpdateOrder} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Order Status</label>
                    <select
                      value={updateData.status}
                      onChange={(e) => setUpdateData({...updateData, status: e.target.value})}
                      className="input-field"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Payment Status</label>
                    <select
                      value={updateData.paymentVerified}
                      onChange={(e) => setUpdateData({...updateData, paymentVerified: e.target.value === 'true'})}
                      className="input-field"
                    >
                      <option value="false">Not Verified</option>
                      <option value="true">Verified</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Tracking Number</label>
                  <input
                    type="text"
                    value={updateData.trackingNumber}
                    onChange={(e) => setUpdateData({...updateData, trackingNumber: e.target.value})}
                    className="input-field"
                    placeholder="Auto-generated when shipped (or enter custom)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Tracking number is automatically generated when order status is changed to "Shipped"
                  </p>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Status Update Note</label>
                  <textarea
                    value={updateData.statusNote}
                    onChange={(e) => setUpdateData({...updateData, statusNote: e.target.value})}
                    className="input-field"
                    rows="2"
                    placeholder="Add a note about this status update..."
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Admin Notes</label>
                  <textarea
                    value={updateData.notes}
                    onChange={(e) => setUpdateData({...updateData, notes: e.target.value})}
                    className="input-field"
                    rows="3"
                    placeholder="Add internal notes for this order..."
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 btn-primary">
                    Update Order
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Payment Fee Modal */}
      {showPaymentFeeModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Send Payment Fee</h2>
                <button
                  onClick={() => setShowPaymentFeeModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Order:</strong> {selectedOrder.orderNumber}
                </p>
                <p className="text-sm text-blue-900">
                  <strong>Customer:</strong> {selectedOrder.user?.name}
                </p>
                <p className="text-sm text-blue-900">
                  <strong>Order Total:</strong> ${selectedOrder.totalAmount.toFixed(2)}
                </p>
              </div>

              <form onSubmit={handleSendPaymentFee} className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Amount ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={paymentFeeData.amount}
                    onChange={(e) => setPaymentFeeData({...paymentFeeData, amount: e.target.value})}
                    className="input-field"
                    placeholder="Enter amount (e.g., 25.00)"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Reason *</label>
                  <input
                    type="text"
                    value={paymentFeeData.reason}
                    onChange={(e) => setPaymentFeeData({...paymentFeeData, reason: e.target.value})}
                    className="input-field"
                    placeholder="e.g., Shipping fee, Custom fee, etc."
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Description (Optional)</label>
                  <textarea
                    value={paymentFeeData.description}
                    onChange={(e) => setPaymentFeeData({...paymentFeeData, description: e.target.value})}
                    className="input-field"
                    rows="3"
                    placeholder="Add additional details about this payment fee..."
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    ⚠️ The user will receive a notification and must accept this payment request before the amount is deducted from their wallet balance.
                  </p>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPaymentFeeModal(false)}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 btn-primary">
                    Send Payment Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminOrders
