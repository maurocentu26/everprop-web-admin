"use client";

import { useEffect, useState } from "react";
import MetricCard from "@/components/admin/MetricCard";
import { Building2, Users, TrendingUp, DollarSign } from "lucide-react";
import { leads as sampleLeads, properties as sampleProperties } from "@/data/admin-sample";
import { loadLeadList, loadPropertyList } from "@/lib/admin-storage";

type Props = {
  companyId?: string;
};

export default function DashboardStats({ companyId = "c1" }: Props) {
  const [counts, setCounts] = useState({
    properties: sampleProperties.filter((property) => property.companyId === companyId).length,
    leads: sampleLeads.filter((lead) => lead.companyId === companyId).length,
    closingLeads: sampleLeads.filter((lead) => lead.companyId === companyId && lead.stage === "closing").length,
  });

  useEffect(() => {
    const currentProperties = loadPropertyList(sampleProperties, companyId);
    const currentLeads = loadLeadList(sampleLeads, companyId);

    setCounts({
      properties: currentProperties.length,
      leads: currentLeads.length,
      closingLeads: currentLeads.filter((lead) => lead.stage === "closing").length,
    });
  }, [companyId]);

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Propiedades activas"
        value={counts.properties}
        delta="+12"
        Icon={Building2}
      />
      <MetricCard
        title="Consultas activas"
        value={counts.leads}
        delta="+4"
        Icon={Users}
      />
      <MetricCard
        title="Cierres del mes"
        value={counts.closingLeads}
        delta="-2"
        Icon={TrendingUp}
      />
      <MetricCard
        title="Ingresos del mes"
        value="$412K"
        delta="+18%"
        Icon={DollarSign}
      />
    </div>
  );
}
