import React, { useMemo } from 'react';
import { marked } from 'marked';

// Configuração padrão do Marked para GitHub Flavored Markdown e quebra de linhas
marked.setOptions({
  gfm: true,
  breaks: true,
});

/**
 * Custom renderer para segurança e usabilidade (abrir links em nova aba com rel seguro)
 */
const renderer = new marked.Renderer();

renderer.link = function (token) {
  // marked v12+ passa um objeto token ou (href, title, text)
  let href = '';
  let title = '';
  let text = '';

  if (typeof token === 'object' && token !== null) {
    href = token.href || '';
    title = token.title || '';
    text = token.text || token.tokens ? this.parser.parseInline(token.tokens) : '';
  } else {
    href = arguments[0] || '';
    title = arguments[1] || '';
    text = arguments[2] || '';
  }

  // Previne links javascript: perigosos
  const cleanHref = href.trim().toLowerCase().startsWith('javascript:') ? '#' : href;
  const titleAttr = title ? ` title="${title}"` : '';

  return `<a href="${cleanHref}" target="_blank" rel="noopener noreferrer"${titleAttr}>${text}</a>`;
};

/**
 * FormattedMessage Component
 * 
 * Converte mensagens formatadas em Markdown em HTML seguro e estilizado.
 *
 * @param {Object} props
 * @param {string} [props.content] - Texto ou Markdown a ser formatado
 * @param {string} [props.text] - Alternativa para a prop content
 * @param {React.ReactNode} [props.children] - Conteúdo alternativo passado como children
 * @param {string} [props.className] - Classes CSS adicionais
 */
export default function FormattedMessage({ content, text, children, className = '' }) {
  const rawText = content ?? text ?? (typeof children === 'string' ? children : '') ?? '';

  const parsedHtml = useMemo(() => {
    if (!rawText || typeof rawText !== 'string') {
      return '';
    }

    try {
      const parsed = marked.parse(rawText, { renderer, breaks: true, gfm: true });
      return typeof parsed === 'string' ? parsed : '';
    } catch (err) {
      console.error('Erro ao converter Markdown:', err);
      return rawText;
    }
  }, [rawText]);

  return (
    <div
      className={`markdown-body ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: parsedHtml }}
    />
  );
}

export { FormattedMessage };
