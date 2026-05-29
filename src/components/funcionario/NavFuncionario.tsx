/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
	PawPrint,
	LayoutGrid,
	Scissors,
	Store,
	Users,
	Tag,
	CalendarCheck,
	User,
	LogIn,
	UserPlus,
	type LucideIcon,
} from "lucide-react";

type NavItem = { to: string; label: string; icon: LucideIcon };

const links: NavItem[] = [
	{ to: "/pets", label: "Pets", icon: PawPrint },
	{ to: "/categorias", label: "Categorias", icon: LayoutGrid },
	{ to: "/servicos", label: "Serviços", icon: Scissors },
	{ to: "/lojas", label: "Lojas", icon: Store },
	{ to: "/usuarios", label: "Usuários", icon: Users },
	{ to: "/tags", label: "Tags", icon: Tag },
	{ to: "/atendimentos", label: "Atendimentos", icon: CalendarCheck },
];

type Pill = {
	left: number;
	width: number;
	opacity: number;
};

export default function NavFuncionario() {
	const location = useLocation();

	const navRef = useRef<HTMLElement | null>(null);
	const itemRefs = useRef<Record<string, HTMLElement | null>>({});

	const [isLogged, setIsLogged] = useState(() => {
		return !!localStorage.getItem("token");
	});

	const [hoveredPath, setHoveredPath] = useState<string | null>(null);

	const [pill, setPill] = useState<Pill>({
		left: 0,
		width: 0,
		opacity: 0,
	});

	const visibleLinks = useMemo((): NavItem[] => {
		if (isLogged) {
			return [...links, { to: "/perfil", label: "Perfil", icon: User }];
		}

		return [
			{ to: "/login", label: "Login", icon: LogIn },
			{ to: "/register", label: "Cadastro", icon: UserPlus },
		];
	}, [isLogged]);

	function movePillTo(path: string) {
		const nav = navRef.current;
		const item = itemRefs.current[path];

		if (!nav || !item) return;

		const navRect = nav.getBoundingClientRect();
		const itemRect = item.getBoundingClientRect();

		setPill({
			left: itemRect.left - navRect.left,
			width: itemRect.width,
			opacity: 1,
		});
	}

	function movePillToActive() {
		const activeItem = visibleLinks.find((link) => link.to === location.pathname);

		if (activeItem) {
			movePillTo(activeItem.to);
			return;
		}

		setPill((prev) => ({
			...prev,
			opacity: 0,
		}));
	}

	useEffect(() => {
		setIsLogged(!!localStorage.getItem("token"));
	}, [location.pathname]);

	useEffect(() => {
		requestAnimationFrame(() => {
			movePillToActive();
		});
	}, [location.pathname, isLogged, visibleLinks]);

	return (
		<header className="sticky top-0 z-50 border-b border-gray-200 bg-white/85 shadow-sm backdrop-blur-xl">
			<div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 sm:py-3">
				<NavLink to="/" className="flex items-center">
					<img src="/logo_apex.png" alt="Apex Petstore" className="h-8 w-auto sm:h-9" />
				</NavLink>

				<nav
					ref={navRef}
					onMouseLeave={() => {
						setHoveredPath(null);
						movePillToActive();
					}}
					className="relative flex items-center gap-0.5 rounded-full border border-gray-200 bg-white/90 p-1 shadow-sm sm:gap-1"
				>
					<div
						className="pointer-events-none absolute top-1 bottom-1 rounded-full bg-linear-to-r from-[#1c46f3] to-[#00bb69] shadow-[0_10px_26px_rgba(28,70,243,0.28)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
						style={{
							left: pill.left,
							width: pill.width,
							opacity: pill.opacity,
						}}
					/>

					{visibleLinks.map((link) => {
						const isActive = location.pathname === link.to;
						const isPillHere = hoveredPath ? hoveredPath === link.to : isActive;

						return (
							<NavLink
								key={link.to}
								to={link.to}
								ref={(el) => {
									itemRefs.current[link.to] = el;
								}}
								onMouseEnter={() => {
									setHoveredPath(link.to);
									movePillTo(link.to);
								}}
								className={`
									relative z-10 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold
									transition-all duration-300 hover:scale-[1.03]
									sm:px-4 sm:py-2 sm:text-sm
									${
										isPillHere
											? "text-white"
											: isActive
												? "text-[#1c46f3]"
												: "text-gray-700 hover:text-[#1c46f3]"
									}
								`}
							>
								<link.icon size={13} className="sm:hidden" />
								<link.icon size={14} className="hidden sm:block" />
								{link.label}
							</NavLink>
						);
					})}
				</nav>
			</div>
		</header>
	);
}
