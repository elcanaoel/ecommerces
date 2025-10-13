require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');

const products = [
  // Smartphones (30 products)
  {
    name: "iPhone 15 Pro Max",
    description: "6.7-inch Super Retina XDR display, A17 Pro chip, Pro camera system with 5x optical zoom, Titanium design",
    price: 1199.99,
    category: "Smartphones",
    stock: 50,
    images: [
      "https://images.unsplash.com/photo-1696446702183-cbd50c2a8155?w=800",
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800",
      "https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=800"
    ],
    featured: true
  },
  {
    name: "iPhone 15 Pro",
    description: "6.1-inch Super Retina XDR display, A17 Pro chip, Advanced camera system, Action button",
    price: 999.99,
    category: "Smartphones",
    stock: 60,
    images: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800",
      "https://images.unsplash.com/photo-1696446702183-cbd50c2a8155?w=800"
    ],
    featured: true
  },
  {
    name: "iPhone 15",
    description: "6.1-inch Super Retina XDR display, A16 Bionic chip, Advanced dual-camera system, Dynamic Island",
    price: 799.99,
    category: "Smartphones",
    stock: 75,
    images: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800",
      "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=800"
    ]
  },
  {
    name: "iPhone 14 Pro Max",
    description: "6.7-inch display, A16 Bionic chip, 48MP Main camera, Always-On display",
    price: 899.99,
    category: "Smartphones",
    stock: 40,
    images: [
      "https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=800",
      "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=800"
    ]
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    description: "6.8-inch Dynamic AMOLED display, Snapdragon 8 Gen 3, 200MP camera, S Pen included",
    price: 1299.99,
    category: "Smartphones",
    stock: 45,
    images: [
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800"
    ],
    featured: true
  },
  {
    name: "Samsung Galaxy S24+",
    description: "6.7-inch display, Snapdragon 8 Gen 3, Triple camera system, 4900mAh battery",
    price: 999.99,
    category: "Smartphones",
    stock: 55,
    images: [
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800"
    ]
  },
  {
    name: "Samsung Galaxy S24",
    description: "6.2-inch FHD+ display, Snapdragon 8 Gen 3, 50MP camera, Compact flagship",
    price: 799.99,
    category: "Smartphones",
    stock: 65,
    images: [
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800",
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800"
    ]
  },
  {
    name: "Samsung Galaxy Z Fold 5",
    description: "7.6-inch foldable display, Snapdragon 8 Gen 2, Multi-tasking powerhouse, IPX8 water resistant",
    price: 1799.99,
    category: "Smartphones",
    stock: 25,
    images: [
      "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800",
      "https://images.unsplash.com/photo-1592286927505-b7d6c1f6d1f7?w=800",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800"
    ],
    featured: true
  },
  {
    name: "Samsung Galaxy Z Flip 5",
    description: "6.7-inch foldable display, Large cover screen, Snapdragon 8 Gen 2, Compact design",
    price: 999.99,
    category: "Smartphones",
    stock: 35,
    images: [
      "https://images.unsplash.com/photo-1592286927505-b7d6c1f6d1f7?w=800",
      "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800"
    ]
  },
  {
    name: "Google Pixel 8 Pro",
    description: "6.7-inch LTPO OLED, Google Tensor G3, 50MP camera with AI features, 7 years of updates",
    price: 999.99,
    category: "Smartphones",
    stock: 40,
    images: [
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
      "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800"
    ],
    featured: true
  },
  {
    name: "Google Pixel 8",
    description: "6.2-inch Actua display, Tensor G3 chip, Advanced AI photography, Magic Eraser",
    price: 699.99,
    category: "Smartphones",
    stock: 50,
    images: [
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800"
    ]
  },
  {
    name: "OnePlus 12",
    description: "6.82-inch AMOLED, Snapdragon 8 Gen 3, 50MP Hasselblad camera, 100W fast charging",
    price: 799.99,
    category: "Smartphones",
    stock: 45,
    images: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
      "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800"
    ]
  },
  {
    name: "OnePlus 11",
    description: "6.7-inch AMOLED, Snapdragon 8 Gen 2, Hasselblad camera, 80W SuperVOOC charging",
    price: 649.99,
    category: "Smartphones",
    stock: 55,
    images: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800"
    ]
  },
  {
    name: "Xiaomi 14 Pro",
    description: "6.73-inch AMOLED, Snapdragon 8 Gen 3, Leica camera system, 120W HyperCharge",
    price: 899.99,
    category: "Smartphones",
    stock: 40,
    images: [
      "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800"
    ]
  },
  {
    name: "Xiaomi 13T Pro",
    description: "6.67-inch AMOLED, Dimensity 9200+, 50MP Leica camera, 120W charging",
    price: 649.99,
    category: "Smartphones",
    stock: 50,
    images: [
      "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800",
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800"
    ]
  },
  {
    name: "OPPO Find X6 Pro",
    description: "6.82-inch AMOLED, Snapdragon 8 Gen 2, Hasselblad triple camera, 100W charging",
    price: 849.99,
    category: "Smartphones",
    stock: 35,
    images: [
      "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800"
    ]
  },
  {
    name: "Motorola Edge 40 Pro",
    description: "6.67-inch pOLED, Snapdragon 8 Gen 2, 50MP camera, Clean Android experience",
    price: 699.99,
    category: "Smartphones",
    stock: 45,
    images: [
      "https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=800",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800"
    ]
  },
  {
    name: "Sony Xperia 1 V",
    description: "6.5-inch 4K OLED, Snapdragon 8 Gen 2, Pro camera with ZEISS optics, 21:9 display",
    price: 1199.99,
    category: "Smartphones",
    stock: 30,
    images: [
      "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800"
    ]
  },
  {
    name: "ASUS ROG Phone 7",
    description: "6.78-inch AMOLED 165Hz, Snapdragon 8 Gen 2, Gaming triggers, 6000mAh battery",
    price: 999.99,
    category: "Smartphones",
    stock: 25,
    images: [
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800",
      "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800"
    ]
  },
  {
    name: "Nothing Phone 2",
    description: "6.7-inch LTPO AMOLED, Snapdragon 8+ Gen 1, Glyph Interface, Unique design",
    price: 599.99,
    category: "Smartphones",
    stock: 60,
    images: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800"
    ]
  },
  {
    name: "Realme GT 5 Pro",
    description: "6.78-inch AMOLED, Snapdragon 8 Gen 3, 50MP Sony IMX890, 100W charging",
    price: 549.99,
    category: "Smartphones",
    stock: 70,
    images: [
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800",
      "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800"
    ]
  },
  {
    name: "Vivo X100 Pro",
    description: "6.78-inch AMOLED, Dimensity 9300, ZEISS camera system, 120W FlashCharge",
    price: 799.99,
    category: "Smartphones",
    stock: 40,
    images: [
      "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800"
    ]
  },
  {
    name: "Honor Magic 6 Pro",
    description: "6.8-inch OLED, Snapdragon 8 Gen 3, AI-powered camera, 80W SuperCharge",
    price: 749.99,
    category: "Smartphones",
    stock: 45,
    images: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800"
    ]
  },
  {
    name: "iPhone 13",
    description: "6.1-inch display, A15 Bionic chip, Dual camera system, Great value flagship",
    price: 599.99,
    category: "Smartphones",
    stock: 80,
    images: [
      "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=800",
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800"
    ]
  },
  {
    name: "Samsung Galaxy A54",
    description: "6.4-inch Super AMOLED, Exynos 1380, 50MP OIS camera, IP67 water resistant",
    price: 449.99,
    category: "Smartphones",
    stock: 90,
    images: [
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800"
    ]
  },
  {
    name: "Google Pixel 7a",
    description: "6.1-inch OLED, Tensor G2, Excellent camera, Clean Android, Affordable flagship",
    price: 499.99,
    category: "Smartphones",
    stock: 75,
    images: [
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800"
    ]
  },
  {
    name: "OnePlus Nord 3",
    description: "6.74-inch AMOLED, Dimensity 9000, 50MP camera, 80W fast charging",
    price: 399.99,
    category: "Smartphones",
    stock: 85,
    images: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
      "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800"
    ]
  },
  {
    name: "Xiaomi Redmi Note 13 Pro",
    description: "6.67-inch AMOLED, Snapdragon 7s Gen 2, 200MP camera, 67W charging",
    price: 349.99,
    category: "Smartphones",
    stock: 100,
    images: [
      "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800"
    ]
  },
  {
    name: "Motorola Moto G Power",
    description: "6.5-inch display, MediaTek Dimensity 7020, 50MP camera, 5000mAh battery",
    price: 299.99,
    category: "Smartphones",
    stock: 110,
    images: [
      "https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=800",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800"
    ]
  },
  {
    name: "Samsung Galaxy S23 FE",
    description: "6.4-inch Dynamic AMOLED, Exynos 2200, Triple camera, Premium features at great price",
    price: 599.99,
    category: "Smartphones",
    stock: 65,
    images: [
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800"
    ]
  },

  // Laptops (30 products)
  {
    name: "MacBook Pro 16-inch M3 Max",
    description: "16-inch Liquid Retina XDR, M3 Max chip, 48GB RAM, 1TB SSD, Ultimate performance",
    price: 3499.99,
    category: "Laptops",
    stock: 20,
    images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500"],
    featured: true
  },
  {
    name: "MacBook Pro 14-inch M3 Pro",
    description: "14-inch Liquid Retina XDR, M3 Pro chip, 18GB RAM, 512GB SSD, Pro performance",
    price: 1999.99,
    category: "Laptops",
    stock: 30,
    images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500"],
    featured: true
  },
  {
    name: "MacBook Air 15-inch M3",
    description: "15-inch Liquid Retina, M3 chip, 16GB RAM, 512GB SSD, Thin and light powerhouse",
    price: 1499.99,
    category: "Laptops",
    stock: 40,
    images: ["https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=500"],
    featured: true
  },
  {
    name: "MacBook Air 13-inch M3",
    description: "13-inch Liquid Retina, M3 chip, 8GB RAM, 256GB SSD, Perfect everyday laptop",
    price: 1099.99,
    category: "Laptops",
    stock: 50,
    images: ["https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=500"]
  },
  {
    name: "Dell XPS 15",
    description: "15.6-inch 4K OLED, Intel Core i9-13900H, RTX 4070, 32GB RAM, 1TB SSD",
    price: 2499.99,
    category: "Laptops",
    stock: 25,
    images: ["https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500"],
    featured: true
  },
  {
    name: "Dell XPS 13 Plus",
    description: "13.4-inch FHD+, Intel Core i7-1360P, 16GB RAM, 512GB SSD, Premium ultrabook",
    price: 1399.99,
    category: "Laptops",
    stock: 35,
    images: ["https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500"]
  },
  {
    name: "HP Spectre x360 16",
    description: "16-inch 3K OLED touchscreen, Intel Core i7-13700H, 16GB RAM, 1TB SSD, 2-in-1 convertible",
    price: 1799.99,
    category: "Laptops",
    stock: 30,
    images: ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500"]
  },
  {
    name: "HP Envy 14",
    description: "14-inch 2.8K display, Intel Core i7-1355U, 16GB RAM, 512GB SSD, Sleek design",
    price: 1199.99,
    category: "Laptops",
    stock: 40,
    images: ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500"]
  },
  {
    name: "Lenovo ThinkPad X1 Carbon Gen 11",
    description: "14-inch WUXGA, Intel Core i7-1365U, 16GB RAM, 512GB SSD, Business ultrabook",
    price: 1699.99,
    category: "Laptops",
    stock: 35,
    images: ["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500"]
  },
  {
    name: "Lenovo Yoga 9i",
    description: "14-inch 4K OLED touchscreen, Intel Core i7-1360P, 16GB RAM, 1TB SSD, Premium 2-in-1",
    price: 1599.99,
    category: "Laptops",
    stock: 30,
    images: ["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500"]
  },
  {
    name: "ASUS ROG Zephyrus G16",
    description: "16-inch QHD+ 240Hz, Intel Core i9-13900H, RTX 4080, 32GB RAM, 1TB SSD, Gaming beast",
    price: 2799.99,
    category: "Laptops",
    stock: 20,
    images: ["https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500"],
    featured: true
  },
  {
    name: "ASUS ZenBook 14 OLED",
    description: "14-inch 2.8K OLED, Intel Core i7-1355U, 16GB RAM, 512GB SSD, Stunning display",
    price: 1099.99,
    category: "Laptops",
    stock: 45,
    images: ["https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500"]
  },
  {
    name: "MSI Stealth 17 Studio",
    description: "17-inch QHD+ 240Hz, Intel Core i9-13900H, RTX 4090, 64GB RAM, 2TB SSD, Creator powerhouse",
    price: 3999.99,
    category: "Laptops",
    stock: 15,
    images: ["https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500"]
  },
  {
    name: "Razer Blade 15",
    description: "15.6-inch QHD 240Hz, Intel Core i9-13950HX, RTX 4070, 32GB RAM, 1TB SSD, Premium gaming",
    price: 2699.99,
    category: "Laptops",
    stock: 25,
    images: ["https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500"]
  },
  {
    name: "Microsoft Surface Laptop 5",
    description: "13.5-inch PixelSense, Intel Core i7-1255U, 16GB RAM, 512GB SSD, Premium Windows laptop",
    price: 1399.99,
    category: "Laptops",
    stock: 35,
    images: ["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500"]
  },
  {
    name: "Microsoft Surface Pro 9",
    description: "13-inch PixelSense touchscreen, Intel Core i7-1255U, 16GB RAM, 256GB SSD, Versatile 2-in-1",
    price: 1299.99,
    category: "Laptops",
    stock: 40,
    images: ["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500"]
  },
  {
    name: "Acer Swift X",
    description: "14-inch FHD, AMD Ryzen 7 5800U, RTX 3050, 16GB RAM, 512GB SSD, Compact creator laptop",
    price: 899.99,
    category: "Laptops",
    stock: 50,
    images: ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500"]
  },
  {
    name: "Acer Predator Helios 16",
    description: "16-inch WQXGA 240Hz, Intel Core i9-13900HX, RTX 4060, 16GB RAM, 1TB SSD, Gaming performance",
    price: 1799.99,
    category: "Laptops",
    stock: 30,
    images: ["https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500"]
  },
  {
    name: "LG Gram 17",
    description: "17-inch WQXGA, Intel Core i7-1360P, 16GB RAM, 1TB SSD, Ultra-lightweight 1.35kg",
    price: 1699.99,
    category: "Laptops",
    stock: 25,
    images: ["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500"]
  },
  {
    name: "Samsung Galaxy Book3 Pro 360",
    description: "16-inch AMOLED touchscreen, Intel Core i7-1360P, 16GB RAM, 512GB SSD, Premium 2-in-1",
    price: 1599.99,
    category: "Laptops",
    stock: 30,
    images: ["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500"]
  },
  {
    name: "Alienware m18",
    description: "18-inch QHD+ 165Hz, Intel Core i9-13980HX, RTX 4090, 64GB RAM, 2TB SSD, Ultimate gaming",
    price: 4299.99,
    category: "Laptops",
    stock: 10,
    images: ["https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500"]
  },
  {
    name: "Framework Laptop 13",
    description: "13.5-inch display, Intel Core i7-1370P, 32GB RAM, 1TB SSD, Modular and repairable",
    price: 1399.99,
    category: "Laptops",
    stock: 35,
    images: ["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500"]
  },
  {
    name: "Gigabyte AERO 16",
    description: "16-inch 4K OLED, Intel Core i9-13900H, RTX 4070, 32GB RAM, 1TB SSD, Creator laptop",
    price: 2499.99,
    category: "Laptops",
    stock: 20,
    images: ["https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500"]
  },
  {
    name: "HP Pavilion 15",
    description: "15.6-inch FHD, Intel Core i5-1335U, 16GB RAM, 512GB SSD, Everyday productivity",
    price: 699.99,
    category: "Laptops",
    stock: 60,
    images: ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500"]
  },
  {
    name: "Lenovo IdeaPad 5 Pro",
    description: "16-inch 2.5K, AMD Ryzen 7 7735HS, 16GB RAM, 512GB SSD, Great value laptop",
    price: 849.99,
    category: "Laptops",
    stock: 55,
    images: ["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500"]
  },
  {
    name: "ASUS VivoBook S15",
    description: "15.6-inch OLED, Intel Core i7-1355U, 16GB RAM, 512GB SSD, Stylish and affordable",
    price: 799.99,
    category: "Laptops",
    stock: 50,
    images: ["https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500"]
  },
  {
    name: "Dell Inspiron 16",
    description: "16-inch FHD+, Intel Core i7-1355U, 16GB RAM, 512GB SSD, Large screen productivity",
    price: 899.99,
    category: "Laptops",
    stock: 45,
    images: ["https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500"]
  },
  {
    name: "Acer Aspire 5",
    description: "15.6-inch FHD, AMD Ryzen 5 7520U, 8GB RAM, 512GB SSD, Budget-friendly laptop",
    price: 549.99,
    category: "Laptops",
    stock: 70,
    images: ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500"]
  },
  {
    name: "HP Chromebook Plus",
    description: "15.6-inch FHD, Intel Core i3-1215U, 8GB RAM, 256GB SSD, Fast and secure Chrome OS",
    price: 499.99,
    category: "Laptops",
    stock: 65,
    images: ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500"]
  },
  {
    name: "Lenovo ThinkBook 15",
    description: "15.6-inch FHD, Intel Core i5-1335U, 16GB RAM, 512GB SSD, Business laptop value",
    price: 749.99,
    category: "Laptops",
    stock: 55,
    images: ["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500"]
  }
];

async function seedProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find an admin user
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('No admin user found. Please create an admin user first.');
      process.exit(1);
    }
    console.log(`Using admin user: ${adminUser.email}`);

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Add createdBy to all products
    const productsWithCreator = products.map(product => ({
      ...product,
      createdBy: adminUser._id
    }));

    // Insert new products
    const result = await Product.insertMany(productsWithCreator);
    console.log(`✅ Successfully created ${result.length} products!`);
    
    console.log('\nProduct Summary:');
    console.log(`- Smartphones: ${products.filter(p => p.category === 'Smartphones').length}`);
    console.log(`- Laptops: ${products.filter(p => p.category === 'Laptops').length}`);
    console.log(`- Featured Products: ${products.filter(p => p.featured).length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
}

seedProducts();
