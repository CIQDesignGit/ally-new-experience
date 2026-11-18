"use client"

import { PageShell } from "@/components/layout/page-shell"
import { PageFrame, PAGE_EDGE } from "@/components/layout/page-frame"
import { TopStrip, useViewer } from "@/components/nudge/top-strip"
import { AppDrawer } from "@/components/nudge/app-drawer"
import { AskBar, ChatProvider, ChatThread } from "@/components/nudge/chat/inline-chat"
import { BusinessOverviewView } from "@/components/business-overview/business-overview-view"

export default function BrandPerformancePage() {
  const { viewer, home } = useViewer("claire")
  return (
    <ChatProvider thread={{ where: "Business overview", home }}>
      <PageShell className="bg-slate-50">
        <PageFrame>
          <TopStrip
            className={PAGE_EDGE}
            person={viewer}
            home={home}
            crumbs={[{ label: "Home", href: home }, { label: "My dashboards" }, { label: "Business overview" }]}
          />
          <BusinessOverviewView />
          <ChatThread />
        </PageFrame>
        <AppDrawer home={home} />
        <AskBar />
      </PageShell>
    </ChatProvider>
  )
}