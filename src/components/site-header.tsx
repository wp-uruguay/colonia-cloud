'use client';

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";

import { mainNav } from "@/data/site";
import GlassSurface from "@/components/GlassSurface";

type NavItem = {
  title: string;
  href: string;
  children?: { title: string; href: string; description?: string }[];
};

function DropdownMenu({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-sm font-semibold uppercase text-slate-600 transition-colors hover:text-slate-900"
      >
        {item.title}
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-3 w-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-1/2 top-full mt-3 w-64 -translate-x-1/2 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-black/10">
          {item.children!.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-4 py-3 transition hover:bg-slate-50"
            >
              <span className="block text-xs font-semibold uppercase text-slate-800">
                {child.title}
              </span>
              {child.description && (
                <span className="mt-0.5 block text-xs font-normal normal-case text-slate-500">
                  {child.description}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function MobileNavItem({
  item,
  onClose,
}: {
  item: NavItem;
  onClose: () => void;
}) {
  const [open, setOpen] = useState(false);

  if (!item.children) {
    return (
      <Link
        href={item.href}
        className="rounded-xl px-4 py-3 text-xs font-semibold uppercase text-slate-700 transition hover:bg-black/5"
        onClick={onClose}
      >
        {item.title}
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-xs font-semibold uppercase text-slate-700 transition hover:bg-black/5"
      >
        {item.title}
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-3 w-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="ml-4 mt-1 grid gap-1 border-l border-slate-200 pl-3">
          {item.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              onClick={onClose}
              className="block rounded-xl px-3 py-2 text-xs font-semibold uppercase text-slate-600 transition hover:bg-black/5"
            >
              {child.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuLayer, setMenuLayer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / document.documentElement.scrollHeight) * 100;
      setScrolled(scrollPercent > 4);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
    return () => document.body.classList.remove("menu-open");
  }, [menuOpen]);

  useEffect(() => {
    setMenuLayer(document.getElementById("menu-layer"));
  }, []);

  return (
    <header className="sticky top-[15px] z-50 bg-transparent px-4 sm:top-4 sm:px-6">
      <GlassSurface
        width="100%"
        borderRadius={16}
        blur={12}
        opacity={0.95}
        displace={0.3}
        brightness={98}
        height="auto"
        className="mx-auto w-full max-w-6xl"
      >
        <div className="flex w-full items-center justify-between px-6 py-4">
          <Link href="/" className="group flex items-center gap-3">
            <Image
              src="/images/brand/Logo.png"
              alt="Colonia Cloud"
              width={140}
              height={36}
              className="hidden h-9 w-auto md:block"
              priority
            />
            <Image
              src="/images/brand/Iso.png"
              alt="Colonia Cloud"
              width={36}
              height={36}
              className="h-9 w-9 md:hidden"
              priority
            />
            <span
              className="text-white md:sr-only"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              <span className="block text-sm font-extrabold leading-none">
                COLONIA
              </span>
              <span className="block text-sm font-semibold leading-none">
                CLOUD
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-4 rounded-[15px] bg-white/80 px-5 py-2 backdrop-blur-sm sm:gap-6 sm:px-6">
            <nav className="hidden items-center gap-6 md:flex">
              {(mainNav as NavItem[]).map((item) =>
                item.children ? (
                  <DropdownMenu key={item.href} item={item} />
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-sm font-semibold uppercase transition-colors ${scrolled ? "text-slate-600 hover:text-slate-900" : "text-slate-600 hover:text-slate-900"}`}
                  >
                    {item.title}
                  </Link>
                )
              )}
            </nav>

            <div className="flex items-center gap-3">
              <Link href="/contacto" className="btn-primary md:hidden">
                Contacto
              </Link>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] bg-black/90 text-white transition md:hidden"
                aria-label={menuOpen ? "Cerrar menu" : "Abrir menu"}
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                onClick={() => setMenuOpen((open) => !open)}
              >
                <span className="sr-only">Menu</span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  {menuOpen ? (
                    <>
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </>
                  ) : (
                    <>
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <line x1="3" y1="12" x2="21" y2="12" />
                      <line x1="3" y1="18" x2="21" y2="18" />
                    </>
                  )}
                </svg>
              </button>
              <Link
                href="/contacto"
                className="btn-primary hidden md:inline-flex"
              >
                Agendar llamada
              </Link>
            </div>
          </div>
        </div>
      </GlassSurface>

      {menuLayer &&
        createPortal(
          <div
            className={`fixed inset-0 z-[60] md:hidden ${
              menuOpen ? "pointer-events-auto" : "pointer-events-none"
            }`}
            aria-hidden={!menuOpen}
          >
            <div
              className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${
                menuOpen ? "opacity-100" : "opacity-0"
              }`}
              onClick={() => setMenuOpen(false)}
            />
            <aside
              id="mobile-menu"
              className={`absolute right-0 top-0 h-full w-72 max-w-[80vw] rounded-l-3xl bg-white/95 p-6 pt-10 text-slate-900 shadow-2xl ring-1 ring-black/10 backdrop-blur-xl transition-transform duration-300 ${
                menuOpen ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
                <span className="text-xs font-semibold uppercase text-slate-500">
                  Menu
                </span>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/90 text-white"
                  aria-label="Cerrar menu"
                  onClick={() => setMenuOpen(false)}
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <nav className="mt-5 grid gap-3">
                {(mainNav as NavItem[]).map((item) => (
                  <MobileNavItem
                    key={item.href}
                    item={item}
                    onClose={() => setMenuOpen(false)}
                  />
                ))}
              </nav>
              <Link
                href="/contacto"
                className="btn-primary mt-6 w-full"
                onClick={() => setMenuOpen(false)}
              >
                Contacto
              </Link>
            </aside>
          </div>,
          menuLayer
        )}
    </header>
  );
}
