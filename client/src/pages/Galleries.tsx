import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart } from "lucide-react";

export default function Galleries() {
  const [, navigate] = useLocation();

  const galleries = [
    {
      id: 1,
      title: "BTS - Dynamite Era",
      description: "Colección de fotos exclusivas de BTS durante la era Dynamite",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=500&fit=crop",
      photos: 24,
    },
    {
      id: 2,
      title: "BLACKPINK - Pink Venom",
      description: "Galería oficial de BLACKPINK - Pink Venom era",
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=500&fit=crop",
      photos: 32,
    },
    {
      id: 3,
      title: "STRAY KIDS - S-Class",
      description: "Fotos detrás de cámaras de STRAY KIDS",
      image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&h=500&fit=crop",
      photos: 28,
    },
    {
      id: 4,
      title: "TWICE - Set Me Free",
      description: "Colección especial de TWICE - Set Me Free",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=500&fit=crop",
      photos: 20,
    },
    {
      id: 5,
      title: "NewJeans - Hype Boy",
      description: "Fotos exclusivas de NewJeans",
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=500&fit=crop",
      photos: 18,
    },
    {
      id: 6,
      title: "IVE - I AM Era",
      description: "Galería oficial de IVE - I AM era",
      image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&h=500&fit=crop",
      photos: 26,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-border/50 shadow-sm">
        <div className="container flex items-center justify-between h-14">
          <span className="font-bold text-sm tracking-tight">Galerías</span>
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

      <div className="container py-12">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Galerías K-POP</h1>
          <p className="text-muted-foreground">
            Explora nuestras colecciones exclusivas de fotos de tus artistas favoritos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleries.map((gallery) => (
            <Card
              key={gallery.id}
              className="bg-white/60 backdrop-blur-xl border-border/50 overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400">
                <img
                  src={gallery.image}
                  alt={gallery.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />

                {/* Photo count badge */}
                <div className="absolute top-3 right-3 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {gallery.photos} fotos
                </div>
              </div>

              {/* Content */}
              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-bold text-lg">{gallery.title}</h3>
                  <p className="text-sm text-muted-foreground">{gallery.description}</p>
                </div>

                <Button
                  className="w-full gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  onClick={() => {
                    // Placeholder for gallery view
                  }}
                >
                  <Heart className="size-4" />
                  Ver Galería
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
