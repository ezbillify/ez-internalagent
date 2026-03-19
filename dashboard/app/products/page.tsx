"use client";

import { useState } from "react";

const DEFAULT_PRODUCTS = [
  { id: "ezbillify-web", name: "EZBillify V2 Web", type: "nextjs", repo: "github.com/ezbillify/ezbillify-v2", active: true },
  { id: "ezbillify-app", name: "EZBillify V2 App", type: "flutter", repo: "github.com/ezbillify/EZBillifyV2App", active: true },
  { id: "ezdine-web", name: "EZ-Dine Web", type: "nextjs", repo: "github.com/ezbillify/EZDine", active: true },
  { id: "ezdine-app", name: "EZ-Dine App", type: "flutter", repo: "github.com/ezbillify/EZDine", active: true },
];

const TYPE_COLORS: Record<string, string> = {
  nextjs: "badge-blue",
  flutter: "badge-purple",
  both: "badge-green",
};

export default function ProductsPage() {
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: "", type: "nextjs", repo: "", branch: "main",
    app_id: "", test_url: "", test_email: "", test_password: ""
  });

  const addProduct = () => {
    if (!form.name || !form.repo) return;
    const newProduct = {
      id: form.name.toLowerCase().replace(/\s+/g, "-"),
      name: form.name,
      type: form.type,
      repo: form.repo.replace("https://github.com/", "github.com/"),
      active: true,
    };
    setProducts((prev) => [...prev, newProduct]);
    setShowAdd(false);
    setForm({ name: "", type: "nextjs", repo: "", branch: "main", app_id: "", test_url: "", test_email: "", test_password: "" });
  };

  const toggleActive = (id: string) => {
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, active: !p.active } : p));
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Product registry</h1>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          + Add product
        </button>
      </div>

      {showAdd && (
        <div className="card" style={{ border: "1px solid #534AB7", marginBottom: 20 }}>
          <div className="card-header">
            <span className="card-title">Add new product</span>
            <button className="btn" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: "#888780", marginBottom: 4 }}>Product name</div>
              <input
                style={{ width: "100%", padding: "7px 10px", fontSize: 13, border: "0.5px solid rgba(0,0,0,0.15)", borderRadius: 8, background: "transparent", color: "inherit" }}
                placeholder="e.g. EZFlow Web"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#888780", marginBottom: 4 }}>Platform type</div>
              <select
                style={{ width: "100%", padding: "7px 10px", fontSize: 13, border: "0.5px solid rgba(0,0,0,0.15)", borderRadius: 8, background: "transparent", color: "inherit" }}
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="nextjs">Next.js</option>
                <option value="flutter">Flutter</option>
                <option value="both">Both (monorepo)</option>
              </select>
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <div style={{ fontSize: 12, color: "#888780", marginBottom: 4 }}>GitHub repo URL</div>
              <input
                style={{ width: "100%", padding: "7px 10px", fontSize: 13, border: "0.5px solid rgba(0,0,0,0.15)", borderRadius: 8, background: "transparent", color: "inherit" }}
                placeholder="https://github.com/ezbillify/repo.git"
                value={form.repo}
                onChange={(e) => setForm({ ...form, repo: e.target.value })}
              />
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#888780", marginBottom: 4 }}>Test email</div>
              <input
                style={{ width: "100%", padding: "7px 10px", fontSize: 13, border: "0.5px solid rgba(0,0,0,0.15)", borderRadius: 8, background: "transparent", color: "inherit" }}
                placeholder="test@product.com"
                value={form.test_email}
                onChange={(e) => setForm({ ...form, test_email: e.target.value })}
              />
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#888780", marginBottom: 4 }}>Test password</div>
              <input
                type="password"
                style={{ width: "100%", padding: "7px 10px", fontSize: 13, border: "0.5px solid rgba(0,0,0,0.15)", borderRadius: 8, background: "transparent", color: "inherit" }}
                placeholder="stored as secret"
                value={form.test_password}
                onChange={(e) => setForm({ ...form, test_password: e.target.value })}
              />
            </div>
          </div>
          <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button className="btn btn-primary" onClick={addProduct}>Add product</button>
          </div>
        </div>
      )}

      <div className="section-label">Registered products ({products.length})</div>
      {products.map((product) => (
        <div className="card" key={product.id} style={{ opacity: product.active ? 1 : 0.5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8, flexShrink: 0,
              background: product.type === "flutter" ? "#EEEDFE" : "#E6F1FB",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 500,
              color: product.type === "flutter" ? "#3C3489" : "#0C447C"
            }}>
              {product.type === "flutter" ? "APP" : "WEB"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{product.name}</div>
              <div style={{ fontSize: 11, color: "#888780", marginTop: 1 }}>{product.repo}</div>
            </div>
            <span className={`badge ${TYPE_COLORS[product.type]}`}>{product.type}</span>
            <button
              className={`toggle ${product.active ? "on" : ""}`}
              onClick={() => toggleActive(product.id)}
            />
            <button className="btn" style={{ fontSize: 11, padding: "4px 10px" }}>Edit</button>
          </div>
        </div>
      ))}
    </div>
  );
}
