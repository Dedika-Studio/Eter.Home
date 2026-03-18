import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import LandingHome from "./pages/LandingHome";
import RaffleDetail from "./pages/RaffleDetail";
import Success from "./pages/Success";
import Cancel from "./pages/Cancel";
import CheckTickets from "./pages/CheckTickets";
import Store from "./pages/Store";
import Admin from "./pages/Admin";
import Raffles from "./pages/Raffles";
import Galleries from "./pages/Galleries";
import Biographies from "./pages/Biographies";
import PurchaseHistory from "./pages/PurchaseHistory";

function Router() {
  // Routing: / = Landing Home, /rifa = Raffle
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={LandingHome} />
      <Route path="/rifa" component={Home} />
      <Route path="/rifa/:id" component={RaffleDetail} />
      <Route path="/success" component={Success} />
      <Route path="/cancel" component={Cancel} />
      <Route path="/check-tickets" component={CheckTickets} />
      <Route path="/tienda" component={Store} />
      <Route path="/rifas" component={Raffles} />
      <Route path="/galerias" component={Galleries} />
      <Route path="/biografias" component={Biographies} />
      <Route path="/mi-historial" component={PurchaseHistory} />
      <Route path="/admin" component={Admin} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
