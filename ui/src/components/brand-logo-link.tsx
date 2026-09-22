import { Link, useLocation } from "@tanstack/react-router";
import { Copy, Download, ExternalLink, Image } from "lucide-react";
import { type MouseEvent, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import {
  BRAND_LOGO_SRC,
  collectBrandIcons,
  copyLogoImage,
  downloadAsset,
  filenameFromHref,
  primaryFavicon,
} from "@/lib/brand";

type MenuPoint = {
  x: number;
  y: number;
};

export function BrandLogoLink({
  appName,
  className,
  imageClassName,
  nameClassName,
}: {
  appName: string;
  className: string;
  imageClassName: string;
  nameClassName?: string;
}) {
  const location = useLocation();
  const triggerRef = useRef<HTMLAnchorElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState<MenuPoint | null>(null);

  const logoHref =
    triggerRef.current?.querySelector("img")?.currentSrc ||
    triggerRef.current?.querySelector("img")?.src ||
    new URL(BRAND_LOGO_SRC, location.href).href;

  useLayoutEffect(() => {
    const node = menuRef.current;
    if (!node || !menu) return;
    const rect = node.getBoundingClientRect();
    const margin = 8;
    const nextX = Math.max(margin, Math.min(menu.x, window.innerWidth - rect.width - margin));
    const nextY = Math.max(margin, Math.min(menu.y, window.innerHeight - rect.height - margin));
    if (nextX !== menu.x || nextY !== menu.y) setMenu({ x: nextX, y: nextY });
  }, [menu]);

  useEffect(() => {
    if (!menu) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenu(null);
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (menuRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      setMenu(null);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [menu]);

  const openMenu = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    setMenu({
      x: event.clientX || rect.left,
      y: event.clientY || rect.bottom,
    });
  };

  const close = () => setMenu(null);

  const copyLogo = () => {
    void copyLogoImage(logoHref).then(
      () => toast.success("Logo copied"),
      () => toast.error("Could not copy logo"),
    );
    close();
  };

  const downloadLogo = () => {
    downloadAsset(logoHref, filenameFromHref(logoHref, "logo.png"));
    close();
  };

  const downloadFavicon = () => {
    const links = Array.from(
      document.querySelectorAll<HTMLLinkElement>('link[rel="icon"], link[rel="shortcut icon"]'),
    ).map((link) => ({ href: link.getAttribute("href") ?? "", rel: link.rel }));
    const href = primaryFavicon(collectBrandIcons(links, null));
    downloadAsset(href, filenameFromHref(href, "favicon.ico"));
    close();
  };

  return (
    <>
      <Link ref={triggerRef} to="/" className={className} onContextMenu={openMenu}>
        <img src={BRAND_LOGO_SRC} alt={appName} className={imageClassName} />
        <span className={nameClassName}>{appName}</span>
      </Link>
      {menu &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label="Brand assets"
            style={{ top: menu.y, left: menu.x }}
            className="fixed z-50 w-64 rounded-lg border border-border bg-popover p-1.5 text-popover-foreground shadow-md"
            onContextMenu={(event) => event.preventDefault()}
          >
            <Link
              to="/brand"
              target="_blank"
              rel="noopener noreferrer"
              role="menuitem"
              className={menuItemClass}
              onClick={close}
            >
              <ExternalLink />
              Open brand in new tab
            </Link>
            <a
              href={logoHref}
              target="_blank"
              rel="noopener noreferrer"
              role="menuitem"
              className={menuItemClass}
              onClick={close}
            >
              <Image />
              Open logo in new tab
            </a>
            <button type="button" role="menuitem" className={menuItemClass} onClick={copyLogo}>
              <Copy />
              Copy logo
            </button>
            <button type="button" role="menuitem" className={menuItemClass} onClick={downloadLogo}>
              <Download />
              Download logo
            </button>
            <button
              type="button"
              role="menuitem"
              className={menuItemClass}
              onClick={downloadFavicon}
            >
              <Download />
              Download favicon
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}

const menuItemClass =
  "flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-sm outline-none transition-colors hover:bg-accent focus:bg-accent [&_svg]:size-4 [&_svg]:text-muted-foreground";
