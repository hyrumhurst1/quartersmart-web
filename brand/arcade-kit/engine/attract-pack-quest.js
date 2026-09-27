// attract pack: quest (being built)
(window.QSAttractPacks = window.QSAttractPacks || []).push((A) => { window.__qa = A; return {
  questProbe: { name: 'probe', dur: 7000, word: { lay: 'line', F: 2 }, init() { this.t = 0; }, update(t) { this.t = t; }, draw() { A.drawWord(); } },
}; });
