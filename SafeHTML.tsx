import DOMPurify from "dompurify";

interface SafeHTMLProps {
  html: string;
  className?: string;
}

export function SafeHTML({ html, className = "" }: SafeHTMLProps) {
  const sanitizedHTML = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "b", "i", "u", "a", "ul", "ol", "li", "h1", "h2", "h3", "h4", "h5", "h6"],
    ALLOWED_ATTR: ["href", "target", "rel", "class"],
  });

  return (
    <div
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
    />
  );
}
