import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Trash2, Eye, Calendar, Copy, Check } from "lucide-react";
import { raffleThemes, type RaffleCategory } from "@shared/raffleThemes";
import { trpc } from "@/lib/trpc";
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
  rating?: number;
  reviews: number;
  badge?: string;
}

interface Raffle {
  id: string;
  title: string;
  description: string;
  image: string;
  totalTickets: number;
  pricePerTicket: number;
  drawDate: string;
  webhookUrl: string;
  category: RaffleCategory;
  raffleNumber?: number;
}

const ADMIN_PASSWORD = "panochonas12";

export default function Admin() {
  const [, navigate] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"products" | "raffles" | "view-raffles">("products");

  // Products state
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

  const [productFormData, setProductFormData] = useState<Partial<Product>>({
    title: "",
    description: "",
    price: undefined,
    image: "",
    link: "",
    rating: undefined,
    reviews: undefined,
    badge: "",
  });

  // Products state
  const { data: dbProducts, refetch: refetchProducts } = trpc.products.list.useQuery();
  const createProductMutation = trpc.products.create.useMutation();
  const updateProductMutation = trpc.products.update.useMutation();
  const deleteProductMutation = trpc.products.delete.useMutation();

  // Update local state when DB products load
  useEffect(() => {
    if (dbProducts) {
      setProducts(
        dbProducts.map((p) => ({
          id: p.id.toString(),
          title: p.title,
          description: p.description || "",
          price: p.price / 100,
          image: p.image,
          link: p.link,
          rating: p.rating ? p.rating / 10 : undefined,
          reviews: p.reviews,
          badge: p.badge || undefined,
        }))
      );
    }
  }, [dbProducts]);

  // Raffles state
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const { data: dbRaffles, refetch: refetchRaffles } = trpc.raffles.list.useQuery();
  const createRaffleMutation = trpc.raffles.create.useMutation();
  const updateRaffleMutation = trpc.raffles.update.useMutation();
  const deleteRaffleMutation = trpc.raffles.delete.useMutation();

  // Update local state when DB raffles load
  useEffect(() => {
    if (dbRaffles) {
      setRaffles(dbRaffles.map(r => ({
        id: r.id.toString(),
        title: r.title,
        description: r.description || "",
        image: r.image,
        totalTickets: r.totalTickets,
        pricePerTicket: r.pricePerTicket / 100,
        drawDate: r.drawDate.toISOString().split('T')[0],
        webhookUrl: r.webhookUrl || "",
        category: r.category as RaffleCategory,
      })));
      // Update nextRaffleNumber based on the highest raffleNumber in the database
      const maxRaffleNumber = Math.max(...dbRaffles.map(r => r.raffleNumber || 0), 0);
      setNextRaffleNumber(maxRaffleNumber + 1);
    }
  }, [dbRaffles]);

  const [raffleFormData, setRaffleFormData] = useState<Partial<Raffle>>({
    title: "",
    description: "",
    image: "",
    totalTickets: 1000,
    pricePerTicket: undefined,
    drawDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    webhookUrl: "",
    category: "otro",
  });

  const [showProductPreview, setShowProductPreview] = useState(false);
  const [showRafflePreview, setShowRafflePreview] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingRaffleId, setEditingRaffleId] = useState<string | null>(null);
  const [copiedWebhookId, setCopiedWebhookId] = useState<string | null>(null);
  const [nextRaffleNumber, setNextRaffleNumber] = useState(1);
  const [copiedRaffleUrl, setCopiedRaffleUrl] = useState<string | null>(null);
  const [generatedWebhookUrl, setGeneratedWebhookUrl] = useState<string | null>(null);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPassword("");
    } else {
      alert("Contraseña incorrecta");
      setPassword("");
    }
  };

  // Product handlers
  const handleAddProduct = async () => {
    if (
      !productFormData.title ||
      !productFormData.image ||
      !productFormData.link ||
      productFormData.price === undefined
    ) {
      alert("Llena los campos obligatorios");
      return;
    }

    try {
      if (editingProductId) {
        await updateProductMutation.mutateAsync({
          id: parseInt(editingProductId),
          title: productFormData.title,
          description: productFormData.description,
          price: productFormData.price,
          image: productFormData.image,
          link: productFormData.link,
          rating: productFormData.rating,
          reviews: productFormData.reviews,
          badge: productFormData.badge,
        });
        setEditingProductId(null);
      } else {
        await createProductMutation.mutateAsync({
          title: productFormData.title,
          description: productFormData.description,
          price: productFormData.price,
          image: productFormData.image,
          link: productFormData.link,
          rating: productFormData.rating,
          reviews: productFormData.reviews,
          badge: productFormData.badge,
        });
      }

      await refetchProducts();

      setProductFormData({
        title: "",
        description: "",
        price: undefined,
        image: "",
        link: "",
        rating: undefined,
        reviews: undefined,
        badge: "",
      });
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Error al guardar el producto");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("¿Eliminar este producto?")) {
      try {
        await deleteProductMutation.mutateAsync({
          id: parseInt(id),
        });
        await refetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Error al eliminar el producto");
      }
    }
  };

  const handleEditProduct = (product: Product) => {
    setProductFormData(product);
    setEditingProductId(product.id);
  };

  // Raffle handlers
  const handleAddRaffle = async () => {
    console.log("[handleAddRaffle] Form data:", raffleFormData);
    
    if (
      !raffleFormData.title ||
      !raffleFormData.image ||
      !raffleFormData.drawDate ||
      raffleFormData.totalTickets === undefined ||
      raffleFormData.pricePerTicket === undefined
    ) {
      console.log("[handleAddRaffle] Missing required fields");
      alert("Llena los campos obligatorios");
      return;
    }

    // Validate that image is a URL, not base64 data
    const imageStr = String(raffleFormData.image).trim();
    if (!imageStr.startsWith('http://') && !imageStr.startsWith('https://')) {
      console.log("[handleAddRaffle] Invalid image URL:", imageStr.substring(0, 50));
      alert("La imagen debe ser una URL que comience con http:// o https://");
      return;
    }

    // Prevent base64 data from being submitted
    if (imageStr.startsWith('data:')) {
      console.log("[handleAddRaffle] Base64 data detected");
      alert("No se permiten datos en base64. Por favor, usa una URL de imagen.");
      return;
    }
    
    console.log("[handleAddRaffle] Validation passed, proceeding with mutation");

    try {
      if (editingRaffleId) {
        await updateRaffleMutation.mutateAsync({
          id: parseInt(editingRaffleId),
          title: raffleFormData.title,
          description: raffleFormData.description,
          image: raffleFormData.image,
          totalTickets: raffleFormData.totalTickets,
          pricePerTicket: raffleFormData.pricePerTicket,
          drawDate: raffleFormData.drawDate,
          webhookUrl: raffleFormData.webhookUrl,
          category: raffleFormData.category || "otro",
        });
        setEditingRaffleId(null);
      } else {
        await createRaffleMutation.mutateAsync({
          title: raffleFormData.title,
          description: raffleFormData.description,
          image: raffleFormData.image,
          totalTickets: raffleFormData.totalTickets,
          pricePerTicket: raffleFormData.pricePerTicket,
          drawDate: raffleFormData.drawDate,
          webhookUrl: raffleFormData.webhookUrl,
          category: raffleFormData.category || "otro",
          raffleNumber: nextRaffleNumber,
        });
      }
      await refetchRaffles();
    } catch (error) {
      console.error("Error saving raffle:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`Error al guardar la rifa: ${errorMessage}`);
    }

    setRaffleFormData({
      title: "",
      description: "",
      image: "",
      totalTickets: undefined,
      pricePerTicket: undefined,
      drawDate: "",
      webhookUrl: "",
      category: "otro",
    });
  };

  const generateWebhookUrl = (raffleNumber: number) => {
    const baseUrl = "https://dedika-studio-eter-rifa.manus.space";
    return `${baseUrl}/api/stripe/webhook/rifa${raffleNumber}`;
  };

  const handleGenerateWebhook = () => {
    const webhookUrl = generateWebhookUrl(nextRaffleNumber);
    setGeneratedWebhookUrl(webhookUrl);
  };

  const handleCopyWebhook = () => {
    if (generatedWebhookUrl) {
      navigator.clipboard.writeText(generatedWebhookUrl);
      setCopiedWebhookId("webhook");
      setTimeout(() => setCopiedWebhookId(null), 2000);
    }
  };

  const handleDeleteRaffle = (id: string) => {
    if (confirm("¿Eliminar esta rifa?")) {
      setRaffles(raffles.filter((r) => r.id !== id));
    }
  };

  const handleEditRaffle = (raffle: Raffle) => {
    setRaffleFormData(raffle);
    setEditingRaffleId(raffle.id);
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
              Admin Panel - ETER KPOP MX
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

      {/* Tabs */}
      <div className="container py-6">
        <div className="flex gap-4 border-b border-border/50 mb-8">
          <button
            onClick={() => setActiveTab("products")}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === "products"
                ? "text-purple-600 border-b-2 border-purple-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Productos
          </button>
          <button
            onClick={() => setActiveTab("raffles")}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === "raffles"
                ? "text-purple-600 border-b-2 border-purple-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Crear Rifas
          </button>
          <button
            onClick={() => setActiveTab("view-raffles")}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === "view-raffles"
                ? "text-purple-600 border-b-2 border-purple-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Ver Todas las Rifas
          </button>
        </div>

        {/* Products Tab */}
        {activeTab === "products" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Product Form */}
            <Card className="lg:col-span-1 bg-white/60 backdrop-blur-xl border-border/50">
              <CardContent className="p-6 space-y-4">
                <h2 className="font-bold text-lg">
                  {editingProductId ? "Editar Producto" : "Nuevo Producto"}
                </h2>
                <Input
                  placeholder="Título"
                  value={productFormData.title || ""}
                  onChange={(e) =>
                    setProductFormData({
                      ...productFormData,
                      title: e.target.value,
                    })
                  }
                />
                <Input
                  placeholder="Descripción"
                  value={productFormData.description || ""}
                  onChange={(e) =>
                    setProductFormData({
                      ...productFormData,
                      description: e.target.value,
                    })
                  }
                />
                <Input
                  placeholder="Precio"
                  type="number"
                  value={productFormData.price || 0}
                  onChange={(e) =>
                    setProductFormData({
                      ...productFormData,
                      price: parseFloat(e.target.value),
                    })
                  }
                />
                <Input
                  placeholder="URL Imagen"
                  value={productFormData.image || ""}
                  onChange={(e) =>
                    setProductFormData({
                      ...productFormData,
                      image: e.target.value,
                    })
                  }
                />
                <Input
                  placeholder="Link Mercado Libre"
                  value={productFormData.link || ""}
                  onChange={(e) =>
                    setProductFormData({
                      ...productFormData,
                      link: e.target.value,
                    })
                  }
                />
                <Input
                  placeholder="Rating (0-5)"
                  type="number"
                  step="0.1"
                  value={productFormData.rating || 4.5}
                  onChange={(e) =>
                    setProductFormData({
                      ...productFormData,
                      rating: parseFloat(e.target.value),
                    })
                  }
                />
                <Input
                  placeholder="Reviews"
                  type="number"
                  value={productFormData.reviews || 0}
                  onChange={(e) =>
                    setProductFormData({
                      ...productFormData,
                      reviews: parseInt(e.target.value),
                    })
                  }
                />
                <Input
                  placeholder="Badge (ej: Nuevo)"
                  value={productFormData.badge || ""}
                  onChange={(e) =>
                    setProductFormData({
                      ...productFormData,
                      badge: e.target.value,
                    })
                  }
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleAddProduct}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="size-4 mr-2" />
                    {editingProductId ? "Actualizar" : "Agregar"}
                  </Button>
                  <Button
                    onClick={() => setShowProductPreview(true)}
                    variant="outline"
                    className="flex-1"
                  >
                    <Eye className="size-4 mr-2" />
                    Vista Previa
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Products List */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="font-bold text-lg">Productos ({products.length})</h2>
              {products.map((product) => (
                <Card
                  key={product.id}
                  className="bg-white/60 backdrop-blur-xl border-border/50 overflow-hidden"
                >
                  <CardContent className="p-4 flex gap-4">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-sm line-clamp-2">
                        {product.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        ${product.price} MXN
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditProduct(product)}
                          className="text-xs"
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-xs"
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Raffles Tab */}
        {activeTab === "raffles" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Raffle Form */}
            <Card className="lg:col-span-1 bg-white/60 backdrop-blur-xl border-border/50">
              <CardContent className="p-6 space-y-4">
                <h2 className="font-bold text-lg">
                  {editingRaffleId ? "Editar Rifa" : "Nueva Rifa"}
                </h2>
                <Input
                  placeholder="Título de la Rifa"
                  value={raffleFormData.title || ""}
                  onChange={(e) =>
                    setRaffleFormData({
                      ...raffleFormData,
                      title: e.target.value,
                    })
                  }
                />
                <Input
                  placeholder="Descripción"
                  value={raffleFormData.description || ""}
                  onChange={(e) =>
                    setRaffleFormData({
                      ...raffleFormData,
                      description: e.target.value,
                    })
                  }
                />
                <Input
                  placeholder="URL Imagen"
                  value={raffleFormData.image || ""}
                  onChange={(e) =>
                    setRaffleFormData({
                      ...raffleFormData,
                      image: e.target.value,
                    })
                  }
                />
                <Input
                  placeholder="Total de Boletos"
                  type="number"
                  value={raffleFormData.totalTickets || 1000}
                  onChange={(e) =>
                    setRaffleFormData({
                      ...raffleFormData,
                      totalTickets: parseInt(e.target.value),
                    })
                  }
                />
                <Input
                  placeholder="Precio por Boleto (MXN)"
                  type="number"
                  step="0.01"
                  value={raffleFormData.pricePerTicket ?? ""}
                  onChange={(e) =>
                    setRaffleFormData({
                      ...raffleFormData,
                      pricePerTicket: e.target.value === "" ? undefined : parseFloat(e.target.value),
                    })
                  }
                />
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 text-muted-foreground" />
                  <Input
                    placeholder="Fecha del Sorteo"
                    type="datetime-local"
                    value={raffleFormData.drawDate || ""}
                    onChange={(e) =>
                      setRaffleFormData({
                        ...raffleFormData,
                        drawDate: e.target.value,
                      })
                    }
                  />
                </div>
                <select
                  value={raffleFormData.category || "otro"}
                  onChange={(e) =>
                    setRaffleFormData({
                      ...raffleFormData,
                      category: e.target.value as RaffleCategory,
                    })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                >
                  <option value="dinero">💰 Dinero</option>
                  <option value="electronica">📱 Electrónica</option>
                  <option value="herramientas">🔧 Herramientas</option>
                  <option value="kpop">🎤 K-POP</option>
                  <option value="moda">👗 Moda</option>
                  <option value="otro">🎁 Otro</option>
                </select>
                <div className="space-y-2">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 space-y-2">
                    <p className="text-xs font-bold text-purple-900">URL de la Rifa:</p>
                    <div className="flex gap-2">
                      <code className="flex-1 text-xs bg-white border border-purple-200 rounded px-2 py-1 overflow-x-auto break-all">
                        https://dedika-studio-eter-rifa.manus.space/rifa{nextRaffleNumber}
                      </code>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(`https://dedika-studio-eter-rifa.manus.space/rifa${nextRaffleNumber}`);
                          setCopiedRaffleUrl("url");
                          setTimeout(() => setCopiedRaffleUrl(null), 2000);
                        }}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {copiedRaffleUrl === "url" ? (
                          <Check className="size-4" />
                        ) : (
                          <Copy className="size-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-purple-700">
                      Esta será la URL pública de tu rifa
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={handleGenerateWebhook}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Generar URL de Webhook
                  </Button>
                  {generatedWebhookUrl && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                      <p className="text-xs font-bold text-blue-900">URL del Webhook:</p>
                      <div className="flex gap-2">
                        <code className="flex-1 text-xs bg-white border border-blue-200 rounded px-2 py-1 overflow-x-auto break-all">
                          {generatedWebhookUrl}
                        </code>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleCopyWebhook}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {copiedWebhookId === "webhook" ? (
                            <Check className="size-4" />
                          ) : (
                            <Copy className="size-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-blue-700">
                        Copia esta URL y registrala en Stripe para obtener el webhook secret
                      </p>
                    </div>
                  )}
                </div>
                <Input
                  placeholder="Webhook Secret (de Stripe)"
                  value={raffleFormData.webhookUrl || ""}
                  onChange={(e) =>
                    setRaffleFormData({
                      ...raffleFormData,
                      webhookUrl: e.target.value,
                    })
                  }
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleAddRaffle}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="size-4 mr-2" />
                    {editingRaffleId ? "Actualizar" : "Crear"}
                  </Button>
                  <Button
                    onClick={() => setShowRafflePreview(true)}
                    variant="outline"
                    className="flex-1"
                  >
                    <Eye className="size-4 mr-2" />
                    Vista Previa
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Raffles List */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="font-bold text-lg">Rifas ({raffles.length})</h2>
              {raffles.length === 0 ? (
                <Card className="bg-white/60 backdrop-blur-xl border-border/50">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No hay rifas creadas aún
                  </CardContent>
                </Card>
              ) : (
                raffles.map((raffle) => (
                  <Card
                    key={raffle.id}
                    className="bg-white/60 backdrop-blur-xl border-border/50 overflow-hidden"
                  >
                    <CardContent className="p-4 flex gap-4">
                      <img
                        src={raffle.image}
                        alt={raffle.title}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-sm line-clamp-2">
                          {raffle.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-1">
                          ${raffle.pricePerTicket} MXN • {raffle.totalTickets}{" "}
                          boletos
                        </p>
                        <p className="text-xs text-muted-foreground mb-2">
                          Sorteo: {new Date(raffle.drawDate).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditRaffle(raffle)}
                            className="text-xs"
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteRaffle(raffle.id)}
                            className="text-xs"
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* View Raffles Tab */}
        {activeTab === "view-raffles" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Todas las Rifas</h2>
            {raffles.length === 0 ? (
              <Card className="bg-white/60 backdrop-blur-xl border-border/50">
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No hay rifas creadas aún</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {raffles.map((raffle) => {
                  const theme = raffleThemes[raffle.category || "otro"];
                  return (
                    <Card
                      key={raffle.id}
                      className="bg-white/60 backdrop-blur-xl border-border/50 overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div
                        className={`h-32 bg-gradient-to-br ${theme.gradient}`}
                        style={{
                          backgroundImage: `url(${raffle.image})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      >
                        <div className="w-full h-full bg-black/20 flex items-end p-4">
                          <Badge className="bg-white/90 text-black text-xs">
                            {theme.icon} {raffle.category}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4 space-y-3">
                        <div>
                          <h3 className="font-bold text-sm line-clamp-2">{raffle.title}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {raffle.description}
                          </p>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Boletos:</span>
                            <span className="font-bold">{raffle.totalTickets}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Precio:</span>
                            <span className="font-bold">${raffle.pricePerTicket} MXN</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Sorteo:</span>
                            <span className="font-bold">
                              {new Date(raffle.drawDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditRaffle(raffle)}
                            className="text-xs flex-1"
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteRaffle(raffle.id)}
                            className="text-xs"
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Product Preview Dialog */}
      <Dialog open={showProductPreview} onOpenChange={setShowProductPreview}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Vista previa del producto</DialogTitle>
          </DialogHeader>
          <div className="bg-white/60 backdrop-blur rounded-lg p-4">
            {productFormData.image && (
              <img
                src={productFormData.image}
                alt={productFormData.title}
                className="w-full h-40 object-cover rounded-lg mb-3"
              />
            )}
            {productFormData.badge && (
              <Badge className="bg-red-500 mb-2">{productFormData.badge}</Badge>
            )}
            <h3 className="font-bold text-sm mb-2">{productFormData.title}</h3>
            <p className="text-xs text-muted-foreground mb-3">
              {productFormData.description}
            </p>
            <div className="flex items-center gap-1 mb-3">
              <span className="text-yellow-500 text-sm">
                {renderStars(productFormData.rating || 4.5)}
              </span>
              <span className="text-xs text-muted-foreground">
                ({productFormData.rating} • {productFormData.reviews})
              </span>
            </div>
            <div className="text-lg font-bold text-purple-600 mb-3">
              ${productFormData.price} MXN
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowProductPreview(false)}
              variant="outline"
              className="w-full"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Raffle Preview Dialog */}
      <Dialog open={showRafflePreview} onOpenChange={setShowRafflePreview}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Vista previa de la rifa</DialogTitle>
          </DialogHeader>
          <div className="bg-white/60 backdrop-blur rounded-lg p-4 space-y-3">
            {raffleFormData.image && (
              <img
                src={raffleFormData.image}
                alt={raffleFormData.title}
                className="w-full h-40 object-cover rounded-lg"
              />
            )}
            <div>
              <h3 className="font-bold text-sm mb-1">{raffleFormData.title}</h3>
              <p className="text-xs text-muted-foreground mb-3">
                {raffleFormData.description}
              </p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Categoría:</span>
                <span className="font-bold">
                  {raffleThemes[raffleFormData.category || "otro"].icon}{" "}
                  {raffleFormData.category}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Boletos:</span>
                <span className="font-bold">{raffleFormData.totalTickets}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Precio:</span>
                <span className="font-bold">
                  ${raffleFormData.pricePerTicket} MXN
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sorteo:</span>
                <span className="font-bold">
                  {raffleFormData.drawDate
                    ? new Date(raffleFormData.drawDate).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowRafflePreview(false)}
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
