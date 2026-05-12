import { Link } from "react-router-dom";
import {
  PawPrint,
  CalendarCheck,
  Store,
  Scissors,
  ArrowRight,
  ShieldCheck,
  Star,
} from "lucide-react";

const features = [
  {
    icon: PawPrint,
    title: "Gestão de Pets",
    desc: "Cadastre e acompanhe histórico completo de todos os pets.",
    bg: "bg-[#1c46f3]/10",
    iconCls: "text-[#1c46f3]",
  },
  {
    icon: CalendarCheck,
    title: "Agendamentos",
    desc: "Visualize e gerencie atendimentos em tempo real.",
    bg: "bg-[#00bb69]/10",
    iconCls: "text-[#00bb69]",
  },
  {
    icon: Store,
    title: "Múltiplas Lojas",
    desc: "Controle todas as suas unidades em um só painel.",
    bg: "bg-[#ffd200]/20",
    iconCls: "text-yellow-600",
  },
  {
    icon: Scissors,
    title: "Catálogo de Serviços",
    desc: "Organize banho, tosa, consultas e muito mais.",
    bg: "bg-purple-100",
    iconCls: "text-purple-600",
  },
  {
    icon: ShieldCheck,
    title: "Controle de Acesso",
    desc: "Perfis separados para clientes e funcionários.",
    bg: "bg-rose-100",
    iconCls: "text-rose-600",
  },
  {
    icon: Star,
    title: "Fácil de usar",
    desc: "Interface limpa pensada para o dia a dia do petshop.",
    bg: "bg-orange-100",
    iconCls: "text-orange-500",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1c46f3] via-[#1840e0] to-[#00bb69] px-6 py-24 text-white">
        {/* Decoração */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/5" />
          <div className="absolute top-1/2 -left-24 h-72 w-72 rounded-full bg-white/5" />
          <div className="absolute -bottom-20 right-1/4 h-64 w-64 rounded-full bg-[#ffd200]/10" />
        </div>

        <div className="relative mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5">
            <PawPrint size={14} className="text-[#ffd200]" />
            <span className="text-xs font-semibold uppercase tracking-widest">Apex Petstore</span>
          </div>

          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
            A gestão completa<br />do seu petshop
          </h1>
          <p className="mt-5 text-lg text-white/75">
            Pets, agendamentos, lojas e serviços — tudo em um único lugar,
            para você focar no que importa.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#1c46f3] shadow-lg transition hover:shadow-xl hover:opacity-95"
            >
              Entrar na conta
              <ArrowRight size={15} />
            </Link>
            <Link
              to="/register"
              className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Criar cadastro
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Tudo que você precisa</h2>
          <p className="mt-2 text-sm text-gray-500">
            Uma plataforma completa para petshops de todos os tamanhos.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${f.bg}`}>
                <f.icon size={20} className={f.iconCls} />
              </div>
              <h3 className="font-semibold text-gray-900">{f.title}</h3>
              <p className="mt-1.5 text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-xl text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1c46f3]/10">
            <PawPrint size={22} className="text-[#1c46f3]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Pronto para começar?</h2>
          <p className="mt-2 text-sm text-gray-500">
            Crie sua conta gratuitamente e comece a gerenciar seu petshop hoje.
          </p>
          <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/register"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1c46f3] to-[#1840e0] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-[#1c46f3]/25 transition hover:opacity-90"
            >
              Criar conta gratuita
              <ArrowRight size={15} />
            </Link>
            <Link
              to="/login"
              className="rounded-xl border border-gray-200 bg-gray-50 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              Já tenho conta
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 bg-white px-6 py-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Apex Petstore. Todos os direitos reservados.
      </footer>
    </div>
  );
}
