import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Ticket } from "lucide-react";
import { getTheme } from "@shared/raffleThemes";
import type { RaffleCategory } from "@shared/raffleThemes";

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
}

export default function RaffleDetail() {
  const [match, params] = useRoute("/rifa/:id");
  const [, navigate] = useLocation();
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [selectedTickets, setSelectedTickets] = useState<number[]>([]);

  useEffect(() => {
    // TODO: Fetch raffle from API using params.id
    // For now, mock data
    const mockRaffle: Raffle = {
      id: params?.id || "1",
      title: "Rifa iPhone 15 Pro",
      description: "Gana un iPhone 15 Pro de 256GB. Sorteo en vivo el 25 de marzo.",
      image:
        "https://images.unsplash.com/photo-1592286927505-1def25115558?w=800&h=600&fit=crop",
      totalTickets: 1000,
      pricePerTicket: 50,
      drawDate: "2026-03-25T20:00:00",
      webhookUrl: "https://example.com/webhook",
      category: "electronica",
    };
    setRaffle(mockRaffle);
  }, [params?.id]);

  if (!match || !raffle) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Cargando rifa...</p>
        </div>
      </div>
    );
  }

  const theme = getTheme(raffle.category);
  const totalPrice = selectedTickets.length * raffle.pricePerTicket;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-border/50 shadow-sm">
        <div className="container flex items-center justify-between h-14">
          <span className="font-bold text-sm tracking-tight">Detalles de Rifa</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/rifa")}
            className="gap-1 text-xs"
          >
            <ArrowLeft className="size-3" />
            Volver
          </Button>
        </div>
      </header>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Hero Section */}
          <div className="lg:col-span-2">
            <div
              className={`bg-gradient-to-br ${theme.gradient} rounded-xl overflow-hidden shadow-lg mb-6`}
            >
              <div className="relative h-96">
                <img
                  src={raffle.image}
                  alt={raffle.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-end p-6">
                  <div className={theme.textColor}>
                    <div className="text-4xl mb-2">{theme.icon}</div>
                    <h1 className="text-3xl font-bold mb-2">{raffle.title}</h1>
                    <p className="text-sm opacity-90">{raffle.description}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Details */}
            <Card className="bg-white/60 backdrop-blur-xl border-border/50 mb-6">
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-muted-foreground text-sm mb-1">Boletos</p>
                    <p className={`text-2xl font-bold ${theme.accent}`}>
                      {raffle.totalTickets}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground text-sm mb-1">Precio</p>
                    <p className={`text-2xl font-bold ${theme.accent}`}>
                      ${raffle.pricePerTicket}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground text-sm mb-1">Sorteo</p>
                    <p className={`text-2xl font-bold ${theme.accent}`}>
                      {new Date(raffle.drawDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ticket Selection */}
            <Card className="bg-white/60 backdrop-blur-xl border-border/50">
              <CardContent className="p-6">
                <h2 className="font-bold text-lg mb-4">Selecciona tus boletos</h2>
                <div className="grid grid-cols-5 gap-2 max-h-96 overflow-y-auto">
                  {Array.from({ length: raffle.totalTickets }, (_, i) => i).map(
                    (num) => (
                      <button
                        key={num}
                        onClick={() => {
                          if (selectedTickets.includes(num)) {
                            setSelectedTickets(
                              selectedTickets.filter((t) => t !== num)
                            );
                          } else {
                            setSelectedTickets([...selectedTickets, num]);
                          }
                        }}
                        className={`p-3 rounded-lg font-bold text-sm transition-all ${
                          selectedTickets.includes(num)
                            ? `${theme.buttonBg} ${theme.textColor}`
                            : "bg-gray-200 hover:bg-gray-300"
                        }`}
                      >
                        {String(num).padStart(3, "0")}
                      </button>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Resumen */}
          <div>
            <Card className="bg-white/60 backdrop-blur-xl border-border/50 sticky top-20">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-bold text-lg">Resumen</h3>

                <div className="space-y-3 border-b border-border/50 pb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Boletos seleccionados:</span>
                    <span className="font-bold">{selectedTickets.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Precio unitario:</span>
                    <span className="font-bold">${raffle.pricePerTicket}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-bold">${totalPrice}</span>
                  </div>
                </div>

                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className={theme.accent}>${totalPrice}</span>
                </div>

                {selectedTickets.length > 0 && (
                  <div className="text-xs text-muted-foreground bg-gray-100 p-3 rounded-lg">
                    <p className="font-bold mb-1">Boletos seleccionados:</p>
                    <p className="break-all">
                      {selectedTickets.map((t) => String(t).padStart(3, "0")).join(", ")}
                    </p>
                  </div>
                )}

                <Button
                  disabled={selectedTickets.length === 0}
                  className={`w-full ${theme.buttonBg} ${theme.buttonHover} ${theme.textColor} disabled:opacity-50`}
                >
                  <Ticket className="size-4 mr-2" />
                  Ir a Pagar
                </Button>

                <Button variant="outline" className="w-full" onClick={() => setSelectedTickets([])}>
                  Limpiar
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
