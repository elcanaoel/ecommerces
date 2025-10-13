import { useState, useEffect } from 'react'
import { Save, Wallet, Plus, X, CreditCard } from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import { settingsAPI } from '../../utils/api'
import { toast } from 'react-toastify'

const AdminSettings = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    walletAddresses: {
      BTC: '',
      ETH: '',
      USDT: ''
    },
    giftCardTypes: [],
    siteName: '',
    siteDescription: ''
  })
  const [newGiftCard, setNewGiftCard] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await settingsAPI.get()
      setSettings(response.data)
    } catch (error) {
      toast.error('Failed to load settings')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      await settingsAPI.update(settings)
      toast.success('Settings updated successfully')
    } catch (error) {
      toast.error('Failed to update settings')
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const handleWalletChange = (crypto, value) => {
    setSettings({
      ...settings,
      walletAddresses: {
        ...settings.walletAddresses,
        [crypto]: value
      }
    })
  }

  const addGiftCard = () => {
    if (!newGiftCard.trim()) {
      toast.error('Please enter a gift card name')
      return
    }
    
    if (settings.giftCardTypes.includes(newGiftCard.trim())) {
      toast.error('This gift card type already exists')
      return
    }

    setSettings({
      ...settings,
      giftCardTypes: [...settings.giftCardTypes, newGiftCard.trim()]
    })
    setNewGiftCard('')
    toast.success('Gift card type added')
  }

  const removeGiftCard = (cardType) => {
    setSettings({
      ...settings,
      giftCardTypes: settings.giftCardTypes.filter(type => type !== cardType)
    })
    toast.success('Gift card type removed')
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Configure your store settings and wallet addresses</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl">
        {/* Site Settings */}
        <div className="card mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Site Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Site Name</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                className="input-field"
                placeholder="Crypto Store"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Site Description</label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
                className="input-field"
                rows="3"
                placeholder="Premium products, pay with crypto"
              />
            </div>
          </div>
        </div>

        {/* Wallet Addresses */}
        <div className="card mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Wallet className="mr-2" size={24} />
            Cryptocurrency Wallet Addresses
          </h2>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> These wallet addresses will be displayed to customers during checkout.
              Make sure they are correct and that you have access to these wallets.
              Never share your private keys!
            </p>
          </div>

          <div className="space-y-4">
            {/* Bitcoin */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Bitcoin (BTC) Wallet Address
              </label>
              <input
                type="text"
                value={settings.walletAddresses.BTC}
                onChange={(e) => handleWalletChange('BTC', e.target.value)}
                className="input-field font-mono text-sm"
                placeholder="Enter your Bitcoin wallet address"
              />
              <p className="text-sm text-gray-500 mt-1">
                Example: bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
              </p>
            </div>

            {/* Ethereum */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Ethereum (ETH) Wallet Address
              </label>
              <input
                type="text"
                value={settings.walletAddresses.ETH}
                onChange={(e) => handleWalletChange('ETH', e.target.value)}
                className="input-field font-mono text-sm"
                placeholder="Enter your Ethereum wallet address"
              />
              <p className="text-sm text-gray-500 mt-1">
                Example: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
              </p>
            </div>

            {/* USDT */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Tether (USDT) Wallet Address
              </label>
              <input
                type="text"
                value={settings.walletAddresses.USDT}
                onChange={(e) => handleWalletChange('USDT', e.target.value)}
                className="input-field font-mono text-sm"
                placeholder="Enter your USDT wallet address"
              />
              <p className="text-sm text-gray-500 mt-1">
                USDT can be on multiple networks (ERC-20, TRC-20, etc.). Specify the network in product description if needed.
              </p>
            </div>
          </div>
        </div>

        {/* Gift Card Types */}
        <div className="card mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <CreditCard className="mr-2" size={24} />
            Gift Card Types
          </h2>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Info:</strong> Add gift card types that users can use for deposits. 
              Users will upload images of these gift cards for verification.
            </p>
          </div>

          {/* Add New Gift Card */}
          <div className="flex space-x-2 mb-4">
            <input
              type="text"
              value={newGiftCard}
              onChange={(e) => setNewGiftCard(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGiftCard())}
              className="input-field flex-1"
              placeholder="Enter gift card name (e.g., Amazon, iTunes)"
            />
            <button
              type="button"
              onClick={addGiftCard}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Add</span>
            </button>
          </div>

          {/* Gift Card List */}
          <div className="space-y-2">
            {settings.giftCardTypes && settings.giftCardTypes.length > 0 ? (
              settings.giftCardTypes.map((cardType) => (
                <div
                  key={cardType}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center space-x-2">
                    <CreditCard size={20} className="text-primary-600" />
                    <span className="font-medium text-gray-900">{cardType}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeGiftCard(cardType)}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No gift card types added yet</p>
            )}
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={saving}
          className="btn-primary flex items-center space-x-2 disabled:bg-gray-400"
        >
          <Save size={20} />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </form>

      {/* Instructions */}
      <div className="card mt-8 max-w-3xl bg-blue-50 border border-blue-200">
        <h3 className="text-lg font-bold text-blue-900 mb-3">How to Get Wallet Addresses</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p><strong>Bitcoin (BTC):</strong> Use wallets like Electrum, Ledger, or Trezor</p>
          <p><strong>Ethereum (ETH):</strong> Use MetaMask, Trust Wallet, or hardware wallets</p>
          <p><strong>USDT:</strong> Can use the same Ethereum address (ERC-20) or Tron address (TRC-20)</p>
          <p className="mt-3">
            <strong>Security Tips:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Never share your private keys or seed phrases</li>
            <li>Use hardware wallets for large amounts</li>
            <li>Double-check addresses before saving</li>
            <li>Test with small amounts first</li>
            <li>Keep backups of your wallet recovery phrases</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminSettings
