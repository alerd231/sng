import { Helmet } from 'react-helmet-async'

interface SeoProps {
  title: string
  description: string
  canonicalPath?: string
}

export const Seo = ({ title, description, canonicalPath = '/' }: SeoProps) => {
  const fullTitle = `${title} | СтройНефтеГаз`
  const canonical = `https://stroineftegaz.ru${canonicalPath}`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      <link rel="canonical" href={canonical} />
    </Helmet>
  )
}
