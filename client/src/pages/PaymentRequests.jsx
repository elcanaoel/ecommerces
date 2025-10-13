import { useState, useEffect } from 'react'
import { DollarSign, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import { paymentRequestsAPI } from '../utils/api'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'

const PaymentRequests = () => {
  const { user, login } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState(null)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await paymentRequestsAPI.getUserRequests()
      setRequests(response.data)
    } catch (error) {
      toast.error('Failed to load payment requests')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (requestId, amount) => {
    if (user.walletBalance < amount) {
      toast.error(`Insufficient balance. You need $${amount.toFixed(2)} but have $${user.walletBalance.toFixed(2)}`)
      return
    }

    if (!window.confirm(`Are you sure you want to accept this payment request of $${amount.toFixed(2)}? This amount will be deducted from your wallet balance.`)) {
      return
    }

    try {
      setProcessingId(requestId)
      const response = await paymentRequestsAPI.accept(requestId)
      toast.success('Payment accepted successfully')
      
      // Update user balance
      const token = localStorage.getItem('token')
      const updatedUser = { ...user, walletBalance: response.data.newBalance }
      login(token, updatedUser)
      
      fetchRequests()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept payment')
      console.error(error)
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (requestId) => {
    if (!window.confirm('Are you sure you want to reject this payment request?')) {
      return
    }

    try {
      setProcessingId(requestId)
      await paymentRequestsAPI.reject(requestId)
      toast.success('Payment request rejected')
      fetchRequests()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject payment')
      console.error(error)
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock, label: 'Pending' },
      accepted: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Accepted' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Rejected' }
    }
    return badges[status] || badges.pending
  }

  const pendingRequests = requests.filter(r => r.status === 'pending')
  const processedRequests = requests.filter(r => r.status !== 'pending')

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Payment Requests</h1>
        <p className="text-gray-600 mt-2">Manage payment fee requests from admin</p>
      </div>

      {/* Wallet Balance */}
      <div className="card mb-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-100 text-sm mb-1">Your Wallet Balance</p>
            <p className="text-3xl font-bold">${user?.walletBalance?.toFixed(2) || '0.00'}</p>
          </div>
          <DollarSign size={48} className="text-primary-200" />
        </div>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <AlertCircle className="mr-2 text-yellow-600" size={24} />
            Pending Requests ({pendingRequests.length})
          </h2>

          <div className="space-y-4">
            {pendingRequests.map((request) => {
              const statusBadge = getStatusBadge(request.status)
              const StatusIcon = statusBadge.icon
              const canAfford = user.walletBalance >= request.amount

              return (
                <div key={request._id} className="card border-2 border-yellow-300 bg-yellow-50">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusBadge.bg} ${statusBadge.text} flex items-center space-x-1`}>
                          <StatusIcon size={16} />
                          <span>{statusBadge.label}</span>
                        </span>
                        <span className="text-2xl font-bold text-gray-900">
                          ${request.amount.toFixed(2)}
                        </span>
                      </div>

                      <p className="text-lg font-semibold text-gray-900 mb-1">{request.reason}</p>
                      {request.description && (
                        <p className="text-gray-600 mb-2">{request.description}</p>
                      )}

                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Order:</strong> {request.order?.orderNumber}</p>
                        <p><strong>Requested:</strong> {new Date(request.createdAt).toLocaleString()}</p>
                        <p><strong>From:</strong> Admin ({request.createdBy?.name || request.createdBy?.email})</p>
                      </div>

                      {!canAfford && (
                        <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-sm text-red-800 font-medium">
                            ⚠️ Insufficient balance! You need ${(request.amount - user.walletBalance).toFixed(2)} more.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleAccept(request._id, request.amount)}
                      disabled={processingId === request._id || !canAfford}
                      className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                        canAfford
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {processingId === request._id ? 'Processing...' : 'Accept & Pay'}
                    </button>
                    <button
                      onClick={() => handleReject(request._id)}
                      disabled={processingId === request._id}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {processingId === request._id ? 'Processing...' : 'Reject'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Processed Requests */}
      {processedRequests.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            History ({processedRequests.length})
          </h2>

          <div className="space-y-4">
            {processedRequests.map((request) => {
              const statusBadge = getStatusBadge(request.status)
              const StatusIcon = statusBadge.icon

              return (
                <div key={request._id} className="card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusBadge.bg} ${statusBadge.text} flex items-center space-x-1`}>
                          <StatusIcon size={16} />
                          <span>{statusBadge.label}</span>
                        </span>
                        <span className="text-xl font-bold text-gray-900">
                          ${request.amount.toFixed(2)}
                        </span>
                      </div>

                      <p className="text-lg font-semibold text-gray-900 mb-1">{request.reason}</p>
                      {request.description && (
                        <p className="text-gray-600 mb-2">{request.description}</p>
                      )}

                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Order:</strong> {request.order?.orderNumber}</p>
                        <p><strong>Requested:</strong> {new Date(request.createdAt).toLocaleString()}</p>
                        {request.respondedAt && (
                          <p><strong>Responded:</strong> {new Date(request.respondedAt).toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {requests.length === 0 && (
        <div className="card text-center py-12">
          <DollarSign size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">No payment requests yet</p>
        </div>
      )}
    </div>
  )
}

export default PaymentRequests
