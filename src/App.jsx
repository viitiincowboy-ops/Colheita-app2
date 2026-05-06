import { useState, useMemo } from "react";

const CULTURAS = ["Soja", "Sorgo", "Trigo", "Milho", "Feijão"];

const CULTURA_COLORS = {
  Soja: "#c8a84b", Sorgo: "#b05a2f", Trigo: "#d4a017", Milho: "#e8c840", Feijão: "#7a4a2a",
};
const CULTURA_ICONS = {
  Soja: "🌱", Sorgo: "🌾", Trigo: "🌾", Milho: "🌽", Feijão: "🫘",
};

const FAZENDAS_FIXAS = [
  "Fazenda Cercadinho JHS",
  "Fazenda Takaoka JHS",
  "Fazenda Dois Irmãos JHS",
  "Fazenda Amália JHS",
];

const PIVOS_OPCOES = [
  "Sequeiro",
  ...Array.from({ length: 35 }, (_, i) => `Pivô ${String(i + 1).padStart(2, "0")}`),
];

const initialRegistros = [
  { id: 1, data: "2025-01-10", fazenda: "Fazenda Cercadinho JHS", pivo: "Pivô 01", cultura: "Soja", hectares: 80 },
  { id: 2, data: "2025-01-18", fazenda: "Fazenda Takaoka JHS", pivo: "Sequeiro", cultura: "Milho", hectares: 55 },
  { id: 3, data: "2025-02-05", fazenda: "Fazenda Dois Irmãos JHS", pivo: "Pivô 03", cultura: "Trigo", hectares: 40 },
  { id: 4, data: "2025-03-12", fazenda: "Fazenda Amália JHS", pivo: "Pivô 02", cultura: "Soja", hectares: 90 },
  { id: 5, data: "2026-01-08", fazenda: "Fazenda Cercadinho JHS", pivo: "Pivô 01", cultura: "Soja", hectares: 75 },
  { id: 6, data: "2026-02-14", fazenda: "Fazenda Takaoka JHS", pivo: "Sequeiro", cultura: "Feijão", hectares: 30 },
  { id: 7, data: "2026-03-20", fazenda: "Fazenda Amália JHS", pivo: "Pivô 05", cultura: "Milho", hectares: 65 },
];

let nextId = 8;

