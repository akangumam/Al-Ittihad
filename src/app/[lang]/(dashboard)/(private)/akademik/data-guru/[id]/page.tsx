import TeacherDetail from '@/views/akademik/TeacherDetail'

export default async function DetailGuruPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return <TeacherDetail teacherId={id} />
}
