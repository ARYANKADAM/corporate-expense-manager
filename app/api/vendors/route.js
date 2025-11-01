import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Vendor from '@/models/Vendor';
import Expense from '@/models/Expense';
import { getUserFromToken } from '@/lib/auth';

// GET - Fetch vendors
export async function GET(request) {
  try {
    await connectDB();

    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');

    let query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (category) {
      query.category = category;
    }

    const vendors = await Vendor.find(query).sort({ totalSpent: -1 }).limit(100);

    return NextResponse.json({
      success: true,
      vendors,
    });
  } catch (error) {
    console.error('Get vendors error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create or update vendor
export async function POST(request) {
  try {
    await connectDB();

    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, category, isApproved, isBlacklisted } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, message: 'Vendor name is required' },
        { status: 400 }
      );
    }

    // Check if vendor exists
    let vendor = await Vendor.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });

    if (vendor) {
      // Update existing vendor
      if (category) vendor.category = category;
      if (typeof isApproved !== 'undefined') vendor.isApproved = isApproved;
      if (typeof isBlacklisted !== 'undefined') vendor.isBlacklisted = isBlacklisted;
      await vendor.save();
    } else {
      // Create new vendor
      vendor = await Vendor.create({
        name,
        category,
        isApproved: isApproved !== undefined ? isApproved : true,
        isBlacklisted: isBlacklisted || false,
      });
    }

    return NextResponse.json({
      success: true,
      message: vendor ? 'Vendor updated successfully' : 'Vendor created successfully',
      vendor,
    });
  } catch (error) {
    console.error('Create vendor error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}