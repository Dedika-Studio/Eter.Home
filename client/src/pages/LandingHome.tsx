import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  ShieldCheck,
  Ticket,
  Store,
  Images,
  Users,
  ArrowRight,
  Clock,
  ChevronDown,
  Lightbulb,
} from "lucide-react";
import { RAFFLE_CONFIG } from "@shared/raffle";

export default function LandingHome() {
  const [, navigate] = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-border/50 shadow-sm">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <img
              src={RAFFLE_CONFIG.logoUrl}
              alt={RAFFLE_CONFIG.storeName}
              className="h-8 w-8 rounded-lg shadow-md"
            />
            <span className="font-bold text-sm tracking-tight">
              {RAFFLE_CONFIG.storeName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs font-medium gap-1">
              <ShieldCheck className="size-3" />
              Sitio Oficial
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-violet-600 to-fuchsia-500" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 25%, white 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative container py-8 md:py-16 text-center text-white">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md rounded-full px-3 py-1 mb-3 md:mb-6 text-xs md:text-sm font-medium">
            <Sparkles className="size-3 md:size-4" />
            <span className="hidden md:inline">Bienvenido a ETER KPOP MX</span>
            <span className="md:hidden">ETER KPOP MX</span>
          </div>
          <h1 className="text-2xl md:text-5xl font-extrabold tracking-tight mb-2 md:mb-4 drop-shadow-lg">
            Descubre el Mundo K-POP
          </h1>
          <p className="text-white/90 text-xs md:text-lg max-w-2xl mx-auto leading-relaxed">
            <span className="hidden md:inline">Productos exclusivos, rifas emocionantes y contenido de tus artistas favoritos. Todo en un solo lugar.</span>
            <span className="md:hidden">Rifas, productos y contenido K-POP</span>
          </p>
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mt-4 md:mt-8">
            <Button
              onClick={() => navigate("/rifa")}
              className="gap-1 md:gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-xs md:text-sm py-1 md:py-2"
            >
              <Ticket className="size-3 md:size-4" />
              <span className="hidden md:inline">Ir a Rifas</span>
              <span className="md:hidden">Rifas</span>
            </Button>
            <div className="relative" ref={dropdownRef}>
              <div
                className={`bg-white/20 border border-white/40 text-white rounded-lg overflow-hidden transition-all duration-300 ${
                  isDropdownOpen ? "w-48" : "w-auto"
                }`}
              >
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full flex items-center justify-between gap-1 md:gap-2 hover:bg-white/30 text-xs md:text-sm py-1 md:py-2 px-3 md:px-4 transition-colors"
                >
                  <div className="flex items-center gap-1 md:gap-2">
                    <Lightbulb className="size-3 md:size-4" />
                    <span className="hidden md:inline">Explorar</span>
                    <span className="md:hidden">Menú</span>
                  </div>
                  <ChevronDown className={`size-3 md:size-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {isDropdownOpen && (
                  <div className="border-t border-white/40 divide-y divide-white/20 space-y-0">
                    <button
                      onClick={() => handleNavigate("/tienda")}
                      className="w-full px-4 md:px-5 py-3 md:py-4 text-left text-xs md:text-sm font-medium text-gray-900 hover:bg-white/60 transition-all duration-200 flex items-center gap-3 hover:translate-x-1 animate-in fade-in slide-in-from-top-2 duration-300"
                    >
                      <Store className="size-4 md:size-5" />
                      <span>Tienda</span>
                    </button>
                    <button
                      onClick={() => handleNavigate("/galerias")}
                      className="w-full px-4 md:px-5 py-3 md:py-4 text-left text-xs md:text-sm font-medium text-gray-900 hover:bg-white/60 transition-all duration-200 flex items-center gap-3 hover:translate-x-1 animate-in fade-in slide-in-from-top-2 duration-300 delay-75"
                    >
                      <Images className="size-4 md:size-5" />
                      <span>Galerias</span>
                    </button>
                    <button
                      onClick={() => handleNavigate("/biografias")}
                      className="w-full px-4 md:px-5 py-3 md:py-4 text-left text-xs md:text-sm font-medium text-gray-900 hover:bg-white/60 transition-all duration-200 flex items-center gap-3 hover:translate-x-1 animate-in fade-in slide-in-from-top-2 duration-300 delay-150"
                    >
                      <Users className="size-4 md:size-5" />
                      <span>Biografias</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container py-8 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
          {/* Rifas Section */}
          <Card className="bg-white/60 backdrop-blur-xl border-border/50 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <CardContent className="p-0">
              <div className="relative h-32 md:h-48 bg-gradient-to-br from-purple-400 to-pink-400 overflow-hidden">
                <img
                  src="https://http2.mlstatic.com/D_NQ_NP_2X_867895-MLA99578718932_122025-F.webp"
                  alt="Rifa BTS Album"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
              <div className="p-2 md:p-6">
                <h2 className="text-lg md:text-2xl font-bold mb-1 md:mb-2 flex items-center gap-2">
                  <Sparkles className="size-4 md:size-5 text-purple-600" />
                  <span className="hidden md:inline">Rifas</span>
                  <span className="md:hidden">Rifas</span>
                </h2>
                <p className="text-gray-600 text-xs md:text-sm mb-2 md:mb-4 hidden md:block">
                  Participa en nuestras rifas exclusivas y gana productos
                  increíbles del mundo K-POP. ¡Tu oportunidad de ganar está
                  aquí!
                </p>
                <Button
                  onClick={() => navigate("/rifa")}
                  className="w-full gap-1 md:gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-xs md:text-sm py-1 md:py-2"
                >
                  <span className="hidden md:inline">Ver Rifas Activas</span>
                  <span className="md:hidden">Rifas</span>
                  <ArrowRight className="size-3 md:size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tienda Section */}
          <Card className="bg-white/60 backdrop-blur-xl border-border/50 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <CardContent className="p-0">
              <div className="relative h-32 md:h-48 bg-gradient-to-br from-blue-400 to-cyan-400 overflow-hidden">
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310519663442540562/eG7tCpxgJHL2beNG2g3VYE/TIENDA_a3fdf310.png"
                  alt="K-POP Merchandise"
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
              <div className="p-2 md:p-6">
                <h2 className="text-lg md:text-2xl font-bold mb-1 md:mb-2 flex items-center gap-2">
                  <Store className="size-4 md:size-5 text-blue-600" />
                  Tienda
                </h2>
                <p className="text-gray-600 text-xs md:text-sm mb-2 md:mb-4 hidden md:block">
                  Explora nuestra colección de productos K-POP: álbumes,
                  figuras, merchandise y mucho más. Envíos a todo México.
                </p>
                <Button
                  onClick={() => navigate("/tienda")}
                  className="w-full gap-1 md:gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-xs md:text-sm py-1 md:py-2"
                >
                  <Store className="size-3 md:size-4" />
                  <span className="hidden md:inline">Ver Tienda</span>
                  <span className="md:hidden">Tienda</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Galerías Section */}
          <Card className="bg-white/60 backdrop-blur-xl border-border/50 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <CardContent className="p-0">
              <div className="relative h-32 md:h-48 bg-gradient-to-br from-orange-400 to-red-400 overflow-hidden">
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310519663442540562/eG7tCpxgJHL2beNG2g3VYE/GALERIAS_fd059a61.png"
                  alt="BTS Concert Performance"
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
              <div className="p-2 md:p-6">
                <h2 className="text-lg md:text-2xl font-bold mb-1 md:mb-2 flex items-center gap-2">
                  <Images className="size-4 md:size-5 text-orange-600" />
                  Galerías
                </h2>
                <p className="text-gray-600 text-xs md:text-sm mb-2 md:mb-4 hidden md:block">
                  Galería de fotos de eventos, conciertos y momentos especiales
                  del mundo K-POP. Revive tus momentos favoritos.
                </p>
                <Button
                  disabled
                  className="w-full gap-2 opacity-60"
                  variant="outline"
                >
                  <Clock className="size-4" />
                  Próximamente
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Biografías Section */}
          <Card className="bg-white/60 backdrop-blur-xl border-border/50 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <CardContent className="p-0">
              <div className="relative h-32 md:h-48 bg-gradient-to-br from-green-400 to-emerald-400 overflow-hidden">
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310519663442540562/eG7tCpxgJHL2beNG2g3VYE/BIOGRAFIAS_d6416b1b.png"
                  alt="BLACKPINK Members"
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
              <div className="p-2 md:p-6">
                <h2 className="text-lg md:text-2xl font-bold mb-1 md:mb-2 flex items-center gap-2">
                  <Users className="size-4 md:size-5 text-green-600" />
                  Biografías
                </h2>
                <p className="text-gray-600 text-xs md:text-sm mb-2 md:mb-4 hidden md:block">
                  Conoce las historias de tus artistas K-POP favoritos. Desde
                  sus inicios hasta sus mayores logros.
                </p>
                <Button
                  disabled
                  className="w-full gap-2 opacity-60"
                  variant="outline"
                >
                  <Clock className="size-4" />
                  Próximamente
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Featured Raffle */}
      <section className="container py-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Rifa Destacada</h2>
          <p className="text-gray-600">Participa ahora en nuestra rifa principal</p>
        </div>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 overflow-hidden">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <img
                  src="https://http2.mlstatic.com/D_NQ_NP_2X_867895-MLA99578718932_122025-F.webp"
                  alt={RAFFLE_CONFIG.name}
                  className="w-full rounded-xl shadow-lg hover:shadow-2xl transition-shadow"
                />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 bg-purple-100 rounded-full px-4 py-2 mb-4">
                  <Sparkles className="size-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">
                    Sorteo Oficial
                  </span>
                </div>
                <h3 className="text-3xl font-bold mb-3">{RAFFLE_CONFIG.name}</h3>
                <p className="text-gray-600 mb-6">
                  Participa en la rifa del álbum BTS - Skool Luv Affair. Selecciona
                  tus boletos y asegura tu oportunidad de ganar este increíble
                  artículo.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/60 backdrop-blur rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {RAFFLE_CONFIG.priceDisplay}
                    </div>
                    <div className="text-xs text-gray-600">Por boleto</div>
                  </div>
                  <div className="bg-white/60 backdrop-blur rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">31 Mar</div>
                    <div className="text-xs text-gray-600">Sorteo</div>
                  </div>
                </div>

                <Button
                  onClick={() => navigate("/rifa")}
                  className="w-full gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  <Ticket className="size-4" />
                  Participar Ahora
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>



      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4 flex items-center gap-2">
                <img
                  src={RAFFLE_CONFIG.logoUrl}
                  alt="Logo"
                  className="h-6 w-6 rounded"
                />
                {RAFFLE_CONFIG.storeName}
              </h4>
              <p className="text-gray-400 text-sm">
                Tu destino para rifas, productos y contenido K-POP exclusivo.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Enlaces</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <button
                    onClick={() => navigate("/rifa")}
                    className="hover:text-white transition"
                  >
                    Rifas
                  </button>
                </li>
                <li>
                  <button
                    disabled
                    className="opacity-50 cursor-not-allowed"
                  >
                    Tienda
                  </button>
                </li>
                <li>
                  <button
                    disabled
                    className="opacity-50 cursor-not-allowed"
                  >
                    Galerías
                  </button>
                </li>
                <li>
                  <button
                    disabled
                    className="opacity-50 cursor-not-allowed"
                  >
                    Biografías
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <p className="text-gray-400 text-sm">
                © 2026 DEDIKA STUDIO. Todos los derechos reservados.
              </p>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <p className="text-gray-400 text-xs text-center">
              Este sitio web tiene fines informativos y de entretenimiento. El
              contenido mostrado puede incluir artículos, opiniones, enlaces
              externos, recomendaciones de productos y material relacionado con
              la cultura K-POP. ETER KPOP MX no se responsabiliza por compras,
              envíos, garantías o políticas de plataformas externas.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
