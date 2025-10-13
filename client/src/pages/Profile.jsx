import { useState, useEffect } from 'react'
import { Wallet, DollarSign, TrendingUp, Clock, CheckCircle, XCircle, CreditCard, Upload } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { walletAPI } from '../utils/api'
import { toast } from 'react-toastify'

const Profile = () => {
  const { user, login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [walletData, setWalletData] = useState({
    walletBalance: user?.walletBalance || 0,
    transactions: []
  })
  const [depositAmount, setDepositAmount] = useState('')
  const [showDepositForm, setShowDepositForm] = useState(false)
  const [depositMethod, setDepositMethod] = useState('cash')
  const [giftCardType, setGiftCardType] = useState('')
  const [giftCardCode, setGiftCardCode] = useState('')
  const [giftCardImage, setGiftCardImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [availableGiftCards, setAvailableGiftCards] = useState([])

  useEffect(() => {
    fetchWalletData()
    fetchGiftCardTypes()
  }, [])

  const fetchGiftCardTypes = async () => {
    try {
      const response = await walletAPI.getGiftCardTypes()
      setAvailableGiftCards(response.data.giftCardTypes)
      if (response.data.giftCardTypes.length > 0) {
        setGiftCardType(response.data.giftCardTypes[0])
      }
    } catch (error) {
      console.error('Failed to fetch gift card types:', error)
      // Fallback to default types
      setAvailableGiftCards(['Amazon', 'iTunes', 'Google Play', 'Steam', 'Visa'])
      setGiftCardType('Amazon')
    }
  }

  const fetchWalletData = async () => {
    try {
      const response = await walletAPI.getWallet()
      setWalletData(response.data)
      
      // Update user context with latest wallet balance
      const token = localStorage.getItem('token')
      const updatedUser = { ...user, walletBalance: response.data.walletBalance }
      login(token, updatedUser)
    } catch (error) {
      console.error('Failed to fetch wallet data:', error)
      toast.error('Failed to load wallet information')
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB')
        return
      }
      setGiftCardImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleDeposit = async (e) => {
    e.preventDefault()
    
    const amount = parseFloat(depositAmount)
    if (isNaN(amount) || amount < 1) {
      toast.error('Please enter a valid amount (minimum $1)')
      return
    }

    setLoading(true)
    try {
      if (depositMethod === 'giftcard') {
        if (!giftCardImage) {
          toast.error('Please upload gift card image')
          setLoading(false)
          return
        }

        const formData = new FormData()
        formData.append('amount', amount)
        formData.append('giftCardType', giftCardType)
        formData.append('giftCardCode', giftCardCode)
        formData.append('giftCardImage', giftCardImage)

        await walletAPI.depositGiftCard(formData)
        toast.success('Gift card deposit submitted! Waiting for admin verification.')
      } else {
        await walletAPI.deposit({ amount })
        toast.success('Deposit request submitted! Waiting for admin approval.')
      }
      
      setDepositAmount('')
      setGiftCardCode('')
      setGiftCardImage(null)
      setImagePreview(null)
      setShowDepositForm(false)
      fetchWalletData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create deposit request')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={20} />
      case 'pending':
        return <Clock className="text-yellow-500" size={20} />
      case 'failed':
        return <XCircle className="text-red-500" size={20} />
      default:
        return null
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50'
      case 'pending':
        return 'text-yellow-600 bg-yellow-50'
      case 'failed':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'deposit':
        return 'text-green-600'
      case 'payment':
        return 'text-red-600'
      case 'refund':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* User Info Card */}
        <div className="card">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Wallet Balance Card */}
        <div className="card bg-gradient-to-br from-primary-500 to-primary-700 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-primary-100">Wallet Balance</span>
            <Wallet size={24} />
          </div>
          <p className="text-4xl font-bold mb-4">${walletData.walletBalance.toFixed(2)}</p>
          <button
            onClick={() => setShowDepositForm(!showDepositForm)}
            className="w-full bg-white text-primary-600 py-2 px-4 rounded-lg font-medium hover:bg-primary-50 transition-colors"
          >
            Add Funds
          </button>
        </div>

        {/* Quick Stats Card */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600">Total Transactions</span>
            <TrendingUp className="text-primary-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {walletData.transactions.length}
          </p>
        </div>
      </div>

      {/* Deposit Form */}
      {showDepositForm && (
        <div className="card mb-8 border-2 border-primary-500">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Funds to Wallet</h2>
          <form onSubmit={handleDeposit} className="space-y-4">
            {/* Deposit Method Selection */}
            <div>
              <label className="block text-gray-700 font-medium mb-3">Deposit Method</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setDepositMethod('cash')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    depositMethod === 'cash'
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-300 hover:border-primary-400'
                  }`}
                >
                  <DollarSign className="mx-auto mb-2 text-primary-600" size={32} />
                  <p className="font-bold">Cash Deposit</p>
                </button>
                <button
                  type="button"
                  onClick={() => setDepositMethod('giftcard')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    depositMethod === 'giftcard'
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-300 hover:border-primary-400'
                  }`}
                >
                  <CreditCard className="mx-auto mb-2 text-primary-600" size={32} />
                  <p className="font-bold">Gift Card</p>
                </button>
              </div>
            </div>

            {/* Gift Card Type Selection */}
            {depositMethod === 'giftcard' && (
              <div>
                <label className="block text-gray-700 font-medium mb-3">Select Gift Card Type</label>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {availableGiftCards.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setGiftCardType(type)}
                      className={`p-3 rounded-lg border-2 transition-all text-sm ${
                        giftCardType === type
                          ? 'border-primary-600 bg-primary-50 font-bold'
                          : 'border-gray-300 hover:border-primary-400'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                {availableGiftCards.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">No gift card types available. Contact admin.</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Deposit Amount (USD)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="1"
                  step="0.01"
                  className="input-field pl-10"
                  required
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">Minimum deposit: $1.00</p>
            </div>

            {/* Gift Card Specific Fields */}
            {depositMethod === 'giftcard' && (
              <>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Gift Card Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={giftCardCode}
                    onChange={(e) => setGiftCardCode(e.target.value)}
                    placeholder="Enter gift card code"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Upload Gift Card Image *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="giftcard-upload"
                      required={depositMethod === 'giftcard'}
                    />
                    <label htmlFor="giftcard-upload" className="cursor-pointer">
                      {imagePreview ? (
                        <div>
                          <img src={imagePreview} alt="Gift card preview" className="max-h-48 mx-auto mb-2 rounded" />
                          <p className="text-sm text-gray-600">Click to change image</p>
                        </div>
                      ) : (
                        <div>
                          <Upload className="mx-auto text-gray-400 mb-2" size={48} />
                          <p className="text-gray-600">Click to upload gift card image</p>
                          <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </>
            )}

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => {
                  setShowDepositForm(false)
                  setDepositAmount('')
                  setGiftCardCode('')
                  setGiftCardImage(null)
                  setImagePreview(null)
                }}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary disabled:bg-gray-400"
              >
                {loading ? 'Processing...' : depositMethod === 'giftcard' ? 'Submit Gift Card' : 'Deposit Funds'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Transaction History */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Transaction History</h2>
        
        {walletData.transactions.length === 0 ? (
          <div className="text-center py-12">
            <Wallet className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">No transactions yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Add funds to your wallet to get started
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {walletData.transactions.map((transaction) => (
                  <tr key={transaction._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-sm font-medium capitalize ${getTypeColor(transaction.type)}`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {transaction.description}
                    </td>
                    <td className={`py-3 px-4 text-right font-semibold ${getTypeColor(transaction.type)}`}>
                      {transaction.type === 'deposit' || transaction.type === 'refund' ? '+' : '-'}
                      ${transaction.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center">
                        <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {getStatusIcon(transaction.status)}
                          <span className="capitalize">{transaction.status}</span>
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
