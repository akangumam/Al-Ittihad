import EditTeacherForm from '@/views/akademik/EditTeacherForm'

export default async function EditGuruPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return <EditTeacherForm teacherId={id} />
}
