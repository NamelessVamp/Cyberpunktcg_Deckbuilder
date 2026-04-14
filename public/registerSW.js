// NON OMNIS MORIAR — Afterlife Decks SW Registration
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => console.log("[AfterlifeDecks] SW registered:", reg.scope))
      .catch((err) =>
        console.warn("[AfterlifeDecks] SW registration failed:", err),
      );
  });
}
