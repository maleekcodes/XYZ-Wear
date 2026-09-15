import type { ReactNode } from "react"
import type { PortableTextComponents } from "@portabletext/react"

export const introParagraphClassName =
  "text-pretty text-xl md:text-2xl font-light leading-relaxed text-deepBlack"

export function keepIntroPhrasesTogether(content: ReactNode): ReactNode {
  if (typeof content !== "string") return content

  const phrase = "choose restraint"
  const parts = content.split(phrase)

  if (parts.length === 1) return content

  return parts.flatMap((part, index) =>
    index === parts.length - 1
      ? [part]
      : [
          part,
          <span key={`choose-restraint-${index}`} className="whitespace-nowrap">
            {phrase}
          </span>,
        ]
  )
}

export const introPortableTextComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className={introParagraphClassName}>
        {Array.isArray(children)
          ? children.map((child) => keepIntroPhrasesTogether(child))
          : keepIntroPhrasesTogether(children)}
      </p>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-medium text-deepBlack">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({
      value,
      children,
    }: {
      value?: { href?: string }
      children?: ReactNode
    }) => (
      <a
        href={value?.href}
        className="underline decoration-neutral-300 underline-offset-4 hover:decoration-deepBlack"
      >
        {children}
      </a>
    ),
  },
}
