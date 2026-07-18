'use client';

import { motion } from 'motion/react';
import {
  Info,
  Target,
  Heart,
  Mail,
  Phone,
  MapPin,
  Quote,
  GraduationCap,
  Building2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function AProposPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="mb-4 inline-flex rounded-2xl bg-green-50 p-3">
          <Info className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900">À propos de notre plateforme</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
          Découvrez la mission et l&apos;équipe derrière InfraDren AMM
        </p>
      </motion.div>

      {/* Mission Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="mt-16"
      >
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className="grid md:grid-cols-5">
            <div className="flex items-center justify-center bg-gradient-to-br from-green-600 to-green-700 p-8 md:col-span-2">
              <div className="text-center">
                <Target className="mx-auto h-16 w-16 text-white/80" />
                <h2 className="mt-4 text-2xl font-bold text-white">Notre Mission</h2>
              </div>
            </div>
            <div className="p-8 md:col-span-3">
              <p className="text-lg leading-relaxed text-gray-700">
                Notre plateforme a été conçue dans le but de représenter de manière précise
                les infrastructures scolaires au sein de la{' '}
                <strong className="text-green-700">DREN Amoron&apos;i Mania</strong>.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-gray-700">
                L&apos;objectif est de fournir des données claires et détaillées sur l&apos;état
                des bâtiments, des salles de classe et des ressources disponibles, afin de
                faciliter la prise de décision et d&apos;améliorer les conditions d&apos;apprentissage
                pour les élèves.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Remerciements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="mt-10"
      >
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg">
          <div className="absolute -right-8 -top-8 text-amber-100">
            <Quote className="h-40 w-40" />
          </div>
          <CardContent className="relative p-8">
            <div className="flex items-start gap-4">
              <div className="hidden shrink-0 rounded-2xl bg-amber-100 p-3 sm:block">
                <Heart className="h-8 w-8 text-amber-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Remerciements</h3>
                <p className="mt-4 text-lg leading-relaxed text-gray-700">
                  Nous tenons à exprimer notre profonde gratitude à la direction de la{' '}
                  <strong className="text-amber-700">DREN Amoron&apos;i Mania</strong>, et plus
                  particulièrement à{' '}
                  <strong className="text-amber-700">
                    Monsieur MIHARIMANANIRINA AINA GERALD
                  </strong>
                  , pour leur soutien précieux et leur collaboration indispensable à la
                  réalisation de ce projet.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats / Chiffres clés */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="mt-10 grid gap-6 sm:grid-cols-3"
      >
        {[
          {
            icon: GraduationCap,
            label: 'Établissements recensés',
            desc: 'Suivi complet des infrastructures scolaires',
            color: 'text-blue-600 bg-blue-50',
          },
          {
            icon: Building2,
            label: 'Infrastructures suivies',
            desc: 'Bâtiments, salles & équipements',
            color: 'text-green-600 bg-green-50',
          },
          {
            icon: MapPin,
            label: 'Région AMM',
            desc: 'Amoron&apos;i Mania, Madagascar',
            color: 'text-purple-600 bg-purple-50',
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="border-0 bg-white shadow-md">
              <CardContent className="p-6 text-center">
                <div className={`mx-auto mb-4 inline-flex rounded-2xl p-3 ${item.color}`}>
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="font-bold text-gray-900">{item.label}</h3>
                <p className="mt-1 text-sm text-gray-500">{item.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Contact Admin */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="mt-10"
      >
        <Card className="border-0 bg-white shadow-lg">
          <div className="grid md:grid-cols-5">
            <div className="flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 p-8 md:col-span-2">
              <div className="text-center">
                <Mail className="mx-auto h-12 w-12 text-white/80" />
                <h2 className="mt-3 text-xl font-bold text-white">
                  Contacts de l&apos;Administrateur
                </h2>
              </div>
            </div>
            <div className="flex items-center p-8 md:col-span-3">
              <div className="w-full space-y-4">
                <a
                  href="mailto:miharimananirina@gmail.com"
                  className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4 transition-colors hover:border-green-200 hover:bg-green-50"
                >
                  <div className="rounded-xl bg-green-100 p-2.5">
                    <Mail className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-semibold text-gray-900">miharimananirina@gmail.com</p>
                  </div>
                </a>
                <a
                  href="tel:+261346403428"
                  className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4 transition-colors hover:border-green-200 hover:bg-green-50"
                >
                  <div className="rounded-xl bg-green-100 p-2.5">
                    <Phone className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Téléphone</p>
                    <p className="font-semibold text-gray-900">034 64 034 28</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
