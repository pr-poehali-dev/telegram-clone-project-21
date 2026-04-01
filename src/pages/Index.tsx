import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const services = [
  {
    num: "01",
    title: "Стратегия",
    desc: "Исследуем рынок, находим точки роста и строим чёткую дорожную карту для достижения ваших целей.",
    icon: "Compass",
  },
  {
    num: "02",
    title: "Дизайн",
    desc: "Создаём визуальные системы, которые запоминаются. От айдентики до готового продукта.",
    icon: "Layers",
  },
  {
    num: "03",
    title: "Разработка",
    desc: "Пишем чистый, быстрый код. Веб-приложения, лендинги, интеграции — любой масштаб.",
    icon: "Code2",
  },
  {
    num: "04",
    title: "Продвижение",
    desc: "SEO, контент, таргет — системный подход к привлечению аудитории и конверсии.",
    icon: "TrendingUp",
  },
];

const works = [
  { title: "Архитектурное бюро", tag: "Брендинг · Сайт", year: "2024" },
  { title: "Ресторан «Сезон»", tag: "Айдентика · Меню", year: "2024" },
  { title: "IT-стартап Orion", tag: "UX · Разработка", year: "2023" },
];

const stats = [
  { value: "87", label: "Проектов завершено" },
  { value: "12", label: "Лет на рынке" },
  { value: "4.9", label: "Рейтинг клиентов" },
];

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return { ref, inView };
}

