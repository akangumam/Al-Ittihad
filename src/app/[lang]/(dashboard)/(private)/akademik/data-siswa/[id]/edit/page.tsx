import EditStudentForm from '@/views/akademik/EditStudentForm'

export default async function EditSiswaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return <EditStudentForm studentId={id} />
}
