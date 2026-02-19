import StudentDetail from '@/views/akademik/StudentDetail'

export default async function DetailSiswaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return <StudentDetail studentId={id} />
}
