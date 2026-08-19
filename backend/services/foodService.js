import Food from '../models/Food.js';
import FoodAvailability from '../models/FoodAvailability.js';
import Vendor from '../models/Vendor.js';

export async function getAllFoods(filters = {}) {
  const query = {};
  if (filters.category && filters.category !== 'All') {
    query.category = filters.category;
  }
  if (filters.isVeg !== undefined) {
    query.isVeg = filters.isVeg === 'true' || filters.isVeg === true;
  }
  if (filters.search) {
    query.name = { $regex: filters.search, $options: 'i' };
  }

  const foods = await Food.find(query)
    .populate('vendor', 'businessName category rating totalReviews status location pickupAddress coverImage')
    .sort({ createdAt: -1 });
  return foods;
}

export async function getFoodById(id) {
  const food = await Food.findById(id).populate('vendor');
  return food;
}

export async function createFood(vendorUserId, data) {
  let vendor = await Vendor.findOne({ user: vendorUserId });
  if (!vendor) {
    vendor = await Vendor.findOne();
    if (!vendor) {
      vendor = await Vendor.create({
        user: vendorUserId,
        businessName: "Anjali's Kitchen",
      });
    }
  }

  const food = await Food.create({
    ...data,
    vendor: vendor._id,
    initialQuantity: data.quantity,
    status: data.quantity > 0 ? 'AVAILABLE' : 'SOLD_OUT',
    available: data.quantity > 0,
  });

  await FoodAvailability.create({
    food: food._id,
    vendor: vendor._id,
    quantity: food.quantity,
    available: food.available,
    status: food.status,
  });

  const populated = await Food.findById(food._id).populate('vendor');
  return populated;
}

export async function updateFood(foodId, data) {
  if (data.quantity !== undefined) {
    data.available = data.quantity > 0;
    data.status = data.quantity === 0 ? 'SOLD_OUT' : data.quantity <= 3 ? 'LOW_STOCK' : 'AVAILABLE';
  }

  const food = await Food.findByIdAndUpdate(foodId, data, { new: true }).populate('vendor');
  
  if (food) {
    await FoodAvailability.findOneAndUpdate(
      { food: food._id },
      {
        quantity: food.quantity,
        available: food.available,
        status: food.status,
        lastUpdated: new Date(),
      },
      { upsert: true }
    );
  }
  return food;
}

export async function deleteFood(foodId) {
  const food = await Food.findByIdAndDelete(foodId);
  await FoodAvailability.findOneAndDelete({ food: foodId });
  return food;
}

/**
 * Atomic quantity deduction to prevent overselling
 */
export async function deductFoodQuantity(foodId, qty) {
  const food = await Food.findOneAndUpdate(
    {
      _id: foodId,
      quantity: { $gte: qty },
      available: true,
    },
    {
      $inc: { quantity: -qty },
    },
    { new: true }
  ).populate('vendor');

  if (!food) {
    const existing = await Food.findById(foodId);
    if (!existing || existing.quantity < qty) {
      throw new Error(`Insufficient quantity available (only ${existing ? existing.quantity : 0} left)`);
    }
    throw new Error('Food item is currently unavailable');
  }

  // Update availability status
  if (food.quantity === 0) {
    food.available = false;
    food.status = 'SOLD_OUT';
    await food.save();
  } else if (food.quantity <= 3) {
    food.status = 'LOW_STOCK';
    await food.save();
  }

  await FoodAvailability.findOneAndUpdate(
    { food: food._id },
    {
      quantity: food.quantity,
      available: food.available,
      status: food.status,
      lastUpdated: new Date(),
    },
    { upsert: true }
  );

  return food;
}
