import Vendor from '../models/Vendor.js';
import Food from '../models/Food.js';

export async function getAllVendors(filters = {}) {
  const query = {};
  if (filters.status) {
    query.status = filters.status;
  }
  const vendors = await Vendor.find(query).populate('user', 'name phone email avatar');
  return vendors;
}

export async function getVendorById(id) {
  const vendor = await Vendor.findById(id).populate('user');
  const foods = await Food.find({ vendor: id });
  return { vendor, foods };
}

export async function updateVendorProfile(vendorIdOrUserId, data) {
  let vendor = await Vendor.findOne({
    $or: [{ _id: vendorIdOrUserId }, { user: vendorIdOrUserId }],
  });

  if (!vendor) {
    vendor = await Vendor.create({
      user: vendorIdOrUserId,
      businessName: data.businessName || "Anjali's Kitchen",
      ...data,
    });
  } else {
    Object.assign(vendor, data);
    await vendor.save();
  }

  return vendor;
}
