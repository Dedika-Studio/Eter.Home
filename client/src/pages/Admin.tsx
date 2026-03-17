import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Trash2, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  link: string;
  rating: number;
  reviews: number;
  badge?: string;
}

const ADMIN_PASSWORD = "panochonas12";

export default function Admin() {
  const [, navigate] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      title: "Kit Fiesta Bts/bt21 Globos De Cumpleaños Decoración K-pop",
      description:
        "Set de 18 globos. 1 juego completo de banderola, 18 globos de látex, 1 inserto de tarta grande (2 palos), 14 insertos de tarta pequeños",
      price: 213.84,
      image:
        "https://http2.mlstatic.com/D_NQ_NP_2X_730858-CBT84152775940_052025-F-kit-fiesta-btsbt21-globos-de-cumpleanos-decoracion-k-pop.webp",
      link: "https://meli.la/14ifKUh",
      rating: 4.9,
      reviews: 63,
      badge: "Nuevo",
    },
    {
      id: "2",
      title: "Bts Kpop Bangtan Boys Muñecas De Dibujos Animados 7 Pcs",
      description: "La edad mínima recomendada para utilizarla es 5 años.",
      price: 398,
      image:
        "https://http2.mlstatic.com/D_NQ_NP_2X_747539-MLA107426879435_022026-F.webp",
      link: "https://meli.la/2EASF4B",
      rating: 5,
      reviews: 4,
      badge: "Nuevo",
    },
  ]);

  const [formData, setFormData] = useState<Partial<Product>>({
    title: "",
    description: "",
    price: 0,
    image: "",
    link: "",
    rating: 4.5,
    reviews: 0,
    badge: "",
  });

  const [showPreview, setShowPreview] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPassword("");
    } else {
      alert("Contraseña incorrecta");
      setPassword("");
    }
  };

  const handleAddProduct = () => {
    if (
      !formData.title ||
      !formData.image ||
      !formData.link ||
      formData.price === undefined
    ) {
      alert("Llena los campos obligatorios");
      return;
    }

    if (editingId) {
      setProducts(
        products.map((p) =>
          p.id === editingId ? { ...formData as Product, id: editingId } : p
        )
      );
      setEditingId(null);
    } else {
      const newProduct: Product = {
        ...formData as Product,
        id: Date.now().toString(),
      };
      setProducts([...products, newProduct]);
    }

    setFormData({
      title: "",
      description: "",
      price: 0,
      image: "",
      link: "",
      rating: 4.5,
      reviews: 0,
      badge: "",
    });
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm("¿Eliminar este producto?")) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  const handleEditProduct = (product: Product) => {
    setFormData(product);
    setEditingId(product.id);
  };

  const renderStars = (rating: number) => {
    let stars = "";
    for (let i = 0; i < 5; i++) {
      if (rating >= i + 1) stars += "★";
      else if (rating >= i + 0.5) stars += "☆";
      else stars += "☆";
    }
    return stars;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-violet-600 to-fuchsia-500 flex items-center justify-center">
        <Card className="w-96 bg-white/95 backdrop-blur-xl border-border/50">
          <CardContent className="p-8">
            <h1 className="text-2xl font-bold mb-6 text-center">Admin Panel</h1>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleLogin();
              }}
              className="w-full px-4 py-2 border border-border rounded-lg mb-4 bg-background"
              autoFocus
            />
            <Button
              onClick={handleLogin}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Entrar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-border/50 shadow-sm">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm tracking-tight">
              Admin - Gestión de Productos
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-1 text-xs"
          >
            <ArrowLeft className="size-3" />
            Volver
          </Button>
        </div>
      </header>

      <section className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <Card className="lg:col-span-1 bg-white/60 backdrop-blur-xl border-border/50">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold mb-4">
                {editingId ? "Editar Producto" : "Nuevo Producto"}
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Título *
                  </label>
                  <Input
                    value={formData.title || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Nombre del producto"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Descripción"
                    className="w-full px-3 py-2 border border-border rounded-lg mt-1 bg-background text-sm"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Link Mercado Libre *
                  </label>
                  <Input
                    value={formData.link || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, link: e.target.value })
                    }
                    placeholder="https://meli.la/..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Link Imagen *
                  </label>
                  <Input
                    value={formData.image || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    placeholder="https://..."
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">
                      Precio *
                    </label>
                    <Input
                      type="number"
                      value={formData.price || 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: parseFloat(e.target.value),
                        })
                      }
                      placeholder="0"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">
                      Calificación
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.rating || 4.5}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          rating: parseFloat(e.target.value),
                        })
                      }
                      placeholder="4.5"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">
                      # Reseñas
                    </label>
                    <Input
                      type="number"
                      value={formData.reviews || 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          reviews: parseInt(e.target.value),
                        })
                      }
                      placeholder="0"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">
                      Badge
                    </label>
                    <select
                      value={formData.badge || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, badge: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg mt-1 bg-background text-sm"
                    >
                      <option value="">Ninguno</option>
                      <option value="Nuevo">Nuevo</option>
                      <option value="Popular">Popular</option>
                      <option value="Recomendado">Recomendado</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => setShowPreview(true)}
                    variant="outline"
                    className="flex-1 gap-1"
                  >
                    <Eye className="size-4" />
                    Vista previa
                  </Button>
                  <Button
                    onClick={handleAddProduct}
                    className="flex-1 gap-1 bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="size-4" />
                    {editingId ? "Actualizar" : "Agregar"}
                  </Button>
                </div>

                {editingId && (
                  <Button
                    onClick={() => {
                      setEditingId(null);
                      setFormData({
                        title: "",
                        description: "",
                        price: 0,
                        image: "",
                        link: "",
                        rating: 4.5,
                        reviews: 0,
                        badge: "",
                      });
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Cancelar edición
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Products List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold">Productos ({products.length})</h2>
            {products.map((product) => (
              <Card
                key={product.id}
                className="bg-white/60 backdrop-blur-xl border-border/50"
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-sm line-clamp-2">
                          {product.title}
                        </h3>
                        {product.badge && (
                          <Badge className="bg-red-500 ml-2">
                            {product.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-bold text-purple-600">
                            ${product.price} MXN
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {renderStars(product.rating)} ({product.rating} •{" "}
                            {product.reviews})
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleEditProduct(product)}
                            size="sm"
                            variant="outline"
                          >
                            Editar
                          </Button>
                          <Button
                            onClick={() => handleDeleteProduct(product.id)}
                            size="sm"
                            variant="destructive"
                            className="gap-1"
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="bg-white/95 backdrop-blur-xl border-border/50 max-w-sm">
          <DialogHeader>
            <DialogTitle>Vista previa del producto</DialogTitle>
          </DialogHeader>
          <div className="bg-white/60 backdrop-blur rounded-lg p-4">
            {formData.image && (
              <img
                src={formData.image}
                alt={formData.title}
                className="w-full h-40 object-cover rounded-lg mb-3"
              />
            )}
            {formData.badge && (
              <Badge className="bg-red-500 mb-2">{formData.badge}</Badge>
            )}
            <h3 className="font-bold text-sm mb-2">{formData.title}</h3>
            <p className="text-xs text-muted-foreground mb-3">
              {formData.description}
            </p>
            <div className="flex items-center gap-1 mb-3">
              <span className="text-yellow-500 text-sm">
                {renderStars(formData.rating || 4.5)}
              </span>
              <span className="text-xs text-muted-foreground">
                ({formData.rating} • {formData.reviews})
              </span>
            </div>
            <div className="text-lg font-bold text-purple-600 mb-3">
              ${formData.price} MXN
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowPreview(false)}
              variant="outline"
              className="w-full"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
