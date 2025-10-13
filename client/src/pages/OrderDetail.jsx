import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Package, Wallet, MapPin, Clock, CheckCircle, XCircle, Truck } from 'lucide-react'
import { ordersAPI } from '../utils/api'
import { toast } from 'react-toastify'

const OrderDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrder()
  }, [id])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const response = await ordersAPI.getOne(id)
      setOrder(response.data)
    } catch (error) {
      toast.error('Failed to load order details')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return
    }

    try {
      await ordersAPI.cancel(id)
      toast.success('Order cancelled successfully')
      fetchOrder()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order')
      console.error(error)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
      processing: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      shipped: 'bg-purple-100 text-purple-800 border-purple-300',
      delivered: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300'
    }
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300'
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="text-green-600" size={24} />
      case 'cancelled':
        return <XCircle className="text-red-600" size={24} />
      case 'shipped':
        return <Truck className="text-purple-600" size={24} />
      case 'processing':
        return <Package className="text-indigo-600" size={24} />
      case 'confirmed':
        return <CheckCircle className="text-blue-600" size={24} />
      default:
        return <Clock className="text-yellow-600" size={24} />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-500">Order not found</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/orders')}
        className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 mb-6"
      >
        <ArrowLeft size={20} />
        <span>Back to Orders</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Order #{order.orderNumber}
              </h2>
              {getStatusIcon(order.status)}
            </div>

            <div className={`border-2 rounded-lg p-4 ${getStatusColor(order.status)}`}>
              <p className="font-semibold text-lg">
                Status: {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </p>
              {order.paymentVerified && (
                <p className="text-sm mt-1">✓ Payment has been verified</p>
              )}
              {!order.paymentVerified && order.status === 'pending' && (
                <p className="text-sm mt-1">⏳ Waiting for payment verification</p>
              )}
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p>Ordered on {new Date(order.createdAt).toLocaleString()}</p>
              <p>Last updated {new Date(order.updatedAt).toLocaleString()}</p>
            </div>

            {order.trackingNumber && (
              <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Truck className="text-purple-600" size={20} />
                  <p className="font-semibold text-purple-900">Tracking Number</p>
                </div>
                <code className="text-lg font-mono text-purple-700 bg-white px-3 py-2 rounded block">
                  {order.trackingNumber}
                </code>
              </div>
            )}

            {order.status === 'pending' && (
              <button
                onClick={handleCancelOrder}
                className="mt-4 text-red-600 hover:text-red-700 font-medium"
              >
                Cancel Order
              </button>
            )}
          </div>

          {/* Order Timeline */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Clock className="mr-2" size={24} />
                Order Timeline
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Complete history of all status updates ({order.statusHistory.length} {order.statusHistory.length === 1 ? 'update' : 'updates'})
              </p>

              <div className="space-y-4">
                {[...order.statusHistory].reverse().map((history, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex flex-col items-center">
                      <div className={`p-2 rounded-full ${getStatusColor(history.status).split(' ')[0]} ${getStatusColor(history.status).split(' ')[1]}`}>
                        {getStatusIcon(history.status)}
                      </div>
                      {index < order.statusHistory.length - 1 && (
                        <div className="w-0.5 h-12 bg-gray-300 my-1"></div>
                      )}
                    </div>

                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-lg capitalize">{history.status}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(history.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {history.note && (
                        <p className="text-gray-600">{history.note}</p>
                      )}
                      {index === 0 && (
                        <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                          Latest Update
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Package className="mr-2" size={24} />
              Order Items
            </h3>

            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item._id} className="flex items-center space-x-4 pb-4 border-b last:border-0">
                  {item.product?.images?.[0] ? (
                    <img
                      src={item.product.images[0]}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Package size={32} className="text-gray-400" />
                    </div>
                  )}

                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{item.name}</h4>
                    <p className="text-gray-600">Quantity: {item.quantity}</p>
                    <p className="text-gray-600">${item.price.toFixed(2)} each</p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-primary-600">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount</span>
                <span className="text-primary-600">${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <MapPin className="mr-2" size={24} />
              Shipping Address
            </h3>

            <div className="text-gray-700">
              <p className="font-semibold">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.address}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
              </p>
              <p>{order.shippingAddress.country}</p>
              <p className="mt-2">Phone: {order.shippingAddress.phone}</p>
            </div>
          </div>

          {/* Admin Notes */}
          {order.notes && (
            <div className="card bg-blue-50 border border-blue-200">
              <h3 className="text-lg font-bold text-blue-900 mb-2">Admin Notes</h3>
              <p className="text-blue-800">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card sticky top-20">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Wallet className="mr-2" size={24} />
              Payment Details
            </h3>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Cryptocurrency</p>
                <p className="font-semibold text-lg">{order.cryptocurrency}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Wallet Address</p>
                <code className="text-xs break-all bg-gray-100 p-2 rounded block mt-1">
                  {order.walletAddress}
                </code>
              </div>

              {order.transactionHash && (
                <div>
                  <p className="text-sm text-gray-600">Transaction Hash</p>
                  <code className="text-xs break-all bg-gray-100 p-2 rounded block mt-1">
                    {order.transactionHash}
                  </code>
                </div>
              )}

              <div className="pt-3 border-t">
                <p className="text-sm text-gray-600">Payment Status</p>
                <p className={`font-semibold ${order.paymentVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                  {order.paymentVerified ? '✓ Verified' : '⏳ Pending Verification'}
                </p>
              </div>
            </div>

            {!order.paymentVerified && order.status === 'pending' && (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  Your payment is being verified. This usually takes a few minutes to a few hours.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetail
