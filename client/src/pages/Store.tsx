import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, ShoppingBag, Lock, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";

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

const DEFAULT_PRODUCTS: Product[] = [
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
];

export default function Store() {
  const [, navigate] = useLocation();
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const { data: dbProducts } = trpc.products.list.useQuery();

  useEffect(() => {
    if (dbProducts && dbProducts.length > 0) {
      const formattedProducts = dbProducts.map((p: any) => ({
        id: p.id.toString(),
        title: p.title,
        description: p.description || "",
        price: p.price / 100,
        image: p.image,
        link: p.link,
        rating: p.rating ? p.rating / 10 : undefined,
        reviews: p.reviews,
        badge: p.badge || undefined,
      }));
      setProducts(formattedProducts);
    }
  }, [dbProducts]);

  const handleAdminAccess = () => {
    if (adminPassword === "panochonas12") {
      setShowAdminPrompt(false);
      setAdminPassword("");
      navigate("/admin");
    } else {
      alert("Contraseña incorrecta");
      setAdminPassword("");
    }
  };

  const renderStars = (rating?: number) => {
    if (!rating) return "";
    let stars = "";
    for (let i = 0; i < 5; i++) {
      if (rating >= i + 1) stars += "★";
      else if (rating >= i + 0.5) stars += "☆";
      else stars += "☆";
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-border/50 shadow-sm">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <ShoppingBag className="size-6 text-purple-600" />
            <span className="font-bold text-sm tracking-tight">Tienda</span>
          </div>
          <div className="flex items-center gap-1 bg-white/50 backdrop-blur px-2 py-1 rounded-md">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663442540562/eG7tCpxgJHL2beNG2g3VYE/Mercado-Libre-Logo-PNG1_e7fad039.png"
              alt="Mercado Libre"
              className="h-5"
            />
            <span className="text-xs font-medium text-gray-700">Afiliados Oficiales</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.history.back()}
            className="gap-1 text-xs"
          >
            ← Volver
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-4 md:py-12">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-violet-600 to-fuchsia-500" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 25%, white 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative container text-center text-white py-3 md:py-8">
          <h1 className="text-2xl md:text-4xl font-bold mb-1 md:mb-3">Tienda Oficial</h1>
          <p className="text-sm md:text-lg text-white/90">
            Productos exclusivos K-POP de tus artistas favoritos
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="container py-12">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No hay productos disponibles en este momento
            </p>
            <Button onClick={() => navigate("/")} variant="outline">
              Volver al inicio
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4 lg:gap-6">
            {products.map((product) => (
              <Card
                key={product.id}
                className="bg-white/60 backdrop-blur-xl border-border/50 shadow-lg overflow-hidden hover:shadow-xl transition-all hover:scale-105 flex flex-col h-full"
              >
                <CardContent className="p-0 flex flex-col h-full">
                  <div className="relative h-32 md:h-48 bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden flex-shrink-0">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                    {product.badge && (
                      <Badge className="absolute top-3 right-3 bg-red-500">
                        {product.badge}
                      </Badge>
                    )}
                  </div>
                  <div className="p-2 md:p-4 flex flex-col flex-grow">
                    <h3 className="font-bold text-xs md:text-sm mb-1 md:mb-2 line-clamp-2">
                      {product.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2 md:mb-3 line-clamp-2 hidden md:block flex-grow">
                      {product.description}
                    </p>
                    <div className="mt-auto space-y-2 md:space-y-3">
                      <div className="flex items-center gap-1 hidden md:flex">
                        <span className="text-yellow-500 text-xs md:text-sm">
                          {renderStars(product.rating)}
                        </span>
                        <span className="text-xs text-muted-foreground hidden md:inline">
                          ({product.rating} • {product.reviews} calificaciones)
                        </span>
                      </div>
                      <div>
                        <div className="text-lg md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-500 bg-clip-text text-transparent">
                          ${product.price} MXN
                        </div>
                      </div>
                      <a
                        href={product.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button className="w-full gap-1 md:gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-xs md:text-sm py-1 md:py-2">
                          <ExternalLink className="size-3 md:size-4" />
                          <span className="hidden md:inline">Ver en Mercado Libre</span>
                          <span className="md:hidden">Ver</span>
                        </Button>
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Footer with Admin Button */}
      <footer className="bg-muted/50 backdrop-blur-sm border-t border-border/50 mt-10">
        <div className="container py-10 text-center">
          <p className="text-sm font-medium text-foreground mb-4">
            © 2026 DEDIKA STUDIO
          </p>
          <p className="text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-6">
            Este sitio muestra productos disponibles en Mercado Libre mediante
            enlaces externos. No vendemos ni distribuimos directamente los
            productos mostrados. Las compras, envíos, garantías y políticas son
            responsabilidad exclusiva de los vendedores y de la plataforma
            Mercado Libre.
          </p>

          {/* Admin Access Button - Tiny and Discreet */}
          <button
            onClick={() => setShowAdminPrompt(true)}
            className="text-xs text-muted-foreground/50 hover:text-muted-foreground/80 transition-colors flex items-center gap-1 mx-auto"
          >
            <Lock className="size-3" />
            admin
          </button>
        </div>

        {/* Admin Password Modal */}
        {showAdminPrompt && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <Card className="w-96 bg-white/95 backdrop-blur-xl border-border/50">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold mb-4">Acceso Admin</h2>
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAdminAccess();
                  }}
                  className="w-full px-3 py-2 border border-border rounded-lg mb-4 bg-background"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleAdminAccess}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    Entrar
                  </Button>
                  <Button
                    onClick={() => {
                      setShowAdminPrompt(false);
                      setAdminPassword("");
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </footer>
    </div>
  );
}