// ── Cultura card expandível ──────────────────────────────────────────────────
function CulturaGrid({ culturas, resumoPorCulturaAno, totalAno, registrosAno }) {
  const [aberta, setAberta] = useState(null);

  const toggle = (c) => setAberta((v) => (v === c ? null : c));

  // Por fazenda dentro de cada cultura
  const fazPorCultura = useMemo(() => {
    const m = {};
    for (const r of registrosAno) {
      if (!m[r.cultura]) m[r.cultura] = {};
      m[r.cultura][r.fazenda] = (m[r.cultura][r.fazenda] || 0) + r.hectares;
    }
    return m;
  }, [registrosAno]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {culturas.map((c) => {
        const expandido = aberta === c;
        const ha = resumoPorCulturaAno[c] || 0;
        const pct = totalAno ? Math.round((ha / totalAno) * 100) : 0;
        const fazendas = fazPorCultura[c] || {};

        return (
          <div
            key={c}
            onClick={() => toggle(c)}
            style={{
              background: expandido ? `${CULTURA_COLORS[c]}18` : "#0f1a0d",
              border: `1px solid ${expandido ? CULTURA_COLORS[c] + "88" : CULTURA_COLORS[c] + "44"}`,
              borderTop: `3px solid ${CULTURA_COLORS[c]}`,
              borderRadius: 10,
              cursor: "pointer",
              overflow: "hidden",
              transition: "background 0.2s",
              // span 2 columns when expanded if odd position would leave orphan
              gridColumn: expandido ? "1 / -1" : "auto",
            }}
          >
            {/* Cabeçalho sempre visível */}
            <div style={{ padding: "12px 10px", textAlign: "center" }}>
              <div style={{ fontSize: expandido ? 24 : 20 }}>{CULTURA_ICONS[c]}</div>
              <div style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: "#6a8a5a", marginTop: 3 }}>{c}</div>
              <div style={{ fontSize: expandido ? 26 : 20, color: CULTURA_COLORS[c], marginTop: 4, fontVariantNumeric: "tabular-nums", fontWeight: expandido ? "bold" : "normal" }}>
                {ha.toLocaleString("pt-BR")}
              </div>
              <div style={{ fontSize: 10, color: "#4a6a3a" }}>hectares</div>
              <div style={{ marginTop: 6, height: 3, background: "#1a2a10", borderRadius: 2 }}>
                <div style={{ height: "100%", borderRadius: 2, background: CULTURA_COLORS[c], width: `${pct}%` }} />
              </div>
              <div style={{ fontSize: 10, color: "#4a6a3a", marginTop: 3 }}>{pct}% do ano</div>
              <div style={{ fontSize: 10, color: expandido ? CULTURA_COLORS[c] : "#3a5a2a", marginTop: 4 }}>
                {expandido ? "▲ fechar" : "▼ ver fazendas"}
              </div>
            </div>

            {/* Fazendas — só quando expandido */}
            {expandido && (
              <div style={{ borderTop: `1px solid ${CULTURA_COLORS[c]}33`, padding: "10px 12px 12px" }}>
                <p style={{ margin: "0 0 8px", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "#6a8a5a" }}>
                  Colhido por fazenda
                </p>
                {Object.entries(fazendas).sort((a, b) => b[1] - a[1]).map(([faz, fazHa]) => (
                  <div key={faz} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "7px 10px", marginBottom: 5,
                    background: `${CULTURA_COLORS[c]}11`,
                    border: `1px solid ${CULTURA_COLORS[c]}22`,
                    borderRadius: 8,
                  }}>
                    <div>
                      <div style={{ fontSize: 12, color: "#c8c8b0" }}>
                        🏡 {faz.replace(" JHS", "")}<span style={{ color: "#3a5a2a", fontSize: 10 }}> JHS</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 14, color: CULTURA_COLORS[c], fontVariantNumeric: "tabular-nums" }}>
                        {fazHa.toLocaleString("pt-BR")} ha
                      </div>
                      <div style={{ fontSize: 9, color: "#4a6a3a" }}>
                        {Math.round((fazHa / ha) * 100)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Fazenda card colapsável ──────────────────────────────────────────────────
function FazendaCard({ fazenda, dados, totalRef, showPct }) {
  const [aberto, setAberto] = useState(false);
  const nome = fazenda.replace(" JHS", "");
  const pct = totalRef ? Math.round((dados.total / totalRef) * 100) : 0;

  return (
    <div style={{
      background: "#0f1a0d", border: "1px solid #2a4a1a",
      borderRadius: 10, marginBottom: 8, overflow: "hidden",
    }}>
      {/* Cabeçalho clicável */}
      <button
        onClick={() => setAberto((v) => !v)}
        style={{
          width: "100%", background: "none", border: "none", cursor: "pointer",
          padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between",
          fontFamily: "inherit",
        }}
      >
        <div style={{ textAlign: "left" }}>
          <div style={{ fontSize: 13, color: "#e8dfc0", lineHeight: 1.3 }}>
            🏡 {nome}<span style={{ color: "#4a6a3a", fontSize: 10 }}> JHS</span>
          </div>
          {/* Barra de culturas miniaturas */}
          <div style={{ display: "flex", gap: 3, marginTop: 5 }}>
            {Object.entries(dados.culturas).sort((a, b) => b[1] - a[1]).map(([cult]) => (
              <span key={cult} style={{
                fontSize: 11,
                color: CULTURA_COLORS[cult] || "#c8a84b",
                background: `${CULTURA_COLORS[cult] || "#c8a84b"}22`,
                borderRadius: 4, padding: "1px 5px",
              }}>{CULTURA_ICONS[cult]}</span>
            ))}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0, paddingLeft: 8 }}>
          <div style={{ fontSize: 17, color: "#c8a84b", fontVariantNumeric: "tabular-nums" }}>
            {dados.total.toLocaleString("pt-BR")} ha
          </div>
          {showPct && <div style={{ fontSize: 9, color: "#4a6a3a" }}>{pct}% do total</div>}
          <div style={{ fontSize: 16, color: "#3a6a2a", marginTop: 2 }}>{aberto ? "▲" : "▼"}</div>
        </div>
      </button>

      {/* Conteúdo expandido */}
      {aberto && (
        <div style={{ padding: "0 14px 14px" }}>
          {/* Barra colorida */}
          <div style={{ height: 4, background: "#1a2a10", borderRadius: 2, overflow: "hidden", display: "flex", marginBottom: 10 }}>
            {Object.entries(dados.culturas).sort((a, b) => b[1] - a[1]).map(([cult, ha]) => (
              <div key={cult} style={{
                height: "100%", background: CULTURA_COLORS[cult] || "#c8a84b",
                width: `${Math.round((ha / dados.total) * 100)}%`,
              }} />
            ))}
          </div>
          {/* Culturas detalhadas */}
          {Object.entries(dados.culturas).sort((a, b) => b[1] - a[1]).map(([cult, ha]) => (
            <div key={cult} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "7px 10px", marginBottom: 5,
              background: `${CULTURA_COLORS[cult] || "#c8a84b"}11`,
              border: `1px solid ${CULTURA_COLORS[cult] || "#c8a84b"}33`,
              borderRadius: 8,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>{CULTURA_ICONS[cult]}</span>
                <span style={{ fontSize: 13, color: "#e8dfc0" }}>{cult}</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 15, color: CULTURA_COLORS[cult] || "#c8a84b", fontVariantNumeric: "tabular-nums" }}>
                  {ha.toLocaleString("pt-BR")} ha
                </div>
                <div style={{ fontSize: 9, color: "#4a6a3a" }}>
                  {Math.round((ha / dados.total) * 100)}% da fazenda
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Histórico acumulado colapsável (fazenda → culturas) ────────────────────
function HistoricoAcumulado({ resumoFazendaHistorico, resumoCulturaHistorico, totalHistorico }) {
  const [fazendaAberta, setFazendaAberta] = useState(null);

  const toggle = (faz) => setFazendaAberta((v) => (v === faz ? null : faz));

  return (
    <div style={{ background: "#141f0f", border: "1px solid #2a4a1a", borderRadius: 10, padding: "12px", marginBottom: 12 }}>
      <p style={{ margin: "0 0 4px", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "#6a8a5a" }}>
        Histórico acumulado — todas as safras
      </p>
      <p style={{ margin: "0 0 12px", fontSize: 11, color: "#4a6a3a" }}>
        Total geral: <span style={{ color: "#5a8a4a" }}>{totalHistorico.toLocaleString("pt-BR")} ha</span>
      </p>

      {Object.entries(resumoFazendaHistorico)
        .sort((a, b) => b[1].total - a[1].total)
        .map(([faz, d]) => {
          const aberto = fazendaAberta === faz;
          const nome = faz.replace(" JHS", "");
          return (
            <div key={faz} style={{ marginBottom: 6, border: "1px solid #1a3a0a", borderRadius: 8, overflow: "hidden" }}>
              <button
                onClick={() => toggle(faz)}
                style={{
                  width: "100%", background: aberto ? "#1a2e0f" : "transparent",
                  border: "none", cursor: "pointer", fontFamily: "inherit",
                  padding: "9px 12px", display: "flex", justifyContent: "space-between", alignItems: "center",
                }}
              >
                <span style={{ fontSize: 12, color: "#8aaa6a" }}>
                  🏡 {nome}<span style={{ color: "#3a5a2a", fontSize: 10 }}> JHS</span>
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, color: "#5a7a4a", fontVariantNumeric: "tabular-nums" }}>
                    {d.total.toLocaleString("pt-BR")} ha
                  </span>
                  <span style={{ fontSize: 12, color: "#3a5a2a" }}>{aberto ? "▲" : "▼"}</span>
                </div>
              </button>

              {aberto && (
                <div style={{ padding: "4px 12px 10px" }}>
                  {Object.entries(d.culturas).sort((a, b) => b[1] - a[1]).map(([cult, ha]) => (
                    <div key={cult} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "5px 8px", marginBottom: 4,
                      background: `${CULTURA_COLORS[cult] || "#c8a84b"}0d`,
                      borderRadius: 6,
                    }}>
                      <span style={{ fontSize: 12, color: "#6a8a5a" }}>{CULTURA_ICONS[cult]} {cult}</span>
                      <span style={{ fontSize: 12, color: CULTURA_COLORS[cult] || "#5a7a4a", fontVariantNumeric: "tabular-nums" }}>
                        {ha.toLocaleString("pt-BR")} ha
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}

// ── App principal ────────────────────────────────────────────────────────────
export default function ColheitaApp() {
  const [registros, setRegistros] = useState(initialRegistros);
  const [aba, setAba] = useState("registrar");
  const anoAtual = new Date().getFullYear();
  const [anoResumo, setAnoResumo] = useState(anoAtual);
  const [abaHistoricoAno, setAbaHistoricoAno] = useState(anoAtual);
  const [form, setForm] = useState({
    data: new Date().toISOString().split("T")[0],
    fazenda: FAZENDAS_FIXAS[0],
    pivoModo: "lista",
    pivo: "",
    pivoLivre: "",
    cultura: "Soja",
    hectares: "",
  });
  const [editando, setEditando] = useState(null);
  const [mensagem, setMensagem] = useState(null);
  const [filtroFazenda, setFiltroFazenda] = useState("");

  const anosDisponiveis = useMemo(() => {
    const s = new Set(registros.map((r) => parseInt(r.data.split("-")[0])));
    return [...s].sort((a, b) => b - a);
  }, [registros]);

  const registrosAno = useMemo(() =>
    registros.filter((r) => parseInt(r.data.split("-")[0]) === anoResumo),
    [registros, anoResumo]
  );

  const resumoPorCulturaAno = useMemo(() => {
    const m = {};
    for (const r of registrosAno) m[r.cultura] = (m[r.cultura] || 0) + r.hectares;
    return m;
  }, [registrosAno]);

  const resumoPorFazendaAno = useMemo(() => {
    const m = {};
    for (const r of registrosAno) {
      if (!m[r.fazenda]) m[r.fazenda] = { total: 0, culturas: {} };
      m[r.fazenda].total += r.hectares;
      m[r.fazenda].culturas[r.cultura] = (m[r.fazenda].culturas[r.cultura] || 0) + r.hectares;
    }
    return m;
  }, [registrosAno]);

  const totalAno = useMemo(() => registrosAno.reduce((s, r) => s + r.hectares, 0), [registrosAno]);
  const totalHistorico = useMemo(() => registros.reduce((s, r) => s + r.hectares, 0), [registros]);

  const resumoCulturaHistorico = useMemo(() => {
    const m = {};
    for (const r of registros) m[r.cultura] = (m[r.cultura] || 0) + r.hectares;
    return m;
  }, [registros]);

  const resumoFazendaHistorico = useMemo(() => {
    const m = {};
    for (const r of registros) {
      if (!m[r.fazenda]) m[r.fazenda] = { total: 0, culturas: {} };
      m[r.fazenda].total += r.hectares;
      m[r.fazenda].culturas[r.cultura] = (m[r.fazenda].culturas[r.cultura] || 0) + r.hectares;
    }
    return m;
  }, [registros]);

  const registrosFiltrados = useMemo(() => {
    return [...registros]
      .filter((r) => {
        const ano = parseInt(r.data.split("-")[0]);
        return ano === abaHistoricoAno && (!filtroFazenda || r.fazenda === filtroFazenda);
      })
      .sort((a, b) => b.data.localeCompare(a.data));
  }, [registros, filtroFazenda, abaHistoricoAno]);

  const fmt = (d) => { const [y, m, dia] = d.split("-"); return `${dia}/${m}/${y}`; };

  const showMsg = (txt, tipo = "ok") => {
    setMensagem({ txt, tipo });
    setTimeout(() => setMensagem(null), 3000);
  };

  const salvar = () => {
    const pivoFinal = form.pivoModo === "lista" ? form.pivo : (form.pivoLivre || "").trim();
    if (!form.fazenda || !pivoFinal || !form.hectares || !form.data) {
      showMsg("Preencha todos os campos!", "erro"); return;
    }
    const ha = parseFloat(form.hectares);
    if (isNaN(ha) || ha <= 0) { showMsg("Hectares inválido!", "erro"); return; }
    const reg = { data: form.data, fazenda: form.fazenda, pivo: pivoFinal, cultura: form.cultura, hectares: ha };
    if (editando !== null) {
      setRegistros((prev) => prev.map((r) => r.id === editando ? { ...r, ...reg } : r));
      setEditando(null); showMsg("Registro atualizado!");
    } else {
      setRegistros((prev) => [...prev, { id: nextId++, ...reg }]);
      showMsg("Colheita registrada!");
    }
    setForm({ data: new Date().toISOString().split("T")[0], fazenda: FAZENDAS_FIXAS[0], pivoModo: "lista", pivo: "", pivoLivre: "", cultura: "Soja", hectares: "" });
  };

  const editar = (r) => {
    const isLista = PIVOS_OPCOES.includes(r.pivo);
    setForm({ data: r.data, fazenda: r.fazenda, pivoModo: isLista ? "lista" : "livre", pivo: isLista ? r.pivo : "", pivoLivre: isLista ? "" : r.pivo, cultura: r.cultura, hectares: String(r.hectares) });
    setEditando(r.id); setAba("registrar");
  };

  const excluir = (id) => { setRegistros((prev) => prev.filter((r) => r.id !== id)); showMsg("Excluído.", "aviso"); };
  const reset = () => {
    setEditando(null);
    setForm({ data: new Date().toISOString().split("T")[0], fazenda: FAZENDAS_FIXAS[0], pivoModo: "lista", pivo: "", pivoLivre: "", cultura: "Soja", hectares: "" });
  };

  return (
    <div style={{
      minHeight: "100dvh", width: "100%", maxWidth: "100vw",
      display: "flex", flexDirection: "column",
      background: "#0f1a0d", fontFamily: "'Georgia', serif", color: "#e8dfc0",
      overflow: "hidden",
    }}>

      {/* Header */}
      <div style={{
        background: "linear-gradient(180deg,#0a1208,#0f1a0d)",
        borderBottom: "1px solid #2a4a1a",
        padding: "env(safe-area-inset-top, 12px) 16px 0",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 12, marginBottom: 10 }}>
          <span style={{ fontSize: 22 }}>🌾</span>
          <div>
            <h1 style={{ margin: 0, fontSize: 17, fontWeight: "normal", letterSpacing: 2, color: "#c8a84b", textTransform: "uppercase" }}>
              Controle de Colheita
            </h1>
            <p style={{ margin: 0, fontSize: 9, color: "#6a8a5a", letterSpacing: 2, textTransform: "uppercase" }}>
              Gestão de Produção Agrícola
            </p>
          </div>
        </div>
        <div style={{ display: "flex" }}>
          {[{ id: "registrar", label: "Registrar" }, { id: "historico", label: "Histórico" }, { id: "resumo", label: "Resumo" }].map((t) => (
            <button key={t.id} onClick={() => setAba(t.id)} style={{
              flex: 1, padding: "9px 0",
              background: aba === t.id ? "#1e3a10" : "transparent",
              border: "none",
              borderTop: aba === t.id ? "2px solid #c8a84b" : "2px solid transparent",
              color: aba === t.id ? "#c8a84b" : "#6a8a5a",
              cursor: "pointer", fontSize: 12, letterSpacing: 1,
              textTransform: "uppercase", fontFamily: "inherit",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Toast */}
      {mensagem && (
        <div style={{
          position: "fixed", top: 72, left: 16, right: 16, zIndex: 999,
          background: mensagem.tipo === "erro" ? "#4a1010" : mensagem.tipo === "aviso" ? "#3a2a10" : "#1a3a10",
          border: `1px solid ${mensagem.tipo === "erro" ? "#8a2020" : mensagem.tipo === "aviso" ? "#8a6020" : "#3a8a20"}`,
          color: "#e8dfc0", padding: "10px 16px", borderRadius: 8,
          fontSize: 13, textAlign: "center", animation: "fadeIn 0.3s ease",
        }}>{mensagem.txt}</div>
      )}

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "14px 14px 32px", WebkitOverflowScrolling: "touch" }}>

        {/* ── REGISTRAR ── */}
        {aba === "registrar" && (
          <div style={{ background: "#141f0f", border: "1px solid #2a4a1a", borderRadius: 12, padding: "16px 14px" }}>
            <p style={{ margin: "0 0 14px", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#6a8a5a" }}>
              {editando ? "✏️ Editar Registro" : "➕ Nova Colheita"}
            </p>

            <Fld label="Data">
              <input type="date" value={form.data}
                onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))}
                style={IS} />
            </Fld>

            <Fld label="Fazenda">
              <select value={form.fazenda}
                onChange={(e) => setForm((f) => ({ ...f, fazenda: e.target.value }))}
                style={IS}>
                {FAZENDAS_FIXAS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </Fld>

            <Fld label="Pivô / Talhão">
              <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                {["lista", "livre"].map((m) => (
                  <button key={m} onClick={() => setForm((f) => ({ ...f, pivoModo: m }))} style={{
                    flex: 1, padding: "8px 0", fontSize: 10, letterSpacing: 1,
                    textTransform: "uppercase", fontFamily: "inherit",
                    background: form.pivoModo === m ? "#2a4a1a" : "transparent",
                    border: `1px solid ${form.pivoModo === m ? "#4a8a2a" : "#2a4a1a"}`,
                    color: form.pivoModo === m ? "#c8a84b" : "#6a8a5a",
                    borderRadius: 8, cursor: "pointer",
                  }}>
                    {m === "lista" ? "🔽 Selecionar" : "✏️ Digitar"}
                  </button>
                ))}
              </div>
              {form.pivoModo === "lista" ? (
                <select value={form.pivo}
                  onChange={(e) => setForm((f) => ({ ...f, pivo: e.target.value }))}
                  style={IS}>
                  <option value="">— Selecione —</option>
                  {PIVOS_OPCOES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              ) : (
                <input value={form.pivoLivre || ""} placeholder="Digite o pivô ou talhão"
                  onChange={(e) => setForm((f) => ({ ...f, pivoLivre: e.target.value }))}
                  style={IS} />
              )}
            </Fld>

            <Fld label="Cultura">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 5 }}>
                {CULTURAS.map((c) => (
                  <button key={c} onClick={() => setForm((f) => ({ ...f, cultura: c }))} style={{
                    padding: "8px 2px", borderRadius: 8, cursor: "pointer",
                    fontFamily: "inherit", fontSize: 9, letterSpacing: 0.3, textTransform: "uppercase",
                    background: form.cultura === c ? `${CULTURA_COLORS[c]}33` : "#0a1208",
                    border: `1px solid ${form.cultura === c ? CULTURA_COLORS[c] : "#2a4a1a"}`,
                    color: form.cultura === c ? CULTURA_COLORS[c] : "#6a8a5a",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                  }}>
                    <span style={{ fontSize: 17 }}>{CULTURA_ICONS[c]}</span>{c}
                  </button>
                ))}
              </div>
            </Fld>

            <Fld label="Hectares Colhidos">
              <input type="number" value={form.hectares} placeholder="0,00" min="0" step="0.01"
                onChange={(e) => setForm((f) => ({ ...f, hectares: e.target.value }))}
                style={{ ...IS, fontSize: 22, textAlign: "center", color: "#c8a84b", fontWeight: "bold" }} />
            </Fld>

            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button onClick={salvar} style={{
                flex: 1, background: "#c8a84b", color: "#0f1a0d", border: "none",
                padding: "14px", borderRadius: 10, fontSize: 13, letterSpacing: 2,
                textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit", fontWeight: "bold",
              }}>{editando ? "Salvar Alterações" : "Registrar Colheita"}</button>
              {editando && (
                <button onClick={reset} style={{
                  background: "transparent", color: "#6a8a5a", border: "1px solid #2a4a1a",
                  padding: "14px 16px", borderRadius: 10, fontSize: 16, cursor: "pointer",
                }}>✕</button>
              )}
            </div>
          </div>
        )}

        {/* ── HISTÓRICO ── */}
        {aba === "historico" && (
          <div>
            {/* Seletor de ano */}
            <div style={{ display: "flex", gap: 6, marginBottom: 10, overflowX: "auto", paddingBottom: 4 }}>
              {anosDisponiveis.map((a) => (
                <button key={a} onClick={() => setAbaHistoricoAno(a)} style={{
                  padding: "6px 16px", borderRadius: 20, cursor: "pointer",
                  fontFamily: "inherit", fontSize: 13, whiteSpace: "nowrap",
                  background: abaHistoricoAno === a ? "#c8a84b" : "#141f0f",
                  border: `1px solid ${abaHistoricoAno === a ? "#c8a84b" : "#2a4a1a"}`,
                  color: abaHistoricoAno === a ? "#0f1a0d" : "#6a8a5a",
                }}>{a}</button>
              ))}
            </div>

            <select value={filtroFazenda}
              onChange={(e) => setFiltroFazenda(e.target.value)}
              style={{ ...IS, marginBottom: 12, fontSize: 13 }}>
              <option value="">Todas as fazendas</option>
              {FAZENDAS_FIXAS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>

            {registrosFiltrados.length === 0 ? (
              <div style={{ textAlign: "center", padding: "50px 0", color: "#4a6a3a", fontSize: 14 }}>
                Nenhum registro em {abaHistoricoAno}.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {registrosFiltrados.map((r) => (
                  <div key={r.id} style={{
                    background: "#141f0f", border: "1px solid #2a4a1a",
                    borderLeft: `3px solid ${CULTURA_COLORS[r.cultura] || "#c8a84b"}`,
                    borderRadius: 10, padding: "12px 14px",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontSize: 11, color: "#8aaa7a", fontFamily: "monospace" }}>{fmt(r.data)}</div>
                        <div style={{ fontSize: 14, color: "#e8dfc0", marginTop: 2 }}>
                          {r.fazenda.replace(" JHS", "")}<span style={{ color: "#4a6a3a", fontSize: 11 }}> JHS</span>
                        </div>
                        <div style={{ fontSize: 12, color: "#6a8a5a", marginTop: 1 }}>
                          {r.pivo} · {CULTURA_ICONS[r.cultura]} {r.cultura}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 19, color: "#c8a84b", fontVariantNumeric: "tabular-nums" }}>
                          {r.hectares.toLocaleString("pt-BR")} ha
                        </div>
                        <div style={{ display: "flex", gap: 5, marginTop: 7, justifyContent: "flex-end" }}>
                          <button onClick={() => editar(r)} style={BS("#2a4a2a", "#6a8a5a")}>✏️</button>
                          <button onClick={() => excluir(r.id)} style={BS("#4a1a1a", "#aa5a5a")}>🗑</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── RESUMO ── */}
        {aba === "resumo" && (
          <div>
            {/* Seletor de ano */}
            <div style={{ display: "flex", gap: 6, marginBottom: 12, overflowX: "auto", paddingBottom: 4 }}>
              {anosDisponiveis.map((a) => (
                <button key={a} onClick={() => setAnoResumo(a)} style={{
                  padding: "6px 16px", borderRadius: 20, cursor: "pointer",
                  fontFamily: "inherit", fontSize: 13, whiteSpace: "nowrap",
                  background: anoResumo === a ? "#c8a84b" : "#141f0f",
                  border: `1px solid ${anoResumo === a ? "#c8a84b" : "#2a4a1a"}`,
                  color: anoResumo === a ? "#0f1a0d" : "#6a8a5a",
                }}>{a}</button>
              ))}
            </div>

            {/* Total do Ano */}
            <div style={{
              background: "linear-gradient(135deg,#1e3a10,#0f2008)",
              border: "1px solid #3a6a1a", borderRadius: 12,
              padding: "20px 16px", marginBottom: 14, textAlign: "center",
            }}>
              <p style={{ margin: "0 0 2px", fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#6a8a5a" }}>
                Total colhido em {anoResumo}
              </p>
              <p style={{ margin: 0, fontSize: 46, color: "#c8a84b", fontWeight: "bold", lineHeight: 1.1 }}>
                {totalAno.toLocaleString("pt-BR")}
                <span style={{ fontSize: 16, color: "#8aaa5a", marginLeft: 6 }}>ha</span>
              </p>
              <p style={{ margin: "5px 0 0", fontSize: 11, color: "#6a8a5a" }}>
                {registrosAno.length} registros · {Object.keys(resumoPorFazendaAno).length} fazendas
              </p>
              {anosDisponiveis.length > 1 && (
                <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px solid #1a3a0a" }}>
                  <p style={{ margin: 0, fontSize: 11, color: "#4a6a3a" }}>
                    Acumulado histórico:&nbsp;
                    <span style={{ color: "#5a7a4a" }}>{totalHistorico.toLocaleString("pt-BR")} ha</span>
                    &nbsp;· {anosDisponiveis.length} safras
                  </p>
                </div>
              )}
            </div>

            {/* Culturas do Ano */}
            <Sec title={`Culturas — ${anoResumo}`}>
              {CULTURAS.filter((c) => resumoPorCulturaAno[c]).length === 0 ? (
                <p style={{ color: "#4a6a3a", fontSize: 13, textAlign: "center", margin: "8px 0" }}>Sem dados neste ano.</p>
              ) : (
                <CulturaGrid
                  culturas={CULTURAS.filter((c) => resumoPorCulturaAno[c])}
                  resumoPorCulturaAno={resumoPorCulturaAno}
                  totalAno={totalAno}
                  registrosAno={registrosAno}
                />
              )}
            </Sec>

            {/* Fazendas do Ano — clicáveis */}
            <Sec title={`Fazendas — ${anoResumo}`}>
              {Object.keys(resumoPorFazendaAno).length === 0 ? (
                <p style={{ color: "#4a6a3a", fontSize: 13, textAlign: "center", margin: "8px 0" }}>Sem dados neste ano.</p>
              ) : (
                Object.entries(resumoPorFazendaAno)
                  .sort((a, b) => b[1].total - a[1].total)
                  .map(([fazenda, dados]) => (
                    <FazendaCard
                      key={fazenda}
                      fazenda={fazenda}
                      dados={dados}
                      totalRef={totalAno}
                      showPct={true}
                    />
                  ))
              )}
            </Sec>

            {/* Histórico Acumulado — fazendas clicáveis com culturas */}
            {anosDisponiveis.length > 0 && (
              <HistoricoAcumulado
                resumoFazendaHistorico={resumoFazendaHistorico}
                resumoCulturaHistorico={resumoCulturaHistorico}
                totalHistorico={totalHistorico}
              />
            )}
          </div>
        )}
      </div>

      <style>{`
        html, body { margin: 0; padding: 0; height: 100%; }
        input, select { outline: none; }
        input:focus, select:focus { border-color: #c8a84b !important; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(-6px) } to { opacity:1; transform:translateY(0) } }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #0f1a0d; }
        ::-webkit-scrollbar-thumb { background: #2a4a1a; border-radius: 2px; }
        input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.5); cursor: pointer; }
        * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
      `}</style>
    </div>
  );
}

const IS = {
  width: "100%", background: "#0a1208", border: "1px solid #2a4a1a",
  color: "#e8dfc0", padding: "11px 13px", borderRadius: 8,
  fontSize: 14, fontFamily: "'Georgia', serif", transition: "border-color 0.2s",
};

const BS = (bg, color) => ({
  background: bg, border: "none", color, cursor: "pointer",
  padding: "6px 9px", borderRadius: 6, fontSize: 13,
});

function Fld({ label, children }) {
  return (
    <div style={{ marginBottom: 13 }}>
      <label style={{ display: "block", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "#6a8a5a", marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Sec({ title, children }) {
  return (
    <div style={{ background: "#141f0f", border: "1px solid #2a4a1a", borderRadius: 12, padding: "13px", marginBottom: 14 }}>
      <p style={{ margin: "0 0 11px", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "#6a8a5a" }}>
        {title}
      </p>
      {children}
    </div>
  );
}
