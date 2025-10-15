import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, DollarSign, Users, TrendingUp, CreditCard, Image as ImageIcon, RefreshCw } from 'lucide-react'
import { walletAPI, BASE_URL } from '../../utils/api'
import { toast } from 'react-toastify'

const AdminWallet = () => {
  const [loading, setLoading] = useState(false)
  const [pendingDeposits, setPendingDeposits] = useState([])
  const [allTransactions, setAllTransactions] = useState([])
  const [usersBalances, setUsersBalances] = useState([])
  const [activeTab, setActiveTab] = useState('pending')
  const [filter, setFilter] = useState({ status: '', type: '' })
  const [selectedImage, setSelectedImage] = useState(null)
  const [recalculating, setRecalculating] = useState(null)

  useEffect(() => {
    fetchPendingDeposits()
    fetchAllTransactions()
  }, [])

  useEffect(() => {
    if (activeTab === 'all') {
      fetchAllTransactions()
    } else if (activeTab === 'balances') {
      fetchUsersBalances()
    }
  }, [filter, activeTab])

  const fetchPendingDeposits = async () => {
    try {
      const response = await walletAPI.getPendingDeposits()
      setPendingDeposits(response.data.deposits)
    } catch (error) {
      console.error('Failed to fetch pending deposits:', error)
      toast.error('Failed to load pending deposits')
    }
  }

  const fetchAllTransactions = async () => {
    try {
      const response = await walletAPI.getAllTransactions(filter)
      setAllTransactions(response.data.transactions)
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
      toast.error('Failed to load transactions')
    }
  }

  const fetchUsersBalances = async () => {
    try {
      const response = await walletAPI.getUsersBalances()
      setUsersBalances(response.data.users)
    } catch (error) {
      console.error('Failed to fetch users balances:', error)
      toast.error('Failed to load users balances')
    }
  }

  const handleApprove = async (transactionId) => {
    if (!window.confirm('Are you sure you want to approve this deposit?')) {
      return
    }

    setLoading(true)
    try {
      await walletAPI.confirmDeposit(transactionId)
      toast.success('Deposit approved successfully!')
      fetchPendingDeposits()
      fetchAllTransactions()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve deposit')
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async (transactionId) => {
    if (!window.confirm('Are you sure you want to reject this deposit?')) {
      return
    }

    setLoading(true)
    try {
      await walletAPI.rejectDeposit(transactionId)
      toast.success('Deposit rejected')
      fetchPendingDeposits()
      fetchAllTransactions()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject deposit')
    } finally {
      setLoading(false)
    }
  }

  const handleRecalculateBalance = async (userId, userName) => {
    if (!window.confirm(`Recalculate wallet balance for ${userName}? This will fix any discrepancies.`)) {
      return
    }

    setRecalculating(userId)
    try {
      const response = await walletAPI.recalculateBalance(userId)
      const { oldBalance, newBalance, difference, transactionsProcessed } = response.data
      
      if (difference === 0) {
        toast.info(`Balance is correct: $${newBalance.toFixed(2)}`)
      } else {
        toast.success(
          `Balance updated! Old: $${oldBalance.toFixed(2)} → New: $${newBalance.toFixed(2)} (${difference > 0 ? '+' : ''}$${difference.toFixed(2)}). Processed ${transactionsProcessed} transactions.`
        )
      }
      
      fetchUsersBalances()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to recalculate balance')
    } finally {
      setRecalculating(null)
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getTypeBadge = (type) => {
    const styles = {
      deposit: 'bg-blue-100 text-blue-800',
      payment: 'bg-purple-100 text-purple-800',
      refund: 'bg-orange-100 text-orange-800'
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[type] || 'bg-gray-100 text-gray-800'}`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    )
  }

  const stats = {
    pending: pendingDeposits.length,
    totalPendingAmount: pendingDeposits.reduce((sum, d) => sum + d.amount, 0),
    totalTransactions: allTransactions.length
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Wallet Management</h1>
        <p className="text-gray-600 mt-2">Manage user deposits and transactions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Pending Deposits</p>
              <p className="text-3xl font-bold mt-1">{stats.pending}</p>
            </div>
            <Clock size={40} className="text-yellow-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Pending Amount</p>
              <p className="text-3xl font-bold mt-1">${stats.totalPendingAmount.toFixed(2)}</p>
            </div>
            <DollarSign size={40} className="text-green-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Transactions</p>
              <p className="text-3xl font-bold mt-1">{stats.totalTransactions}</p>
            </div>
            <TrendingUp size={40} className="text-blue-200" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pending'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pending Deposits ({stats.pending})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Transactions
          </button>
          <button
            onClick={() => setActiveTab('balances')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'balances'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            User Balances
          </button>
        </nav>
      </div>

      {/* Pending Deposits Tab */}
      {activeTab === 'pending' && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Pending Deposit Requests</h2>
          
          {pendingDeposits.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">No pending deposits</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Method</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingDeposits.map((deposit) => (
                    <tr key={deposit._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(deposit.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-900">{deposit.user?.name}</p>
                          <p className="text-xs text-gray-500">{deposit.user?.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {deposit.depositMethod === 'giftcard' ? (
                          <div>
                            <div className="flex items-center space-x-1 mb-1">
                              <CreditCard size={16} className="text-primary-600" />
                              <span className="font-medium">{deposit.giftCardType}</span>
                            </div>
                            {deposit.giftCardImage && (
                              <button
                                onClick={() => setSelectedImage(`${BASE_URL}${deposit.giftCardImage}`)}
                                className="text-xs text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                              >
                                <ImageIcon size={12} />
                                <span>View Image</span>
                              </button>
                            )}
                            {deposit.giftCardCode && (
                              <p className="text-xs text-gray-500 mt-1">Code: {deposit.giftCardCode}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-600">Cash</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-green-600">
                        ${deposit.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleApprove(deposit._id)}
                            disabled={loading}
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 text-sm flex items-center space-x-1"
                          >
                            <CheckCircle size={16} />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleReject(deposit._id)}
                            disabled={loading}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400 text-sm flex items-center space-x-1"
                          >
                            <XCircle size={16} />
                            <span>Reject</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* All Transactions Tab */}
      {activeTab === 'all' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">All Transactions</h2>
            <div className="flex space-x-4">
              <select
                value={filter.type}
                onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                className="input-field py-2"
              >
                <option value="">All Types</option>
                <option value="deposit">Deposit</option>
                <option value="payment">Payment</option>
                <option value="refund">Refund</option>
              </select>
              <select
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                className="input-field py-2"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          {allTransactions.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">No transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allTransactions.map((transaction) => (
                    <tr key={transaction._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(transaction.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-900">{transaction.user?.name}</p>
                          <p className="text-xs text-gray-500">{transaction.user?.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getTypeBadge(transaction.type)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {transaction.description}
                      </td>
                      <td className={`py-3 px-4 text-right font-bold ${
                        transaction.type === 'deposit' || transaction.type === 'refund' 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {transaction.type === 'deposit' || transaction.type === 'refund' ? '+' : '-'}
                        ${transaction.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {getStatusBadge(transaction.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* User Balances Tab */}
      {activeTab === 'balances' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">User Wallet Balances</h2>
            <button
              onClick={fetchUsersBalances}
              className="btn-secondary flex items-center space-x-2"
            >
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              <strong>Info:</strong> Use the "Recalculate" button to fix any wallet balance discrepancies. 
              The system will recalculate the balance based on all completed transactions.
            </p>
          </div>

          {usersBalances.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Wallet Balance</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Member Since</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersBalances.map((user) => (
                    <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        {user.name}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {user.email}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`font-bold text-lg ${
                          user.walletBalance > 0 ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          ${user.walletBalance.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => handleRecalculateBalance(user._id, user.name)}
                            disabled={recalculating === user._id}
                            className="px-3 py-1 bg-primary-500 text-white rounded hover:bg-primary-600 disabled:bg-gray-400 text-sm flex items-center space-x-1"
                          >
                            <RefreshCw size={16} className={recalculating === user._id ? 'animate-spin' : ''} />
                            <span>{recalculating === user._id ? 'Recalculating...' : 'Recalculate'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100"
            >
              <XCircle size={24} />
            </button>
            <img 
              src={selectedImage} 
              alt="Gift card" 
              className="max-w-full max-h-[90vh] rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminWallet
