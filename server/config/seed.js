import { User } from '../models/User.js';
import { Vendor } from '../models/Vendor.js';
import { Food } from '../models/Food.js';
import { Order } from '../models/Order.js';

export async function seedDatabaseIfEmpty() {
  try {
    const vendorCount = await Vendor.countDocuments();
    if (vendorCount > 0) {
      console.log(`[Seed] Database already contains ${vendorCount} vendors. Skipping seed.`);
      return;
    }

    console.log('[Seed] Seeding database with initial FoodMap kitchens and dishes...');

    // 1. Create Default Users
    const userAnjali = await User.create({
      phone: '9820145892',
      name: 'Anjali Sharma',
      role: 'both',
      address: 'Building B, Flat 402, Bhandup West, Mumbai',
      location: { type: 'Point', coordinates: [72.9342, 19.1458] }
    });

    const userNikhil = await User.create({
      phone: '9876543210',
      name: 'Nikhil Gupta',
      role: 'both',
      address: 'Near Ruia Gate, Bhandup West, Mumbai',
      location: { type: 'Point', coordinates: [72.9355, 19.1468] }
    });

    const userRamesh = await User.create({
      phone: '9819923456',
      name: 'Ramesh Uncle',
      role: 'vendor',
      address: 'Shop 4, Station Road, Bhandup West, Mumbai',
      location: { type: 'Point', coordinates: [72.9328, 19.1442] }
    });

    const userKavita = await User.create({
      phone: '9820311223',
      name: 'Kavita Deshmukh',
      role: 'vendor',
      address: 'Shree Sai Krupa, LBS Marg, Bhandup West, Mumbai',
      location: { type: 'Point', coordinates: [72.9360, 19.1475] }
    });

    // 2. Create Vendors
    const vendorAnjali = await Vendor.create({
      userId: userAnjali._id,
      kitchenName: "Anjali's Kitchen",
      vendorType: 'home',
      ownerName: 'Anjali Sharma',
      phone: '+91 98201 45892',
      address: 'Building B, Flat 402, Bhandup West, Mumbai',
      location: { type: 'Point', coordinates: [72.9342, 19.1458] },
      bio: 'I love sharing the meals I cook for my family with the neighborhood. Every dish is made with fresh cold-pressed oils and authentic homemade spices.',
      experience: 'Cooking for 8+ years',
      rating: 4.9,
      reviewCount: 42,
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAa_bwPjHF4-UEAiI4g5QpEUhysOA60vRVbWAtpUJdovb-DsF0Nwr89fLNBADH3P9XPSxVmlA18etggDwZ5Cw5Bl3wTsXi_SGa7y6x4oAclP0w5US1AWf1oa9_pJAkUSAOZ-b4-vYBIyhdXhHWAFG-cVG_xToI84-GLHz928ndgHHMciMrrffmLzqG4yWZ-hZLSM_I4j1WLnUEHY6WB6zf8rx4sxjG0uMMcoRQdE-DkkemszKJt7D0p',
      coverImage: 'https://lh3.googleusercontent.com/aida/AP1WRLuDc9bH-IA06P2L6_W9Q5aP_zcaHr2Gr4AXjE7Y0mB862tCkeRCYN5TMn-2hXCZ8XGRJoFkIlXV2K-34snxDNuh5ovfaL3cXQcCk7mD8sxnEolrnZDzyli7ub0Xfw4Wl2GKdIrC-UmLrLN-6dDs-Tj-wfqKn9Z906nuXRDDesZSGnk9Cw3RykuAEVJ_T8Rnh-zxLeyb-7wsQ_29vRY14YlxDViP6YaQnUuxSzT4xjDVM0gsPpR1gIEyCjo',
      specialties: ['Punjabi', 'North Indian', 'Homestyle Thali'],
      isOpen: true
    });

    const vendorRamesh = await Vendor.create({
      userId: userRamesh._id,
      kitchenName: 'Ramesh Uncle Chaat & Rolls',
      vendorType: 'street',
      ownerName: 'Ramesh Uncle',
      phone: '+91 98199 23456',
      address: 'Shop 4, Station Road, Bhandup West, Mumbai',
      location: { type: 'Point', coordinates: [72.9328, 19.1442] },
      bio: 'Serving Mumbai iconic street delicacies and frankies for over 15 years. Pure vegetarian and hygiene certified.',
      experience: '15+ years stall chef',
      rating: 4.7,
      reviewCount: 88,
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB3FkL7rPz5nQe-Lq5a7XkL2h9P9QpEUhysOA60vRVbWAtpUJdovb-DsF0Nwr89fLNBADH3P9XPSxVmlA18etggDwZ5Cw5Bl3wTsXi_SGa7y6x4oAclP0w5US1AWf1oa9_pJAkUSAOZ-b4',
      coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFfHUL4JWMwiBEe31VrFZcI4-j7ZtOXY-hbq6AuniEOhsra2OGFxR98ejAe4_z_jm98YYWJ0DW9tkuruQwIVj6V89izucv7uncvV7u_PwkgbfBXm3VN-AqiEfOB7Wyh6ko3AHLI777gLBKTa5KQTjaHZ0g52h0PFlpDiMsSOYbmbGW62D8Q0K32mbetADsgzgM9j7n129nhUHAKh9GpwQE3HPR1cYtRDSshkDOnzVBkB_GwxOvOYDt',
      specialties: ['Street Food', 'Noodles', 'Frankies'],
      isOpen: true
    });

    const vendorKavita = await Vendor.create({
      userId: userKavita._id,
      kitchenName: 'Kavita Home Tiffin',
      vendorType: 'tiffin',
      ownerName: 'Kavita Deshmukh',
      phone: '+91 98203 11223',
      address: 'Shree Sai Krupa, LBS Marg, Bhandup West, Mumbai',
      location: { type: 'Point', coordinates: [72.9360, 19.1475] },
      bio: 'Authentic Maharashtrian home cooked meals, Puran Poli, Pithla Bhakri, and wholesome daily tiffins.',
      experience: 'Homemaker & caterer for 6 years',
      rating: 4.8,
      reviewCount: 31,
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUAKf21eybPUtwjXWS_WDPcM3KS176CUGgvq9K8tOR9nvREtDOtAIH3wvA0YQv6cNKpWqL-hDv_hxicHTJfpg3fJYeC-MBr5DDGUd5zeF3PPagp74DJ9-sxSew09ougUUFCmU7P-4Ce8i6LS6HlJCLLYB6TIxWUGpNIgv0PVtUx0vGt7CulFXqjZj3JdVIwzjRPc0QLiMAATn7yplewZF9vCw2IEg7qXhsjKuXymuCd9q6sdRqsf91',
      coverImage: 'https://lh3.googleusercontent.com/aida/AP1WRLuDc9bH-IA06P2L6_W9Q5aP_zcaHr2Gr4AXjE7Y0mB862tCkeRCYN5TMn-2hXCZ8XGRJoFkIlXV2K-34snxDNuh5ovfaL3cXQcCk7mD8sxnEolrnZDzyli7ub0Xfw4Wl2GKdIrC-UmLrLN-6dDs-Tj-wfqKn9Z906nuXRDDesZSGnk9Cw3RykuAEVJ_T8Rnh-zxLeyb-7wsQ_29vRY14YlxDViP6YaQnUuxSzT4xjDVM0gsPpR1gIEyCjo',
      specialties: ['Maharashtrian', 'Puran Poli', 'Healthy Tiffin'],
      isOpen: true
    });

    // 3. Create Foods
    const food1 = await Food.create({
      vendorId: vendorAnjali._id,
      vendorName: "Anjali's Kitchen",
      name: 'Authentic Punjabi Rajma Chawal',
      description: 'Slow-simmered Kashmiri red kidney beans in roasted ginger-garlic tomato gravy, served with fluffy jeera basmati rice and fresh home pickle.',
      category: 'Main Course',
      price: 120,
      quantity: 8,
      initialQuantity: 12,
      isAvailable: true,
      status: 'ready',
      cookingStatus: 'Ready now',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5tj44PBk_pXA_-WXZGHdA-t1aeLtsjItWwoODao564te6kYMnEP0nty7ZmOM1uGDAyCKeo4ZYgD29FWPxya4vFyDPBKuIYhfbZ2r_4nqxWX2NWHuZSb-U__HojUGlV7Qry_kdbWUTrcyLsEX02meeaz_G9Og5CwwN55pjxKG7NpNoYWSjq69eI9DSj9SGrl1IVowEZ0jKsCnvaymZkSjT65zjQQSkEjmH1Cu6jClqXYIOkburuor5',
      diet: 'veg',
      tags: ['Comfort Food', 'Homestyle', 'Pure Ghee'],
      location: { type: 'Point', coordinates: [72.9342, 19.1458] }
    });

    const food2 = await Food.create({
      vendorId: vendorAnjali._id,
      vendorName: "Anjali's Kitchen",
      name: 'Aloo Paratha with White Butter & Curd',
      description: 'Golden, crisp flatbread stuffed with spiced mashed potatoes, fresh coriander, served with fresh homemade makkhan and sweet curd.',
      category: 'Breakfast / Snacks',
      price: 80,
      quantity: 6,
      initialQuantity: 10,
      isAvailable: true,
      status: 'ready',
      cookingStatus: 'Ready in 10m',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9loq5f3DeAN_7at5D5kkMwb96XqWwjFh2Fu8HiIHqZOOOl8lW56ZQWFkODdUyfnTjaXJlLpRpE5u-eUmPJciTOp2AWsk5TePK5XoCyVJqJQ-wrV-XsZAsiT6J3rz7LzXMN8M64YToEZc-zBy5BLfX-Ww5MIpFxAVzRIJthXEgBo4YpNdewqVnSpebJByMGIbWQKztSLT11wIR6rnCbnXO9MKrckv5qwlH2-y8VZSOI9YoEsTIPlww',
      diet: 'veg',
      tags: ['Crispy', 'Breakfast', 'Homemade'],
      location: { type: 'Point', coordinates: [72.9342, 19.1458] }
    });

    const food3 = await Food.create({
      vendorId: vendorRamesh._id,
      vendorName: 'Ramesh Uncle Chaat & Rolls',
      name: 'Spicy Garlic Hakka Noodles',
      description: 'Wok-tossed street style noodles loaded with crunchy bell peppers, shredded cabbage, spring onions, and spicy red garlic chilli sauce.',
      category: 'Street Food',
      price: 110,
      quantity: 10,
      initialQuantity: 15,
      isAvailable: true,
      status: 'ready',
      cookingStatus: 'Fresh on wok',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9F2Y3N9_m5Pq8nQ8sT7XkL2h9P9QpEUhysOA60vRVbWAtpUJdovb-DsF0Nwr89fLNBADH3P9XPSxVmlA18etggDwZ5Cw5Bl3wTsXi_SGa7y6x4oAclP0w5US1AWf1oa9_pJAkUSAOZ-b4',
      diet: 'veg',
      tags: ['Street Style', 'Spicy', 'Fast Prep'],
      location: { type: 'Point', coordinates: [72.9328, 19.1442] }
    });

    const food4 = await Food.create({
      vendorId: vendorKavita._id,
      vendorName: 'Kavita Home Tiffin',
      name: 'Hot Puran Poli with Pure Ghee (2 pcs)',
      description: 'Traditional Maharashtrian sweet flatbread filled with sweet chana dal & cardamom-jaggery mixture, roasted golden and drizzled with warm desi ghee.',
      category: 'Sweets & Breads',
      price: 90,
      quantity: 5,
      initialQuantity: 8,
      isAvailable: true,
      status: 'ready',
      cookingStatus: 'Ready now',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9loq5f3DeAN_7at5D5kkMwb96XqWwjFh2Fu8HiIHqZOOOl8lW56ZQWFkODdUyfnTjaXJlLpRpE5u-eUmPJciTOp2AWsk5TePK5XoCyVJqJQ-wrV-XsZAsiT6J3rz7LzXMN8M64YToEZc-zBy5BLfX-Ww5MIpFxAVzRIJthXEgBo4YpNdewqVnSpebJByMGIbWQKztSLT11wIR6rnCbnXO9MKrckv5qwlH2-y8VZSOI9YoEsTIPlww',
      diet: 'veg',
      tags: ['Festive', 'Desi Ghee', 'Authentic'],
      location: { type: 'Point', coordinates: [72.9360, 19.1475] }
    });

    // 4. Create an Initial Sample Order
    await Order.create({
      orderNumber: 'FM-1024',
      residentId: userNikhil._id,
      residentName: 'Nikhil Gupta',
      residentPhone: '+91 98765 43210',
      vendorId: vendorAnjali._id,
      vendorName: "Anjali's Kitchen",
      vendorPhone: '+91 98201 45892',
      foodId: food1._id,
      foodName: 'Authentic Punjabi Rajma Chawal',
      foodImage: food1.image,
      quantity: 2,
      pricePerUnit: 120,
      totalAmount: 240,
      status: 'preparing',
      specialInstructions: 'Please pack extra spoon and napkins if possible!',
      pickupAddress: 'Building B, Flat 402, Bhandup West, Mumbai',
      pickupLocation: { type: 'Point', coordinates: [72.9342, 19.1458] },
      residentLocation: { type: 'Point', coordinates: [72.9355, 19.1468] },
      statusHistory: [
        { status: 'placed', timestamp: new Date(Date.now() - 15 * 60 * 1000), note: 'Order placed by resident' },
        { status: 'accepted', timestamp: new Date(Date.now() - 12 * 60 * 1000), note: 'Accepted by Anjali' },
        { status: 'preparing', timestamp: new Date(Date.now() - 5 * 60 * 1000), note: 'Cooking in progress' }
      ]
    });

    console.log('[Seed] Database seeded successfully with vendors, dishes, and initial order!');
  } catch (err) {
    console.error('[Seed Error]', err);
  }
}
