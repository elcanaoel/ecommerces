import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bitcoin, Wallet, Copy, Check, CreditCard } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { ordersAPI, settingsAPI } from '../utils/api'
import { toast } from 'react-toastify'

const Checkout = () => {
  const { cart, getCartTotal, clearCart } = useCart()
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: Shipping, 2: Payment, 3: Confirmation
  const [loading, setLoading] = useState(false)
  const [walletAddresses, setWalletAddresses] = useState({})
  const [qrCode, setQrCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('wallet')

  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: ''
  })

  const [paymentInfo, setPaymentInfo] = useState({
    cryptocurrency: 'BTC',
    transactionHash: '',
    paymentMethod: 'crypto'
  })

  useEffect(() => {
    fetchWalletAddresses()
  }, [])

  useEffect(() => {
    if (step === 2 && paymentInfo.cryptocurrency) {
      generateQRCode()
    }
  }, [step, paymentInfo.cryptocurrency])

  const fetchWalletAddresses = async () => {
    try {
      const response = await settingsAPI.get()
      setWalletAddresses(response.data.walletAddresses)
    } catch (error) {
      toast.error('Failed to load payment information')
      console.error(error)
    }
  }

  const generateQRCode = async () => {
    try {
      const address = walletAddresses[paymentInfo.cryptocurrency]
      if (!address) {
        toast.error('Wallet address not configured for this cryptocurrency')
        return
      }

      const response = await settingsAPI.generateQR({
        address,
        cryptocurrency: paymentInfo.cryptocurrency
      })
      setQrCode(response.data.qrCode)
    } catch (error) {
      console.error('Failed to generate QR code:', error)
    }
  }

  const handleShippingSubmit = (e) => {
    e.preventDefault()
    
    // Validate all fields
    const requiredFields = ['fullName', 'address', 'city', 'state', 'zipCode', 'country', 'phone']
    const missingFields = requiredFields.filter(field => !shippingInfo[field])
    
    if (missingFields.length > 0) {
      toast.error('Please fill in all shipping information')
      return
    }

    setStep(2)
  }

  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    
    setLoading(true)

    try {
      const orderData = {
        items: cart.map(item => ({
          product: item._id,
          quantity: item.quantity
        })),
        shippingAddress: shippingInfo,
        paymentMethod: selectedPaymentMethod
      }

      // Wallet payment validation
      if (user.walletBalance < getCartTotal()) {
        toast.error(`Insufficient wallet balance. You need $${getCartTotal().toFixed(2)} but have $${user.walletBalance.toFixed(2)}`)
        setLoading(false)
        return
      }

      console.log('📤 Sending order data:', {
        paymentMethod: orderData.paymentMethod,
        itemsCount: orderData.items.length,
        shippingAddress: orderData.shippingAddress
      })

      const response = await ordersAPI.create(orderData)
      
      // Update user wallet balance if wallet payment was used
      if (selectedPaymentMethod === 'wallet' && response.data.walletBalance !== undefined) {
        const token = localStorage.getItem('token')
        const updatedUser = { ...user, walletBalance: response.data.walletBalance }
        login(token, updatedUser)
      }
      
      toast.success('Order placed successfully!')
      clearCart()
      navigate(`/orders/${response.data.order._id}`)
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Failed to create order'
      toast.error(errorMsg)
      console.error('Order creation error:', error)
      console.error('Error response:', error.response?.data)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    const address = walletAddresses[paymentInfo.cryptocurrency]
    navigator.clipboard.writeText(address)
    setCopied(true)
    toast.success('Address copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  // Redirect to cart if empty
  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart')
    }
  }, [cart.length, navigate])

  if (cart.length === 0) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          <div className={`flex items-center ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200'
            }`}>
              1
            </div>
            <span className="ml-2 font-medium">Shipping</span>
          </div>
          <div className="w-16 h-1 bg-gray-300"></div>
          <div className={`flex items-center ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200'
            }`}>
              2
            </div>
            <span className="ml-2 font-medium">Payment</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {step === 1 && (
            <div className="card">
              <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>
              <form onSubmit={handleShippingSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    value={shippingInfo.fullName}
                    onChange={(e) => setShippingInfo({...shippingInfo, fullName: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Address</label>
                  <input
                    type="text"
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">City</label>
                    <input
                      type="text"
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">State/Province</label>
                    <input
                      type="text"
                      value={shippingInfo.state}
                      onChange={(e) => setShippingInfo({...shippingInfo, state: e.target.value})}
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Zip Code</label>
                    <input
                      type="text"
                      value={shippingInfo.zipCode}
                      onChange={(e) => setShippingInfo({...shippingInfo, zipCode: e.target.value})}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Country</label>
                    <input
                      type="text"
                      value={shippingInfo.country}
                      onChange={(e) => setShippingInfo({...shippingInfo, country: e.target.value})}
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={shippingInfo.phone}
                    onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>

                <button type="submit" className="w-full btn-primary py-3">
                  Continue to Payment
                </button>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className="card">
              <h2 className="text-2xl font-bold mb-6">Payment - Wallet Balance</h2>
              
              {/* Wallet Payment Info */}
              <div className="mb-6">
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg p-6 mb-4">
                  <div className="flex items-center justify-center mb-4">
                    <Wallet size={48} />
                  </div>
                  <div className="text-center">
                    <p className="text-primary-100 text-sm mb-2">Your Wallet Balance</p>
                    <p className="text-4xl font-bold mb-4">${user?.walletBalance?.toFixed(2) || '0.00'}</p>
                    <div className="border-t border-primary-400 pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-primary-100">Order Total:</span>
                        <span className="text-2xl font-bold">${getCartTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {user?.walletBalance < getCartTotal() ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 font-medium mb-2">
                      ❌ Insufficient balance! You need ${(getCartTotal() - user.walletBalance).toFixed(2)} more.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate('/profile')}
                      className="btn-primary w-full"
                    >
                      Add Funds to Wallet
                    </button>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 font-medium">
                      ✓ You have sufficient balance to complete this order
                    </p>
                  </div>
                )}
              </div>

              {/* Remove crypto payment section */}
              {false && selectedPaymentMethod === 'crypto' && (
                <>
                  {/* Cryptocurrency Selection */}
                  <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-3">Select Cryptocurrency</label>
                    <div className="grid grid-cols-3 gap-4">
                      {['BTC', 'ETH', 'USDT'].map((crypto) => (
                        <button
                          key={crypto}
                          type="button"
                          onClick={() => setPaymentInfo({...paymentInfo, cryptocurrency: crypto})}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            paymentInfo.cryptocurrency === crypto
                              ? 'border-primary-600 bg-primary-50'
                              : 'border-gray-300 hover:border-primary-400'
                          }`}
                        >
                          <Bitcoin className="mx-auto mb-2" size={32} />
                          <p className="font-bold">{crypto}</p>
                        </button>
                      ))}
                    </div>
                  </div>

              {/* Wallet Address Display */}
              {walletAddresses[paymentInfo.cryptocurrency] ? (
                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-3">
                    Send {paymentInfo.cryptocurrency} to this address:
                  </label>
                  
                  {/* QR Code */}
                  {qrCode && (
                    <div className="flex justify-center mb-4">
                      <img src={qrCode} alt="QR Code" className="w-64 h-64 border-2 border-gray-300 rounded-lg" />
                    </div>
                  )}

                  {/* Address */}
                  <div className="flex items-center space-x-2 bg-gray-100 p-4 rounded-lg">
                    <code className="flex-1 text-sm break-all">
                      {walletAddresses[paymentInfo.cryptocurrency]}
                    </code>
                    <button
                      type="button"
                      onClick={copyToClipboard}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      {copied ? <Check size={18} /> : <Copy size={18} />}
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Important:</strong> Send exactly <strong>${getCartTotal().toFixed(2)}</strong> worth of {paymentInfo.cryptocurrency} to the address above.
                      Your order will be processed once payment is verified by our admin.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">
                    Wallet address for {paymentInfo.cryptocurrency} is not configured. Please contact support.
                  </p>
                </div>
              )}

              {/* Transaction Hash (Optional) */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  Transaction Hash (Optional)
                </label>
                <input
                  type="text"
                  value={paymentInfo.transactionHash}
                  onChange={(e) => setPaymentInfo({...paymentInfo, transactionHash: e.target.value})}
                  placeholder="Enter transaction hash after sending payment"
                  className="input-field"
                />
                <p className="text-sm text-gray-500 mt-1">
                  You can submit this later if you don't have it yet
                </p>
              </div>
                </>
              )}

              <form onSubmit={handlePaymentSubmit}>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 btn-secondary py-3"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || (selectedPaymentMethod === 'crypto' && !walletAddresses[paymentInfo.cryptocurrency]) || (selectedPaymentMethod === 'wallet' && user?.walletBalance < getCartTotal())}
                    className="flex-1 btn-primary py-3 disabled:bg-gray-400"
                  >
                    {loading ? 'Processing...' : 'Place Order'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-20">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4">
              {cart.map((item) => (
                <div key={item._id} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.name} x {item.quantity}
                  </span>
                  <span className="font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary-600">${getCartTotal().toFixed(2)}</span>
              </div>
            </div>

            {step === 2 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600 flex items-center">
                  <Wallet className="inline mr-1" size={16} />
                  Payment: Wallet Balance
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