export default function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const aboutSection = useInView();
  const servicesSection = useInView();
  const worksSection = useInView();
  const statsSection = useInView();
  const ctaSection = useInView();

  return (
    <div
      className="min-h-screen bg-obsidian text-white font-golos overflow-x-hidden"
      style={{ background: "linear-gradient(160deg, #0D0D0D 0%, #131210 100%)" }}
    >
      {/* ── NAV ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "bg-obsidian/90 backdrop-blur-md border-b border-obsidian-border" : ""
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <a href="#" className="font-cormorant text-2xl font-light tracking-[0.2em] text-white">
            СТУ<span className="text-gold">ДИЯ</span>
          </a>
          <div className="hidden md:flex items-center gap-10">
            {["Услуги", "Работы", "О нас", "Контакт"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm tracking-widest uppercase text-white/50 hover:text-gold transition-colors duration-300"
              >
                {item}
              </a>
            ))}
          </div>
          <button
            className="md:hidden text-white/70 hover:text-gold transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Icon name={menuOpen ? "X" : "Menu"} size={22} />
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-obsidian-soft border-t border-obsidian-border px-6 py-6 flex flex-col gap-5">
            {["Услуги", "Работы", "О нас", "Контакт"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm tracking-widest uppercase text-white/50 hover:text-gold transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {item}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col justify-center px-6 pt-24 pb-16 overflow-hidden">
        {/* Background geometry */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-[0.04]"
            style={{ background: "radial-gradient(circle, #C9A84C 0%, transparent 70%)", transform: "translate(30%, -30%)" }}
          />
          <div
            className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.03]"
            style={{ background: "radial-gradient(circle, #C9A84C 0%, transparent 70%)", transform: "translate(-30%, 30%)" }}
          />
          {/* Vertical lines */}
          <div className="absolute top-0 bottom-0 left-[8%] w-px bg-white/[0.04]" />
          <div className="absolute top-0 bottom-0 right-[8%] w-px bg-white/[0.04]" />
        </div>

        <div className="max-w-6xl mx-auto w-full relative">
          {/* Label */}
          <div
            className="flex items-center gap-3 mb-10 opacity-0 animate-fade-up"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="w-8 h-px bg-gold" />
            <span className="text-gold text-xs tracking-[0.35em] uppercase font-golos">Творческая студия · Москва</span>
          </div>

          {/* Main headline */}
          <h1
            className="font-cormorant text-[clamp(52px,9vw,120px)] leading-[0.95] font-light opacity-0 animate-fade-up"
            style={{ animationDelay: "0.25s" }}
          >
            Создаём
            <br />
            <em className="italic text-gold">смыслы</em>
            <br />
            и образы
          </h1>

          {/* Subtext */}
          <p
            className="mt-8 max-w-md text-white/40 text-lg leading-relaxed font-golos opacity-0 animate-fade-up"
            style={{ animationDelay: "0.45s" }}
          >
            Брендинг, дизайн и цифровые продукты для компаний, которым важна репутация.
          </p>

          {/* CTAs */}
          <div
            className="mt-12 flex flex-wrap items-center gap-5 opacity-0 animate-fade-up"
            style={{ animationDelay: "0.6s" }}
          >
            <button className="group relative px-8 py-4 bg-gold text-obsidian text-sm font-golos font-600 tracking-wider uppercase overflow-hidden transition-all duration-300 hover:bg-gold-light">
              <span className="relative z-10">Начать проект</span>
            </button>
            <button className="flex items-center gap-3 text-sm tracking-wider uppercase text-white/40 hover:text-gold transition-colors duration-300 group">
              Наши работы
              <Icon name="ArrowRight" size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Scroll hint */}
          <div
            className="absolute bottom-[-60px] right-0 flex flex-col items-center gap-3 opacity-0 animate-fade-in"
            style={{ animationDelay: "1.2s" }}
          >
            <span className="text-white/20 text-[10px] tracking-[0.4em] uppercase rotate-90 origin-center mb-6">Scroll</span>
            <div className="w-px h-16 bg-gradient-to-b from-white/20 to-transparent" />
          </div>
        </div>

        {/* Hero bottom line */}
        <div
          className="absolute bottom-0 left-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent opacity-0 animate-line-grow"
          style={{ animationDelay: "0.8s", width: "100%" }}
        />
      </section>

      {/* ── STATS ── */}
      <section id="о нас" ref={statsSection.ref} className="py-16 border-y border-obsidian-border/50">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-3 gap-px bg-obsidian-border/30">
          {stats.map((s, i) => (
            <div
              key={i}
              className={`bg-obsidian px-8 py-10 text-center transition-all duration-700 ${
                statsSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: `${i * 0.15}s` }}
            >
              <div className="font-cormorant text-5xl font-light text-gold leading-none mb-2">
                {s.value}
              </div>
              <div className="text-white/30 text-xs tracking-widest uppercase">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="о нас" ref={aboutSection.ref} className="py-28 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div
            className={`transition-all duration-900 ${
              aboutSection.inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"
            }`}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-px bg-gold" />
              <span className="text-gold text-xs tracking-[0.35em] uppercase">О студии</span>
            </div>
            <h2 className="font-cormorant text-[clamp(38px,5vw,64px)] font-light leading-tight mb-8">
              Мы верим,<br />
              что <em className="italic text-gold">форма</em><br />
              следует смыслу
            </h2>
            <p className="text-white/40 leading-relaxed mb-6">
              Студия основана в 2012 году. За это время мы помогли брендам из России, Европы и Азии найти свой голос и стать заметными на своих рынках.
            </p>
            <p className="text-white/40 leading-relaxed">
              Мы небольшая команда — и это сознательный выбор. Каждый проект получает полное внимание партнёра студии от первого брифа до финального релиза.
            </p>
          </div>

          <div
            className={`relative transition-all duration-900 delay-200 ${
              aboutSection.inView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"
            }`}
          >
            <div className="relative aspect-[4/5] bg-obsidian-mid border border-obsidian-border overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80"
                alt="Студия"
                className="w-full h-full object-cover opacity-60 mix-blend-luminosity"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent" />
              {/* Gold frame accent */}
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-gold" />
              <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-gold" />
            </div>
            {/* Offset label */}
            <div className="absolute -bottom-6 -right-6 bg-gold px-5 py-3 hidden md:block">
              <span className="font-cormorant text-obsidian text-xl font-light italic">с 2012</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="услуги" ref={servicesSection.ref} className="py-28 px-6 bg-obsidian-soft">
        <div className="max-w-6xl mx-auto">
          <div
            className={`mb-16 transition-all duration-700 ${
              servicesSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-px bg-gold" />
              <span className="text-gold text-xs tracking-[0.35em] uppercase">Услуги</span>
            </div>
            <h2 className="font-cormorant text-[clamp(38px,5vw,64px)] font-light">
              Что мы делаем
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-px bg-obsidian-border/30">
            {services.map((s, i) => (
              <div
                key={i}
                className={`group bg-obsidian-soft p-10 border border-transparent hover:border-gold/20 transition-all duration-500 cursor-default ${
                  servicesSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-8">
                  <span className="font-cormorant text-gold/40 text-5xl font-light leading-none">
                    {s.num}
                  </span>
                  <div className="w-10 h-10 border border-obsidian-border group-hover:border-gold/40 flex items-center justify-center transition-colors duration-300">
                    <Icon name={s.icon} size={18} className="text-white/30 group-hover:text-gold transition-colors duration-300" />
                  </div>
                </div>
                <h3 className="font-cormorant text-2xl font-light mb-4 group-hover:text-gold transition-colors duration-300">
                  {s.title}
                </h3>
                <p className="text-white/35 text-sm leading-relaxed">{s.desc}</p>
                <div className="mt-8 w-0 h-px bg-gold group-hover:w-full transition-all duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WORKS ── */}
      <section id="работы" ref={worksSection.ref} className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div
            className={`mb-16 flex items-end justify-between transition-all duration-700 ${
              worksSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-px bg-gold" />
                <span className="text-gold text-xs tracking-[0.35em] uppercase">Портфолио</span>
              </div>
              <h2 className="font-cormorant text-[clamp(38px,5vw,64px)] font-light">
                Избранные<br />работы
              </h2>
            </div>
            <button className="hidden md:flex items-center gap-2 text-sm tracking-wider uppercase text-white/30 hover:text-gold transition-colors group">
              Все проекты
              <Icon name="ArrowRight" size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="space-y-px">
            {works.map((w, i) => (
              <div
                key={i}
                className={`group flex items-center justify-between px-8 py-7 border border-obsidian-border/40 hover:border-gold/30 hover:bg-obsidian-soft transition-all duration-400 cursor-pointer ${
                  worksSection.inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
                }`}
                style={{ transitionDelay: `${i * 0.12}s` }}
              >
                <div className="flex items-center gap-6">
                  <span className="font-cormorant text-gold/30 text-3xl font-light w-8">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-cormorant text-xl font-light group-hover:text-gold transition-colors duration-300">
                      {w.title}
                    </h3>
                    <p className="text-white/25 text-xs tracking-widest uppercase mt-1">{w.tag}</p>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <span className="text-white/20 text-sm font-cormorant">{w.year}</span>
                  <Icon
                    name="ArrowUpRight"
                    size={16}
                    className="text-white/15 group-hover:text-gold transition-colors duration-300"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="контакт" ref={ctaSection.ref} className="py-32 px-6 relative overflow-hidden">
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(201,168,76,0.05) 0%, transparent 70%)" }}
        />

        <div
          className={`max-w-3xl mx-auto text-center relative transition-all duration-900 ${
            ctaSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
        >
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-8 h-px bg-gold" />
            <span className="text-gold text-xs tracking-[0.35em] uppercase">Начните сегодня</span>
            <div className="w-8 h-px bg-gold" />
          </div>

          <h2 className="font-cormorant text-[clamp(44px,7vw,88px)] font-light leading-tight mb-6">
            Готовы обсудить
            <br />
            <em className="italic text-gold">ваш проект?</em>
          </h2>

          <p className="text-white/35 max-w-md mx-auto mb-12 leading-relaxed">
            Расскажите о задаче — мы ответим в течение рабочего дня и предложим варианты сотрудничества.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-10 py-4 bg-gold text-obsidian text-sm font-golos tracking-wider uppercase hover:bg-gold-light transition-colors duration-300">
              Написать нам
            </button>
            <button className="px-10 py-4 border border-obsidian-border text-white/50 text-sm tracking-wider uppercase hover:border-gold/50 hover:text-gold transition-all duration-300">
              +7 (495) 123-45-67
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-obsidian-border/50 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-cormorant text-xl font-light tracking-[0.2em] text-white/40">
            СТУ<span className="text-gold/50">ДИЯ</span>
          </span>
          <span className="text-white/20 text-xs tracking-widest uppercase">
            © 2024 · Все права защищены
          </span>
          <div className="flex items-center gap-6">
            {["Telegram", "Instagram", "Behance"].map((name) => (
              <a
                key={name}
                href="#"
                className="text-white/20 text-xs tracking-widest uppercase hover:text-gold transition-colors duration-300"
              >
                {name}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
