const sampleProducts = [
  {
    id: "P-1001",
    name: "Organic Basmati Rice",
    category: "Grains",
    seller: "Green Harvest Co-op",
    price: 4.8,
    image:
      "https://images.unsplash.com/photo-1586201375761-83865001e31b?auto=format&fit=crop&w=900&q=80",
    description:
      "Premium long-grain organic rice grown with low-water regenerative techniques.",
    isEcoFriendly: true,
    carbonData: {
      method: "manual",
      totalCO2ePerKg: 1.2,
      material: "plant",
      breakdown: {
        manufacturing: 0.46,
        packaging: 0.17,
        transport: 0.34,
        handling: 0.23
      }
    }
  },
  {
    id: "P-1002",
    name: "Reusable Glass Water Bottle",
    category: "Lifestyle",
    seller: "Eco Home Market",
    price: 12.5,
    image:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80",
    description:
      "BPA-free reusable bottle designed for long-term use and reduced plastic waste.",
    isEcoFriendly: true,
    carbonData: {
      method: "auto",
      totalCO2ePerKg: 1.95,
      material: "glass",
      breakdown: {
        manufacturing: 0.88,
        packaging: 0.24,
        transport: 0.57,
        handling: 0.26
      }
    }
  },
  {
    id: "P-1003",
    name: "Conventional Cleaning Spray",
    category: "Home Care",
    seller: "Urban Daily Needs",
    price: 3.2,
    image:
      "https://images.unsplash.com/photo-1584467735871-8f4f0e8f5f4e?auto=format&fit=crop&w=900&q=80",
    description:
      "Everyday cleaning spray with strong degreasing performance for kitchen use.",
    isEcoFriendly: false,
    carbonData: {
      method: "manual",
      totalCO2ePerKg: 5.9,
      material: "plastic",
      breakdown: {
        manufacturing: 2.54,
        packaging: 1.12,
        transport: 1.48,
        handling: 0.76
      }
    }
  }
];

export default sampleProducts;
