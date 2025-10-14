import React from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Package, Star } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { toast } from 'react-toastify'

const ProductCard = ({ product }) => {
  const { addToCart } = useCart()
  const [imageError, setImageError] = React.useState(false)

  const handleAddToCart = (e) => {
    e.preventDefault()
    if (product.stock > 0) {
      addToCart(product)
      toast.success('Added to cart!')
    } else {
      toast.error('Product out of stock')
    }
  }

  const handleImageError = (e) => {
    console.error('Image failed to load:', product.images[0])
    setImageError(true)
  }

  const handleImageLoad = () => {
    console.log('Image loaded successfully:', product.images[0])
  }

  return (
    <Link to={`/product/${product._id}`} className="card hover:shadow-xl transition-shadow">
      <div className="relative">
        {product.images && product.images.length > 0 && !imageError ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-48 object-cover rounded-lg mb-4 bg-gray-100"
            onError={handleImageError}
            onLoad={handleImageLoad}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-4 flex items-center justify-center">
            <div className="text-center text-white p-4">
              <Package size={48} className="mx-auto mb-2" />
              <p className="text-sm font-semibold">{product.name}</p>
            </div>
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
            Out of Stock
          </div>
        )}
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
        {product.name}
      </h3>

      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
        {product.description}
      </p>

      {/* Rating */}
      {product.averageRating > 0 && (
        <div className="flex items-center space-x-1 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={i < Math.round(product.averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">
            {product.averageRating.toFixed(1)} ({product.reviews?.length || 0})
          </span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-primary-600">
            ${product.price.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500">
            Stock: {product.stock}
          </p>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="btn-primary flex items-center space-x-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <ShoppingCart size={18} />
          <span>Add</span>
        </button>
      </div>
    </Link>
  )
}

export default ProductCard
