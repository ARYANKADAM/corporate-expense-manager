import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Policy from "@/models/Policy";

export async function GET(req, { params }) {
  await connectDB();
  const policy = await Policy.findById(params.id);
  if (!policy) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(policy);
}

export async function PUT(req, { params }) {
  await connectDB();
  const data = await req.json();
  const updated = await Policy.findByIdAndUpdate(params.id, data, { new: true });
  return NextResponse.json(updated);
}

export async function DELETE(req, { params }) {
  await connectDB();
  await Policy.findByIdAndDelete(params.id);
  return NextResponse.json({ message: "Deleted" });
}
