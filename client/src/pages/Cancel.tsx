import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function Cancel() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-white/80 backdrop-blur-xl border-border/50 shadow-2xl">
        <CardContent className="p-8 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-100 mx-auto">
            <XCircle className="size-10 text-orange-600" />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold mb-2">
              Pago cancelado
            </h1>
            <p className="text-muted-foreground text-sm">
              El pago fue cancelado. Tus boletos serán liberados automáticamente y estarán disponibles para otros participantes.
            </p>
          </div>

          <div className="bg-muted/50 rounded-xl p-4 text-sm text-muted-foreground">
            No se realizó ningún cargo a tu tarjeta. Puedes intentar nuevamente cuando lo desees.
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
