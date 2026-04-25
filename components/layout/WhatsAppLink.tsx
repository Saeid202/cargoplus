"use client";

const WA_NUMBER = "14168825015";
const WA_TEXT = "Hi%20CargoPlus%2C%20I%20have%20a%20question.";

export function WhatsAppLink({ className, style, children }: {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    window.location.href = `whatsapp://send?phone=${WA_NUMBER}&text=${WA_TEXT}`;
    setTimeout(() => {
      window.open(`https://wa.me/${WA_NUMBER}?text=${WA_TEXT}`, "_blank");
    }, 1000);
  }

  return (
    <a
      href={`whatsapp://send?phone=${WA_NUMBER}&text=${WA_TEXT}`}
      onClick={handleClick}
      aria-label="Chat with us on WhatsApp"
      className={className}
      style={style}
    >
      {children}
    </a>
  );
}
