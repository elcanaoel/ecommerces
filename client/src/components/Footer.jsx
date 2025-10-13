import { Bitcoin, Wallet } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Bitcoin className="text-primary-400" size={24} />
              <h3 className="text-xl font-bold">Crypto Store</h3>
            </div>
            <p className="text-gray-400">
              Premium products, pay with cryptocurrency. Fast, secure, and decentralized.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Accepted Cryptocurrencies</h4>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center space-x-2">
                <Wallet size={16} />
                <span>Bitcoin (BTC)</span>
              </li>
              <li className="flex items-center space-x-2">
                <Wallet size={16} />
                <span>Ethereum (ETH)</span>
              </li>
              <li className="flex items-center space-x-2">
                <Wallet size={16} />
                <span>Tether (USDT)</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="/" className="hover:text-primary-400 transition-colors">Home</a>
              </li>
              <li>
                <a href="/cart" className="hover:text-primary-400 transition-colors">Cart</a>
              </li>
              <li>
                <a href="/orders" className="hover:text-primary-400 transition-colors">Orders</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Crypto Store. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
