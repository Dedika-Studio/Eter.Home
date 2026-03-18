import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, ArrowLeft, CheckCircle2, Clock } from "lucide-react";
import { useLocation } from "wouter";

export default function CheckTickets() {
  const [, navigate] = useLocation();
  const [phone, setPhone] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const query = trpc.orders.getByPhone.useQuery(
    { phone },
    { enabled: false }
  );

  const handleSearch = async () => {
    if (!phone.trim()) {
      toast.error("Ingresa tu número de teléfono");
      return;
    }

    setHasSearched(true);
    try {
      await query.refetch();
    } catch (error) {
      toast.error("Error al buscar tus boletos");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle2 className="size-3" />
            Pagado
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
            <Clock className="size-3" />
            Pendiente
          </Badge>
        );
      case "expired":
        return <Badge variant="secondary">Expirado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-border/50 shadow-sm">
        <div className="container flex items-center justify-between h-14">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/rifa")}
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            Volver
          </Button>
          <span className="font-bold text-sm tracking-tight">Revisa tus boletos</span>
          <div className="w-12" />
        </div>
      </header>

      <div className="container py-10">
        <div className="max-w-md mx-auto space-y-6">
          <Card className="bg-white/60 backdrop-blur-xl border-border/50 shadow-lg">
            <CardContent className="p-6 space-y-4">
              <div>
                <h2 className="text-lg font-bold mb-2">Busca tus boletos</h2>
                <p className="text-sm text-muted-foreground">
                  Ingresa el número de teléfono con el que hiciste tu compra
                </p>
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Ej: 6571921509"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="bg-white/80 backdrop-blur-sm border-border/50 text-center text-lg font-semibold tracking-widest"
                />
                <Button
                  onClick={handleSearch}
                  disabled={query.isLoading}
                  className="shrink-0 shadow-lg"
                >
                  <Search className="size-4 mr-1" />
                  Buscar
                </Button>
              </div>
            </CardContent>
          </Card>

          {hasSearched && (
            <>
              {query.isLoading && (
                <Card className="bg-white/60 backdrop-blur-xl border-border/50">
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">Buscando tus boletos...</p>
                  </CardContent>
                </Card>
              )}

              {query.isError && (
                <Card className="bg-red-50 border-red-200">
                  <CardContent className="p-6">
                    <p className="text-red-700 text-sm">
                      {query.error?.message || "Error al buscar tus boletos"}
                    </p>
                  </CardContent>
                </Card>
              )}

              {query.data && query.data.length === 0 && (
                <Card className="bg-white/60 backdrop-blur-xl border-border/50">
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">
                      No encontramos boletos con este número de teléfono
                    </p>
                  </CardContent>
                </Card>
              )}

              {query.data && query.data.length > 0 && (
                <div className="space-y-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Se encontraron {query.data.length} compra(s)
                  </p>
                  {query.data.map((order) => (
                    <Card
                      key={order.id}
                      className="bg-white/60 backdrop-blur-xl border-border/50 shadow-lg"
                    >
                      <CardContent className="p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-sm">
                            Compra #{order.id}
                          </h3>
                          {getStatusBadge(order.status)}
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Nombre</span>
                            <span className="font-medium">{order.buyerName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Boletos</span>
                            <span className="font-medium">{order.ticketCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total</span>
                            <span className="font-medium">${order.totalAmount} MXN</span>
                          </div>
                        </div>

                        <div className="border-t border-border/50 pt-3">
                          <p className="text-xs text-muted-foreground mb-2">
                            Números de boletos:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {order.ticketNumbers.map((num) => (
                              <Badge
                                key={num}
                                variant="outline"
                                className="font-mono font-bold text-xs px-2 py-1 bg-primary/5 border-primary/20"
                              >
                                {num}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString("es-MX", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
