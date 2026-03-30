import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const getProductsPath = () => path.join(process.cwd(), "..", "config", "products.json");

export async function GET() {
  try {
    const filePath = getProductsPath();
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ products: [] });
    }
    const data = fs.readFileSync(filePath, "utf-8");
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    return NextResponse.json({ error: "Failed to read products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const newProduct = await req.json();
    const filePath = getProductsPath();
    
    let data: any = { products: [] };
    if (fs.existsSync(filePath)) {
      data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }
    
    data.products.push(newProduct);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    
    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add product" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const filePath = getProductsPath();
    if (!fs.existsSync(filePath)) return NextResponse.json({ success: true });

    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    data.products = data.products.filter((p: any) => p.id !== id);
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
