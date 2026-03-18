import { useState, useMemo, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { RAFFLE_CONFIG } from "@shared/raffle";
import {
  Search,
  Shuffle,
  CreditCard,
  Ticket,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
  ShieldCheck,
  Clock,
  Eye,
} from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const [, navigate] = useLocation();
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [autoCount, setAutoCount] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const ticketsQuery = trpc.tickets.list.useQuery(undefined, {
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });

  const createCheckout = trpc.checkout.create.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        toast.success("Redirigiendo al pago...");
        window.open(data.checkoutUrl, "_blank");
      }
      setIsCheckingOut(false);
    },
    onError: (error) => {
      toast.error(error.message);
      setIsCheckingOut(false);
    },
  });

  const ticketMap = useMemo(() => {
    const map = new Map<string, string>();
    if (ticketsQuery.data) {
      for (const t of ticketsQuery.data) {
        map.set(t.number, t.status);
      }
    }
    return map;
  }, [ticketsQuery.data]);

  const availableCount = useMemo(() => {
    let count = 0;
    ticketMap.forEach((status) => {
      if (status === "available") count++;
    });
    return count;
  }, [ticketMap]);

  const totalPrice = selectedTickets.length * 3;

  const handleSearch = useCallback(() => {
    const num = searchValue.padStart(3, "0");
    if (num.length !== 3 || isNaN(Number(num))) {
      toast.error("Ingresa un número válido (000-999)");
      return;
    }
    const status = ticketMap.get(num);
    if (!status || status === "available") {
      if (!selectedTickets.includes(num)) {
        if (selectedTickets.length >= 30) {
          toast.error("Máximo 30 boletos por pedido");
          return;
        }
        setSelectedTickets((prev) => [...prev, num]);
        toast.success(`Boleto ${num} agregado`);
      } else {
        toast.info(`Boleto ${num} ya está seleccionado`);
      }
    } else {
      toast.error(`Boleto ${num} no disponible (${status})`);
    }
    setSearchValue("");
  }, [searchValue, ticketMap, selectedTickets]);

  const handleAutoGenerate = useCallback(() => {
    const count = parseInt(autoCount);
    if (!count || count < 1) {
      toast.error("Ingresa una cantidad válida");
      return;
    }
    if (count + selectedTickets.length > 30) {
      toast.error("Máximo 30 boletos por pedido");
      return;
    }
    const available: string[] = [];
    ticketMap.forEach((status, number) => {
      if (status === "available" && !selectedTickets.includes(number)) {
        available.push(number);
      }
    });
    if (available.length < count) {
      toast.error(`Solo hay ${available.length} boletos disponibles`);
      return;
    }
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, count);
    setSelectedTickets((prev) => [...prev, ...picked]);
    toast.success(`${count} boleto(s) generados al azar`);
    setAutoCount("");
  }, [autoCount, ticketMap, selectedTickets]);

  const removeTicket = useCallback((num: string) => {
    setSelectedTickets((prev) => prev.filter((t) => t !== num));
  }, []);

  const handleCheckout = useCallback(() => {
    if (!buyerName.trim()) {
      toast.error("Ingresa tu nombre");
      return;
    }
    if (!buyerPhone.trim()) {
      toast.error("Ingresa tu teléfono");
      return;
    }
    if (buyerPhone.length !== 10) {
      toast.error("El teléfono debe tener exactamente 10 dígitos");
      return;
    }
    if (selectedTickets.length < 4) {
      toast.error("El mínimo de compra es 4 boletos");
      return;
    }
    if (selectedTickets.length > 30) {
      toast.error("El máximo de compra es 30 boletos por pedido");
      return;
    }
    setShowConfirmDialog(true);
  }, [buyerName, buyerPhone, selectedTickets]);

  const confirmCheckout = useCallback(() => {
    // Final validation before confirming
    if (selectedTickets.length < 4 || selectedTickets.length > 30) {
      toast.error("Debes seleccionar entre 4 y 30 boletos");
      return;
    }
    setShowConfirmDialog(false);
    setIsCheckingOut(true);
    createCheckout.mutate({
      ticketNumbers: selectedTickets,
      buyerName: buyerName.trim(),
      buyerPhone: buyerPhone.trim(),
      buyerEmail: buyerEmail.trim() || undefined,
    });
  }, [selectedTickets, buyerName, buyerPhone, buyerEmail, createCheckout]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-border/50 shadow-sm">
        <div className="container flex items-center justify-between h-12 md:h-14 px-2 md:px-4">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <img
              src={RAFFLE_CONFIG.logoUrl}
              alt={RAFFLE_CONFIG.storeName}
              className="h-6 w-6 md:h-8 md:w-8 rounded-lg shadow-md flex-shrink-0"
            />
            <span className="font-bold text-xs md:text-sm tracking-tight truncate">
              {RAFFLE_CONFIG.storeName}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.history.back()}
            className="gap-1 text-xs flex-shrink-0 ml-2"
          >
            ← Volver
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-violet-600 to-fuchsia-500" />
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px)', backgroundSize: '24px 24px'}} />
        <div className="absolute top-4 right-4 z-10">
          <Badge variant="secondary" className="text-xs font-medium gap-1 bg-white/90 backdrop-blur">
            <ShieldCheck className="size-3" />
            Pago Seguro
          </Badge>
        </div>
        <div className="relative container py-16 text-center text-white">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md rounded-full px-4 py-1.5 mb-6 text-sm font-medium">
            <Sparkles className="size-4" />
            Sorteo Oficial
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3 drop-shadow-lg">
            {RAFFLE_CONFIG.name}
          </h1>
          <p className="text-white/90 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            El sorteo se realizará el <strong>{RAFFLE_CONFIG.drawDate}</strong>
            <br />
            Coincide con los <strong>{RAFFLE_CONFIG.drawMethod}</strong>
          </p>
          <div className="flex items-center justify-center gap-6 mt-8">
            <div className="text-center">
              <div className="text-2xl font-extrabold">{RAFFLE_CONFIG.priceDisplay}</div>
              <div className="text-xs text-white/70 font-medium">Por boleto</div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Carousel */}
      <section className="container py-10">
        <div className="max-w-xs mx-auto">
          <Carousel opts={{ loop: true }}>
            <CarouselContent>
              {RAFFLE_CONFIG.images.map((img, i) => (
                <CarouselItem key={i}>
                  <div className="rounded-2xl overflow-hidden shadow-xl">
                    <img
                      src={img}
                      alt={`Album BTS ${i + 1}`}
                      className="w-full aspect-square object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:bg-white" />
            <CarouselNext className="right-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:bg-white" />
          </Carousel>
          <h2 className="text-xl font-bold text-center mt-6">Album BTS Original</h2>
          <p className="text-center text-3xl font-extrabold mt-2 bg-gradient-to-r from-purple-600 to-fuchsia-500 bg-clip-text text-transparent">
            {RAFFLE_CONFIG.priceDisplay}
            <span className="text-sm font-medium text-muted-foreground ml-1">
              / boleto
            </span>
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/check-tickets")}
            className="gap-2 mt-6 mx-auto block"
          >
            <Eye className="size-4" />
            Ya compraste tus boletos? Revísalos aquí
          </Button>
        </div>
      </section>

      {/* Buyer Info */}
      <section className="container pb-8">
        <Card className="max-w-md mx-auto bg-white/60 backdrop-blur-xl border-border/50 shadow-lg">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Ticket className="size-5 text-primary" />
              Tus datos
            </h3>
            <Input
              placeholder="Tu nombre"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              className="bg-white/80 backdrop-blur-sm border-border/50 focus:border-primary transition-all"
            />
            <Input
              placeholder="Tu teléfono (10 dígitos)"
              type="tel"
              inputMode="numeric"
              value={buyerPhone}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/\D/g, "");
                if (cleaned.length <= 10) {
                  setBuyerPhone(cleaned);
                }
              }}
              maxLength={10}
              minLength={10}
              className="bg-white/80 backdrop-blur-sm border-border/50 focus:border-primary transition-all"
            />
            <Input
              placeholder="Tu email (opcional)"
              type="email"
              value={buyerEmail}
              onChange={(e) => setBuyerEmail(e.target.value)}
              className="bg-white/80 backdrop-blur-sm border-border/50 focus:border-primary transition-all"
            />
          </CardContent>
        </Card>
      </section>

      {/* Ticket Selection */}
      <section className="container pb-8">
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold">Selecciona tus boletos</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Busca tu número favorito o genera al azar
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Máximo 30 boletos por pedido
            </p>
          </div>

          {/* Search */}
          <Card className="bg-white/60 backdrop-blur-xl border-border/50 shadow-lg">
            <CardContent className="p-5">
              <div className="flex gap-2">
                <Input
                  placeholder="Ej: 007"
                  maxLength={3}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value.replace(/\D/g, ""))}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="bg-white/80 backdrop-blur-sm border-border/50 text-center text-lg font-semibold tracking-widest"
                />
                <Button onClick={handleSearch} className="shrink-0 shadow-lg">
                  <Search className="size-4 mr-1" />
                  Buscar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Auto Generate */}
          <Card className="bg-white/60 backdrop-blur-xl border-border/50 shadow-lg">
            <CardContent className="p-5">
              <div className="flex gap-2">
                <Input
                  type="number"
                  min={1}
                  max={30}
                  placeholder="Cantidad"
                  value={autoCount}
                  onChange={(e) => setAutoCount(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAutoGenerate()}
                  className="bg-white/80 backdrop-blur-sm border-border/50 text-center text-lg font-semibold"
                />
                <Button
                  onClick={handleAutoGenerate}
                  variant="secondary"
                  className="shrink-0 shadow-lg"
                >
                  <Shuffle className="size-4 mr-1" />
                  Al azar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Selected Tickets Panel */}
      <section className="container pb-10">
        <Card className="max-w-md mx-auto bg-white/70 backdrop-blur-xl border-border/50 shadow-xl">
          <CardContent className="p-6">
            <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
              <Ticket className="size-5 text-primary" />
              Boletos seleccionados
              {selectedTickets.length > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {selectedTickets.length}
                </Badge>
              )}
            </h3>

            {selectedTickets.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Aún no has seleccionado boletos
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedTickets.map((num) => (
                  <Badge
                    key={num}
                    variant="outline"
                    className="text-sm font-mono font-semibold px-3 py-1.5 bg-primary/5 border-primary/20 hover:bg-destructive/10 hover:border-destructive/30 cursor-pointer transition-all group"
                    onClick={() => removeTicket(num)}
                  >
                    {num}
                    <XCircle className="size-3.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-destructive" />
                  </Badge>
                ))}
              </div>
            )}

            <div className="border-t border-border/50 pt-4 mt-4">
              {selectedTickets.length > 0 && selectedTickets.length < 4 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-sm text-amber-800">
                  <p className="font-semibold mb-1">⚠️ Compra mínima: 4 boletos</p>
                  <p className="text-xs">Necesitas seleccionar al menos 4 boletos para completar tu compra. Actualmente tienes {selectedTickets.length}.</p>
                </div>
              )}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-fuchsia-500 bg-clip-text text-transparent">
                  {`$${totalPrice} MXN`}
                </span>
              </div>
              <Button
                onClick={handleCheckout}
                disabled={isCheckingOut || selectedTickets.length < 4 || selectedTickets.length > 30}
                className="w-full h-12 text-base font-bold shadow-xl bg-gradient-to-r from-purple-600 to-fuchsia-500 hover:from-purple-700 hover:to-fuchsia-600 transition-all"
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="size-5 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <CreditCard className="size-5 mr-2" />
                    Pagar con tarjeta
                  </>
                )}
              </Button>
              <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="size-3" />
                  Pago seguro con Stripe
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  Reserva 10 min
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Confirm Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-white/95 backdrop-blur-xl border-border/50 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <CheckCircle2 className="size-6 text-primary" />
              Confirmar compra
            </DialogTitle>
            <DialogDescription>
              Revisa los detalles antes de proceder al pago
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Nombre</span>
              <span className="font-medium">{buyerName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Teléfono</span>
              <span className="font-medium">{buyerPhone}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Boletos</span>
              <span className="font-mono font-medium text-right max-w-[200px] break-all">
                {selectedTickets.join(", ")}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cantidad</span>
              <span className="font-medium">{selectedTickets.length}</span>
            </div>
            <div className="border-t border-border/50 pt-3 flex justify-between">
              <span className="font-semibold">Total</span>
              <span className="text-xl font-extrabold bg-gradient-to-r from-purple-600 to-fuchsia-500 bg-clip-text text-transparent">
                ${totalPrice} MXN
              </span>
            </div>
          </div>
          <DialogFooter className="flex-col gap-2">
            <Button
              onClick={confirmCheckout}
              className="w-full h-11 shadow-xl bg-gradient-to-r from-purple-600 to-fuchsia-500 hover:from-purple-700 hover:to-fuchsia-600"
            >
              <CreditCard className="size-4 mr-2" />
              Ir a pagar
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              className="w-full"
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-muted/50 backdrop-blur-sm border-t border-border/50 mt-10">
        <div className="container py-10 text-center">
          <p className="text-sm font-medium text-foreground mb-4">
            &copy; 2026 DEDIKA STUDIO
          </p>
          <p className="text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Aviso: Esta rifa es con fines de entretenimiento y no constituye venta directa de productos. 
            ETER KPOP MX no se responsabiliza por compras, envíos ni garantías de productos externos. 
            La realización de esta rifa está sujeta a la venta mínima del 50% de los boletos. 
            Si no se alcanza este mínimo, los boletos serán reembolsados y la rifa no se realizará. 
            Al participar, aceptas los términos aquí descritos y que el producto pertenece a sus respectivos propietarios.
          </p>
        </div>
      </footer>
    </div>
  );
}
