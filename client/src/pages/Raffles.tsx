import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Ticket, Calendar, DollarSign } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getTheme } from "@shared/raffleThemes";
import { Loader } from "lucide-react";

export default function Raffles() {
  const [, navigate] = useLocation();
  const { data: raffles, isLoading } = trpc.raffles.list.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader className="size-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Cargando rifas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-border/50 shadow-sm">
        <div className="container flex items-center justify-between h-14">
          <span className="font-bold text-sm tracking-tight">Todas las Rifas</span>
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
        {!raffles || raffles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No hay rifas disponibles en este momento</p>
            <Button onClick={() => navigate("/")} variant="outline">
              Volver al inicio
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {raffles.map((raffle) => {
              const theme = getTheme(raffle.category);
              const drawDate = new Date(raffle.drawDate);
              const isUpcoming = drawDate > new Date();

              return (
                <Card
                  key={raffle.id}
                  className="bg-white/60 backdrop-blur-xl border-border/50 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => navigate(`/rifa/${raffle.id}`)}
                >
                  {/* Image */}
                  <div
                    className={`relative h-48 bg-gradient-to-br ${theme.gradient} overflow-hidden`}
                  >
                    <img
                      src={raffle.image}
                      alt={raffle.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />

                    {/* Category Badge */}
                    <div className={`absolute top-3 right-3 ${theme.buttonBg} ${theme.textColor} px-3 py-1 rounded-full text-xs font-bold`}>
                      {theme.icon}
                    </div>

                    {/* Status Badge */}
                    {!isUpcoming && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        Finalizado
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h3 className="font-bold text-lg line-clamp-2">{raffle.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {raffle.description}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Ticket className="size-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{raffle.totalTickets} boletos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="size-4 text-muted-foreground" />
                        <span className={`font-bold ${theme.accent}`}>
                          ${raffle.pricePerTicket / 100}
                        </span>
                      </div>
                    </div>

                    {/* Draw Date */}
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="size-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {drawDate.toLocaleDateString("es-MX", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    {/* CTA Button */}
                    <Button
                      className={`w-full ${theme.buttonBg} ${theme.buttonHover} ${theme.textColor}`}
                      disabled={!isUpcoming}
                    >
                      {isUpcoming ? "Ver Detalles" : "Finalizado"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
