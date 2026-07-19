'use client';

import { motion } from 'motion/react';
import {
  Target,
  Heart,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Building2,
  Users,
  Quote,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const stats = [
  {
    icon: GraduationCap,
    label: 'Établissements recensés',
    desc: 'Suivi complet des infrastructures',
    color: 'from-green-50 to-green-100',
    iconBg: 'bg-green-100 text-green-700',
  },
  {
    icon: Building2,
    label: 'Infrastructures suivies',
    desc: 'Bâtiments, salles & équipements',
    color: 'from-green-100 to-green-200',
    iconBg: 'bg-green-200 text-green-800',
  },
  {
    icon: MapPin,
    label: 'Région AMM',
    desc: "Amoron'i Mania, Madagascar",
    color: 'from-green-200 to-green-50',
    iconBg: 'bg-green-50 text-green-600',
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

        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          À propos de notre plateforme
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-gray-500 leading-relaxed">
          Découvrez la mission, les remerciements et l&apos;équipe derrière
          la plateforme de suivi des infrastructures scolaires.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <span className="h-1 w-16 rounded-full bg-green-500" />
          <span className="h-1 w-4 rounded-full bg-green-300" />
        </div>
      </motion.div>

      {/* ── Mission ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-20"
      >
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
          <div className="grid md:grid-cols-5">
            {/* Left accent panel */}
            <div className="relative flex items-center justify-center bg-green-600 p-10 md:col-span-2">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.12)_0%,transparent_60%)]" />
              <div className="relative text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                  <Target className="h-10 w-10 text-white" />
                </div>
                <h2 className="mt-5 text-2xl font-bold text-white">Notre Mission</h2>
                <p className="mt-1 text-sm text-green-200">Objectif & vision</p>
              </div>
            </div>
            {/* Right content */}
            <div className="flex flex-col justify-center p-8 md:col-span-3 md:p-10">
              <p className="text-lg leading-relaxed text-gray-700">
                Notre plateforme a été conçue dans le but de représenter de manière
                précise les infrastructures scolaires au sein de la{' '}
                <strong className="text-green-700">DREN Amoron&apos;i Mania</strong>.
              </p>
              <div className="mt-6 border-l-4 border-green-200 bg-green-50/50 pl-5 py-4 rounded-r-lg">
                <p className="text-lg leading-relaxed text-gray-700">
                  L&apos;objectif est de fournir des données claires et détaillées sur
                  l&apos;état des bâtiments, des salles de classe et des ressources
                  disponibles, afin de faciliter la prise de décision et d&apos;améliorer
                  les conditions d&apos;apprentissage pour les élèves.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Remerciements ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-12"
      >
        <div className="relative overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm">
          {/* Decorative top accent */}
          <div className="h-1.5 w-full bg-gradient-to-r from-green-400 via-green-500 to-green-600" />

          <div className="p-8 md:p-10">
            <div className="flex items-start gap-5">
              {/* Icon */}
              <div className="hidden shrink-0 sm:flex">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50">
                  <Heart className="h-7 w-7 text-green-500" />
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-gray-900">Remerciements</h2>
                  <div className="hidden sm:flex items-center gap-1">
                    <span className="h-0.5 w-8 rounded-full bg-green-300" />
                    <span className="h-0.5 w-3 rounded-full bg-green-200" />
                  </div>
                </div>

                {/* Quote card */}
                <div className="relative mt-6 rounded-xl bg-gradient-to-br from-green-50 to-white border border-green-100 p-6">
                  <Quote className="absolute -left-2 -top-2 h-8 w-8 text-green-200" />
                  <p className="relative pl-4 text-lg leading-relaxed text-gray-700">
                    Nous tenons à exprimer notre profonde gratitude à la direction de la{' '}
                    <strong className="text-green-700">DREN Amoron&apos;i Mania</strong>,
                    et plus particulièrement à{' '}
                    <strong className="text-green-700">
                      Monsieur MIHARIMANANIRINA AINA GERALD
                    </strong>
                    , pour leur soutien précieux et leur collaboration indispensable à
                    la réalisation de ce projet.
                  </p>
                </div>

                {/* Signature line */}
                <div className="mt-5 flex items-center gap-3 text-sm text-gray-400">
                  <span className="inline-block h-px flex-1 bg-gray-200" />
                  <span className="flex items-center gap-1 text-green-600">
                    <Users className="h-3.5 w-3.5" /> Direction DREN AMM
                  </span>
                  <span className="inline-block h-px flex-1 bg-gray-200" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Stats ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-12 grid gap-5 sm:grid-cols-3"
      >
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className={`rounded-2xl bg-gradient-to-br ${item.color} border border-gray-100/50 p-6 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`}
            >
              <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${item.iconBg}`}>
                <Icon className="h-7 w-7" />
              </div>
              <h3 className="font-bold text-gray-900">{item.label}</h3>
              <p className="mt-1 text-sm text-gray-500">{item.desc}</p>
            </div>
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
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="grid md:grid-cols-5">
            {/* Left panel */}
            <div className="relative flex items-center justify-center bg-gray-900 p-8 md:col-span-2">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.06)_0%,transparent_60%)]" />
              <div className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-white">
                  Contact administrateur
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  Pour toute question ou suggestion
                </p>
              </div>
            </div>
            {/* Right content */}
            <div className="flex flex-col justify-center gap-4 p-8 md:col-span-3">
              <a
                href="mailto:miharimananirina@gmail.com"
                className="group flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50/80 p-4 transition-all hover:border-green-200 hover:bg-green-50 hover:shadow-sm"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-600 transition-colors group-hover:bg-green-200">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    Email
                  </p>
                  <p className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                    miharimananirina@gmail.com
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-300 transition-colors group-hover:text-green-500" />
              </a>

              <a
                href="tel:+261346403428"
                className="group flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50/80 p-4 transition-all hover:border-green-200 hover:bg-green-50 hover:shadow-sm"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-600 transition-colors group-hover:bg-green-200">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    Téléphone
                  </p>
                  <p className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                    034 64 034 28
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-300 transition-colors group-hover:text-green-500" />
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
