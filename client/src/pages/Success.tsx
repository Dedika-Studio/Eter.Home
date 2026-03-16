import { useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Ticket, Loader2, PartyPopper } from "lucide-react";
import { RAFFLE_CONFIG } from "@shared/raffle";
import { useLocation } from "wouter";

export default function Success() {
  const [, navigate] = useLocation();

  const searchParams = useMemo(() => {
    if (typeof window === "undefined") return new URLSearchParams();
    return new URLSearchParams(window.location.search);
  }, []);

  const sessionId = searchParams.get("session_id");

  // We poll for order status since webhook might take a moment
  const orderId = useMemo(() => {
    const raw = searchParams.get("order_id");
    return raw ? parseInt(raw) : null;
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-white/80 backdrop-blur-xl border-border/50 shadow-2xl">
        <CardContent className="p-8 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mx-auto">
            <CheckCircle2 className="size-10 text-green-600" />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold mb-2">
              Pago exitoso
            </h1>
            <p className="text-muted-foreground text-sm">
              Tu compra ha sido procesada correctamente. Tus boletos han sido registrados.
            </p>
          </div>

          <div className="bg-muted/50 rounded-xl p-4 space-y-2 text-left">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Rifa</span>
              <span className="font-medium">{RAFFLE_CONFIG.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sorteo</span>
              <span className="font-medium">{RAFFLE_CONFIG.drawDate}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <PartyPopper className="size-4" />
            <span>Los boletos aparecerán en la hoja de registro</span>
          </div>

          <Button
            onClick={() => navigate("/")}
            className="w-full h-11 bg-gradient-to-r from-purple-600 to-fuchsia-500 hover:from-purple-700 hover:to-fuchsia-600 shadow-xl"
          >
            Volver al inicio
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
