import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apexTheme } from "../lib/theme";
import { getLojaById } from "../services/lojaService";
import type { Loja } from "../types/loja";

export default function LojaPage() {
	const c = apexTheme.colors;
	const { id } = useParams();

	function formatMoney(value: number) {
		return new Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: "BRL",
		}).format(value);
	}

	const [loja, setLoja] = useState<Loja | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		async function loadLoja() {
			if (!id) {
				setError("ID da loja não informado.");
				setLoading(false);
				return;
			}

			try {
				setLoading(true);
				const data = await getLojaById(Number(id));
				setLoja(data);
				setError("");
			} catch (err) {
				console.error(err);
				setError("Erro ao carregar os dados da loja.");
			} finally {
				setLoading(false);
			}
		}

		loadLoja();
	}, [id]);

	return (
		<div className={`min-h-screen ${c.bg} px-4 py-10 ${c.text}`}>
			<div className="mx-auto max-w-5xl space-y-8">
				<header className={`rounded-3xl border ${c.border} ${c.card} p-8`}>
					<p className={`text-sm ${c.textMuted}`}>Detalhe da loja</p>
					<h1 className="mt-2 text-4xl font-bold">Loja</h1>
					<p className={`mt-3 ${c.textSoft}`}>
						Visualize as informações completas da unidade selecionada.
					</p>
				</header>

				<div>
					<Link
						to="/lojas"
						className={`rounded-xl border ${c.border} px-4 py-2 text-sm font-medium ${c.text} transition hover:${c.bgSoft}`}
					>
						Voltar para lista de lojas
					</Link>
				</div>

				{loading ? (
					<div className={`rounded-2xl border ${c.border} ${c.card} p-6 ${c.textSoft}`}>
						Carregando loja...
					</div>
				) : error ? (
					<div className="rounded-2xl border border-red-800 bg-red-950 px-4 py-3 text-red-300">
						{error}
					</div>
				) : loja ? (
					<section className={`space-y-6 rounded-2xl border ${c.border} ${c.card} p-6 shadow-lg`}>
						<h2 className={`text-2xl font-bold ${c.text}`}>{loja.nome}</h2>
						<div className="mt-4 grid gap-4 md:grid-cols-2">
							<p className={`text-sm ${c.textSoft}`}>
								<span className="font-semibold">ID:</span> {loja.id}
							</p>
							<p className={`text-sm ${c.textSoft}`}>
								<span className="font-semibold">CNPJ:</span> {loja.cnpj}
							</p>
							<p className={`text-sm ${c.textSoft}`}>
								<span className="font-semibold">Telefone:</span> {loja.telefone}
							</p>
							<p className={`text-sm ${c.textSoft}`}>
								<span className="font-semibold">Email:</span> {loja.email}
							</p>
							<p className={`text-sm ${c.textSoft}`}>
								<span className="font-semibold">CEP:</span> {loja.end_cep}
							</p>
							<p className={`text-sm ${c.textSoft}`}>
								<span className="font-semibold">Cidade/UF:</span> {loja.end_cidade}/{loja.end_estado}
							</p>
							<p className={`text-sm ${c.textSoft}`}>
								<span className="font-semibold">Bairro:</span> {loja.end_bairro}
							</p>
							<p className={`text-sm ${c.textSoft}`}>
								<span className="font-semibold">Número:</span> {loja.end_numero}
							</p>
						</div>

						<p className={`mt-4 text-sm ${c.textSoft}`}>
							<span className="font-semibold">Rua:</span> {loja.end_rua}
						</p>

						<div className={`rounded-2xl border ${c.border} ${c.cardSoft} p-5`}>
							<h3 className={`text-xl font-bold ${c.text}`}>Funcionários</h3>

							{loja.funcionarios.length === 0 ? (
								<p className={`mt-2 text-sm ${c.textSoft}`}>
									Nenhum funcionário vinculado a esta loja.
								</p>
							) : (
								<div className="mt-4 grid gap-3 md:grid-cols-2">
									{loja.funcionarios.map((funcionario) => (
										<div
											key={`${funcionario.usuario_id}-${funcionario.matricula}`}
											className={`rounded-xl border ${c.border} ${c.card} p-4`}
										>
											<p className={`text-sm ${c.textSoft}`}>
												<span className="font-semibold">Nome:</span> {funcionario.nome}
											</p>
											<p className={`text-sm ${c.textSoft}`}>
												<span className="font-semibold">Usuário ID:</span> {funcionario.usuario_id}
											</p>
											<p className={`text-sm ${c.textSoft}`}>
												<span className="font-semibold">Matrícula:</span> {funcionario.matricula}
											</p>
											<p className={`text-sm ${c.textSoft}`}>
												<span className="font-semibold">Cargo:</span> {funcionario.cargo}
											</p>
											<p className={`text-sm ${c.textSoft}`}>
												<span className="font-semibold">Salário:</span> {formatMoney(funcionario.salario)}
											</p>
											<p className={`text-sm ${c.textSoft}`}>
												<span className="font-semibold">Contratação:</span> {funcionario.data_contratacao}
											</p>
										</div>
									))}
								</div>
							)}
						</div>
					</section>
				) : (
					<div className={`rounded-2xl border ${c.border} ${c.card} p-6 ${c.textSoft}`}>
						Loja não encontrada.
					</div>
				)}
			</div>
		</div>
	);
}
