import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboardData } from "../hooks/useDashboardData";
import { useDashboardStats } from "../hooks/useDashboardStats";
import DashboardHeader from "../components/DashboardHeader";
import StatsBar from "../components/StatsBar";
import MissionGrid from "../components/MissionGrid";
import EmptyState from "../components/EmptyState";
import MissionModal from "../components/MissionModal";
import AnalyticsSection from "../components/charts/AnalyticsSection";

export default function DashboardPage() {
  const { missions, setMissions, rapports, perimetres, stats, loading, error, retry } = useDashboardData();
  const { stats: analyticsStats, loading: analyticsLoading, error: analyticsError } = useDashboardStats();
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  if (loading) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        fontSize: "1rem",
        color: "var(--muted)",
        gap: "0.75rem",
      }}>
        <span style={{ fontSize: "1.5rem", animation: "spin 1s linear infinite" }}>⟳</span>
        Chargement…
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        gap: "1rem",
        textAlign: "center",
        padding: "2rem",
      }}>
        <p style={{ color: "var(--danger, #dc2626)", fontSize: "0.95rem", margin: 0 }}>{error}</p>
        <button className="btn-primary" onClick={retry}>Réessayer</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <DashboardHeader onNewMission={() => setShowModal(true)} />

      {missions.length > 0 && (
        <StatsBar
          total={stats.total}
          enCours={stats.enCours}
          terminees={stats.terminees}
          scoreMoyen={stats.scoreMoyen}
        />
      )}

      <div style={{ padding: "1.5rem 2.5rem" }}>
        {missions.length === 0 ? (
          <EmptyState onNewMission={() => setShowModal(true)} />
        ) : (
          <>
            <AnalyticsSection
              stats={analyticsStats}
              loading={analyticsLoading}
              error={analyticsError}
              missions={missions}
            />
            <MissionGrid
              missions={missions}
              rapports={rapports}
              perimetres={perimetres}
              onMissionClick={(id) => {
                localStorage.setItem("iso_audit_mission_id", id);
                navigate("/audit/");
              }}
              onMissionsChange={setMissions}
            />
          </>
        )}
      </div>

      {showModal && (
        <MissionModal
          mode="create"
          onClose={() => setShowModal(false)}
          onSave={(saved) => {
            setMissions(prev => [saved, ...prev]);
            setShowModal(false);
            retry(); // recharger depuis l'API pour avoir date_fin
          }}
        />
      )}
    </div>
  );
}
