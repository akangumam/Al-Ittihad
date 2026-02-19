import { redirect } from 'next/navigation'

interface Props {
  params: Promise<{ lang: string; path?: string[] }>
}

export default async function PenetapanNominalCatchAll({ params }: Props) {
  const { lang, path } = await params
  const subPath = path ? `/${path.join('/')}` : ''

  redirect(`/${lang}/spp/penetapan-nominal${subPath}`)
}
