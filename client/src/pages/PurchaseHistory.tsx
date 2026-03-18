import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Ticket, ShoppingBag, Calendar, DollarSign, CheckCircle2, Clock, XCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Loader } from "lucide-react";

export default function PurchaseHistory() {
  const [, navigate] = useLocation();
  const { data: user } = trpc.auth.me.useQuery();
  
  // This would be connected to tRPC in a real implementation
  // For now, showing the structure
  const purchases = [
    {
      id: 1,
      type: "raffle",
      title: "BTS Album Deluxe",
      amount: 450,
      currency: "MXN",
      status: "completed",
      date: new Date("2026-03-15"),
      tickets: ["123", "124", "125"],
    },
    {
      id: 2,
      type: "product",
      title: "BLACKPINK Merchandise Bundle",
      amount: 599,
      currency: "MXN",
      status: "completed",
      date: new Date("2026-03-10"),
      quantity: 1,
    },
    {
      id: 3,
      type: "raffle",
      title: "STRAY KIDS Concert Tickets",
      amount: 1200,
      currency: "MXN",
      status: "pending",
      date: new Date("2026-03-18"),
      tickets: ["456", "457"],
    },
  ];

  if (!user || !user.id) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Debes iniciar sesión para ver tu historial</p>
          <Button onClick={() => navigate("/")} variant="outline">
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="size-4 text-green-600" />;
      case "pending":
        return <Clock className="size-4 text-yellow-600" />;
      case "failed":
        return <XCircle className="size-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completado</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Fallido</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-border/50 shadow-sm">
        <div className="container flex items-center justify-between h-14">
          <span className="font-bold text-sm tracking-tight">Mi Historial de Compras</span>
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
        {/* User Info */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-border/50 mb-8">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-2">{user.name}</h2>
            <p className="text-muted-foreground">{user.email}</p>
          </CardContent>
        </Card>

        {/* Purchases List */}
        {purchases.length === 0 ? (
          <Card className="bg-white/60 backdrop-blur-xl border-border/50">
            <CardContent className="p-12 text-center">
              <ShoppingBag className="size-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No tienes compras registradas</p>
              <Button onClick={() => navigate("/rifas")} className="gap-2">
                <Ticket className="size-4" />
                Explorar Rifas
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {purchases.map((purchase) => (
              <Card
                key={purchase.id}
                className="bg-white/60 backdrop-blur-xl border-border/50 hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Icon and Info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="mt-1">
                        {purchase.type === "raffle" ? (
                          <Ticket className="size-6 text-purple-600" />
                        ) : (
                          <ShoppingBag className="size-6 text-pink-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-lg truncate">{purchase.title}</h3>
                          {getStatusBadge(purchase.status)}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="size-4" />
                            <span>{purchase.date.toLocaleDateString("es-MX")}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <DollarSign className="size-4" />
                            <span className="font-bold text-foreground">
                              ${purchase.amount / 100} {purchase.currency}
                            </span>
                          </div>

                          {purchase.type === "raffle" && purchase.tickets && (
                            <div className="flex items-center gap-1">
                              <Ticket className="size-4" />
                              <span>{purchase.tickets.length} boletos</span>
                            </div>
                          )}

                          {purchase.type === "product" && purchase.quantity && (
                            <div className="flex items-center gap-1">
                              <ShoppingBag className="size-4" />
                              <span>Qty: {purchase.quantity}</span>
                            </div>
                          )}
                        </div>

                        {purchase.type === "raffle" && purchase.tickets && (
                          <div className="mt-3 pt-3 border-t border-border/50">
                            <p className="text-xs text-muted-foreground mb-2">Boletos:</p>
                            <div className="flex flex-wrap gap-2">
                              {purchase.tickets.map((ticket) => (
                                <Badge key={ticket} variant="secondary" className="text-xs">
                                  #{ticket}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Status Icon */}
                    <div className="flex-shrink-0">
                      {getStatusIcon(purchase.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
