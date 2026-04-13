import React from 'react';
import { ThemeProvider } from 'styled-components';
import { defaultTheme } from './metamask/layout/theme.js';

// Import MetaMask components
import SiteHeader from './metamask/navigation/SiteHeader.jsx';
import SiteFooter from './metamask/navigation/SiteFooter.jsx';
import AnimatedFeatureSection from './metamask/animation/AnimatedFeatureSection.jsx';
import AnimatedCarousel from './metamask/animation/AnimatedCarousel.jsx';
import ContentCarousel from './metamask/animation/ContentCarousel.jsx';
import Accordion from './metamask/interactive/Accordion.jsx';
import CallToAction from './metamask/interactive/CallToAction.jsx';
import FullWidthBanner from './metamask/interactive/FullWidthBanner.jsx';

export default function LandingPage() {
  // Header navigation
  const headerMenus = [
    { title: "Projects", href: "#projects" },
    { title: "Stack", href: "#stack" },
    { title: "GitHub", href: "https://github.com/blueif16" },
  ];

  // Footer navigation
  const footerMenus = [
    {
      title: "Projects",
      items: [
        { title: "CloudMate", href: "https://github.com/blueif16/cloudmate" },
        { title: "GoDag", href: "https://github.com/blueif16/godag" },
      ],
    },
    {
      title: "Connect",
      items: [
        { title: "GitHub", href: "https://github.com/blueif16" },
        { title: "Twitter", href: "https://twitter.com/blueif16" },
      ],
    },
  ];

  // Infrastructure accordion items
  const infrastructureItems = [
    {
      question: "Claude Code + tmux",
      answer: "Orchestrating multiple Claude Code sessions in parallel across tmux panes. Each session works in isolated git worktrees for parallel development.",
      defaultOpen: true,
    },
    {
      question: "Git Worktrees",
      answer: "Multiple working directories from a single repo. Enables true parallel development — different branches, different features, same codebase.",
      defaultOpen: false,
    },
    {
      question: "MCP Servers",
      answer: "Model Context Protocol servers for extending Claude with custom tools, data sources, and integrations.",
      defaultOpen: false,
    },
    {
      question: "Obsidian",
      answer: "Second brain. Knowledge management, project notes, and documentation synced via git. Context lives here.",
      defaultOpen: false,
    },
  ];

  // Infrastructure tools for marquee
  const infrastructureTools = [
    { title: "Claude Code", image: "/assets/icons/icon-claude.svg" },
    { title: "tmux", image: "/assets/icons/icon-tmux.svg" },
    { title: "Git Worktrees", image: "/assets/icons/icon-git-worktree.svg" },
    { title: "MCP Servers", image: "/assets/icons/icon-mcp.svg" },
    { title: "Obsidian", image: "/assets/icons/icon-obsidian.svg" },
    { title: "Neovim", image: "/assets/icons/icon-neovim.svg" },
    { title: "FastAPI", image: "/assets/icons/icon-fastapi.svg" },
    { title: "React", image: "/assets/icons/icon-react-tool.svg" },
  ];

  // CloudMate project for carousel
  const cloudmateProject = [
    {
      title: "CloudMate",
      description: `
        <p>Tmux-based orchestration for parallel Claude Code sessions across git worktrees. Automated PR creation, code review pipelines, and multi-session coordination.</p>
        <p style="margin-top: 12px; font-size: 14px; color: #059669;">Claude Code • tmux • Git Worktrees • Automation</p>
      `,
      image: "/assets/icons/icon-cloudmate.svg",
    },
  ];

  return (
    <ThemeProvider theme={defaultTheme}>
      {/* Header */}
      <SiteHeader
        logo={{ logo: "/logo.svg" }}
        menus={headerMenus}
        isSticky={true}
        showDarkModeToggle={true}
      />

      {/* Hero */}
      <div style={{ position: 'relative', padding: '120px 0 80px 0', textAlign: 'center' }}>
        {/* 3D Fox placeholder */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{
            width: '200px',
            height: '200px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            borderRadius: '50%',
            boxShadow: '0 8px 32px rgba(5, 150, 105, 0.3)'
          }}>
            <span style={{ fontSize: '80px', color: 'white' }}>🦊</span>
          </div>
        </div>

        {/* Floating icons */}
        <div style={{ position: 'absolute', top: '140px', left: 'calc(50% - 300px)', width: '32px', height: '32px' }}>
          <img src="/assets/icons/icon-terminal.svg" alt="Terminal" style={{ width: '100%', height: '100%' }} />
        </div>
        <div style={{ position: 'absolute', top: '140px', right: 'calc(50% - 300px)', width: '32px', height: '32px' }}>
          <img src="/assets/icons/icon-code.svg" alt="Code" style={{ width: '100%', height: '100%' }} />
        </div>
        <div style={{ position: 'absolute', top: '280px', left: 'calc(50% - 300px)', width: '32px', height: '32px' }}>
          <img src="/assets/icons/icon-neural.svg" alt="Neural" style={{ width: '100%', height: '100%' }} />
        </div>
        <div style={{ position: 'absolute', top: '280px', right: 'calc(50% - 300px)', width: '32px', height: '32px' }}>
          <img src="/assets/icons/icon-rocket.svg" alt="Rocket" style={{ width: '100%', height: '100%' }} />
        </div>

        {/* Hero text */}
        <AnimatedFeatureSection
          headline="<h1>Building dev tools and products</h1>"
          description="<p style='font-size: 20px;'>Creative builder. Learning every day.</p>"
          contentAlignment="center"
          animation={true}
          sectionPadding="0"
          headlineMarginTop0={true}
        />
      </div>

      {/* Tech Stack Intro */}
      <CallToAction
        headline="Four areas. One workflow."
        description="Agent orchestration, full-stack AI, model fine-tuning, and infrastructure."
        ctas={[{ text: "Explore the stack ↓", href: "#stack" }]}
        layout="center"
        backgroundColor="default"
        sectionPadding="60px 0"
      />

      {/* Agent Orchestration */}
      <div id="stack" style={{ padding: '80px 0' }}>
        <AnimatedFeatureSection
          headline="<h2>Agent Orchestration</h2>"
          description={`
            <div style="display: flex; gap: 24px; align-items: center; margin-bottom: 24px;">
              <img src="/assets/icons/icon-langgraph.svg" alt="LangGraph" style="width: 64px; height: 64px;" />
              <img src="/assets/icons/icon-multiagent.svg" alt="Multi-agent" style="width: 64px; height: 64px;" />
              <img src="/assets/icons/icon-dag.svg" alt="DAG" style="width: 64px; height: 64px;" />
            </div>
            <p>Multi-agent systems with LangGraph. Designing workflows where agents coordinate, execute tasks in parallel, and handle complex pipelines.</p>
          `}
          contentAlignment="left"
          animation={true}
          sectionPadding="0"
        />
      </div>

      {/* Full-Stack AI */}
      <AnimatedFeatureSection
        headline="<h2>Full-Stack AI Integration</h2>"
        description={`
          <div style="display: flex; gap: 16px; align-items: center; justify-content: center; margin-bottom: 24px; flex-wrap: wrap;">
            <img src="/assets/icons/icon-react.svg" alt="React" style="width: 48px; height: 48px;" />
            <span style="font-size: 24px; color: #059669;">→</span>
            <img src="/assets/icons/icon-copilotkit.svg" alt="CopilotKit" style="width: 48px; height: 48px;" />
            <span style="font-size: 24px; color: #059669;">→</span>
            <img src="/assets/icons/icon-api.svg" alt="API" style="width: 48px; height: 48px;" />
            <span style="font-size: 24px; color: #059669;">→</span>
            <img src="/assets/icons/icon-agent.svg" alt="Agent" style="width: 48px; height: 48px;" />
            <span style="font-size: 24px; color: #059669;">→</span>
            <img src="/assets/icons/icon-result.svg" alt="Result" style="width: 48px; height: 48px;" />
          </div>
          <p>CopilotKit for real-time AI interactions on the frontend. FastAPI and Node.js backends that orchestrate agentic workflows.</p>
        `}
        contentAlignment="center"
        animation={true}
        backgroundColor="gray"
        sectionPadding="80px 0"
      />

      {/* Model Fine-Tuning */}
      <AnimatedFeatureSection
        headline="<h2>Model Fine-Tuning</h2>"
        description={`
          <div style="display: flex; gap: 40px; align-items: center;">
            <div style="flex: 1;">
              <p>Training models, not just prompting them. Supervised fine-tuning (SFT), reinforcement learning (RL), and Unsloth for efficient training on custom datasets.</p>
            </div>
            <div style="flex-shrink: 0;">
              <img src="/assets/icons/icon-training-curve.svg" alt="Training Curve" style="width: 200px; height: 150px;" />
            </div>
          </div>
        `}
        contentAlignment="right"
        animation={true}
        sectionPadding="80px 0"
      />

      {/* Infrastructure Marquee */}
      <div style={{ padding: '80px 0', background: 'var(--bg-subtle)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '40px', fontFamily: 'var(--font-heading)', fontSize: '2.5rem' }}>
          Infrastructure & Tools
        </h2>
        <ContentCarousel
          items={infrastructureTools}
          autoplay={true}
          speed={3000}
          infinite={true}
          arrows={false}
        />
      </div>

      {/* Infrastructure Accordion */}
      <div style={{ padding: '80px 0' }}>
        <Accordion items={infrastructureItems} backgroundColor="default" />
      </div>

      {/* Interstitial */}
      <FullWidthBanner
        headline="Learning by building. Building by learning."
        description=""
        ctas={[]}
        sectionPadding="120px 0"
        backgroundImage="/assets/pattern-geometric.svg"
      />

      {/* Projects Intro */}
      <CallToAction
        headline="Projects"
        description="Tools for the AI-native development workflow."
        ctas={[{ text: "See what I've built ↓", href: "#projects" }]}
        layout="center"
        backgroundColor="default"
        sectionPadding="60px 0"
      />

      {/* CloudMate Showcase */}
      <div id="projects" style={{ padding: '80px 0' }}>
        <AnimatedCarousel
          headline=""
          description=""
          featureSliderItems={cloudmateProject}
          slideShow={false}
          animation={true}
          sectionPadding="0"
        />
      </div>

      {/* CloudMate Visual */}
      <FullWidthBanner
        headline="Parallel development, automated workflows"
        description=""
        ctas={[]}
        sectionPadding="100px 0"
        backgroundImage="/assets/cloudmate-hero.png"
      />

      {/* More Projects Teaser */}
      <CallToAction
        headline="More coming soon"
        description="GoDag, AccessVision, OpenClaw — building in public."
        ctas={[{ text: "Follow on GitHub", href: "https://github.com/blueif16", newTab: true }]}
        layout="center"
        backgroundColor="gray"
        sectionPadding="80px 0"
      />

      {/* Final CTA */}
      <FullWidthBanner
        headline="Always learning. Always building."
        description="Exploring agent architectures, full-stack AI, and model training."
        ctas={[{ text: "View on GitHub", href: "https://github.com/blueif16", variant: "primary", newTab: true }]}
        sectionPadding="100px 0"
      />

      {/* Footer */}
      <SiteFooter menus={footerMenus} copyright="© 2026 Shiran. Built with Astro." />
    </ThemeProvider>
  );
}
