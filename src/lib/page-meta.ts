import { useEffect } from "react";

type PageMeta = { title: string; description?: string; ogDescription?: string; robots?: string };

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function usePageMeta({ title, description, ogDescription, robots }: PageMeta) {
  useEffect(() => {
    document.title = title;
    setMeta("property", "og:title", title);
    if (description) setMeta("name", "description", description);
    if (ogDescription) setMeta("property", "og:description", ogDescription);
    if (robots) setMeta("name", "robots", robots);
    return () => {
      if (robots) document.head.querySelector('meta[name="robots"]')?.remove();
    };
  }, [title, description, ogDescription, robots]);
}
