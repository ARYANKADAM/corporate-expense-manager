import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Policy from "@/models/Policy";

// Fetch all policies
export async function GET() {
  await dbConnect();
  const policies = await Policy.find().sort({ createdAt: -1 });
  return NextResponse.json(policies);
}

// Create a new policy
export async function POST(req) {
  await dbConnect();
  const body = await req.json();
  const newPolicy = await Policy.create(body);
  return NextResponse.json({ success: true, policy: newPolicy });
}
