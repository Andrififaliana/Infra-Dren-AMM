'use client';

import { motion } from 'motion/react';
import {
  Target, Heart, Mail, Phone, MapPin,
  GraduationCap, Building2, Users, Quote,
  ArrowUpRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const stats = [
  {
    icon: GraduationCap,
    label: 'Établissements recensés',
    desc: 'Suivi complet des infrastructures',
    iconBg: 'bg-primary/5 text-primary',
  },
  {
    icon: Building2,
    label: 'Infrastructures suivies',
    desc: 'Bâtiments, salles & équipements',
    iconBg: 'bg-primary/10 text-primary/80',
  },
  {
    icon: MapPin,
    label: 'Région AMM',
    desc: "Amoron'i Mania, Madagascar",
    iconBg: 'bg-primary/15 text-primary/70',
  },
];

export default function AProposPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative text-center"
      >
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
          À propos de notre plateforme
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground leading-relaxed">
          Découvrez la mission, les remerciements et l&apos;équipe derrière
          la plateforme de suivi des infrastructures scolaires.
        </p>
        <Separator className="mx-auto mt-6 max-w-[100px]" />
      </motion.div>

      {/* ── Mission ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-20"
      >
        <Card className="overflow-hidden border-0 shadow-md">
          <div className="grid md:grid-cols-5">
            {/* Left accent panel */}
            <div className="relative flex items-center justify-center bg-primary p-10 md:col-span-2">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.12)_0%,transparent_60%)]" />
              <div className="relative text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                  <Target className="h-10 w-10 text-white" />
                </div>
                <h2 className="mt-5 text-2xl font-bold text-white">Notre Mission</h2>
                <p className="mt-1 text-sm text-primary-foreground/70">Objectif & vision</p>
              </div>
            </div>
            {/* Right content */}
            <div className="flex flex-col justify-center p-8 md:col-span-3 md:p-10">
              <p className="text-lg leading-relaxed text-muted-foreground">
                Notre plateforme a été conçue dans le but de représenter de manière
                précise les infrastructures scolaires au sein de la{' '}
                <strong className="text-primary">DREN Amoron&apos;i Mania</strong>.
              </p>
              <div className="mt-6 border-l-4 border-primary/20 bg-primary/5 pl-5 py-4 rounded-r-lg">
                <p className="text-lg leading-relaxed text-muted-foreground">
                  L&apos;objectif est de fournir des données claires et détaillées sur
                  l&apos;état des bâtiments, des salles de classe et des ressources
                  disponibles, afin de faciliter la prise de décision et d&apos;améliorer
                  les conditions d&apos;apprentissage pour les élèves.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ── Remerciements ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-12"
      >
        <Card className="relative overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-primary/40 via-primary to-primary/60" />

          <div className="p-8 md:p-10">
            <div className="flex items-start gap-5">
              <div className="hidden shrink-0 sm:flex">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/5">
                  <Heart className="h-7 w-7 text-primary" />
                </div>
              </div>

              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground">Remerciements</h2>

                <div className="relative mt-6 rounded-xl bg-gradient-to-br from-primary/5 to-background border p-6">
                  <Quote className="absolute -left-2 -top-2 h-8 w-8 text-primary/20" />
                  <p className="relative pl-4 text-lg leading-relaxed text-muted-foreground">
                    Nous tenons à exprimer notre profonde gratitude à la direction de la{' '}
                    <strong className="text-primary">DREN Amoron&apos;i Mania</strong>,
                    et plus particulièrement à{' '}
                    <strong className="text-primary">
                      Monsieur MIHARIMANANIRINA AINA GERALD
                    </strong>
                    , pour leur soutien précieux et leur collaboration indispensable à
                    la réalisation de ce projet.
                  </p>
                </div>

                <div className="mt-5 flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="inline-block h-px flex-1 bg-border" />
                  <span className="flex items-center gap-1 text-primary">
                    <Users className="h-3.5 w-3.5" /> Direction DREN AMM
                  </span>
                  <span className="inline-block h-px flex-1 bg-border" />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ── Stats ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-12 grid gap-5 grid-cols-1 sm:grid-cols-3"
      >
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="p-6">
                <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${item.iconBg}`}>
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="font-bold text-foreground">{item.label}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* ── Contact ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-12"
      >
        <Card className="overflow-hidden border-0 shadow-md">
          <div className="grid md:grid-cols-5">
            <div className="relative flex items-center justify-center bg-foreground p-8 md:col-span-2">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.06)_0%,transparent_60%)]" />
              <div className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-background/10 backdrop-blur-sm">
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-white">Contact administrateur</h2>
                <p className="mt-1 text-sm text-muted-foreground/60">Pour toute question ou suggestion</p>
              </div>
            </div>
            <div className="flex flex-col justify-center gap-4 p-8 md:col-span-3">
              <a
                href="mailto:miharimananirina@gmail.com"
                className="group flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:border-primary/20 hover:bg-primary/5 hover:shadow-sm"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</p>
                  <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    miharimananirina@gmail.com
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 transition-colors group-hover:text-primary" />
              </a>

              <a
                href="tel:+261346403428"
                className="group flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:border-primary/20 hover:bg-primary/5 hover:shadow-sm"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Téléphone</p>
                  <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    034 64 034 28
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 transition-colors group-hover:text-primary" />
              </a>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
